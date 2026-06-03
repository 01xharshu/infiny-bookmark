export type PinType = 'note' | 'image' | 'link' | 'quote' | 'video' | 'file' | 'task';
export type BackgroundStyle = 'solid' | 'dots' | 'grid' | 'lines';

export interface NoteData {
  text: string;
  color: string;
}

export interface ImageData {
  src: string;
  alt: string;
  color?: string;
}

export interface LinkData {
  url: string;
  title: string;
  description: string;
  favicon: string;
  ogImage?: string;
  color?: string;
}

export interface QuoteData {
  text: string;
  author: string;
  color: string;
}

export interface VideoData {
  url: string;
  title: string;
  channel: string;
  thumbnail: string;
  color?: string;
}

export interface FileData {
  name: string;
  size: string;
  type: string;
  color?: string;
}

export interface TaskData {
  title: string;
  status: 'draft' | 'in-progress' | 'in-review' | 'completed';
  pomodoroTimeLeft: number;
  pomodoroIsRunning: boolean;
  color?: string;
}

export type PinData = NoteData | ImageData | LinkData | QuoteData | VideoData | FileData | TaskData;

export interface Pin {
  id: string;
  type: PinType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  createdAt: string;
  data: PinData;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}
