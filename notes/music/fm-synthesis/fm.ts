export const sampleRate = 48000;

// the return value of oscillator needs to be
// called sequentially with the instantaneous frequency 
// of the carrier wave
export const oscillator = (carrier = Math.sin) => {
    let phase = 0;
    return (freq: number) => {
        phase += 2 * Math.PI * freq / sampleRate;
        return carrier(phase);
    }
}

export function sineWave(freq: number) {
    return function(t: number) {
        return Math.sin(2 * Math.PI * freq * t);
    }
}

export function modulateFreq(
    carrier: (t: number) => number, 
    modulator: (t: number) => number) {
    return function(t: number) {
        return carrier(t + modulator(t));
    }
}

export function modulateAmp(
    carrier: (t: number) => number, 
    modulator: (t: number) => number) {
    return function(t: number) {
        return carrier(t) * modulator(t);
    }
}

export function envelope(
    duration: number,
    attack: number, 
    decay: number, 
    sustain: number, 
    release: number) {
    return function(t: number) {
        if (t < attack) {
            return t / attack;
        } else if (t < attack + decay) {
            return 1 - (1 - sustain) * (t - attack) / decay;
        } else if (t < duration - release) {
            return sustain;
        } else {
            return sustain * (duration - t) / release;
        }
    }
}

export function generate(
   wave: (t: number) => number,
   duration: number,
) {
    const samples = new Float32Array(duration * sampleRate);
    for (let i = 0; i < samples.length; i++) {
        samples[i] = wave(i / sampleRate);
    }
    return samples;
}
