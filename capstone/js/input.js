/* Input state shared by keyboard and touch controls. */
(function (root) {
  'use strict';
  class InputManager {
    constructor(target) {
      this.state = { forward: false, reverse: false, left: false, right: false };
      this.enabled = true;
      this.target = target || (typeof window !== 'undefined' ? window : null);
      this.keyMap = { ArrowUp: 'forward', KeyW: 'forward', ArrowDown: 'reverse', KeyS: 'reverse', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
      this._down = e => this.onKey(e, true);
      this._up = e => this.onKey(e, false);
      if (this.target && this.target.addEventListener) {
        this.target.addEventListener('keydown', this._down, { passive: false });
        this.target.addEventListener('keyup', this._up, { passive: false });
        this.target.addEventListener('blur', () => this.clear());
      }
    }
    onKey(event, pressed) {
      const control = this.keyMap[event.code];
      if (!control) return;
      if (event.preventDefault) event.preventDefault();
      if (this.enabled) this.state[control] = pressed;
    }
    bindTouch(container) {
      if (!container) return;
      container.querySelectorAll('[data-control]').forEach(button => {
        const control = button.dataset.control;
        const set = (value, event) => {
          if (event) event.preventDefault();
          if (this.enabled) this.state[control] = value;
          button.classList.toggle('active', value);
        };
        button.addEventListener('pointerdown', e => { button.setPointerCapture?.(e.pointerId); set(true, e); });
        ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach(name => button.addEventListener(name, e => set(false, e)));
      });
    }
    clear() { Object.keys(this.state).forEach(key => { this.state[key] = false; }); }
    setEnabled(value) { this.enabled = value; if (!value) this.clear(); }
    axis() {
      return { throttle: (this.state.forward ? 1 : 0) - (this.state.reverse ? 1 : 0), steer: (this.state.right ? 1 : 0) - (this.state.left ? 1 : 0) };
    }
  }
  root.InputManager = InputManager;
  if (typeof module !== 'undefined') module.exports = InputManager;
})(typeof globalThis !== 'undefined' ? globalThis : this);
