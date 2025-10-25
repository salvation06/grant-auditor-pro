// Browser AI APIs type declarations

interface SummarizerOptions {
  sharedContext?: string;
  type?: string;
  format?: string;
  length?: string | number;
}

interface Summarizer {
  summarize(text: string): Promise<string>;
  destroy(): void;
  ready?: Promise<void>;
  addEventListener?(event: string, callback: (e: any) => void): void;
}

interface SummarizerConstructor {
  create(options: SummarizerOptions): Promise<Summarizer>;
  availability(): Promise<'available' | 'unavailable' | 'after-download'>;
}

interface WriterOptions {
  tone?: string;
  length?: string;
  format?: string;
  sharedContext?: string;
}

interface Writer {
  writeStreaming(prompt: string): AsyncIterable<string>;
  write(prompt: string): Promise<string>;
  destroy(): void;
}

interface WriterConstructor {
  create(options: WriterOptions): Promise<Writer>;
  availability(): Promise<'available' | 'unavailable' | 'after-download'>;
}

declare global {
  const Summarizer: SummarizerConstructor;
  const Writer: WriterConstructor;
}

export {};
