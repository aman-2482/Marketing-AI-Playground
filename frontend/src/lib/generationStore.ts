import { createActivityStreamWorker } from "./api";

interface StreamState {
  slug: string;
  output: string;
  loading: boolean;
}

let state: StreamState | null = null;
let activeWorker: Worker | null = null;

let displayOnChunk: ((text: string) => void) | null = null;
let displayOnDone: (() => void) | null = null;
let displayOnError: ((msg: string) => void) | null = null;


export function getStreamState(): StreamState | null {
  return state;
}


export function startStream(
  slug: string,
  data: { prompt: string; session_id?: string; temperature?: number; model?: string },
): void {
  // Clean up any previous stream
  activeWorker?.terminate();
  activeWorker = null;

  state = { slug, output: "", loading: true };

  const worker = createActivityStreamWorker(
    slug,
    data,
    (text) => {
      if (state) {
        state = { ...state, output: state.output + text };
        displayOnChunk?.(text);
      }
    },
    () => {
      if (state) state = { ...state, loading: false };
      activeWorker = null;
      displayOnDone?.();
    },
    (msg) => {
      if (state) state = { ...state, loading: false };
      activeWorker = null;
      displayOnError?.(msg);
    }
  );

  activeWorker = worker;
}


export function attachDisplay(
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
): void {
  displayOnChunk = onChunk;
  displayOnDone = onDone;
  displayOnError = onError;
}


export function detachDisplay(): void {
  displayOnChunk = null;
  displayOnDone = null;
  displayOnError = null;
}

/** Abort the current stream. */
export function stopStream(): void {
  activeWorker?.terminate();
  activeWorker = null;
  if (state) state = { ...state, loading: false };
}

/** Clear saved state for a given slug (call after success / confirmed stop). */
export function clearStream(slug: string): void {
  if (state?.slug === slug) {
    state = null;
  }
}

/** True when a stream is actively running (Worker alive). */
export function isStreaming(): boolean {
  return activeWorker !== null;
}
