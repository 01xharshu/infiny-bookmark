'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import type { Pin, PinType, NoteData, LinkData, TaskData } from '@/types/pin';

import { IoClose } from 'react-icons/io5';
import { FiPlay, FiExternalLink } from 'react-icons/fi';
import {
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineLink,
  HiOutlineFilm,
  HiOutlineDocumentDuplicate,
  HiOutlinePaperClip,
  HiOutlineMenu,
  HiOutlineDownload,
  HiOutlineUpload,
  HiOutlineColorSwatch,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlinePencil,
} from 'react-icons/hi';
import {
  BsChatQuote,
  BsCircle,
  BsCircleHalf,
  BsPieChartFill,
  BsCheckCircleFill,
  BsPlayFill,
  BsPauseFill,
  BsArrowCounterclockwise,
  BsAsterisk,
  BsLayoutSidebar,
} from 'react-icons/bs';
import {
  RiStickyNoteLine,
  RiGridLine,
  RiTaskLine,
} from 'react-icons/ri';
import {
  FiPlus,
  FiMinus,
  FiCrosshair,
} from 'react-icons/fi';

/* ============================================
   PIN COMPONENTS
   ============================================ */

function NotePin({ pin }: { pin: Pin }) {
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const data = pin.data as { text: string; color: string };

  return (
    <div className="pin-card note-pin" style={{ background: data.color || 'var(--card-bg)' }}>
      <div className="note-pin-label">
        <span>NOTE</span>
      </div>
      <textarea
        className="note-pin-text"
        value={data.text}
        onChange={(e) => {
          let val = e.target.value;
          if (val.includes('[] ')) val = val.replace(/\[\]\s/g, '☐ ');
          updatePinData(pin.id, { text: val });
        }}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <span className="note-pin-date">
        {new Date(pin.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    </div>
  );
}

function QuotePin({ pin }: { pin: Pin }) {
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const data = pin.data as { text: string; author: string; color: string };

  return (
    <div className="pin-card quote-pin" style={{ background: data.color || 'var(--card-bg)' }}>
      <div className="quote-pin-header">
        <div className="quote-pin-icon">
          <span className="dot" />
          QUOTE
        </div>
      </div>
      <div className="quote-pin-marks">&ldquo;</div>
      <textarea
        className="quote-pin-text"
        value={data.text}
        onChange={(e) => updatePinData(pin.id, { text: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <input
        className="quote-pin-author"
        value={`— ${data.author}`}
        onChange={(e) =>
          updatePinData(pin.id, { author: e.target.value.replace(/^—\s*/, '') })
        }
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function LinkPin({ pin }: { pin: Pin }) {
  const data = pin.data as {
    url: string;
    title: string;
    description: string;
    favicon: string;
    ogImage?: string;
    color?: string;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('edit-link-pin', { detail: pin.id }));
  };

  return (
    <div className="pin-card link-pin" onDoubleClick={handleDoubleClick} style={{ background: data.color || 'var(--card-bg)' }}>
      {data.ogImage && (
        <div className="link-pin-og-image" style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.ogImage} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div className="link-pin-preview">
        {!data.ogImage && (
          <div className="link-pin-favicon">
            <HiOutlineLink />
          </div>
        )}
        <div className="link-pin-info">
          <div className="link-pin-title">
            {data.title}
            <FiExternalLink size={12} />
          </div>
          <div className="link-pin-desc">{data.description}</div>
        </div>
      </div>
      <a
        className="link-pin-url"
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {data.url}
      </a>
    </div>
  );
}

/* ============================================
   LINK EDIT MODAL
   ============================================ */
function LinkEditModal({ pin, onClose }: { pin: Pin; onClose: () => void }) {
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const data = pin.data as { url: string; title: string; description: string; favicon: string };
  const [url, setUrl] = useState(data.url);
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);

  const handleSave = () => {
    updatePinData(pin.id, { url, title, description });
    onClose();
  };

  return (
    <div className="edit-input-overlay" onClick={onClose}>
      <div className="edit-input-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Bookmark</h3>
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="edit-input-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ImagePin({ pin }: { pin: Pin }) {
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const data = pin.data as { src: string; alt: string; color?: string; };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updatePinData(pin.id, { src: ev.target?.result as string, alt: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pin-card image-pin" style={{ background: data.color || 'var(--card-bg)' }}>
      <div className="image-pin-preview">
        {data.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.src} alt={data.alt} />
        ) : (
          <div
            className="image-pin-upload"
            onClick={() => fileInputRef.current?.click()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="image-pin-upload-icon">
              <HiOutlinePhotograph />
            </span>
            <span className="image-pin-upload-text">Click to upload</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPin({ pin }: { pin: Pin }) {
  const data = pin.data as {
    url: string;
    title: string;
    channel: string;
    thumbnail: string;
    color?: string;
  };

  const getEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      try {
        videoId = new URL(url).searchParams.get('v') || '';
      } catch {
        // fallback
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const embedUrl = getEmbedUrl(data.url);

  return (
    <div className="pin-card video-pin" style={{ padding: embedUrl ? '8px' : 0, background: data.color || 'var(--card-bg)' }}>
      {embedUrl ? (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <div className="video-pin-thumbnail">
            <div className="video-pin-play">
              <FiPlay />
            </div>
            <div className="video-pin-badge">
              <span>▶</span> YouTube
            </div>
          </div>
          <div className="video-pin-info">
            <div className="video-pin-title">{data.title}</div>
            <div className="video-pin-channel">{data.channel}</div>
          </div>
        </>
      )}
    </div>
  );
}

function FilePin({ pin }: { pin: Pin }) {
  const data = pin.data as { name: string; size: string; type: string; color?: string; };
  const iconClass =
    data.type === 'pdf' ? 'pdf' : data.type === 'doc' ? 'doc' : 'default';

  return (
    <div className="pin-card file-pin" style={{ background: data.color || 'var(--card-bg)' }}>
      <div className={`file-pin-icon ${iconClass}`}>
        <HiOutlinePaperClip />
      </div>
      <div className="file-pin-info">
        <div className="file-pin-name">{data.name}</div>
        <div className="file-pin-meta">
          {data.type.toUpperCase()} • {data.size}
        </div>
      </div>
    </div>
  );
}

function TaskPin({ pin }: { pin: Pin }) {
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const data = pin.data as TaskData;
  const { title, status, pomodoroTimeLeft, pomodoroIsRunning } = data;

  useEffect(() => {
    let interval: any;
    if (pomodoroIsRunning && pomodoroTimeLeft > 0) {
      interval = setInterval(() => {
        useCanvasStore.getState().updatePinData(pin.id, { pomodoroTimeLeft: pomodoroTimeLeft - 1 });
      }, 1000);
    } else if (pomodoroTimeLeft === 0 && pomodoroIsRunning) {
      useCanvasStore.getState().updatePinData(pin.id, { pomodoroIsRunning: false });
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, pomodoroTimeLeft, pin.id]);

  const toggleStatus = () => {
    const statuses: TaskData['status'][] = ['draft', 'in-progress', 'in-review', 'completed'];
    const next = statuses[(statuses.indexOf(status) + 1) % statuses.length];
    updatePinData(pin.id, { status: next });
  };

  const mins = Math.floor(pomodoroTimeLeft / 60);
  const secs = (pomodoroTimeLeft % 60).toString().padStart(2, '0');

  const getStatusDisplay = () => {
    switch(status) {
      case 'draft': return { label: 'Draft', icon: <BsCircle size={14} />, className: 'status-draft' };
      case 'in-progress': return { label: 'In-progress', icon: <BsCircleHalf size={14} />, className: 'status-inprogress' };
      case 'in-review': return { label: 'In-review', icon: <BsPieChartFill size={14} style={{transform: 'rotate(90deg)'}} />, className: 'status-inreview' };
      case 'completed': return { label: 'Completed', icon: <BsCheckCircleFill size={14} />, className: 'status-completed' };
      default: return { label: 'Draft', icon: <BsCircle size={14} />, className: 'status-draft' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="pin-card task-pin" style={{ background: data.color || 'var(--card-bg)' }}>
      <div className="task-pin-header">
        <input
          className="task-pin-title"
          value={title}
          placeholder="Task Name"
          onChange={(e) => updatePinData(pin.id, { title: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
        />
        <button 
          className={`task-status-badge ${statusDisplay.className}`}
          onClick={(e) => { e.stopPropagation(); toggleStatus(); }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="task-status-icon">{statusDisplay.icon}</span>
          <span className="task-status-label">{statusDisplay.label}</span>
        </button>
      </div>

      <div className="task-pomodoro-wrapper" onPointerDown={(e) => e.stopPropagation()}>
        <div className="task-pomodoro-timer">
          {mins}:{secs}
        </div>
        <div className="task-pomodoro-controls">
          {pomodoroIsRunning ? (
            <button className="pomodoro-btn" onClick={() => updatePinData(pin.id, { pomodoroIsRunning: false })}>
              <BsPauseFill size={18} />
            </button>
          ) : (
            <button className="pomodoro-btn" onClick={() => updatePinData(pin.id, { pomodoroIsRunning: true })}>
              <BsPlayFill size={18} />
            </button>
          )}
          <button className="pomodoro-btn" onClick={() => updatePinData(pin.id, { pomodoroTimeLeft: 25 * 60, pomodoroIsRunning: false })}>
            <BsArrowCounterclockwise size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PIN WRAPPER — drag, select, delete
   ============================================ */
function PinWrapper({ pin }: { pin: Pin }) {
  const {
    selectedPinId,
    selectPin,
    deletePin,
    bringToFront,
  } = useCanvasStore();
  const movePin = useCanvasStore((s) => s.movePin);
  const save = useCanvasStore((s) => s.save);
  const updatePinData = useCanvasStore((s) => s.updatePinData);
  const updatePin = useCanvasStore((s) => s.updatePin);
  const viewport = useCanvasStore((s) => s.viewport);
  const isSelected = selectedPinId === pin.id;
  const dragStart = useRef<{ x: number; y: number; pinX: number; pinY: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    selectPin(pin.id);
    bringToFront(pin.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = pin.width;
    const startH = pin.height;

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / viewport.scale;
      const dy = (moveEvent.clientY - startY) / viewport.scale;
      updatePin(pin.id, {
        width: Math.max(100, startW + dx),
        height: Math.max(100, startH + dy),
      });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      save();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Don't start drag if interacting with input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'A') {
        return;
      }

      e.stopPropagation();
      selectPin(pin.id);
      bringToFront(pin.id);

      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        pinX: pin.x,
        pinY: pin.y,
      };

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [pin.id, pin.x, pin.y, selectPin, bringToFront]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = (e.clientX - dragStart.current.x) / viewport.scale;
      const dy = (e.clientY - dragStart.current.y) / viewport.scale;
      movePin(pin.id, dragStart.current.pinX + dx, dragStart.current.pinY + dy);
    },
    [pin.id, viewport.scale, movePin]
  );

  const handlePointerUp = useCallback(() => {
    if (dragStart.current) {
      dragStart.current = null;
      save();
    }
  }, [save]);

  const renderPinContent = () => {
    switch (pin.type) {
      case 'note':
        return <NotePin pin={pin} />;
      case 'quote':
        return <QuotePin pin={pin} />;
      case 'link':
        return <LinkPin pin={pin} />;
      case 'image':
        return <ImagePin pin={pin} />;
      case 'video':
        return <VideoPin pin={pin} />;
      case 'file':
        return <FilePin pin={pin} />;
      case 'task':
        return <TaskPin pin={pin} />;
      default:
        return null;
    }
  };
  const [isFlipped, setIsFlipped] = useState(false);
  const CARD_STYLES = [
    { id: 'white', bg: '#ffffff' },
    { id: 'glass', bg: 'rgba(255, 255, 255, 0.4)' },
    { id: 'yellow', bg: '#FFF9C4' },
    { id: 'green', bg: '#C8E6C9' },
    { id: 'blue', bg: '#BBDEFB' },
    { id: 'pink', bg: '#F8BBD0' },
    { id: 'purple', bg: '#E1BEE7' },
    { id: 'dark', bg: '#111827' },
    { id: 'grad-sunset', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'grad-ocean', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { id: 'grad-purple', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`pin-wrapper ${isSelected ? 'selected' : ''} ${isFlipped ? 'flipped' : ''}`}
      style={{
        left: pin.x,
        top: pin.y,
        width: pin.width,
        height: pin.height,
        zIndex: pin.zIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="pin-inner">
        <div className="pin-front">
          <div className="pin-hover-actions">
            <button 
              className="hover-action-btn edit" 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
              title="Edit Style"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <HiOutlinePencil size={16} />
            </button>
            <button
              className="hover-action-btn delete"
              onPointerDown={(e) => {
                e.stopPropagation();
                deletePin(pin.id);
              }}
              title="Delete pin"
            >
              <IoClose size={18} />
            </button>
          </div>
          {renderPinContent()}
          <div
            className="pin-resize-handle"
            onPointerDown={handleResizePointerDown}
          />
        </div>
        
        <div className="pin-back">
          <div className="pin-back-header">
            <span>Card Aesthetics</span>
            <button 
              className="hover-action-btn" 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              style={{ width: 28, height: 28 }}
            >
              <IoClose size={16} />
            </button>
          </div>
          <div className="color-swatches" onPointerDown={(e) => e.stopPropagation()}>
            {CARD_STYLES.map(style => (
              <button 
                key={style.id} 
                className={`color-swatch skeu-btn ${(pin.data as any).color === style.bg ? 'active' : ''}`} 
                style={{ background: style.bg, padding: 0 }} 
                onClick={(e) => {
                  e.stopPropagation();
                  updatePinData(pin.id, { color: style.bg });
                }} 
                title={style.id}
              />
            ))}
          </div>
          <p style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto', textAlign: 'center'}}>Click a style to apply instantly.</p>
        </div>
      </div>
    </div>
  );
}

function BottomDock() {
  const { viewport, setViewport, backgroundStyle, setBackgroundStyle, bentoLayout } = useCanvasStore();
  const [isOpen, setIsOpen] = useState(false);

  const zoomIn = () => setViewport({ scale: Math.min(2, viewport.scale + 0.1) });
  const zoomOut = () => setViewport({ scale: Math.max(0.25, viewport.scale - 0.1) });
  const resetZoom = () => setViewport({ x: 0, y: 0, scale: 1 });

  return (
    <div className="bottom-dock-wrapper" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
      {isOpen && (
        <div className="canvas-settings-menu" style={{ background: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', borderRadius: 12, padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Background Texture</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['solid', 'dots', 'grid', 'lines'].map((s) => (
              <button 
                key={s} 
                onClick={() => setBackgroundStyle(s as any)}
                className="skeu-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: backgroundStyle === s ? '1px solid var(--accent-blue)' : '1px solid transparent',
                  background: backgroundStyle === s ? 'rgba(108, 99, 255, 0.1)' : undefined,
                  color: backgroundStyle === s ? 'var(--accent-blue)' : 'var(--text-primary)',
                  textTransform: 'capitalize',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bottom-dock-pill skeu-btn" style={{ borderRadius: 9999 }}>
        <button className="dock-icon-btn" onClick={zoomOut} title="Zoom out">
          <FiMinus />
        </button>
        <span className="dock-zoom-text" onClick={resetZoom} style={{ cursor: 'pointer' }}>
          {Math.round(viewport.scale * 100)}%
        </span>
        <button className="dock-icon-btn" onClick={zoomIn} title="Zoom in">
          <FiPlus />
        </button>
        
        <div className="dock-divider" />
        
        <button 
          onClick={bentoLayout}
          title="Magic Bento Layout"
          className="dock-icon-btn"
        >
          <HiOutlineSparkles />
        </button>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="dock-icon-btn"
        >
          <HiOutlineCog />
        </button>
      </div>
    </div>
  );
}

/* ============================================
   BOTTOM NAV BAR
   ============================================ */
const PIN_TYPES: { type: PinType; label: string; icon: React.ReactNode }[] = [
  { type: 'note', label: 'Notes', icon: <RiStickyNoteLine /> },
  { type: 'task', label: 'Tasks', icon: <RiTaskLine /> },
  { type: 'image', label: 'Images', icon: <HiOutlinePhotograph /> },
  { type: 'quote', label: 'Quotes', icon: <BsChatQuote /> },
  { type: 'link', label: 'Links', icon: <HiOutlineLink /> },
  { type: 'video', label: 'Media', icon: <HiOutlineFilm /> },
  { type: 'file', label: 'Files', icon: <HiOutlinePaperClip /> },
];

function BottomNavBar() {
  const addPin = useCanvasStore((s) => s.addPin);

  const handleExport = () => {
    const state = useCanvasStore.getState();
    const data = JSON.stringify({ pins: state.pins, viewport: state.viewport });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infiny-board.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.pins) {
              useCanvasStore.setState({ pins: data.pins, viewport: data.viewport || { x: 0, y: 0, scale: 1 } });
              useCanvasStore.getState().save();
            }
          } catch {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="bottom-nav-bar">
      {PIN_TYPES.map((pt) => (
        <button
          key={pt.type}
          className="bottom-nav-item"
          onClick={() => addPin(pt.type)}
          title={`Add ${pt.label}`}
        >
          <div className="bottom-nav-icon skeu-btn">
            {pt.icon}
          </div>
          <span>{pt.label}</span>
        </button>
      ))}

      <div className="bottom-nav-divider" />

      <button
        className="bottom-nav-item"
        onClick={handleExport}
        title="Export Board"
      >
        <div className="bottom-nav-icon skeu-btn">
          <HiOutlineDownload />
        </div>
        <span>Export</span>
      </button>

      <button
        className="bottom-nav-item"
        onClick={handleImport}
        title="Import Board"
      >
        <div className="bottom-nav-icon skeu-btn">
          <HiOutlineUpload />
        </div>
        <span>Import</span>
      </button>
    </div>
  );
}

/* ============================================
   ZOOM CONTROLS
   ============================================ */
// Removed ZoomControls, now part of BottomDock

/* ============================================
   INFINITE CANVAS
   ============================================ */
function InfiniteCanvas() {
  const {
    viewport,
    setViewport,
    pins,
    selectPin,
    backgroundStyle,
  } = useCanvasStore();

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas panning
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only pan on left click on the canvas itself
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target !== containerRef.current) return;

      selectPin(null);
      isPanning.current = true;
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        vx: viewport.x,
        vy: viewport.y,
      };
      containerRef.current?.classList.add('grabbing');
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [viewport.x, viewport.y, selectPin]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setViewport({
        x: panStart.current.vx + dx,
        y: panStart.current.vy + dy,
      });
    },
    [setViewport]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
    containerRef.current?.classList.remove('grabbing');
  }, []);

  // Zoom or Pan on wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.altKey) {
        // Zoom
        const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05;
        const newScale = Math.min(
          2,
          Math.max(0.25, viewport.scale * scaleFactor)
        );

        // Zoom toward cursor position
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - viewport.x) * (newScale / viewport.scale);
        const newY = mouseY - (mouseY - viewport.y) * (newScale / viewport.scale);

        setViewport({ x: newX, y: newY, scale: newScale });
      } else {
        // Pan
        setViewport({
          x: viewport.x - e.deltaX,
          y: viewport.y - e.deltaY,
        });
      }
    },
    [viewport, setViewport]
  );

  // Attach non-passive wheel listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05;
      const state = useCanvasStore.getState();
      const newScale = Math.min(
        2,
        Math.max(0.25, state.viewport.scale * scaleFactor)
      );
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newX =
        mouseX -
        (mouseX - state.viewport.x) * (newScale / state.viewport.scale);
      const newY =
        mouseY -
        (mouseY - state.viewport.y) * (newScale / state.viewport.scale);
      state.setViewport({ x: newX, y: newY, scale: newScale });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`canvas-container canvas-bg-${backgroundStyle}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={
        backgroundStyle !== 'solid'
          ? {
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              backgroundSize:
                backgroundStyle === 'lines'
                  ? `100% ${28 * viewport.scale}px`
                  : `${28 * viewport.scale}px ${28 * viewport.scale}px`,
            }
          : {}
      }
    >
      <div
        className="canvas-transform"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        }}
      >
        {pins.map((pin) => (
          <PinWrapper key={pin.id} pin={pin} />
        ))}
      </div>

      {pins.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📌</div>
          <div className="empty-state-title">Your canvas is empty</div>
          <div className="empty-state-desc">
            Use the sidebar to add notes, links, images, quotes, and more to your infinite canvas.
          </div>
        </div>
      )}

      {/* BottomDock moved to Home */}
    </div>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */
export default function Home() {
  const [editingLinkPinId, setEditingLinkPinId] = useState<string | null>(null);
  const load = useCanvasStore((s) => s.load);
  const pins = useCanvasStore((s) => s.pins);

  useEffect(() => {
    load();
  }, [load]);

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      let pasted = false;
      const store = useCanvasStore.getState();

      // Handle images
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              store.addPinWithData('image', { src, alt: 'Pasted Image' });
            };
            reader.readAsDataURL(file);
            pasted = true;
            break;
          }
        }
      }

      if (pasted) return;

      // Handle text/URLs
      const text = e.clipboardData?.getData('text');
      if (text) {
        if (text.match(/^https?:\/\//)) {
          if (text.includes('youtube.com/watch') || text.includes('youtu.be/')) {
            store.addPinWithData('video', {
              url: text,
              title: 'YouTube Video',
              channel: 'Pasted URL',
              thumbnail: '',
            });
          } else {
            const newPinId = store.addPinWithData('link', {
              url: text,
              title: 'Loading preview...',
              description: '',
              favicon: '',
            });
            
            fetch(`/api/og?url=${encodeURIComponent(text)}`)
              .then(res => res.json())
              .then(og => {
                if (og && !og.error) {
                  store.updatePinData(newPinId, {
                    title: og.title || text,
                    description: og.description || '',
                    ogImage: og.image || '',
                  });
                } else {
                  store.updatePinData(newPinId, { title: text });
                }
              })
              .catch(() => {
                store.updatePinData(newPinId, { title: text });
              });
          }
        } else {
          store.addPinWithData('note', {
            text,
            color: '#FFF9C4', // default pastel yellow
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Listen for custom link-edit events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setEditingLinkPinId(e.detail);
    };
    window.addEventListener('edit-link-pin', handler as EventListener);
    return () => window.removeEventListener('edit-link-pin', handler as EventListener);
  }, []);

  const editingLinkPin = editingLinkPinId
    ? pins.find((p) => p.id === editingLinkPinId) || null
    : null;

  return (
    <div className="app-layout">
      <InfiniteCanvas />
      <BottomDock />
      <BottomNavBar />
      {editingLinkPin && (
        <LinkEditModal
          pin={editingLinkPin}
          onClose={() => setEditingLinkPinId(null)}
        />
      )}
    </div>
  );
}

