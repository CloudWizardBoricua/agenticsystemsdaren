/* Enhanced Input state supporting desktop keyboard and multi-touch mobile buttons. */
(function (root) {
  'use strict';
  class InputManager {
    constructor(target) {
      this.state = { forward: false, reverse: false, left: false, right: false };
      this.enabled = true;
      this.target = target || (typeof window !== 'undefined' ? window : null);
      this.keyMap = {
        ArrowUp: 'forward', KeyW: 'forward',
        ArrowDown: 'reverse', KeyS: 'reverse',
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right'
      };
      
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
      if (event.preventDefault && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (this.enabled) this.state[control] = pressed;
    }

    bindTouch(container) {
      if (!container) return;
      
      container.querySelectorAll('[data-control]').forEach(button => {
        const control = button.dataset.control;
        
        const setControl = (val, e) => {
          if (e && e.cancelable) e.preventDefault();
          if (this.enabled) {
            this.state[control] = val;
          }
          button.classList.toggle('active', val);
        };

        // Modern pointer events with touch capture
        button.addEventListener('pointerdown', e => {
          try { button.setPointerCapture(e.pointerId); } catch (err) {}
          setControl(true, e);
        }, { passive: false });

        ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach(evt => {
          button.addEventListener(evt, e => setControl(false, e), { passive: false });
        });

        // Touch event fallbacks for older Safari / iOS
        button.addEventListener('touchstart', e => setControl(true, e), { passive: false });
        ['touchend', 'touchcancel'].forEach(evt => {
          button.addEventListener(evt, e => setControl(false, e), { passive: false });
        });
      });
    }

    clear() {
      Object.keys(this.state).forEach(k => { this.state[k] = false; });
      if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('.touch-btn').forEach(b => b.classList.remove('active'));
      }
    }

    setEnabled(val) {
      this.enabled = val;
      if (!val) this.clear();
    }

    axis() {
      return {
        throttle: (this.state.forward ? 1 : 0) - (this.state.reverse ? 1 : 0),
        steer: (this.state.right ? 1 : 0) - (this.state.left ? 1 : 0)
      };
    }
  }

  root.InputManager = InputManager;
  if (typeof module !== 'undefined') module.exports = InputManager;
})(typeof globalThis !== 'undefined' ? globalThis : this);
