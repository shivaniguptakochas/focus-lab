/**
 * FocusLab - Audio & Ambient Sound Engine
 * Procedural Web Audio API sound generator for ambient study audio
 * and session notifications without external asset dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientType = 'none';
    this.isPlayingAmbient = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.activeNodes = [];
    this.volume = 0.5;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    if (!this.enabled && this.isPlayingAmbient) {
      this.stopAmbient();
    }
  }

  // --- Sound Effects (Chimes & Notifications) ---

  playChime(type = 'complete') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'complete') {
      // Pleasant two-tone bell chime (C5 -> G5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);

      // Harmony note
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.frequency.setValueAtTime(1046.5, now + 0.1); // C6
      gain2.gain.setValueAtTime(0.2, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc2.start(now + 0.1);
      osc2.stop(now + 1.5);
    } else if (type === 'break') {
      // Gentle meditation bowl chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440.0, now); // A4
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.start(now);
      osc.stop(now + 1.8);
    } else if (type === 'click') {
      // Subtle UI tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'alert') {
      // Attention ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.1); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }

  // --- Ambient Generators ---

  startAmbient(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.stopAmbient();
    this.ambientType = type;
    this.isPlayingAmbient = true;

    if (type === 'rain') {
      this.generateRain();
    } else if (type === 'binaural') {
      this.generateBinaural();
    } else if (type === 'whitenoise') {
      this.generateNoise('white');
    } else if (type === 'pinknoise') {
      this.generateNoise('pink');
    } else if (type === 'lofi') {
      this.generateLofiDrone();
    }
  }

  stopAmbient() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.isPlayingAmbient = false;
  }

  // Binaural 10Hz Alpha Waves (Calm Focus)
  generateBinaural() {
    const baseFreq = 216; // A 432 harmonic
    const beatFreq = 10;  // 10Hz Alpha range

    // Left channel: 216 Hz
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Right channel: 226 Hz
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    // Stereo Panner or Splitter
    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const bGain = this.ctx.createGain();
    bGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    merger.connect(bGain);
    bGain.connect(this.ambientGain);

    oscL.start();
    oscR.start();
    this.activeNodes.push(oscL, oscR, merger, bGain);
  }

  // Rain Ambient: Filtered Noise with Lowpass modulation
  generateRain() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  // Pure White / Pink Noise
  generateNoise(color = 'white') {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = color === 'pink' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(color === 'pink' ? 600 : 1200, this.ctx.currentTime);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ambientGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, nGain);
  }

  // Warm Lofi Ambient Chords Drone
  generateLofiDrone() {
    const freqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 (Cmaj7)
    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    droneGain.connect(this.ambientGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(droneGain);
      osc.start();
      this.activeNodes.push(osc, filter);
    });

    this.activeNodes.push(droneGain);
  }
}

// Global audio singleton
window.focusAudio = new SoundEngine();
