/* Tiny procedural Web Audio soundtrack and vehicle effects; no external assets. */
(function (root) {
  'use strict';
  class GameAudio {
    constructor() { this.context = null; this.master = null; this.enabled = true; this.engineOsc = null; this.engineGain = null; this.musicTimer = null; this.step = 0; }
    init() {
      if (this.context) { if (this.context.state === 'suspended') this.context.resume(); return; }
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this.context = new AC();
      this.master = this.context.createGain(); this.master.gain.value = .2; this.master.connect(this.context.destination);
      this.engineOsc = this.context.createOscillator(); this.engineGain = this.context.createGain();
      this.engineOsc.type = 'triangle'; this.engineOsc.frequency.value = 48; this.engineGain.gain.value = 0;
      this.engineOsc.connect(this.engineGain).connect(this.master); this.engineOsc.start();
      this.startMusic();
    }
    tone(freq, duration=.1, type='sine', volume=.12, when=0) {
      if (!this.enabled || !this.context) return;
      const t=this.context.currentTime+when, osc=this.context.createOscillator(), gain=this.context.createGain();
      osc.type=type; osc.frequency.setValueAtTime(freq,t); gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(volume,t+.01); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
      osc.connect(gain).connect(this.master); osc.start(t); osc.stop(t+duration+.03);
    }
    startMusic() {
      if (this.musicTimer || !this.enabled) return;
      const notes=[220,277.18,329.63,415.3,329.63,277.18,246.94,329.63];
      this.musicTimer=setInterval(()=>{ if (!this.context || this.context.state!=='running') return; const n=notes[this.step++%notes.length]; this.tone(n,.18,'sine',.035); if(this.step%4===1)this.tone(n/2,.32,'triangle',.025); },380);
    }
    updateEngine(speed, throttle) {
      if (!this.context || !this.engineOsc) return;
      const now=this.context.currentTime, amount=Math.min(1,Math.abs(speed)/220);
      this.engineOsc.frequency.setTargetAtTime(46+amount*75+(Math.abs(throttle)*8),now,.05);
      this.engineGain.gain.setTargetAtTime(this.enabled ? .018+amount*.035 : 0,now,.08);
    }
    park() { [523.25,659.25,783.99].forEach((n,i)=>this.tone(n,.22,'sine',.13,i*.1)); }
    bump() { this.tone(74,.13,'square',.07); }
    win() { [392,493.88,587.33,783.99].forEach((n,i)=>this.tone(n,.3,'triangle',.13,i*.12)); }
    toggle(force) { this.enabled=typeof force==='boolean'?force:!this.enabled; if(this.enabled){this.init();this.startMusic();} if(this.master&&this.context)this.master.gain.setTargetAtTime(this.enabled?.2:0,this.context.currentTime,.04); return this.enabled; }
  }
  root.GameAudio=GameAudio;
  if(typeof module!=='undefined')module.exports=GameAudio;
})(typeof globalThis!=='undefined'?globalThis:this);
