const target = document.getElementById("typewriter");
const words = ["DietGT", "diet818"];
const holdDelay = 2200;
const switchDelay = 340;
const typingDelay = 145;
const deletingDelay = 90;
const hasCursorFeatures = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
document.title = "DietGT";

if (target) {
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = words[wordIndex];

    if (!deleting) {
      charIndex += 1;
      const text = current.slice(0, charIndex);
      target.textContent = text;

      if (charIndex === current.length) {
        deleting = true;
        window.setTimeout(tick, holdDelay);
        return;
      }

      window.setTimeout(tick, typingDelay);
      return;
    }

    charIndex -= 1;
    const text = current.slice(0, charIndex);
    target.textContent = text;

    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      window.setTimeout(tick, switchDelay);
      return;
    }

    window.setTimeout(tick, deletingDelay);
  };

  tick();
}

const panel = document.querySelector("[data-panel]");

if (panel) {
  const views = panel.querySelectorAll("[data-view]");
  const homeView = panel.querySelector('[data-view="home"]');
  let isSwitching = false;

  const syncPanelHeight = () => {
    if (!homeView) {
      return;
    }

    const homeHeight = homeView.scrollHeight;
    panel.style.minHeight = `${homeHeight + 48}px`;
  };

  document.querySelectorAll("[data-switch-view]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (isSwitching) {
        return;
      }

      const nextView = button.getAttribute("data-switch-view");
      const currentView = panel.querySelector(".panel-view.is-active");
      const incomingView = panel.querySelector(`[data-view="${nextView}"]`);
      const isReverse = nextView === "home";

      if (!incomingView || currentView === incomingView) {
        return;
      }

      isSwitching = true;
      currentView.classList.remove("is-entering", "is-leaving", "is-entering-reverse", "is-leaving-reverse");
      incomingView.classList.remove("is-entering", "is-leaving", "is-entering-reverse", "is-leaving-reverse");
      incomingView.classList.add("is-active", isReverse ? "is-entering-reverse" : "is-entering");
      currentView.classList.add(isReverse ? "is-leaving-reverse" : "is-leaving");

      window.setTimeout(() => {
        currentView.classList.remove("is-active", "is-leaving", "is-leaving-reverse");
        incomingView.classList.remove("is-entering", "is-entering-reverse");
        isSwitching = false;
      }, 320);
    });
  });

  window.addEventListener("load", syncPanelHeight);
  window.addEventListener("resize", syncPanelHeight);
  syncPanelHeight();
}

const parallaxRoot = document.querySelector("[data-parallax-root]");
const panes = document.querySelectorAll("[data-pane]");

if (hasCursorFeatures && parallaxRoot && panes.length) {
  const state = { x: 0, y: 0, targetX: 0, targetY: 0, activePane: null };

  const setTargets = (pane, event) => {
    const rect = pane.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width - 0.5;
    const localY = (event.clientY - rect.top) / rect.height - 0.5;
    state.targetX = Math.max(-1, Math.min(1, localX * 2));
    state.targetY = Math.max(-1, Math.min(1, localY * 2));
  };

  panes.forEach((pane) => {
    pane.addEventListener("pointerenter", (event) => {
      state.activePane = pane;
      setTargets(pane, event);
    });

    pane.addEventListener("pointermove", (event) => {
      state.activePane = pane;
      setTargets(pane, event);
    });

    pane.addEventListener("pointerleave", () => {
      if (state.activePane === pane) {
        state.activePane = null;
        state.targetX = 0;
        state.targetY = 0;
      }
    });
  });

  const animateParallax = () => {
    state.x += (state.targetX - state.x) * 0.08;
    state.y += (state.targetY - state.y) * 0.08;

    panes.forEach((pane) => {
      const depth = Number(pane.getAttribute("data-depth")) || 20;
      const isActive = state.activePane === pane;
      const factor = isActive ? 1 : state.activePane ? 0.66 : 0;
      const liftFactor = isActive ? 1 : 0;
      const moveX = state.x * depth * -0.34 * factor;
      const moveY = state.y * depth * -0.34 * factor;
      const lift = depth * 4.8 * liftFactor;
      const paneRotateY = state.x * -4.4 * factor;
      const paneRotateX = state.y * 3.2 * factor;
      pane.style.transform = `translate3d(${moveX}px, ${moveY}px, ${lift}px) rotateX(${paneRotateX}deg) rotateY(${paneRotateY}deg)`;
    });

    window.requestAnimationFrame(animateParallax);
  };

  window.setTimeout(() => {
    document.body.classList.add("card-open-done");
        window.requestAnimationFrame(animateParallax);
      }, 700);
}
