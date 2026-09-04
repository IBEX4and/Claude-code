/* pengcode — interface. Um estado, um render, um pedido em voo por vez. */
"use strict";

const API = {
  config: () => fetch("/api/config").then((r) => r.json()),
  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch("/api/upload", { method: "POST", body: fd }).then(check);
  },
  generate: (body, signal) =>
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }).then(check),
};

async function check(r) {
  if (r.ok) return r.json();
  const detail = await r.json().catch(() => ({}));
  throw new Error(detail.detail || `${r.status} ${r.statusText}`);
}

/* ------------------------------------------------------------------ estado */

const state = {
  config: null,
  imageId: null,
  imageName: null,
  mode: "edges",
  pattern: null,
  params: {},
  profile: {},
  result: null,
  inflight: null,
  view: { scale: 1, tx: 0, ty: 0, ready: false },
  anim: { on: false, index: 0, path: null, raf: 0 },
};

/* Definições dos controles. `unit: "mm"` marca o que é medida de papel — os
   parâmetros de densidade são físicos, não dependem da resolução da imagem. */
const CONTROLS = {
  max_dim: { label: "Resolução", min: 200, max: 1600, step: 50, unit: "px" },
  contrast: { label: "Contraste", min: 0.2, max: 3, step: 0.05 },
  gamma: { label: "Gama", min: 0.2, max: 3, step: 0.05 },
  brightness: { label: "Brilho", min: -0.5, max: 0.5, step: 0.02 },
  blur: { label: "Desfoque", min: 0, max: 6, step: 0.1, unit: "px" },
  invert: { label: "Inverter claro/escuro", type: "check" },
  autolevel: { label: "Ajustar níveis automaticamente", type: "check" },

  edge_sigma: { label: "Suavização", min: 0.5, max: 5, step: 0.1 },
  edge_low: { label: "Corte de detalhe", min: 0.4, max: 0.99, step: 0.01 },
  edge_high: { label: "Corte de borda forte", min: 0.5, max: 0.999, step: 0.005 },
  threshold: { label: "Limiar (vazio = automático)", type: "number", step: 0.01 },
  levels: { label: "Níveis", min: 1, max: 24, step: 1 },
  contour_low: { label: "Tom mais claro", min: 0.02, max: 0.98, step: 0.02 },
  contour_high: { label: "Tom mais escuro", min: 0.02, max: 0.98, step: 0.02 },
  hatch_spacing: { label: "Espaçamento", min: 0.2, max: 4, step: 0.05, unit: "mm" },
  hatch_levels: { label: "Camadas de tom", min: 1, max: 6, step: 1 },
  hatch_angle: { label: "Ângulo", min: 0, max: 180, step: 5, unit: "°" },
  hatch_angle_step: { label: "Giro por camada", min: 0, max: 90, step: 5, unit: "°" },
  spiral_pitch: { label: "Passo entre voltas", min: 0.5, max: 8, step: 0.1, unit: "mm" },
  spiral_wavelength: { label: "Comprimento de onda", min: 0.5, max: 8, step: 0.1, unit: "mm" },
  spiral_amplitude: { label: "Amplitude", min: 0.1, max: 3, step: 0.05, unit: "mm" },
  spiral_skip_white: { label: "Pular áreas claras", min: 0, max: 0.9, step: 0.05 },
  stipple_points: { label: "Pontos", min: 200, max: 8000, step: 100 },
  stipple_iterations: { label: "Relaxação", min: 2, max: 40, step: 1 },
  stipple_style: { label: "Estilo", type: "select", options: [["tsp", "linha única"], ["dots", "pontinhos"]] },
  stipple_dot: { label: "Tamanho do ponto", min: 0.2, max: 3, step: 0.05, unit: "mm" },

  fit: { label: "Encaixe", type: "select", options: [["fit", "caber inteiro"], ["fill", "preencher"], ["stretch", "esticar"]] },
  rotate: { label: "Giro", type: "select", options: [[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"]] },

  simplify: { label: "Simplificar", min: 0, max: 1, step: 0.01, unit: "mm" },
  join: { label: "Emendar pontas", min: 0, max: 3, step: 0.05, unit: "mm" },
  min_length: { label: "Descartar traços menores que", min: 0, max: 5, step: 0.1, unit: "mm" },
  reorder: { label: "Reordenar para encurtar viagens", type: "check" },
  time_budget: { label: "Tempo de refino", min: 0, max: 10, step: 0.5, unit: "s" },
};

const MACHINE = [
  { key: "_paper", label: "Folha", type: "select", options: [] },
  { key: "_landscape", label: "Deitada", type: "check" },
  { key: "pen_offset.x", label: "Offset caneta X", type: "number", step: 0.5, unit: "mm" },
  { key: "pen_offset.y", label: "Offset caneta Y", type: "number", step: 0.5, unit: "mm" },
  { key: "z.down", label: "Z desenhando", type: "number", step: 0.05, unit: "mm" },
  { key: "z.up", label: "Z levantada", type: "number", step: 0.1, unit: "mm" },
  { key: "feeds.draw", label: "Velocidade desenho", type: "number", step: 100, unit: "mm/min" },
  { key: "feeds.travel", label: "Velocidade viagem", type: "number", step: 100, unit: "mm/min" },
  { key: "accel", label: "Aceleração", type: "number", step: 100, unit: "mm/s²" },
];

/* --------------------------------------------------------------- utilidades */

const $ = (sel) => document.querySelector(sel);
const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const bury = (obj, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) cur = cur[k] || (cur[k] = {});
  cur[last] = value;
};

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

/* ---------------------------------------------------------------- controles */

function field(key, spec, value, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "field";

  if (spec.type === "check") {
    wrap.classList.add("inline");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!value;
    input.id = `f_${key}`;
    input.addEventListener("change", () => onChange(input.checked));
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = spec.label;
    label.style.margin = "0";
    wrap.append(input, label);
    return wrap;
  }

  const label = document.createElement("label");
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = spec.label;
  const val = document.createElement("span");
  val.className = "val";
  label.append(name, val);
  wrap.append(label);

  if (spec.type === "select") {
    const sel = document.createElement("select");
    for (const [v, text] of spec.options) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = text;
      sel.append(opt);
    }
    sel.value = value ?? spec.options[0][0];
    sel.addEventListener("change", () => onChange(sel.value));
    wrap.append(sel);
    return wrap;
  }

  if (spec.type === "number") {
    const input = document.createElement("input");
    input.type = "number";
    input.step = spec.step ?? 1;
    if (value !== null && value !== undefined) input.value = value;
    val.textContent = spec.unit || "";
    input.addEventListener("change", () => onChange(input.value === "" ? null : Number(input.value)));
    wrap.append(input);
    return wrap;
  }

  const input = document.createElement("input");
  input.type = "range";
  input.min = spec.min;
  input.max = spec.max;
  input.step = spec.step;
  input.value = value ?? spec.min;
  const show = () => (val.textContent = `${Number(input.value)}${spec.unit ? " " + spec.unit : ""}`);
  show();
  input.addEventListener("input", show);
  input.addEventListener("change", () => onChange(Number(input.value)));
  wrap.append(input);
  return wrap;
}

function renderModeParams() {
  const host = $("#modeParams");
  host.textContent = "";
  const info = state.config.modes[state.mode] || { params: [] };
  $("#modeHint").textContent = info.hint || "";
  for (const key of info.params) {
    const spec = CONTROLS[key];
    if (!spec) continue;
    host.append(field(key, spec, state.params[key], (v) => setParam(key, v)));
  }
  host.append(field("fit", CONTROLS.fit, state.params.fit, (v) => setParam("fit", v)));
  host.append(field("rotate", CONTROLS.rotate, state.params.rotate, (v) => setParam("rotate", Number(v))));
}

function renderStaticParams() {
  const groups = {
    "#imageParams": ["max_dim", "contrast", "gamma", "brightness", "blur", "invert", "autolevel"],
    "#optParams": ["simplify", "join", "min_length", "time_budget", "reorder"],
  };
  for (const [sel, keys] of Object.entries(groups)) {
    const host = $(sel);
    host.textContent = "";
    for (const key of keys) host.append(field(key, CONTROLS[key], state.params[key], (v) => setParam(key, v)));
  }

  const host = $("#machineParams");
  host.textContent = "";
  for (const spec of MACHINE) {
    const conf = { ...spec };
    if (spec.key === "_paper") conf.options = [["", "manter"], ...state.config.papers.map((p) => [p, p])];
    const value = spec.key.startsWith("_") ? state.profile[spec.key] : dig(state.profile, spec.key) ?? dig(state.config.profile, spec.key);
    host.append(
      field(spec.key, conf, value, (v) => {
        if (spec.key.startsWith("_")) state.profile[spec.key] = v;
        else bury(state.profile, spec.key, v);
        request();
      })
    );
  }
}

function setParam(key, value) {
  state.params[key] = value;
  state.pattern = null;
  request();
}

function renderModes() {
  const host = $("#modes");
  host.textContent = "";
  for (const mode of state.config.mode_order) {
    if (mode === "svg") continue;
    const info = state.config.modes[mode];
    const b = document.createElement("button");
    b.textContent = info.label;
    b.classList.toggle("on", mode === state.mode && !state.pattern);
    b.addEventListener("click", () => {
      state.mode = mode;
      state.pattern = null;
      state.params.mode = mode;
      renderModes();
      renderModeParams();
      request();
    });
    host.append(b);
  }

  const pats = $("#patterns");
  pats.textContent = "";
  for (const [name, hint] of Object.entries(state.config.patterns)) {
    const b = document.createElement("button");
    b.textContent = name;
    b.title = hint;
    b.classList.toggle("on", state.pattern === name);
    b.addEventListener("click", () => {
      state.pattern = name;
      renderModes();
      request();
    });
    pats.append(b);
  }
}

/* ------------------------------------------------------------------ pedidos */

const request = debounce(doRequest, 260);

async function doRequest() {
  if (!state.pattern && !state.imageId) return;
  if (state.inflight) state.inflight.abort();
  const ctrl = new AbortController();
  state.inflight = ctrl;
  setStatus("calculando…", true);
  try {
    const data = await API.generate(
      { image_id: state.imageId, pattern: state.pattern, params: state.params, profile: state.profile },
      ctrl.signal
    );
    state.result = data;
    state.inflight = null;
    stopAnimation();
    if (!state.view.ready) fitView();
    setStatus(data.paths.length ? "" : "nenhum traço gerado — afrouxe os cortes ou troque de modo");
    renderStats();
    draw();
    $("#btnDownload").disabled = false;
  } catch (err) {
    if (err.name === "AbortError") return;
    state.inflight = null;
    setStatus(err.message);
  }
}

function setStatus(text, busy = false) {
  const el = $("#status");
  el.textContent = text;
  el.classList.toggle("busy", busy);
}

function renderStats() {
  const s = state.result.stats;
  const items = [
    ["traços", s.paths],
    ["pontos", s.points],
    ["desenho", `${Math.round(s.draw_mm)} mm`],
    ["viagem", `${Math.round(s.travel_mm)} mm`],
    ["levantadas", s.pen_lifts],
    ["tempo", s.duration],
  ];
  $("#stats").innerHTML = items
    .map(([k, v]) => `<span><span class="k">${k}</span> <span class="v">${v}</span></span>`)
    .join("");
  $("#warnings").innerHTML = (state.result.warnings || []).map((w) => `<p>⚠ ${w}</p>`).join("");
}

/* ---------------------------------------------------------------- viewport */

const canvas = $("#canvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  draw();
}

function fitView() {
  const geo = state.result?.geometry;
  const bedX = geo ? geo.bed[0] : 256;
  const bedY = geo ? geo.bed[1] : 256;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const scale = Math.min(w / bedX, h / bedY) * 0.92;
  state.view = { scale, tx: (w - scale * bedX) / 2, ty: h - (h - scale * bedY) / 2, ready: true };
  draw();
}

function rect(x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.rect(x0, y0, x1 - x0, y1 - y0);
}

function buildPaths(upTo) {
  const p = new Path2D();
  const list = state.result.paths;
  const end = upTo === undefined ? list.length : Math.min(upTo, list.length);
  for (let i = 0; i < end; i++) {
    const pts = list[i].p;
    p.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) p.lineTo(pts[k][0], pts[k][1]);
    if (list[i].c) p.closePath();
  }
  return p;
}

function buildTravel() {
  const p = new Path2D();
  const list = state.result.paths;
  const box = state.result.geometry.box;
  let cur = [box[0], box[1]];
  for (const path of list) {
    p.moveTo(cur[0], cur[1]);
    p.lineTo(path.p[0][0], path.p[0][1]);
    cur = path.c ? path.p[0] : path.p[path.p.length - 1];
  }
  return p;
}

function draw() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#16171b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!state.result) return;

  const { scale, tx, ty } = state.view;
  const geo = state.result.geometry;
  ctx.setTransform(dpr * scale, 0, 0, -dpr * scale, dpr * tx, dpr * ty);
  const px = 1 / scale;

  if ($("#showContext").checked) {
    ctx.fillStyle = "#24262c";
    rect(0, 0, geo.bed[0], geo.bed[1]);
    ctx.fill();

    ctx.setLineDash([3 * px, 2 * px]);
    ctx.lineWidth = px;
    ctx.strokeStyle = "#454a56";
    rect(geo.reachable[0], geo.reachable[1], geo.reachable[2], geo.reachable[3]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#f4f4f6";
    rect(geo.paper[0], geo.paper[1], geo.paper[2], geo.paper[3]);
    ctx.fill();

    ctx.setLineDash([2 * px, 2 * px]);
    ctx.strokeStyle = "#c9ccd4";
    rect(geo.box[0], geo.box[1], geo.box[2], geo.box[3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if ($("#showTravel").checked && !state.anim.on) {
    ctx.strokeStyle = "rgba(226,72,60,0.55)";
    ctx.lineWidth = 0.6 * px;
    ctx.setLineDash([1.5 * px, 1.5 * px]);
    ctx.stroke(buildTravel());
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = $("#showContext").checked ? "#101014" : "#e6e7ea";
  ctx.lineWidth = 0.42;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(state.anim.on ? state.anim.path : buildPaths());
}

/* --------------------------------------------------------------- navegação */

let drag = null;
canvas.addEventListener("pointerdown", (e) => {
  drag = { x: e.clientX, y: e.clientY, tx: state.view.tx, ty: state.view.ty };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  state.view.tx = drag.tx + (e.clientX - drag.x);
  state.view.ty = drag.ty + (e.clientY - drag.y);
  draw();
});
const endDrag = () => {
  drag = null;
  canvas.classList.remove("dragging");
};
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const k = Math.exp(-e.deltaY * 0.0015);
    const v = state.view;
    v.tx = mx - (mx - v.tx) * k;
    v.ty = my - (my - v.ty) * k;
    v.scale *= k;
    draw();
  },
  { passive: false }
);

/* --------------------------------------------------------------- animação */

function stopAnimation() {
  cancelAnimationFrame(state.anim.raf);
  state.anim = { on: false, index: 0, path: null, raf: 0 };
  $("#btnAnim").textContent = "Animar";
}

function startAnimation() {
  if (!state.result || !state.result.paths.length) return;
  state.anim = { on: true, index: 0, path: new Path2D(), raf: 0 };
  $("#btnAnim").textContent = "Parar";
  const total = state.result.paths.length;
  const perFrame = Math.max(1, Math.ceil(total / 240));
  const step = () => {
    const list = state.result.paths;
    for (let n = 0; n < perFrame && state.anim.index < total; n++, state.anim.index++) {
      const pts = list[state.anim.index].p;
      state.anim.path.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) state.anim.path.lineTo(pts[k][0], pts[k][1]);
      if (list[state.anim.index].c) state.anim.path.closePath();
    }
    draw();
    if (state.anim.index < total) state.anim.raf = requestAnimationFrame(step);
    else setTimeout(stopAnimation, 700), draw();
  };
  step();
}

/* -------------------------------------------------------------- interação */

function wireUpload() {
  const drop = $("#drop");
  const input = $("#file");
  drop.addEventListener("click", () => input.click());
  input.addEventListener("change", () => input.files[0] && loadFile(input.files[0]));
  for (const ev of ["dragenter", "dragover"])
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    });
  for (const ev of ["dragleave", "drop"])
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove("over");
    });
  drop.addEventListener("drop", (e) => e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]));
}

async function loadFile(file) {
  setStatus("enviando…", true);
  try {
    const info = await API.upload(file);
    state.imageId = info.image_id;
    state.imageName = info.name;
    state.pattern = null;
    state.view.ready = false;
    $("#dropName").textContent = info.name;
    if (/\.svg$/i.test(info.name)) {
      state.mode = "svg";
      state.params.mode = "svg";
      renderModes();
      renderModeParams();
    }
    renderModes();
    doRequest();
  } catch (err) {
    setStatus(err.message);
  }
}

function wireToolbar() {
  $("#btnFit").addEventListener("click", fitView);
  $("#showTravel").addEventListener("change", draw);
  $("#showContext").addEventListener("change", draw);
  $("#btnAnim").addEventListener("click", () => (state.anim.on ? stopAnimation() : startAnimation()));
  $("#btnDownload").addEventListener("click", () => {
    if (state.result) window.location.href = `/api/gcode/${state.result.id}`;
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, select")) return;
    if (e.key === "f") fitView();
    if (e.key === " ") {
      e.preventDefault();
      state.anim.on ? stopAnimation() : startAnimation();
    }
  });
  for (const h of document.querySelectorAll("h2.toggle"))
    h.addEventListener("click", () => h.parentElement.classList.toggle("collapsed"));
}

async function boot() {
  state.config = await API.config();
  state.params = { ...state.config.defaults, max_dim: 700, time_budget: 1.5 };
  state.mode = state.params.mode;
  renderModes();
  renderModeParams();
  renderStaticParams();
  wireUpload();
  wireToolbar();
  new ResizeObserver(resize).observe(canvas);
  resize();
  setStatus("envie uma imagem ou escolha um padrão de calibração");
}

boot();
