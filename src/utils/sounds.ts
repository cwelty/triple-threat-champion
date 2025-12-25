// Simple audio utilities using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playBeep(frequency: number = 440, duration: number = 200, volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    // Audio not supported, fail silently
  }
}

export function playWarningBeep() {
  // Two short beeps for warning
  playBeep(600, 150, 0.3);
  setTimeout(() => playBeep(600, 150, 0.3), 200);
}

export function playUrgentBeep() {
  // Three ascending beeps for urgent
  playBeep(500, 100, 0.4);
  setTimeout(() => playBeep(650, 100, 0.4), 150);
  setTimeout(() => playBeep(800, 200, 0.4), 300);
}

export function playTimerEndSound() {
  // Longer descending tone for timer end
  playBeep(800, 150, 0.5);
  setTimeout(() => playBeep(600, 150, 0.5), 180);
  setTimeout(() => playBeep(400, 300, 0.5), 360);
}

export function playSuccessSound() {
  // Happy ascending tone
  playBeep(523, 100, 0.3); // C
  setTimeout(() => playBeep(659, 100, 0.3), 120); // E
  setTimeout(() => playBeep(784, 200, 0.3), 240); // G
}
