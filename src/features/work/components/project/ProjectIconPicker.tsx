import React, { useState } from 'react';
import { ProjectIcon } from './projectIcon';

const EMOJI_OPTIONS = ['📁', '🚀', '⚡', '🎯', '🔧', '📊', '🛠️', '💡', '🌐', '📱', '🔬', '🏗️'];

const ICON_OPTIONS = ['folder', 'layers', 'server', 'smartphone', 'activity', 'users'];

type PickerTab = 'emoji' | 'icons';

interface Props {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export const ProjectIconPicker: React.FC<Props> = ({ open, anchorRef, value, onChange, onClose }) => {
  const [tab, setTab] = useState<PickerTab>('emoji');
  const popRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();
  const isEmoji = EMOJI_OPTIONS.includes(value);

  return (
    <div
      ref={popRef}
      className="work-icon-picker"
      style={{ top: rect.bottom + 6, left: rect.left }}
      role="dialog"
      aria-label="Choose project icon"
      onClick={e => e.stopPropagation()}
    >
      <div className="work-icon-picker__tabs">
        <button
          type="button"
          className={`work-icon-picker__tab${tab === 'emoji' ? ' work-icon-picker__tab--active' : ''}`}
          onClick={() => setTab('emoji')}
        >
          Emoji
        </button>
        <button
          type="button"
          className={`work-icon-picker__tab${tab === 'icons' ? ' work-icon-picker__tab--active' : ''}`}
          onClick={() => setTab('icons')}
        >
          Icons
        </button>
      </div>
      {tab === 'emoji' && (
        <div className="work-icon-picker__section">
          <div className="work-icon-picker__grid">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                className={`work-icon-picker__item${value === e ? ' work-icon-picker__item--active' : ''}`}
                onClick={() => { onChange(e); onClose(); }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      {tab === 'icons' && (
        <div className="work-icon-picker__section">
          <div className="work-icon-picker__grid work-icon-picker__grid--icons">
            {ICON_OPTIONS.map(id => (
              <button
                key={id}
                type="button"
                className={`work-icon-picker__item work-icon-picker__item--icon${!isEmoji && value === id ? ' work-icon-picker__item--active' : ''}`}
                onClick={() => { onChange(id); onClose(); }}
              >
                <ProjectIcon icon={id} size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
