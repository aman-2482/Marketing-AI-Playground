interface PlaygroundState {
  output: string;
  loading: boolean;
}


import { createPlaygroundStreamWorker } from "./api";

let state: PlaygroundState = { output: "", loading: false };
let activeWorker: Worker | null = null;

let onChunkCb: ((text: string) => void) | null = null;
let onDoneCb: (() => void) | null = null;
let onErrorCb: ((msg: string) => void) | null = null;


export function getPlaygroundState(): PlaygroundState {
  return state;
}

export function startPlaygroundStream(data: {
  prompt: string;
  system_prompt?: string;
  temperature?: number;
  session_id?: string;
  model?: string;
}) {
  activeWorker?.terminate();
  state = { output: "", loading: true };

  const worker = createPlaygroundStreamWorker(
    data,
    (text) => {
      state = { ...state, output: state.output + text };
      onChunkCb?.(text);
    },
    () => {
      state = { ...state, loading: false };
      activeWorker = null;
      onDoneCb?.();
    },
    (msg) => {
      state = { ...state, loading: false };
      activeWorker = null;
      onErrorCb?.(msg);
    }
  );

  activeWorker = worker;
}

export function attachPlaygroundDisplay(
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
) {
  onChunkCb = onChunk;
  onDoneCb = onDone;
  onErrorCb = onError;
}

export function detachPlaygroundDisplay() {
  onChunkCb = null;
  onDoneCb = null;
  onErrorCb = null;
}

export function stopPlaygroundStream() {
  activeWorker?.terminate();
  activeWorker = null;
  state = { ...state, loading: false };
}

export function clearPlaygroundStream() {
  state = { output: "", loading: false };
}

export function isPlaygroundStreaming() {
  return activeWorker !== null;
}
