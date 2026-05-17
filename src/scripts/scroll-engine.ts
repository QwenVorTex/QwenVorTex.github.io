/**
 * Neo-Brutalist Scroll Engine
 * 低帧率 (12 FPS) 滚动引擎 —— 时间与空间的双重离散化
 *
 * - 拦截页面 wheel 事件，制造轻度 stop-motion 感
 * - 保留对原生滚动容器、输入区域和无障碍场景的尊重
 * - 用离散步长和低帧率重绘维持硬朗的滚动节奏
 */

export function initScrollEngine() {
  const TARGET_FPS = 24;
  const FPS_INTERVAL = 1000 / TARGET_FPS;
  const SCROLL_SPEED = 0.96;
  const SNAP_THRESHOLD = 1.5;
  const LERP_FACTOR = 0.18;
  const MIN_STEP = 1;
  const MAX_STEP = 36;
  const DISCRETE_STEP = 1;

  let targetScrollY = 0;
  let currentScrollY = 0;
  let then = performance.now();
  let rafId: number | null = null;
  let isEnabled = true;
  let isInternalScroll = false;
  let internalScrollFrame: number | null = null;

  function getMaxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
  }

  function discretize(value: number, step: number = DISCRETE_STEP): number {
    return Math.round(value / step) * step;
  }

  function findScrollableParent(target: EventTarget | null, deltaY: number) {
    if (!(target instanceof Element)) return null;

    let node: Element | null = target;

    while (node && node !== document.body) {
      if (
        node instanceof HTMLElement &&
        (node.matches('textarea, select, [contenteditable="true"], [data-native-scroll]') ||
          node.closest('textarea, select, [contenteditable="true"], [data-native-scroll]'))
      ) {
        return node;
      }

      if (node instanceof HTMLElement) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        const canScroll =
          (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
          node.scrollHeight > node.clientHeight + 1;

        if (canScroll) {
          const isMovingDown = deltaY > 0;
          const canMoveDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
          const canMoveUp = node.scrollTop > 1;

          if ((isMovingDown && canMoveDown) || (!isMovingDown && canMoveUp)) {
            return node;
          }
        }
      }

      node = node.parentElement;
    }

    return null;
  }

  function syncWithNativeScroll() {
    if (isInternalScroll) return;
    currentScrollY = window.scrollY;
    targetScrollY = currentScrollY;
  }

  function applyScroll(nextY: number) {
    if (internalScrollFrame !== null) {
      cancelAnimationFrame(internalScrollFrame);
    }

    isInternalScroll = true;
    window.scrollTo(0, Math.round(nextY));
    internalScrollFrame = requestAnimationFrame(() => {
      isInternalScroll = false;
      internalScrollFrame = null;
    });
  }

  function onWheel(e: WheelEvent) {
    if (!isEnabled) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (findScrollableParent(e.target, e.deltaY)) return;

    e.preventDefault();

    const delta = e.deltaY * SCROLL_SPEED;
    targetScrollY = clamp(targetScrollY + delta, 0, getMaxScroll());
  }

  function tick(now: number) {
    rafId = requestAnimationFrame(tick);

    const elapsed = now - then;

    if (elapsed < FPS_INTERVAL) return;

    then = now - (elapsed % FPS_INTERVAL);

    const diff = targetScrollY - currentScrollY;

    if (Math.abs(diff) < SNAP_THRESHOLD) {
      currentScrollY = targetScrollY;
    } else {
      let step = clamp(diff * LERP_FACTOR, -MAX_STEP, MAX_STEP);

      if (Math.abs(step) < MIN_STEP) {
        step = Math.sign(diff) * MIN_STEP;
      }

      const discreteStep = discretize(
        step > 0 ? Math.ceil(step) : Math.floor(step)
      );
      const nextScrollY = currentScrollY + discreteStep;

      if ((diff > 0 && nextScrollY > targetScrollY) || (diff < 0 && nextScrollY < targetScrollY)) {
        currentScrollY = targetScrollY;
      } else {
        currentScrollY = nextScrollY;
      }
    }

    applyScroll(currentScrollY);
  }

  function onResize() {
    targetScrollY = clamp(targetScrollY, 0, getMaxScroll());
    currentScrollY = window.scrollY;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isEnabled) return;
    if (e.defaultPrevented) return;

    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.isContentEditable ||
        target.matches('input, textarea, select, [role="textbox"]'))
    ) {
      return;
    }

    const scrollAmount = 80;
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        targetScrollY = clamp(targetScrollY + scrollAmount * 3, 0, getMaxScroll());
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        targetScrollY = clamp(targetScrollY - scrollAmount * 3, 0, getMaxScroll());
        break;
      case 'Home':
        e.preventDefault();
        targetScrollY = 0;
        break;
      case 'End':
        e.preventDefault();
        targetScrollY = getMaxScroll();
        break;
      case ' ':
        e.preventDefault();
        targetScrollY = clamp(
          targetScrollY + (e.shiftKey ? -scrollAmount * 5 : scrollAmount * 5),
          0,
          getMaxScroll()
        );
        break;
    }
  }

  function start() {
    currentScrollY = window.scrollY;
    targetScrollY = currentScrollY;

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('scroll', syncWithNativeScroll, { passive: true });

    rafId = requestAnimationFrame(tick);
  }

  function destroy() {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener('scroll', syncWithNativeScroll);

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    if (internalScrollFrame !== null) {
      cancelAnimationFrame(internalScrollFrame);
    }
  }

  function toggle(enabled: boolean) {
    isEnabled = enabled;
    if (!enabled) {
      currentScrollY = window.scrollY;
      targetScrollY = currentScrollY;
    }
  }

  return { start, destroy, toggle };
}
