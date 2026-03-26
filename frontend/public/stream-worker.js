

self.onmessage = async (event) => {
  const { type, url, method, headers, body, mode } = event.data;
  if (type !== 'start') return;

  try {
    const res = await fetch(url, { method, headers, body });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try { const err = await res.json(); message = err.detail || message; } catch { /**/ }
      self.postMessage({ type: 'error', message });
      return;
    }

    if (!res.body) {
      self.postMessage({ type: 'error', message: 'No response body available' });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    if (mode === 'ndjson') {
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          self.postMessage({ type: 'json_line', line });
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) self.postMessage({ type: 'json_line', line: buffer });
    } else {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (text) self.postMessage({ type: 'chunk', text });
      }
      const remainder = decoder.decode();
      if (remainder) self.postMessage({ type: 'chunk', text: remainder });
    }

    self.postMessage({ type: 'done' });
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
