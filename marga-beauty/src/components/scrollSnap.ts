import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";
import { gestureTarget, readSnapMap, restingKey, settleTarget } from "@/lib/snapping";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);

/**
 * Liga o encaixe da rolagem (src/lib/snapping.ts) ao Lenis.
 *
 * - Hero: um gesto (roda, trackpad, dedo) faz um salto travado até a outra ponta da
 *   animação. O resto do mesmo gesto (inércia do trackpad) é ignorado; um gesto
 *   novo no sentido contrário inverte o salto.
 * - Ao parar de rolar (roda, toque, teclado, barra de rolagem), desliza até o ponto
 *   de encaixe, respeitando o sentido do movimento.
 */
export function createScrollSnap() {
  let lenis: Lenis | null = null;

  // Gesto atual: no toque, cada touchstart; na roda, uma pausa de mais de 150 ms.
  let gesture = 0;
  let lastInput = 0;
  let touchTravel = 0;
  let pinching = false;
  let touching = false;
  let pointerHeld = false;

  // Salto do hero
  let jumpDir = 0;
  let jumpGesture = -1;
  let jumpKey: string | null = null;
  let holdGesture = false;
  let heldAt = 0;

  // Onde a rolagem descansou por último
  let lastDir = 1;
  let lastRest: number | null = 0;
  let lastRestKey: string | null = "top";
  let settleTimer: number | undefined;
  let size = { w: 0, h: 0 };

  const isJumping = () => !!lenis?.isLocked;

  const rest = (value: number) => {
    lastRest = value;
    lastRestKey = restingKey(readSnapMap(), value);
  };

  const jump = (target: number) => {
    const l = lenis;
    if (!l) return;
    window.clearTimeout(settleTimer);
    jumpDir = Math.sign(target - l.animatedScroll) || 1;
    jumpKey = restingKey(readSnapMap(), target);
    l.scrollTo(target, {
      duration: 1.4,
      easing: easeInOutCubic,
      lock: true,
      force: true,
      onComplete: () => {
        holdGesture = true;
        heldAt = performance.now();
        rest(target);
      },
    });
  };

  const virtualScroll = ({ deltaX, deltaY, event }: VirtualScrollData): boolean => {
    const l = lenis;
    if (!l || l.isStopped) return true;
    const isTouch = event.type.startsWith("touch");
    const now = performance.now();
    const gap = now - lastInput;
    lastInput = now;

    if (isTouch) {
      const fingers = (event as TouchEvent).touches.length;
      if (event.type === "touchstart") {
        if (fingers === 1) pinching = false;
        gesture++;
        touchTravel = 0;
      }
      if (fingers > 1) pinching = true;
      // Pinça (zoom) e o toque inicial seguem o comportamento normal.
      if (pinching || event.type === "touchstart") return true;
      touchTravel += deltaY;
    } else if (gap > 150) gesture++;
    // Ctrl + roda / pinça no trackpad = zoom do navegador.
    if (event.ctrlKey) return true;

    const block = () => {
      if (event.cancelable) event.preventDefault();
      return false;
    };

    if (isJumping()) {
      const dir = Math.sign(deltaY);
      const fresh = gesture !== jumpGesture && (!isTouch || Math.abs(touchTravel) >= 12);
      if (dir && dir === -jumpDir && fresh) {
        const target = gestureTarget(readSnapMap(), l.animatedScroll, deltaY);
        if (target !== null) {
          jumpGesture = gesture;
          jump(target);
        }
      }
      return block();
    }
    if (holdGesture) {
      const over = isTouch ? gesture !== jumpGesture : gap > 180 || now - heldAt > 2500;
      if (!over) return block();
      holdGesture = false;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY)) return true;
    if ((event.target as Element | null)?.closest?.("[data-lenis-prevent]")) return true;
    if (isTouch && Math.abs(touchTravel) < 12) return true;

    const target = gestureTarget(readSnapMap(), l.targetScroll, deltaY);
    if (target === null) return true;
    jumpGesture = gesture;
    jump(target);
    return block();
  };

  const settle = () => {
    const l = lenis;
    if (!l || isJumping() || touching || pointerHeld || l.isStopped || l.isScrolling === "smooth") return;
    const map = readSnapMap();
    const y = window.scrollY;
    const target = settleTarget(map, y, lastDir, window.innerHeight, lastRest);
    if (target === null) {
      const key = restingKey(map, y);
      if (key) {
        lastRest = map.keys[key];
        lastRestKey = key;
      }
      return;
    }
    l.scrollTo(target, { duration: 0.9, easing: easeInOutCubic, onComplete: () => rest(target) });
  };

  const scheduleSettle = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 160);
  };

  /** A pessoa assumiu (tecla, clique): para o deslize de encaixe em andamento. */
  const cancelGlide = () => {
    const l = lenis;
    if (l && l.isScrolling === "smooth" && !l.isLocked && !l.isStopped) {
      l.stop();
      l.start();
    }
  };

  const onScroll = () => {
    if (lenis?.direction) lastDir = lenis.direction;
    scheduleSettle();
  };
  const onTouchStart = () => {
    touching = true;
    window.clearTimeout(settleTimer);
  };
  const onTouchEnd = () => {
    touching = false;
    scheduleSettle();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    pointerHeld = true;
    window.clearTimeout(settleTimer);
    cancelGlide();
  };
  const onPointerUp = () => {
    if (!pointerHeld) return;
    pointerHeld = false;
    scheduleSettle();
  };
  const onPointerMove = (e: PointerEvent) => {
    // Rede de segurança para navegadores que não mandam pointerup ao soltar a barra.
    if (pointerHeld && e.buttons === 0) onPointerUp();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!NAV_KEYS.has(e.key)) return;
    if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    cancelGlide();
  };

  /** Depois de redimensionar: volta ao mesmo ponto de encaixe na nova medida. */
  const onResize = () => {
    const l = lenis;
    if (!l) return;
    const changed = window.innerWidth !== size.w || window.innerHeight !== size.h;
    size = { w: window.innerWidth, h: window.innerHeight };
    if (!changed) return;
    const map = readSnapMap();
    if (isJumping() && jumpKey && map.keys[jumpKey] !== undefined) {
      jump(map.keys[jumpKey]);
      return;
    }
    const wasResting = lastRest !== null && Math.abs(window.scrollY - lastRest) <= 2;
    if (wasResting && lastRestKey && map.keys[lastRestKey] !== undefined) {
      const value = map.keys[lastRestKey];
      lastRest = value;
      if (Math.abs(value - window.scrollY) > 1) l.scrollTo(value, { immediate: true, force: true });
      return;
    }
    scheduleSettle();
  };

  const attach = (instance: Lenis) => {
    lenis = instance;
    size = { w: window.innerWidth, h: window.innerHeight };
    lenis.on("scroll", onScroll);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("pointercancel", onPointerUp, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("pointercancel", onPointerUp, { capture: true });
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      lenis = null;
    };
  };

  return { virtualScroll, attach, onResize };
}
