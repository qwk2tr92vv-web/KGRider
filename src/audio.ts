class AudioManager {
  ctx: AudioContext | null = null;
  engineOsc1: OscillatorNode | null = null;
  engineOsc2: OscillatorNode | null = null;
  engineGain: GainNode | null = null;
  isInitialized = false;

  bgmOsc: OscillatorNode | null = null;
  bgmGain: GainNode | null = null;
  bgmInterval: number | null = null;

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Engine sound setup
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'square';
      
      this.engineOsc1.connect(this.engineGain);
      this.engineOsc2.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      
      this.engineOsc1.start();
      this.engineOsc2.start();
      
      this.engineGain.gain.value = 0; // muted by default
      
      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateEngine(speed: number, maxSpeed: number, isAccelerating: boolean) {
    if (!this.isInitialized || !this.engineGain || !this.engineOsc1 || !this.engineOsc2 || !this.ctx) return;
    
    const pct = Math.max(0, Math.min(1, speed / maxSpeed));
    // Base frequency
    const baseFreq = 30 + (pct * 80);
    
    // Rev when accelerating
    const targetFreq = isAccelerating ? baseFreq * 1.5 : baseFreq;
    
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 0.5, this.ctx.currentTime, 0.1);
    
    // Volume
    const targetVol = 0.05 + (pct * 0.1);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (!this.isInitialized || !this.engineGain || !this.ctx) return;
    this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
  }

  playCrash() {
    if (!this.isInitialized || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
    
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    noiseSource.start();
  }

  playCoin() {
    if (!this.isInitialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.1); // E6
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  startBGM() {
    if (!this.isInitialized || !this.ctx) return;
    this.stopBGM();

    const notes = [220, 261.63, 329.63, 293.66]; // A3, C4, E4, D4
    let noteIdx = 0;

    const playNote = () => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = notes[noteIdx] * 0.5; // octave down
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
      
      noteIdx = (noteIdx + 1) % notes.length;
    };

    this.bgmInterval = window.setInterval(playNote, 250);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audioManager = new AudioManager();
