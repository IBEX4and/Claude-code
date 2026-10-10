import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gestureTarget, readSnapMap, restingKey, settleTarget } from "@/lib/snapping";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Teclas que rolam a página, com o sentido de cada uma. */
const NAV_KEYS: Record<string, number> = { ArrowDown: 1, PageDown: 1, End: 1, " ": 1, Spacebar: 1, ArrowUp: -1, PageUp: -1, Home: -1 };

/**
 * Liga o encaixe da rolagem (src/lib/snapping.ts) ao Lenis.
 *
 * - Hero: um gesto (roda, trackpad, dedo) faz um salto travado até a outra ponta da
 *   animação. O resto do mesmo gesto (inércia do trackpad) é ignorado; um gesto
 *   novo no sentido contrário inverte o salto.
 * - Ao parar de rolar (roda, toque, teclado, barra de rolagem), desliza até o ponto
 *   de encaixe, respeitando o sentido do movimento (o sentido vem da pessoa: roda,
 *   dedo, tecla ou barra; nunca dos deslizes automáticos).
 * - Ao redimensionar a janela, volta ao mesmo ponto em que estava parada.
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

  // Onde a rolagem descansou por último (ou para onde um deslize está indo)
  let lastDir = 1;
  let lastRest: number | null = 0;
  let lastRestKey: string | null = "top";
  let restingNow = true; // parada exatamente em lastRest, sem a pessoa ter mexido
  let settleTimer: number | undefined;
  let resizing = false;
  let resizeTimer: number | undefined;
  let size = { w: 0, h: 0 };

  const isJumping = () => !!lenis?.isLocked;

  /** Marca `value` como o ponto de descanso (no início do deslize, não só no fim). */
  const aim = (value: number) => {
    lastRest = value;
    lastRestKey = restingKey(readSnapMap(), value);
    restingNow = false;
  };
  const userMoved = (dir: number) => {
    if (dir) lastDir = dir;
    restingNow = false;
  };

  const jump = (target: number) => {
    const l = lenis;
    if (!l) return;
    window.clearTimeout(settleTimer);
    jumpDir = Math.sign(target - l.animatedScroll) || 1;
    jumpKey = restingKey(readSnapMap(), target);
    aim(target);
    l.scrollTo(target, {
      // O hero percorre duas telas; entre cartões o caminho é mais curto.
      duration: Math.abs(target - l.animatedScroll) > window.innerHeight * 1.2 ? 1.4 : 1,
      easing: easeInOutCubic,
      lock: true,
      force: true,
      onComplete: () => {
        holdGesture = true;
        heldAt = performance.now();
        restingNow = true;
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
      if (dir === -jumpDir) lastDir = dir;
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
    if ((event.target as Element | null)?.closest?.("[data-lenis-prevent]")) return true;
    const map = readSnapMap();
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Gesto lateral (ex.: voltar página no trackpad): no hero, a leve deriva
      // vertical não pode disparar o salto; no resto do site segue normal.
      const inHero = map.zones.some((z) => z.mode === "directional" && l.targetScroll >= z.from - 1 && l.targetScroll <= z.to + 1);
      return inHero ? block() : true;
    }
    userMoved(Math.sign(deltaY));
    if (isTouch && Math.abs(touchTravel) < 12) return true;

    const target = gestureTarget(map, l.targetScroll, deltaY);
    if (target === null) return true;
    jumpGesture = gesture;
    jump(target);
    return block();
  };

  const settle = () => {
    const l = lenis;
    if (!l || resizing || isJumping() || touching || pointerHeld || l.isStopped || l.isScrolling === "smooth") return;
    const map = readSnapMap();
    const y = window.scrollY;
    const target = settleTarget(map, y, lastDir, window.innerHeight, lastRest);
    if (target === null) {
      const key = restingKey(map, y);
      if (key) {
        lastRest = map.keys[key];
        lastRestKey = key;
        restingNow = true;
      }
      return;
    }
    aim(target);
    l.scrollTo(target, { duration: 0.9, easing: easeInOutCubic, onComplete: () => void (restingNow = true) });
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
    // Arrastando a barra de rolagem: o sentido vem do próprio movimento.
    if (pointerHeld && lenis?.direction) userMoved(lenis.direction);
    scheduleSettle();
  };
  const onTouchStart = () => {
    touching = true;
    restingNow = false;
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
    const dir = NAV_KEYS[e.key];
    if (!dir) return;
    if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    userMoved(e.key === " " && e.shiftKey ? -1 : dir);
    cancelGlide();
  };

  /**
   * Redimensionar (janela, rotação do celular): enquanto o layout e as animações se
   * recalculam, não encaixa nada; depois volta ao mesmo ponto na nova medida.
   */
  const finishResize = () => {
    const l = lenis;
    resizing = false;
    if (!l) return;
    const widthChanged = window.innerWidth !== size.w;
    const heightDelta = Math.abs(window.innerHeight - size.h);
    size = { w: window.innerWidth, h: window.innerHeight };
    // Barra de endereço do celular aparecendo/sumindo: só a altura muda um pouco.
    if (!widthChanged && heightDelta < window.innerHeight * 0.25 && window.matchMedia("(pointer: coarse)").matches) {
      scheduleSettle();
      return;
    }
    l.resize();
    ScrollTrigger.refresh();
    const map = readSnapMap();
    if (isJumping() && jumpKey && map.keys[jumpKey] !== undefined) {
      jump(map.keys[jumpKey]);
      return;
    }
    if (restingNow && lastRestKey && map.keys[lastRestKey] !== undefined) {
      const value = map.keys[lastRestKey];
      lastRest = value;
      if (Math.abs(value - window.scrollY) > 1) l.scrollTo(value, { immediate: true, force: true });
      return;
    }
    scheduleSettle();
  };
  const onResize = () => {
    resizing = true;
    window.clearTimeout(settleTimer);
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(finishResize, 350);
  };

  const attach = (instance: Lenis) => {
    lenis = instance;
    size = { w: window.innerWidth, h: window.innerHeight };
    lenis.on("scroll", onScroll);
    window.addEventListener("resize", onResize);
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
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
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

  return { virtualScroll, attach };
}
