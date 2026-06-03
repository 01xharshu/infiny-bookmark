import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Pin, PinType, Viewport, PinData, BackgroundStyle } from '@/types/pin';

const NOTE_COLORS = ['#FFF9C4', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#E1BEE7', '#FFE0B2'];
const QUOTE_COLORS = ['#F3E5F5', '#E8F5E9', '#FFF3E0', '#E3F2FD', '#FCE4EC'];

function getDefaultData(type: PinType): PinData {
  switch (type) {
    case 'note':
      return {
        text: 'New note...',
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      };
    case 'image':
      return {
        src: '',
        alt: 'Uploaded image',
      };
    case 'link':
      return {
        url: 'https://example.com',
        title: 'Bookmark',
        description: 'Click to edit this bookmark',
        favicon: '',
      };
    case 'quote':
      return {
        text: 'Enter your quote here...',
        author: 'Author',
        color: QUOTE_COLORS[Math.floor(Math.random() * QUOTE_COLORS.length)],
      };
    case 'video':
      return {
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Video Title',
        channel: 'Channel Name',
        thumbnail: '',
      };
    case 'file':
      return {
        name: 'document.pdf',
        size: '2.4 MB',
        type: 'pdf',
      };
    case 'task':
      return {
        title: 'New Task',
        status: 'draft',
        pomodoroTimeLeft: 25 * 60,
        pomodoroIsRunning: false,
      };
    default:
      return { text: '', color: '#FFF9C4' };
  }
}

function getDefaultSize(type: PinType): { width: number; height: number } {
  switch (type) {
    case 'note':
      return { width: 260, height: 180 };
    case 'image':
      return { width: 280, height: 240 };
    case 'link':
      return { width: 300, height: 140 };
    case 'quote':
      return { width: 320, height: 200 };
    case 'video':
      return { width: 340, height: 260 };
    case 'file':
      return { width: 240, height: 120 };
    case 'task':
      return { width: 320, height: 160 };
    default:
      return { width: 260, height: 180 };
  }
}

interface CanvasStore {
  viewport: Viewport;
  setViewport: (v: Partial<Viewport>) => void;

  backgroundStyle: BackgroundStyle;
  setBackgroundStyle: (style: BackgroundStyle) => void;

  pins: Pin[];
  addPin: (type: PinType, position?: { x: number; y: number }) => void;
  addPinWithData: (type: PinType, data: PinData, size?: { width: number; height: number }) => string;
  updatePin: (id: string, updates: Partial<Pin>) => void;
  updatePinData: (id: string, dataUpdates: Partial<PinData>) => void;
  deletePin: (id: string) => void;
  movePin: (id: string, x: number, y: number) => void;
  bringToFront: (id: string) => void;
  clearCanvas: () => void;
  bentoLayout: () => void;

  selectedPinId: string | null;
  selectPin: (id: string | null) => void;

  maxZIndex: number;

  save: () => void;
  load: () => void;
  loadSamplePins: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  setViewport: (v) =>
    set((state) => {
      const newState = { viewport: { ...state.viewport, ...v } };
      setTimeout(() => get().save(), 100);
      return newState;
    }),

  backgroundStyle: 'solid',
  setBackgroundStyle: (style) => {
    set({ backgroundStyle: style });
    setTimeout(() => get().save(), 100);
  },

  pins: [],
  maxZIndex: 0,

  addPin: (type, position) => {
    const { viewport, maxZIndex } = get();
    const { width, height } = getDefaultSize(type);

    // Place at center of current viewport if no position given
    const x = position?.x ?? (-viewport.x + window.innerWidth / 2) / viewport.scale - width / 2;
    const y = position?.y ?? (-viewport.y + window.innerHeight / 2) / viewport.scale - height / 2;

    // Add some random offset to avoid stacking
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    const newPin: Pin = {
      id: nanoid(),
      type,
      x: x + offsetX,
      y: y + offsetY,
      width,
      height,
      zIndex: maxZIndex + 1,
      createdAt: new Date().toISOString(),
      data: getDefaultData(type),
    };

    set((state) => ({
      pins: [...state.pins, newPin],
      maxZIndex: maxZIndex + 1,
    }));

    // Auto-save after adding
    setTimeout(() => get().save(), 100);
  },

  addPinWithData: (type, data, size) => {
    const { viewport, maxZIndex } = get();
    const defaultSize = getDefaultSize(type);
    const width = size?.width ?? defaultSize.width;
    const height = size?.height ?? defaultSize.height;

    const x = (-viewport.x + window.innerWidth / 2) / viewport.scale - width / 2;
    const y = (-viewport.y + window.innerHeight / 2) / viewport.scale - height / 2;

    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = (Math.random() - 0.5) * 80;

    const newPin: Pin = {
      id: nanoid(),
      type,
      x: x + offsetX,
      y: y + offsetY,
      width,
      height,
      zIndex: maxZIndex + 1,
      createdAt: new Date().toISOString(),
      data,
    };

    set((state) => ({
      pins: [...state.pins, newPin],
      maxZIndex: maxZIndex + 1,
    }));

    setTimeout(() => get().save(), 100);
    return newPin.id;
  },

  updatePin: (id, updates) => {
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    setTimeout(() => get().save(), 300);
  },

  updatePinData: (id, dataUpdates) => {
    set((state) => ({
      pins: state.pins.map((p) =>
        p.id === id ? { ...p, data: { ...p.data, ...dataUpdates } } : p
      ),
    }));
    setTimeout(() => get().save(), 300);
  },

  deletePin: (id) => {
    set((state) => ({
      pins: state.pins.filter((p) => p.id !== id),
      selectedPinId: state.selectedPinId === id ? null : state.selectedPinId,
    }));
    setTimeout(() => get().save(), 100);
  },

  movePin: (id, x, y) => {
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, x, y } : p)),
    }));
    // Don't save on every move frame — save on drag end
  },

  bringToFront: (id) => {
    const { maxZIndex } = get();
    const newZ = maxZIndex + 1;
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, zIndex: newZ } : p)),
      maxZIndex: newZ,
    }));
  },

  clearCanvas: () => set({ pins: [] }),

  bentoLayout: () =>
    set((state) => {
      const pins = [...state.pins];
      const GAP = 32;
      const MAX_WIDTH = 1400;
      
      let currentX = 100;
      let currentY = 100;
      let rowHeight = 0;
      
      const newPins = pins.map(pin => {
        if (currentX + pin.width > MAX_WIDTH && currentX > 100) {
          currentX = 100;
          currentY += rowHeight + GAP;
          rowHeight = 0;
        }
        
        const newX = currentX;
        const newY = currentY;
        
        currentX += pin.width + GAP;
        rowHeight = Math.max(rowHeight, pin.height);
        
        return { ...pin, x: newX, y: newY };
      });
      
      return { pins: newPins, viewport: { x: 0, y: 0, scale: 0.9 } };
    }),

  selectedPinId: null,
  selectPin: (id) => set({ selectedPinId: id }),

  save: () => {
    const { pins, viewport, maxZIndex, backgroundStyle } = get();
    try {
      localStorage.setItem(
        'infiny-bookmark-data',
        JSON.stringify({ pins, viewport, maxZIndex, backgroundStyle })
      );
    } catch {
      // localStorage might be full or unavailable
    }
  },

  load: () => {
    try {
      const raw = localStorage.getItem('infiny-bookmark-data');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.pins && data.pins.length > 0) {
          const maxZ = data.pins.reduce(
            (max: number, p: Pin) => Math.max(max, p.zIndex),
            0
          );
          set({
            pins: data.pins,
            viewport: data.viewport || { x: 0, y: 0, scale: 1 },
            maxZIndex: data.maxZIndex ?? maxZ,
            backgroundStyle: data.backgroundStyle || 'solid',
          });
          return;
        }
      }
      // First visit — load sample pins
      get().loadSamplePins();
    } catch {
      // Corrupted data — load samples
      get().loadSamplePins();
    }
  },

  loadSamplePins: () => {
    const samplePins: Pin[] = [
      {
        id: nanoid(),
        type: 'quote',
        x: 120,
        y: 80,
        width: 340,
        height: 200,
        zIndex: 1,
        createdAt: new Date().toISOString(),
        data: {
          text: 'until death, all defeat is psychological',
          author: 'Unknown',
          color: '#F3E5F5',
        },
      },
      {
        id: nanoid(),
        type: 'note',
        x: 500,
        y: 60,
        width: 280,
        height: 200,
        zIndex: 2,
        createdAt: new Date().toISOString(),
        data: {
          text: 'Send reminder of incoming small memories package to expected delivery date 📦',
          color: '#C8E6C9',
        },
      },
      {
        id: nanoid(),
        type: 'link',
        x: 840,
        y: 100,
        width: 300,
        height: 140,
        zIndex: 3,
        createdAt: new Date().toISOString(),
        data: {
          url: 'https://smallmemories.art',
          title: 'Small Memories',
          description: 'smallmemories.art — Made to be kept',
          favicon: '',
        },
      },
      {
        id: nanoid(),
        type: 'video',
        x: 160,
        y: 340,
        width: 340,
        height: 260,
        zIndex: 4,
        createdAt: new Date().toISOString(),
        data: {
          url: 'https://youtube.com/watch?v=example',
          title: 'How to Learn Pretty Much Anything',
          channel: 'Mattias Pilhede',
          thumbnail: '',
        },
      },
      {
        id: nanoid(),
        type: 'quote',
        x: 560,
        y: 360,
        width: 300,
        height: 220,
        zIndex: 5,
        createdAt: new Date().toISOString(),
        data: {
          text: 'Small Memories — Made to be Kept. These prints are a small reminder to pause, notice, and hold on to the little things.',
          author: 'jerry',
          color: '#FFFFFF',
        },
      },
      {
        id: nanoid(),
        type: 'task',
        x: 920,
        y: 340,
        width: 320,
        height: 160,
        zIndex: 5,
        createdAt: new Date().toISOString(),
        data: {
          title: 'Design system updates',
          status: 'in-progress',
          pomodoroTimeLeft: 25 * 60,
          pomodoroIsRunning: false
        },
      },
      {
        id: nanoid(),
        type: 'file',
        x: 200,
        y: 650,
        width: 260,
        height: 120,
        zIndex: 7,
        createdAt: new Date().toISOString(),
        data: {
          name: 'mood-board-2025.pdf',
          size: '4.2 MB',
          type: 'pdf',
        },
      },
      {
        id: nanoid(),
        type: 'note',
        x: 520,
        y: 640,
        width: 260,
        height: 160,
        zIndex: 8,
        createdAt: new Date().toISOString(),
        data: {
          text: 'I know I was made for this ✨\nBut these are some big waves… 🌊',
          color: '#BBDEFB',
        },
      },
    ];

    set({
      pins: samplePins,
      maxZIndex: samplePins.length,
      viewport: { x: 0, y: 0, scale: 0.9 },
    });

    setTimeout(() => get().save(), 100);
  },
}));

