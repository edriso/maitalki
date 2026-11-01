import { Bookmark, Ear, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { soundContrasts } from '../content/contrasts';
import type { PracticeNote } from '../content/types';
import { ListenControls } from './ListenControls';
import { ShadowCoach } from './ShadowCoach';
import { VoicePicker } from './VoicePicker';

interface Props {
  note?: PracticeNote;
  favorite: boolean;
  onFavorite: () => void;
  onClose: () => void;
  /** Open ear training for a sound contrast taught by this note. */
  onTrainEar?: (contrastId: string) => void;
}

export function NoteDialog({ note, favorite, onFavorite, onClose, onTrainEar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contrast = note ? soundContrasts.find((item) => item.noteId === note.id) : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (note && dialog && !dialog.open) dialog.showModal();
    if (!note && dialog?.open) dialog.close();
  }, [note]);

  return (
    <dialog ref={dialogRef} className="note-dialog" onClose={onClose} onClick={(event) => {
      if (event.target === dialogRef.current) onClose();
    }}>
      {note && <div className="dialog-inner">
        <div className="dialog-actions">
          <button className={`save-button ${favorite ? 'saved' : ''}`} onClick={onFavorite} aria-label={`${favorite ? 'Remove from' : 'Add to'} saved notes`}><Bookmark fill={favorite ? 'currentColor' : 'none'} /></button>
          <button className="icon-button" onClick={onClose} aria-label="Close note"><X /></button>
        </div>
        <div className="meta-row"><span className={`priority p-${note.priority.toLowerCase()}`}>{note.priority}</span><span>{note.category}</span></div>
        <h2>{note.title}</h2>
        <p className="dialog-cue">{note.cue}</p>
        <section><h3>The rule</h3><p>{note.rule}</p></section>
        <section><h3>Why it matters</h3><p>{note.why}</p></section>
        <section><div className="section-heading"><h3>Use it</h3><VoicePicker /></div><div className="example-list">{note.examples.map((example, index) => <div className="example" key={index}>
          {example.label && <small>{example.label}</small>}
          {example.before && <p className="before"><span>Instead</span>{example.before}</p>}
          <p className="after"><span>{example.before ? 'Try' : 'Say'}</span>{example.after}</p>
          <ListenControls text={example.after} label={`example ${index + 1}`} />
          {example.note && <small>{example.note}</small>}
        </div>)}</div>
        <ShadowCoach subject="these examples" lines={note.examples.map((example, index) => ({ text: example.after, label: `example ${index + 1}` }))} /></section>
        <section className="drill-box"><small>Practice now</small><p>{note.drill}</p></section>
        {contrast && onTrainEar && <section className="ear-link">
          <p><strong>Can you hear the difference?</strong>Ten quick words with both voices. Hearing it clearly makes it easier to say.</p>
          <button type="button" className="secondary-button" onClick={() => onTrainEar(contrast.id)}><Ear aria-hidden="true" /> Train your ear: {contrast.label}</button>
        </section>}
      </div>}
    </dialog>
  );
}
