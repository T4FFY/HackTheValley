import React, { useState } from "react";

export default function RainbowControls({ defaultUrl = "http://192.168.4.1" }) {
  const [robotUrl, setRobotUrl] = useState(defaultUrl);
  const [interval, setInterval] = useState(40); // ms between frames
  const [sat, setSat] = useState(255);         // saturation 0..255
  const [val, setVal] = useState(160);         // brightness 0..255
  const [log, setLog] = useState("Ready.");

  const base = robotUrl.replace(/\/+$/, "");

  const start = async () => {
    try {
      const url = `${base}/fx/rainbow/start?interval=${encodeURIComponent(interval)}&sat=${encodeURIComponent(sat)}&val=${encodeURIComponent(val)}`;
      setLog((p) => p + `\nGET ${url}`);
      const res = await fetch(url);
      setLog((p) => p + `\n→ ${res.ok ? "OK" : "ERR " + res.status}`);
    } catch (e) {
      setLog((p) => p + `\n⚠️ ${e.message || e}`);
    }
  };

  const stop = async () => {
    try {
      const url = `${base}/fx/rainbow/stop`;
      setLog((p) => p + `\nGET ${url}`);
      const res = await fetch(url);
      setLog((p) => p + `\n→ ${res.ok ? "OK" : "ERR " + res.status}`);
    } catch (e) {
      setLog((p) => p + `\n⚠️ ${e.message || e}`);
    }
  };

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, background: "#fff", maxWidth: 520 }}>
      <h3 style={{ marginTop: 0 }}>🌈 Rainbow Ring</h3>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "auto 1fr" }}>
        <label>Robot URL</label>
        <input value={robotUrl} onChange={(e) => setRobotUrl(e.target.value)} style={{ padding: 8 }} />

        <label>Interval (ms)</label>
        <input
          type="number"
          min={5}
          max={1000}
          step={5}
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          style={{ padding: 8 }}
        />

        <label>Sat (0–255)</label>
        <input
          type="number"
          min={0}
          max={255}
          value={sat}
          onChange={(e) => setSat(Number(e.target.value))}
          style={{ padding: 8 }}
        />

        <label>Val (0–255)</label>
        <input
          type="number"
          min={0}
          max={255}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          style={{ padding: 8 }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={start} style={{ padding: "8px 12px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6 }}>
          Start Rainbow
        </button>
        <button onClick={stop} style={{ padding: "8px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6 }}>
          Stop
        </button>
      </div>

      <pre style={{ marginTop: 12, background: "#0f172a", color: "#c7d2fe", padding: 8, borderRadius: 6, whiteSpace: "pre-wrap" }}>
        {log}
      </pre>
    </div>
  );
}
