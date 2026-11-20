export interface Metronome {
  audioContext: AudioContext;
  tempo: number;
  beats: number;
  onDone: () => void;
}

export function createMetronome(audioContext: AudioContext, tempo: number, beats: number, onDone: () => void): Metronome {
  return { audioContext, tempo, beats, onDone };
}

export function startMetronome(metronome: Metronome): void {
  const { audioContext, tempo, beats, onDone } = metronome;
  const beatSeconds = 60 / tempo;
  const now = audioContext.currentTime;

  for (let i = 0; i < beats; i++) {
    const time = now + i * beatSeconds;
    playClick(metronome.audioContext, time);
  }

  const lastClickTime = now + (beats - 1) * beatSeconds;
  const lookAhead = 0.05;
  setTimeout(() => {
    onDone();
  }, (lastClickTime - audioContext.currentTime + lookAhead) * 1000);
}

function playClick(audioContext: AudioContext, time: number): void {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(1000, time);
  gain.gain.setValueAtTime(0.1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.05);
}
