class GuitarAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an acoustic guitar plucked note sound
   */
  public playGuitarNote(frequency: number, duration: number = 2.2) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Master gain for this note
      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.7, now + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.2, now + 0.35);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Body resonance filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 6, now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration * 0.8);
      filter.Q.value = 2.5;

      // Fundamental and Harmonics for rich steel/nylon guitar sound
      const harmonics = [
        { mult: 1, gain: 0.6, type: 'triangle' as OscillatorType },
        { mult: 2, gain: 0.3, type: 'sine' as OscillatorType },
        { mult: 3, gain: 0.15, type: 'sawtooth' as OscillatorType },
        { mult: 4, gain: 0.08, type: 'sine' as OscillatorType },
        { mult: 5, gain: 0.04, type: 'triangle' as OscillatorType },
      ];

      harmonics.forEach(h => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const hGain = this.ctx.createGain();

        osc.type = h.type;
        osc.frequency.setValueAtTime(frequency * h.mult, now);

        // Slight micro-detune for acoustic realism
        const detune = (Math.random() - 0.5) * 4;
        osc.detune.setValueAtTime(detune, now);

        hGain.gain.setValueAtTime(h.gain, now);
        hGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (1 / Math.sqrt(h.mult)));

        osc.connect(hGain);
        hGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration);
      });

      // Pluck transient noise (plectrum attack)
      const bufferSize = this.ctx.sampleRate * 0.03;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = Math.min(frequency * 3, 3000);
      noiseFilter.Q.value = 1.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(noteGain);

      noise.start(now);
      noise.stop(now + 0.05);

      filter.connect(noteGain);
      noteGain.connect(this.ctx.destination);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Play a sequence of guitar notes in rhythm
   */
  public playGuitarSequence(frequencies: number[], intervalMs: number = 320) {
    if (this.isMuted || frequencies.length === 0) return;
    frequencies.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.isMuted) {
          this.playGuitarNote(freq, 1.8);
        }
      }, idx * intervalMs);
    });
  }

  /**
   * Sound effect for correct answer
   */
  public playCorrectSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Bright happy chord (C5 + G5)
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect for incorrect answer
   */
  public playWrongSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect for combo / level up
   */
  public playComboSound(multiplier: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = 440 * (1 + multiplier * 0.15);

      [0, 4, 7, 12].forEach((semitone, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const f = baseFreq * Math.pow(2, semitone / 12);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new GuitarAudioSynthesizer();
