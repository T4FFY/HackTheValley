import React, { useCallback, useMemo, useRef, useState } from "react";
import RainbowControls from "./RainbowControls";

const DEFAULT_ROBOT_URL = "http://192.168.4.1";
const GAP_MS = 150;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NOTE_OPTIONS = [
  "C3",
  "D3",
  "E3",
  "F3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
  "F5",
  "G5",
  "A5",
  "B5",
  "C6",
  "D6",
  "E6",
  "F6",
  "G6",
];

let uid = 1;
const newId = () => String(uid++);

export default function SimpleDragAndRun() {
  const [robotUrl, setRobotUrl] = useState(DEFAULT_ROBOT_URL);
  const [items, setItems] = useState([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState(
    "👋 Drag actions into the sequence, tweak values, then press Run."
  );

  // ----- Palette drag -----
  const paletteDragStart = (e, type) => {
    e.dataTransfer.setData("text/plain", type);
  };

  const dropZoneRef = useRef(null);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (!type) return;
    const add = (obj) => setItems((prev) => [...prev, obj]);

    switch (type) {
      case "move":
        add({ id: newId(), type: "move", dir: "forward", seconds: 0.8 });
        break;
      case "beep":
        add({ id: newId(), type: "beep" });
        break;
      case "note":
        add({ id: newId(), type: "note", name: "C4", beats: 1 });
        break;
      case "mary":
        add({ id: newId(), type: "mary" });
        break;
      case "rgb":
        add({ id: newId(), type: "rgb", hex: "#00AEEF", r: 0, g: 128, b: 255 });
        break;
      case "lcd":
        add({
          id: newId(),
          type: "lcd",
          msg: "Hello Robot!",
          row: 0,
          align: "center",
          hex: "#00AEEF",
          r: 0,
          g: 128,
          b: 255,
        });
        break;
      case "wait":
        add({ id: newId(), type: "wait", seconds: 1 });
        break;
      case "rainbowStart":
        add({
          id: newId(),
          type: "rainbowStart",
          interval: 40,
          sat: 255,
          val: 160,
        });
        break;
      case "rainbowStop":
        add({ id: newId(), type: "rainbowStop" });
        break;
      default:
        break;
    }
  };

  // ----- Update / reorder -----
  const updateItem = (id, patch) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));
  const moveUp = (i) =>
    setItems((prev) => (i <= 0 ? prev : swap(prev, i, i - 1)));
  const moveDown = (i) =>
    setItems((prev) => (i >= prev.length - 1 ? prev : swap(prev, i, i + 1)));
  const swap = (arr, i, j) => {
    const c = [...arr];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };

  // ----- Runner -----
  const run = useCallback(async () => {
    if (!items.length || running) return;
    setRunning(true);
    setLog("🚀 Executing…");

    const base = robotUrl.replace(/\/+$/, "");
    const stepLog = (t) => setLog((p) => p + "\n• " + t);

    try {
      for (const it of items) {
        switch (it.type) {
          case "move": {
            const dir = it.dir === "backward" ? "back" : "fwd";
            const ms = Math.max(
              0,
              Math.round(Number(it.seconds || 0.8) * 1000)
            );
            const body = new URLSearchParams({
              l: dir,
              r: dir,
              ms: String(ms),
            });
            stepLog(`POST ${base}/motor  body: ${body.toString()}`);
            await fetch(`${base}/motor`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body,
            });
            break;
          }

          case "beep": {
            const url = `${base}/beep`;
            stepLog(`GET ${url}`);
            await fetch(url);
            break;
          }
          case "note": {
            const name = it.name || "C4";
            const beats = Math.max(0.1, Number(it.beats) || 1);
            const url = `${base}/note?name=${encodeURIComponent(
              name
            )}&beats=${encodeURIComponent(beats)}`;
            stepLog(`GET ${url}`);
            await fetch(url);
            break;
          }
          case "mary": {
            const url = `${base}/mary`;
            stepLog(`GET ${url}`);
            await fetch(url);
            break;
          }
          case "rgb": {
            const hasHex = it.hex && String(it.hex).trim().length >= 4;
            if (hasHex) {
              let hex = String(it.hex).trim();
              if (!hex.startsWith("#")) hex = "#" + hex;
              const body = new URLSearchParams({ hex });
              stepLog(`POST ${base}/rgb  body: ${body.toString()}`);
              await fetch(`${base}/rgb`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body,
              });
            } else {
              const r = clamp255(it.r),
                g = clamp255(it.g),
                b = clamp255(it.b);
              const body = new URLSearchParams({
                r: String(r),
                g: String(g),
                b: String(b),
              });
              stepLog(`POST ${base}/rgb  body: ${body.toString()}`);
              await fetch(`${base}/rgb`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body,
              });
            }
            break;
          }
          case "lcd": {
            const p = new URLSearchParams();
            p.set("msg", it.msg || "");
            p.set("row", String(Math.min(1, Math.max(0, Number(it.row) || 0))));
            p.set("align", (it.align || "center").toLowerCase());
            const hasHex = it.hex && String(it.hex).trim().length >= 4;
            if (hasHex) {
              let hex = String(it.hex).trim();
              if (!hex.startsWith("#")) hex = "#" + hex;
              p.set("hex", hex);
            } else if (
              it.r !== undefined ||
              it.g !== undefined ||
              it.b !== undefined
            ) {
              p.set("r", String(clamp255(it.r)));
              p.set("g", String(clamp255(it.g)));
              p.set("b", String(clamp255(it.b)));
            }

            stepLog(`POST ${base}/lcd  body: ${p.toString()}`);
            await fetch(`${base}/lcd`, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: p,
            });
            break;
          }
          case "wait": {
            const ms = Math.max(0, Math.round(Number(it.seconds || 1) * 1000));
            stepLog(`WAIT ${ms}ms`);
            await sleep(ms);
            break;
          }
          case "rainbowStart": {
            const interval = Math.max(
              5,
              Math.min(1000, Number(it.interval) || 40)
            );
            const sat = clamp255(it.sat);
            const val = clamp255(it.val);
            const url = `${base}/fx/rainbow/start?interval=${encodeURIComponent(
              interval
            )}&sat=${encodeURIComponent(sat)}&val=${encodeURIComponent(val)}`;
            stepLog(`GET ${url}`);
            await fetch(url);
            break;
          }
          case "rainbowStop": {
            const url = `${base}/fx/rainbow/stop`;
            stepLog(`GET ${url}`);
            await fetch(url);
            break;
          }
          default:
            break;
        }
        await sleep(GAP_MS);
      }
      stepLog("✅ Done!");
    } catch (e) {
      console.error(e);
      stepLog(`❌ Error: ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  }, [items, robotUrl, running]);

  // ----- UI -----
  const palette = useMemo(
    () => [
      { type: "move", label: "🚗 Move" }, // NEW
      { type: "beep", label: "🔔 Beep" },
      { type: "note", label: "🎵 Note" },
      { type: "mary", label: "🎶 Mary" },
      { type: "rgb", label: "💡 RGB" },
      { type: "lcd", label: "📺 LCD" },
      { type: "wait", label: "⏱️ Wait" },
      { type: "rainbowStart", label: "🌈 Rainbow Start" },
      { type: "rainbowStop", label: "🛑 Rainbow Stop" },
    ],
    []
  );

  return (
    <div style={{ minHeight: "100vh", padding: 16, background: "#f7f7fb" }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Simple Drag & Run</h1>
      <p style={{ marginTop: 6 }}>
        Endpoints used: <code>/motor</code>, <code>/beep</code>,{" "}
        <code>/note</code>, <code>/mary</code>, <code>/rgb</code>,{" "}
        <code>/lcd</code>, <code>/fx/rainbow/start</code>,{" "}
        <code>/fx/rainbow/stop</code>
      </p>

      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        {/* Palette */}
        <div style={{ width: 220 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Palette</div>
          <div style={{ display: "grid", gap: 8 }}>
            {palette.map((p) => (
              <div
                key={p.type}
                draggable
                onDragStart={(e) => paletteDragStart(e, p.type)}
                style={{
                  userSelect: "none",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  background: "white",
                  cursor: "grab",
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sequence / Drop zone */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sequence</div>

          <div
            ref={dropZoneRef}
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{
              minHeight: 220,
              border: "2px dashed #bbb",
              borderRadius: 10,
              background: "#fff",
              padding: 10,
            }}
          >
            {items.length === 0 ? (
              <div style={{ color: "#666", padding: 8 }}>
                Drag actions here…
              </div>
            ) : (
              items.map((it, i) => (
                <div
                  key={it.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 8,
                    padding: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    marginBottom: 8,
                    background: "#fafafa",
                  }}
                >
                  <div>
                    {/* NEW: Move block UI */}
                    {it.type === "move" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>🚗 Move</strong>
                        <label>
                          direction:
                          <select
                            value={it.dir}
                            onChange={(e) =>
                              updateItem(it.id, { dir: e.target.value })
                            }
                            style={{ marginLeft: 6 }}
                          >
                            <option value="forward">forward</option>
                            <option value="backward">backward</option>
                          </select>
                        </label>
                        <label>
                          seconds:
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={it.seconds}
                            onChange={(e) =>
                              updateItem(it.id, { seconds: e.target.value })
                            }
                            style={{ width: 80, marginLeft: 6 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "beep" && <strong>🔔 Beep</strong>}

                    {it.type === "note" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>🎵 Note</strong>
                        <select
                          value={it.name}
                          onChange={(e) =>
                            updateItem(it.id, { name: e.target.value })
                          }
                        >
                          {NOTE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <label>
                          beats:
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={it.beats}
                            onChange={(e) =>
                              updateItem(it.id, { beats: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 6 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "mary" && (
                      <strong>🎶 Mary Had a Little Lamb</strong>
                    )}

                    {it.type === "rgb" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>💡 RGB</strong>
                        <label title="Prefer hex if set">
                          hex:
                          <input
                            type="text"
                            value={it.hex}
                            onChange={(e) =>
                              updateItem(it.id, { hex: e.target.value })
                            }
                            placeholder="#RRGGBB"
                            style={{ width: 110, marginLeft: 6 }}
                          />
                        </label>
                        <span style={{ opacity: 0.6 }}>(or r,g,b)</span>
                        <label>
                          r:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.r}
                            onChange={(e) =>
                              updateItem(it.id, { r: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                        <label>
                          g:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.g}
                            onChange={(e) =>
                              updateItem(it.id, { g: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                        <label>
                          b:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.b}
                            onChange={(e) =>
                              updateItem(it.id, { b: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "lcd" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>📺 LCD</strong>
                        <input
                          type="text"
                          value={it.msg}
                          onChange={(e) =>
                            updateItem(it.id, { msg: e.target.value })
                          }
                          placeholder="Message"
                          style={{ flex: 1, minWidth: 180 }}
                        />
                        <label>
                          row:
                          <select
                            value={it.row}
                            onChange={(e) =>
                              updateItem(it.id, { row: Number(e.target.value) })
                            }
                            style={{ marginLeft: 6 }}
                          >
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                          </select>
                        </label>
                        <label>
                          align:
                          <select
                            value={it.align}
                            onChange={(e) =>
                              updateItem(it.id, { align: e.target.value })
                            }
                            style={{ marginLeft: 6 }}
                          >
                            <option value="left">left</option>
                            <option value="center">center</option>
                            <option value="right">right</option>
                          </select>
                        </label>
                        <label title="Backlight (prefer hex if set)">
                          hex:
                          <input
                            type="text"
                            value={it.hex}
                            onChange={(e) =>
                              updateItem(it.id, { hex: e.target.value })
                            }
                            placeholder="#00AEEF"
                            style={{ width: 110, marginLeft: 6 }}
                          />
                        </label>
                        <span style={{ opacity: 0.6 }}>(or r,g,b)</span>
                        <label>
                          r:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.r}
                            onChange={(e) =>
                              updateItem(it.id, { r: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                        <label>
                          g:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.g}
                            onChange={(e) =>
                              updateItem(it.id, { g: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                        <label>
                          b:
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.b}
                            onChange={(e) =>
                              updateItem(it.id, { b: e.target.value })
                            }
                            style={{ width: 70, marginLeft: 4 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "wait" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <strong>⏱️ Wait</strong>
                        <label>
                          seconds:
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={it.seconds}
                            onChange={(e) =>
                              updateItem(it.id, { seconds: e.target.value })
                            }
                            style={{ width: 80, marginLeft: 6 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "rainbowStart" && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>🌈 Rainbow Start</strong>
                        <label>
                          interval (ms):
                          <input
                            type="number"
                            min="5"
                            max="1000"
                            step="5"
                            value={it.interval}
                            onChange={(e) =>
                              updateItem(it.id, {
                                interval: Number(e.target.value),
                              })
                            }
                            style={{ width: 90, marginLeft: 6 }}
                          />
                        </label>
                        <label>
                          sat (0–255):
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.sat}
                            onChange={(e) =>
                              updateItem(it.id, { sat: Number(e.target.value) })
                            }
                            style={{ width: 90, marginLeft: 6 }}
                          />
                        </label>
                        <label>
                          val (0–255):
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={it.val}
                            onChange={(e) =>
                              updateItem(it.id, { val: Number(e.target.value) })
                            }
                            style={{ width: 90, marginLeft: 6 }}
                          />
                        </label>
                      </div>
                    )}

                    {it.type === "rainbowStop" && (
                      <strong>🛑 Rainbow Stop</strong>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => moveUp(i)} title="Up">
                      ↑
                    </button>
                    <button onClick={() => moveDown(i)} title="Down">
                      ↓
                    </button>
                    <button onClick={() => removeItem(it.id)} title="Delete">
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={() => setItems([])}
              disabled={running}
              style={{ padding: "8px 12px" }}
            >
              Clear
            </button>
            <button
              onClick={run}
              disabled={!items.length || running}
              style={{
                padding: "8px 12px",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: !items.length || running ? "not-allowed" : "pointer",
                opacity: !items.length || running ? 0.6 : 1,
              }}
            >
              {running ? "Running…" : "Run"}
            </button>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span>Robot URL:</span>
              <input
                value={robotUrl}
                onChange={(e) => setRobotUrl(e.target.value)}
                style={{ width: 260, padding: "6px 8px" }}
                placeholder="http://192.168.4.1"
              />
            </div>
          </div>

          {/* Log */}
          <div
            style={{
              marginTop: 10,
              background: "#0f172a",
              color: "#c7d2fe",
              minHeight: 140,
              borderRadius: 8,
              padding: 10,
              whiteSpace: "pre-wrap",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
              fontSize: 13,
            }}
          >
            {log}
          </div>

          {/* Optional: direct controls for rainbow */}
          <div style={{ marginTop: 16 }}>
            <RainbowControls defaultUrl={robotUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp255(v) {
  const n = Math.round(Number(v || 0));
  if (Number.isNaN(n)) return 0;
  return Math.min(255, Math.max(0, n));
}
