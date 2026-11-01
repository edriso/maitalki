/**
 * Generates model audio with ElevenLabs and writes it to public/audio.
 *
 *   npm run audio                  generate missing clips for every voice
 *   npm run audio -- --dry-run     show what would be generated and the credit estimate
 *   npm run audio -- --voice=eric  limit to one voice
 *   npm run audio -- --audition    write one sample per voice to .audio-auditions/
 *   npm run audio -- --verify      transcribe single-word clips and flag any that sound like another word
 *
 * If a clip sounds wrong, add it to scripts/audio-retakes.json ({ "voice": { "Spoken text.": 1 } })
 * and run again: the retake number changes the seed, so only that clip is regenerated.
 *
 * Files are named by a hash of the spoken text, voice, and settings, so re-running only
 * pays for new or changed lines. Every clip is leveled to the same loudness with ffmpeg so
 * switching lines or voices never jumps in volume. To change post-processing, delete
 * public/audio and run again, so every clip is encoded once from a fresh original. The API key is read from .env.local and never leaves
 * this machine; the deployed site serves static MP3 files only.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { soundContrasts } from '../src/content/contrasts.ts';
import { drills } from '../src/content/drills.ts';
import { notes } from '../src/content/notes.ts';
import { collectSpeechTexts } from '../src/content/speech.ts';
import { modelVoices, type ModelVoice } from '../src/content/voices.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = join(root, 'public', 'audio');
const manifestPath = join(root, 'src', 'content', 'audio-manifest.json');
const auditionDir = join(root, '.audio-auditions');
const retakes = JSON.parse(readFileSync(join(root, 'scripts', 'audio-retakes.json'), 'utf8')) as Record<string, Record<string, number>>;
const apiBase = 'https://api.elevenlabs.io/v1';

/** Generation settings. Any change produces new file hashes and regenerates every clip. */
const generation = {
  // Most consistent, lifelike default for narration-style reads; default voices are tuned for it.
  modelId: 'eleven_multilingual_v2',
  // Clear speech at a small size; each clip is fetched only when the learner presses Listen.
  outputFormat: 'mp3_44100_96',
  voiceSettings: {
    stability: 0.6, // steady delivery so repeated listens sound the same
    similarity_boost: 0.8,
    style: 0, // no exaggerated style; keeps rhythm natural and clean
    use_speaker_boost: true,
    speed: 0.94, // a touch slower than default, still natural
  },
  seed: 20_260_101,
} as const;

/**
 * Post-processing: gentle compression evens out peaks, then two-pass linear normalization
 * to -16 LUFS (a common level for spoken audio on the web).
 */
const loudness = {
  compressor: 'acompressor=threshold=-24dB:ratio=2.5:attack=5:release=80:knee=3',
  target: 'I=-16:TP=-1.5:LRA=11',
  bitrate: '96k',
} as const;

interface Manifest {
  generatedWith: typeof generation;
  voices: Record<string, Record<string, string>>;
}

const args = new Set(process.argv.slice(2));
const voiceArg = process.argv.find((arg) => arg.startsWith('--voice='))?.split('=')[1];
const dryRun = args.has('--dry-run');
const audition = args.has('--audition');
const verify = args.has('--verify');

const fail = (message: string): never => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

const loadApiKey = () => {
  const envFile = join(root, '.env.local');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) fail('ELEVENLABS_API_KEY is missing. Copy .env.example to .env.local and add your key.');
  if (!key!.startsWith('sk_')) fail('ELEVENLABS_API_KEY must be the secret key that starts with "sk_", not the key ID.');
  return key!;
};

const requireFfmpeg = () => {
  const check = spawnSync('ffmpeg', ['-version']);
  if (check.error || check.status !== 0) fail('ffmpeg is required to level clip loudness. Install it (macOS: brew install ffmpeg) and run again.');
};

/** Light compression plus two-pass linear loudness normalization. */
function levelLoudness(mp3: Buffer): Buffer {
  const dir = mkdtempSync(join(tmpdir(), 'maitalki-audio-'));
  try {
    const input = join(dir, 'in.mp3');
    const output = join(dir, 'out.mp3');
    writeFileSync(input, mp3);
    const { compressor, target } = loudness;
    const measure = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `${compressor},loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
    const report = measure.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/)?.[0];
    if (!report) throw new Error(`Could not measure loudness: ${measure.stderr.slice(-300)}`);
    const measured = JSON.parse(report) as Record<string, string>;
    const filter = `${compressor},loudnorm=${target}:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`;
    const encode = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, '-af', filter, '-ar', '44100', '-ac', '1', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', loudness.bitrate, output], { encoding: 'utf8' });
    if (encode.status !== 0) throw new Error(`ffmpeg failed: ${encode.stderr}`);
    return readFileSync(output);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const retakeFor = (voice: ModelVoice, text: string) => retakes[voice.key]?.[text] ?? 0;

const clipHash = (voice: ModelVoice, text: string) => {
  const retake = retakeFor(voice, text);
  const identity = { text, voiceId: voice.voiceId, ...generation, ...(retake ? { retake } : {}) };
  return createHash('sha256').update(JSON.stringify(identity)).digest('hex').slice(0, 16);
};

const readManifest = (): Manifest => {
  if (!existsSync(manifestPath)) return { generatedWith: generation, voices: {} };
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
};

const writeManifest = (manifest: Manifest) => {
  const sorted: Manifest = {
    generatedWith: generation,
    voices: Object.fromEntries(Object.entries(manifest.voices).sort(([a], [b]) => a.localeCompare(b)).map(([key, clips]) =>
      [key, Object.fromEntries(Object.entries(clips).sort(([a], [b]) => a.localeCompare(b)))])),
  };
  writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
};

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

async function synthesize(apiKey: string, voice: ModelVoice, text: string): Promise<Buffer> {
  const url = `${apiBase}/text-to-speech/${voice.voiceId}?output_format=${generation.outputFormat}`;
  const body = JSON.stringify({
    text,
    model_id: generation.modelId,
    voice_settings: generation.voiceSettings,
    seed: generation.seed + retakeFor(voice, text),
    apply_text_normalization: 'auto',
  });

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, { method: 'POST', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body });
    if (response.ok) {
      const audio = Buffer.from(await response.arrayBuffer());
      if (audio.length < 2_000) throw new Error(`Suspiciously small audio (${audio.length} bytes) for: ${text}`);
      return audio;
    }
    const detail = await response.text();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 5) {
      if (detail.includes('quota_exceeded')) fail('Not enough ElevenLabs credits left. Generated clips are saved; run again after credits renew.');
      throw new Error(`ElevenLabs ${response.status}: ${detail.slice(0, 300)}`);
    }
    const wait = Number(response.headers.get('retry-after')) * 1000 || 1_500 * 2 ** attempt;
    console.log(`  … ${response.status}, retrying in ${Math.round(wait / 1000)}s`);
    await sleep(wait);
  }
}

async function remainingCredits(apiKey: string): Promise<number | undefined> {
  try {
    const response = await fetch(`${apiBase}/user/subscription`, { headers: { 'xi-api-key': apiKey } });
    if (!response.ok) return undefined; // key may be restricted to TTS only
    const data = await response.json() as { character_count: number; character_limit: number };
    return data.character_limit - data.character_count;
  } catch {
    return undefined;
  }
}

/** Words a transcriber may legitimately write differently (homophones), keyed by the intended word. */
const homophones: Record<string, string[]> = {
  fill: ['phil'], fin: ['finn'], sink: ['sync', 'cinq'], led: ['lead'], shoe: ['shoo'], which: ['witch'], mass: ['mas'], tin: ['tim'],
};

/** Transcribe every single-word clip and report words that come back as a different word. */
async function verifyWords(apiKey: string, voices: ModelVoice[], texts: string[]) {
  const words = texts.filter((text) => /^[A-Z][a-z]+\.$/.test(text));
  const problems: string[] = [];
  for (const voice of voices) {
    for (const text of words) {
      const file = join(audioDir, voice.key, `${clipHash(voice, text)}.mp3`);
      if (!existsSync(file)) continue;
      const form = new FormData();
      form.append('model_id', 'scribe_v1');
      form.append('language_code', 'en');
      form.append('tag_audio_events', 'false');
      form.append('file', new Blob([readFileSync(file)], { type: 'audio/mpeg' }), 'clip.mp3');
      const response = await fetch(`${apiBase}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': apiKey }, body: form });
      if (!response.ok) fail(`Speech-to-text failed (${response.status}). The key needs Speech to Text permission for --verify.`);
      const heard = ((await response.json()) as { text: string }).text.toLowerCase().replace(/[^a-z]/g, '');
      const intended = text.slice(0, -1).toLowerCase();
      if (heard !== intended && !homophones[intended]?.includes(heard)) problems.push(`  ${voice.name}: "${intended}" was heard as "${heard}"`);
    }
  }
  console.log(`Verified ${words.length * voices.length} word clips.`);
  if (problems.length) {
    console.log(`${problems.length} may sound like another word:\n${problems.join('\n')}\nAdd them to scripts/audio-retakes.json and run again.`);
    process.exitCode = 1;
  }
}

/** Run tasks with a small concurrency limit (the free plan allows few concurrent requests). */
async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item);
  }));
}

async function main() {
  const voices = voiceArg ? modelVoices.filter((voice) => voice.key === voiceArg) : modelVoices;
  if (!voices.length) fail(`Unknown voice "${voiceArg}". Choose one of: ${modelVoices.map((voice) => voice.key).join(', ')}`);

  if (!dryRun) requireFfmpeg();

  if (audition) {
    const apiKey = loadApiKey();
    const sample = 'Based on what you told me, speed is the main priority. Please sit at the desk, and check which shipping list we should send.';
    mkdirSync(auditionDir, { recursive: true });
    for (const voice of voices) {
      writeFileSync(join(auditionDir, `${voice.key}.mp3`), levelLoudness(await synthesize(apiKey, voice, sample)));
      console.log(`✓ ${voice.name} → .audio-auditions/${voice.key}.mp3`);
    }
    return;
  }

  const texts = collectSpeechTexts({ drills, notes, contrasts: soundContrasts });
  const manifest = readManifest();
  const plan = voices.map((voice) => {
    const missing = texts.filter((text) => !existsSync(join(audioDir, voice.key, `${clipHash(voice, text)}.mp3`)));
    return { voice, missing, characters: missing.reduce((sum, text) => sum + text.length, 0) };
  });
  const totalCharacters = plan.reduce((sum, item) => sum + item.characters, 0);

  console.log(`${texts.length} lines · model ${generation.modelId}`);
  for (const { voice, missing, characters } of plan) console.log(`  ${voice.name}: ${missing.length} to generate (${characters.toLocaleString()} characters)`);

  if (dryRun || totalCharacters === 0) {
    if (!dryRun) console.log('Everything is up to date.');
  } else {
    const apiKey = loadApiKey();
    const credits = await remainingCredits(apiKey);
    if (credits !== undefined) {
      console.log(`  ${credits.toLocaleString()} credits remaining`);
      if (credits < totalCharacters) console.log('  ⚠ API discounts usually make this cheaper, but credits may run out; finished clips are kept and the next run resumes.');
    }

    for (const { voice, missing } of plan) {
      if (!missing.length) continue;
      mkdirSync(join(audioDir, voice.key), { recursive: true });
      let done = 0;
      await runPool(missing, 2, async (text) => {
        const audio = await synthesize(apiKey, voice, text);
        writeFileSync(join(audioDir, voice.key, `${clipHash(voice, text)}.mp3`), levelLoudness(audio));
        done += 1;
        console.log(`  ${voice.name} ${done}/${missing.length}  ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`);
      });
    }
  }

  if (dryRun) return;

  // Rebuild the manifest from the files that exist for current content, then prune stale clips.
  for (const voice of modelVoices) {
    const clips = Object.fromEntries(texts.flatMap((text) => {
      const hash = clipHash(voice, text);
      return existsSync(join(audioDir, voice.key, `${hash}.mp3`)) ? [[text, hash]] : [];
    }));
    if (Object.keys(clips).length) manifest.voices[voice.key] = clips;
    else delete manifest.voices[voice.key];

    const voiceDir = join(audioDir, voice.key);
    if (!existsSync(voiceDir)) continue;
    const keep = new Set(Object.values(clips).map((hash) => `${hash}.mp3`));
    for (const file of readdirSync(voiceDir)) if (!keep.has(file)) rmSync(join(voiceDir, file));
  }
  if (existsSync(audioDir)) {
    const known = new Set(modelVoices.map((voice) => voice.key));
    for (const entry of readdirSync(audioDir)) if (!known.has(entry)) rmSync(join(audioDir, entry), { recursive: true });
  }
  for (const key of Object.keys(manifest.voices)) if (!modelVoices.some((voice) => voice.key === key)) delete manifest.voices[key];

  writeManifest(manifest);
  console.log('✓ Manifest updated: src/content/audio-manifest.json');

  if (verify) await verifyWords(loadApiKey(), voices, texts);
}

await main();
