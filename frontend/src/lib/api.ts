const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}


// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export function generatePlayground(data: {
  prompt: string;
  system_prompt?: string;
  temperature?: number;
  session_id?: string;
  model?: string;
}) {
  return request<{ response: string; prompt: string; model: string }>(
    "/playground/generate",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function generatePlaygroundStream(
  data: {
    prompt: string;
    system_prompt?: string;
    temperature?: number;
    session_id?: string;
    model?: string;
  },
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_BASE}/playground/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (!res.body) {
    throw new Error("Streaming response body is not available in this browser");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }

  const remainder = decoder.decode();
  if (remainder) {
    onChunk(remainder);
  }
}

export function comparePrompts(data: {
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
  return request<{
    response_a: string;
    response_b: string;
    response_c?: string | null;
    prompt_a: string;
    prompt_b: string;
    prompt_c?: string | null;
    model_a: string;
    model_b: string;
    model_c?: string | null;
  }>("/playground/compare", { method: "POST", body: JSON.stringify(data) });
}

export async function comparePromptsStream(
  data: {
    prompt_a: string;
    prompt_b: string;
    prompt_c?: string;
    system_prompt?: string;
    temperature?: number;
    session_id?: string;
    model_a?: string;
    model_b?: string;
    model_c?: string;
  },
  onChunk: (payload: { lane: "a" | "b" | "c"; chunk: string }) => void,
  onDone: (payload: { model_a: string; model_b: string; model_c?: string | null }) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_BASE}/playground/compare/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (!res.body) {
    throw new Error("Streaming response body is not available in this browser");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const payload = JSON.parse(line) as {
        lane?: "a" | "b" | "c";
        chunk?: string;
        done?: boolean;
        error?: string;
        model_a?: string;
        model_b?: string;
        model_c?: string | null;
      };
      if (payload.error) {
        throw new Error(payload.error);
      }
      if (payload.done) {
        onDone({
          model_a: payload.model_a || "",
          model_b: payload.model_b || "",
          model_c: payload.model_c,
        });
      } else if (payload.lane && payload.chunk) {
        onChunk({ lane: payload.lane, chunk: payload.chunk });
      }
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const payload = JSON.parse(buffer) as {
      lane?: "a" | "b" | "c";
      chunk?: string;
      done?: boolean;
      error?: string;
      model_a?: string;
      model_b?: string;
      model_c?: string | null;
    };
    if (payload.error) {
      throw new Error(payload.error);
    }
    if (payload.done) {
      onDone({
        model_a: payload.model_a || "",
        model_b: payload.model_b || "",
        model_c: payload.model_c,
      });
    } else if (payload.lane && payload.chunk) {
      onChunk({ lane: payload.lane, chunk: payload.chunk });
    }
  }
}


// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export interface Activity {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  instructions: string;
  tips: string;
  example_inputs: string;
  system_prompt: string;
  input_fields: string;
  order: number;
}

export interface InputField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect";
  placeholder?: string;
  options?: string[];
}

export function listActivities() {
  return request<Activity[]>("/activities/");
}

export function getActivity(slug: string) {
  return request<Activity>(`/activities/${slug}`);
}

export function generateActivity(
  slug: string,
  data: { prompt: string; session_id?: string; temperature?: number; model?: string }
) {
  return request<{ response: string; activity_slug: string; prompt: string; model: string }>(
    `/activities/${slug}/generate`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function generateActivityStream(
  slug: string,
  data: { prompt: string; session_id?: string; temperature?: number; model?: string },
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_BASE}/activities/${slug}/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (!res.body) {
    throw new Error("Streaming response body is not available in this browser");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }

  const remainder = decoder.decode();
  if (remainder) {
    onChunk(remainder);
  }
}


// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export interface ModelInfo {
  id: string;
  name: string;
}

export function listModels() {
  return request<{ models: ModelInfo[]; default: string }>("/models");
}


// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  id: number;
  session_id: string;
  activity_slug: string | null;
  prompt: string;
  system_prompt: string;
  response: string;
  model: string;
  temperature: number;
  is_favorite: boolean;
  created_at: string;
}

export function listHistory(sessionId: string = "default", limit: number = 500) {
  return request<HistoryEntry[]>(`/history/?session_id=${sessionId}&limit=${limit}`);
}

export function toggleFavorite(id: number, isFavorite: boolean) {
  return request<HistoryEntry>(`/history/${id}/favorite`, {
    method: "PATCH",
    body: JSON.stringify({ is_favorite: isFavorite }),
  });
}

export function deleteHistory(id: number) {
  return request<{ detail: string }>(`/history/${id}`, { method: "DELETE" });
}


// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  user_id: number;
}

export function registerUser(data: {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data: { username: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
