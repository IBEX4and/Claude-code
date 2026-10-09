"use client";

import { useEffect, useRef, useState } from "react";

/* Som de corda dedilhada (síntese Karplus-Strong), como na referência. */
let audio: AudioContext | null = null;
let master: GainNode | null = null;
let reverbSend: GainNode | null = null;
const NOTES = [146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392];
const BODY = [
  { frequency: 100, q: 1.2, gain: 0.5 },
  { frequency: 220, q: 2, gain: 0.3 },
];
let noteIndex = 0;

function getAudio() {
  if (!audio) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audio = new Ctor();
    master = audio.createGain();
    master.gain.value = 1;
    const comp = audio.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.006;
    comp.release.value = 0.22;
    master.connect(comp);
    comp.connect(audio.destination);
    const length = Math.floor(2.2 * audio.sampleRate);
    const impulse = audio.createBuffer(2, length, audio.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.8);
    }
    const convolver = audio.createConvolver();
    convolver.buffer = impulse;
    reverbSend = audio.createGain();
    reverbSend.gain.value = 0.42;
    reverbSend.connect(convolver);
    convolver.connect(master);
  }
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function pluck(displacement: number) {
  const ctx = getAudio();
  if (!ctx || !master || !reverbSend) return;
  const strength = Math.min(Math.abs(displacement) / 60, 1);
  if (strength < 0.05) return;
  noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 2)) % NOTES.length;
  const freq = NOTES[noteIndex] * (1 + (Math.random() * 2 - 1) * 0.004);
  const rate = ctx.sampleRate;
  const period = Math.max(2, Math.floor(rate / freq));
  const total = Math.floor(3.2 * rate);
  const buffer = ctx.createBuffer(1, total, rate);
  const out = buffer.getChannelData(0);
  const ring = new Float32Array(period);
  let lp = 0;
  const brightness = 0.1 + 0.12 * strength;
  for (let i = 0; i < period; i++) {
    lp += (Math.random() * 2 - 1 - lp) * brightness;
    ring[i] = lp * Math.min(1, i / (0.4 * period));
  }
  const decay = 0.996 - (1 - strength) * 0.003;
  let idx = 0;
  let prev = 0;
  for (let i = 0; i < total; i++) {
    const cur = ring[idx];
    const next = 0.75 * ((cur + ring[(idx + 1) % period]) * 0.5) + 0.25 * prev;
    prev = next;
    ring[idx] = next * decay;
    out[i] = cur;
    idx = (idx + 1) % period;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 750 + 700 * strength;
  lowpass.Q.value = 0.5;
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 70;
  src.connect(lowpass);
  lowpass.connect(highpass);
  const body = ctx.createGain();
  highpass.connect(body);
  for (const b of BODY) {
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = b.frequency;
    f.Q.value = b.q;
    const g = ctx.createGain();
    g.gain.value = b.gain;
    highpass.connect(f);
    f.connect(g);
    g.connect(body);
  }
  const env = ctx.createGain();
  const peak = 0.16 + 0.34 * strength;
  const now = ctx.currentTime;
  env.gain.setValueAtTime(1e-4, now);
  env.gain.exponentialRampToValueAtTime(peak, now + 0.025);
  env.gain.exponentialRampToValueAtTime(0.45 * peak, now + 0.6);
  env.gain.exponentialRampToValueAtTime(1e-4, now + 3.2);
  body.connect(env);
  const pan = ctx.createStereoPanner?.();
  if (pan) {
    pan.pan.value = (Math.random() * 2 - 1) * 0.35;
    env.connect(pan);
    pan.connect(master);
    pan.connect(reverbSend);
  } else {
    env.connect(master);
    env.connect(reverbSend);
  }
  src.start(now);
  src.stop(now + 3.2);
  src.onended = () => {
    src.disconnect();
    lowpass.disconnect();
    highpass.disconnect();
    body.disconnect();
    env.disconnect();
    pan?.disconnect();
  };
}

/** Linha divisória que se curva com o mouse e vibra ao soltar, como uma corda. */
export function StringLine({ color = "rgba(255,255,255,0.4)", sound = true }: { color?: string; sound?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const offset = useRef(0);
  const raf = useRef<number | null>(null);
  const phase = useRef(Math.PI / 2);
  const [reduced, setReduced] = useState(false);

  const draw = (bend: number) => {
    const w = wrap.current?.offsetWidth ?? 0;
    path.current?.setAttribute("d", `M 0 50 Q ${w * 0.5} ${50 + bend} ${w} 50`);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    draw(reduced ? 0 : offset.current);
    const onResize = () => draw(reduced ? 0 : offset.current);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  const vibrate = () => {
    draw(offset.current * Math.sin(phase.current));
    offset.current *= 0.95;
    phase.current += 0.5;
    if (Math.abs(offset.current) > 0.1) raf.current = requestAnimationFrame(vibrate);
    else {
      phase.current = Math.PI / 2;
      offset.current = 0;
    }
  };

  return (
    <div ref={wrap} className="string-line" aria-hidden="true">
      <span
        className="string-line__hit"
        onMouseEnter={
          reduced
            ? undefined
            : () => {
                if (raf.current != null) {
                  cancelAnimationFrame(raf.current);
                  phase.current = Math.PI / 2;
                }
              }
        }
        onMouseMove={
          reduced
            ? undefined
            : (e) => {
                offset.current += e.movementY / 2;
                draw(offset.current);
              }
        }
        onMouseLeave={
          reduced
            ? undefined
            : () => {
                if (raf.current != null) cancelAnimationFrame(raf.current);
                if (sound) pluck(offset.current);
                vibrate();
              }
        }
      />
      <svg width="100%" height="100">
        <path ref={path} style={{ stroke: color }} />
      </svg>
    </div>
  );
}
