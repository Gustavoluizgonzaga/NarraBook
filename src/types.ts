export interface BookMetadata {
  title: string;
  author?: string;
  cover?: string;
  format: 'txt' | 'epub' | 'pdf';
}

export interface Chapter {
  id: string;
  title: string;
  startIndex: number;
}

export interface BookData {
  metadata: BookMetadata;
  paragraphs: string[];
  chapters: Chapter[];
}

export interface PlaybackSettings {
  rate: number;
  volume: number;
  voiceURI?: string;
  paragraphIndex: number;
}

export interface LibraryEntry {
  id: string;
  book: BookData;
  settings: PlaybackSettings;
  lastRead: number;
}
