import { createCompareStreamWorker } from "./api";

interface CompareState {
  outputA: string;
  outputB: string;
  outputC: string;
  usedModelA: string;
  usedModelB: string;
  usedModelC: string;
  loading: boolean;
}

let state: CompareState = {
  outputA: "", outputB: "", outputC: "",
  usedModelA: "", usedModelB: "", usedModelC: "",
  loading: false,
};

let activeWorker: Worker | null = null;

type ChunkCb = (payload: { lane: "a" | "b" | "c"; chunk: string }) => void;
type DoneCb = (payload: { model_a: string; model_b: string; model_c?: string | null }) => void;
type ErrorCb = (msg: string) => void;

let onChunkCb: ChunkCb | null = null;
let onDoneCb: DoneCb | null = null;
let onErrorCb: ErrorCb | null = null;

export function getCompareState(): CompareState {
  return state;
}

export function startCompareStream(data: {
  prompt_a: string;
  prompt_b: string;
  prompt_c?: string;
  system_prompt?: string;
  temperature?: number;
  session_id?: string;
  model_a?: string;
  model_b?: string;
  model_c?: string;
}) {
  activeWorker?.terminate();
  state = { outputA: "", outputB: "", outputC: "", usedModelA: "", usedModelB: "", usedModelC: "", loading: true };

  const worker = createCompareStreamWorker(
    data,
    ({ lane, chunk }: { lane: "a" | "b" | "c"; chunk: string }) => {
      if (lane === "a") state = { ...state, outputA: state.outputA + chunk };
      if (lane === "b") state = { ...state, outputB: state.outputB + chunk };
      if (lane === "c") state = { ...state, outputC: state.outputC + chunk };
      onChunkCb?.({ lane, chunk });
    },
    (payload: { model_a: string; model_b: string; model_c?: string | null }) => {
      state = {
        ...state,
        usedModelA: payload.model_a || "",
        usedModelB: payload.model_b || "",
        usedModelC: payload.model_c || "",
        loading: false,
      };
      activeWorker = null;
      onDoneCb?.(payload);
    },
    (msg: string) => {
      state = { ...state, loading: false };
      activeWorker = null;
      onErrorCb?.(msg);
    }
  );

  activeWorker = worker;
}

export function attachCompareDisplay(onChunk: ChunkCb, onDone: DoneCb, onError: ErrorCb) {
  onChunkCb = onChunk;
  onDoneCb = onDone;
  onErrorCb = onError;
}

export function detachCompareDisplay() {
  onChunkCb = null;
  onDoneCb = null;
  onErrorCb = null;
}

export function stopCompareStream() {
  activeWorker?.terminate();
  activeWorker = null;
  state = { ...state, loading: false };
}

export function clearCompareStream() {
  state = { outputA: "", outputB: "", outputC: "", usedModelA: "", usedModelB: "", usedModelC: "", loading: false };
}

export function isCompareStreaming() {
  return activeWorker !== null;
}
