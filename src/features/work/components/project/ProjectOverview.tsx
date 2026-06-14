import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckSquare,
  Heading2,
  Heading3,
  Image,
  Link2,
  List,
  ListOrdered,
  Quote,
  Table2,
  ToggleRight,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  healthBadgeClass,
  projectTasks,
  statusBadgeClass,
  type WorkProject,
} from '../../workMockData';
import { ProjectIcon } from './projectIcon';

interface Props {
  project: WorkProject;
}

interface SlashCommand {
  id: string;
  label: string;
  icon: React.ReactNode;
  tag: string;
  placeholder: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h2', label: 'Heading 2', icon: <Heading2 size={14} />, tag: 'h2', placeholder: 'Heading' },
  { id: 'h3', label: 'Heading 3', icon: <Heading3 size={14} />, tag: 'h3', placeholder: 'Heading' },
  { id: 'bullet', label: 'Bulleted list', icon: <List size={14} />, tag: 'ul', placeholder: 'List item' },
  { id: 'numbered', label: 'Numbered list', icon: <ListOrdered size={14} />, tag: 'ol', placeholder: 'List item' },
  { id: 'todo', label: 'To-do list', icon: <CheckSquare size={14} />, tag: 'todo', placeholder: 'To-do' },
  { id: 'table', label: 'Table', icon: <Table2 size={14} />, tag: 'table', placeholder: 'Cell' },
  { id: 'quote', label: 'Quote', icon: <Quote size={14} />, tag: 'blockquote', placeholder: 'Quote' },
  { id: 'link', label: 'Link', icon: <Link2 size={14} />, tag: 'a', placeholder: 'Link text' },
  { id: 'attachment', label: 'Attachment', icon: <Image size={14} />, tag: 'attachment', placeholder: 'Attachment' },
];

const DEFAULT_EDITOR_HTML = `
<h2>Welcome to your project</h2>
<p>This is your project overview. Use it to keep context, goals, milestones, and key updates in one place.</p>
<h3>What this project covers</h3>
<ul>
  <li>Work items for tasks and delivery</li>
  <li>Cycle for focused execution</li>
  <li>Planner for timeline and milestones</li>
</ul>
`.trim();

function buildSlashBlock(cmd: SlashCommand): string {
  switch (cmd.tag) {
    case 'ul':
      return '<ul><li>List item</li></ul>';
    case 'ol':
      return '<ol><li>List item</li></ol>';
    case 'todo':
      return '<ul class="work-overview-doc__todo"><li><input type="checkbox" disabled /> To-do item</li></ul>';
    case 'table':
      return '<table class="work-overview-doc__table"><tr><th>Column 1</th><th>Column 2</th></tr><tr><td>Cell</td><td>Cell</td></tr></table>';
    case 'blockquote':
      return '<blockquote>Quote text</blockquote>';
    case 'a':
      return '<p><a href="#">Link text</a></p>';
    case 'attachment':
      return '<p class="work-overview-doc__attachment"><span>📎</span> Attachment placeholder</p>';
    default:
      return `<${cmd.tag}>${cmd.placeholder}</${cmd.tag}>`;
  }
}

export const ProjectOverview: React.FC<Props> = ({ project }) => {
  const { tasks, updateProject } = useWork();
  const projectTaskList = projectTasks(project.id, tasks);
  const doneCount = projectTaskList.filter(t => t.status === 'done').length;
  const totalCount = projectTaskList.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const [projectName, setProjectName] = useState(project.name);
  const [statesEnabled, setStatesEnabled] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [activeSlashIdx, setActiveSlashIdx] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const slashRangeRef = useRef<Range | null>(null);
  const editorInitialized = useRef(false);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  useEffect(() => {
    if (editorInitialized.current || !editorRef.current) return;
    editorRef.current.innerHTML = DEFAULT_EDITOR_HTML;
    editorInitialized.current = true;
  }, []);

  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  );

  const closeSlashMenu = useCallback(() => {
    setSlashOpen(false);
    setSlashFilter('');
    setActiveSlashIdx(0);
    slashRangeRef.current = null;
  }, []);

  const getSlashContext = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.startContainer)) return null;

    const preRange = range.cloneRange();
    preRange.selectNodeContents(editorRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    const textBefore = preRange.toString();
    const slashIdx = textBefore.lastIndexOf('/');
    if (slashIdx === -1) return null;

    const query = textBefore.slice(slashIdx + 1);
    if (query.includes(' ') || query.includes('\n')) return null;

    const slashRange = document.createRange();
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let charCount = 0;
    let startNode: Text | null = null;
    let startOffset = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const len = node.textContent?.length ?? 0;
      if (charCount + len > slashIdx) {
        startNode = node;
        startOffset = slashIdx - charCount;
        break;
      }
      charCount += len;
    }

    if (!startNode) return null;
    slashRange.setStart(startNode, startOffset);
    slashRange.setEnd(range.startContainer, range.startOffset);

    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    return {
      query,
      slashRange,
      pos: {
        top: rect.bottom - editorRect.top + editorRef.current.scrollTop + 4,
        left: rect.left - editorRect.left + editorRef.current.scrollLeft,
      },
    };
  }, []);

  const applySlashCommand = useCallback((cmd: SlashCommand) => {
    const range = slashRangeRef.current;
    const editor = editorRef.current;
    if (!range || !editor) return;

    range.deleteContents();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildSlashBlock(cmd);
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }
    range.insertNode(fragment);

    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(editor);
      newRange.collapse(false);
      sel.addRange(newRange);
    }

    closeSlashMenu();
  }, [closeSlashMenu]);

  const handleEditorInput = useCallback(() => {
    const ctx = getSlashContext();
    if (ctx) {
      slashRangeRef.current = ctx.slashRange;
      setSlashFilter(ctx.query);
      setSlashPos(ctx.pos);
      setSlashOpen(true);
      setActiveSlashIdx(0);
      return;
    }
    closeSlashMenu();
  }, [closeSlashMenu, getSlashContext]);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!slashOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSlashMenu();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSlashIdx(i => Math.min(i + 1, Math.max(filteredCommands.length - 1, 0)));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSlashIdx(i => Math.max(i - 1, 0));
      return;
    }

    if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault();
      applySlashCommand(filteredCommands[activeSlashIdx]);
    }
  }, [activeSlashIdx, applySlashCommand, closeSlashMenu, filteredCommands, slashOpen]);

  const handleTitleBlur = () => {
    const trimmed = projectName.trim();
    if (trimmed && trimmed !== project.name) {
      updateProject(project.id, { name: trimmed });
    } else if (!trimmed) {
      setProjectName(project.name);
    }
  };

  const cycleCoverColor = () => {
    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0ea5e9'];
    const idx = colors.indexOf(project.coverColor);
    const next = colors[(idx + 1) % colors.length];
    updateProject(project.id, { coverColor: next });
  };

  return (
    <div className="work-overview-doc">
      <div className="work-overview-doc__cover-wrap">
        <div
          className="work-overview-doc__cover"
          style={{ background: `linear-gradient(135deg, ${project.coverColor} 0%, color-mix(in srgb, ${project.coverColor} 70%, #000) 100%)` }}
          role="img"
          aria-label="Project cover"
        />
        <button type="button" className="work-overview-doc__change-cover" onClick={cycleCoverColor}>
          Change cover
        </button>
      </div>

      <div className="work-overview-doc__layout">
        <main className="work-overview-doc__main">
          <div className="work-overview-doc__identity">
            <div
              className="work-overview-doc__avatar"
              style={{ background: `color-mix(in srgb, ${project.coverColor} 18%, var(--surface-panel))` }}
            >
              <ProjectIcon icon={project.icon} size={22} />
            </div>
            <input
              type="text"
              className="work-overview-doc__title"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onBlur={handleTitleBlur}
              aria-label="Project name"
            />
          </div>

          <div className="work-overview-doc__editor-wrap">
            <div
              ref={editorRef}
              className="work-overview-doc__editor"
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="Project overview content"
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
              onBlur={() => {
                window.setTimeout(() => {
                  if (!document.activeElement?.closest('.work-overview-doc__slash-menu')) {
                    closeSlashMenu();
                  }
                }, 120);
              }}
            />

            {slashOpen && filteredCommands.length > 0 && (
              <div
                className="work-overview-doc__slash-menu"
                style={{ top: slashPos.top, left: slashPos.left }}
                role="listbox"
                aria-label="Slash commands"
              >
                {filteredCommands.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    type="button"
                    role="option"
                    aria-selected={idx === activeSlashIdx}
                    className={`work-overview-doc__slash-item${idx === activeSlashIdx ? ' work-overview-doc__slash-item--active' : ''}`}
                    onMouseDown={e => {
                      e.preventDefault();
                      applySlashCommand(cmd);
                    }}
                  >
                    <span className="work-overview-doc__slash-icon">{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className="work-overview-doc__aside" aria-label="Project state">
          <div className="work-overview-doc__state-panel">
            <div className="work-overview-doc__state-head">
              <ToggleRight size={14} aria-hidden="true" />
              <h3 className="work-overview-doc__state-title">Project states</h3>
            </div>

            {statesEnabled ? (
              <>
                <div className="work-overview-doc__state-meta">
                  <span className={`cfg-badge cfg-badge--${statusBadgeClass(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`cfg-badge cfg-badge--${healthBadgeClass(project.health)}`}>
                    {project.health.replace('_', ' ')}
                  </span>
                </div>
                <div className="work-overview-doc__progress">
                  <div className="work-overview-doc__progress-label">
                    <span>Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="work-overview-doc__progress-track">
                    <div
                      className="work-overview-doc__progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="work-overview-doc__progress-hint">
                    {doneCount} of {totalCount} work items completed
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="work-overview-doc__state-desc">
                  Track delivery progress with custom project states and compact status indicators.
                </p>
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm work-overview-doc__enable-states"
                  onClick={() => setStatesEnabled(true)}
                >
                  Enable project states
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
