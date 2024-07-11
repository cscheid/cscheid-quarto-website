import * as fm from "./fm.ts";

export function simpleSine(freq = 440) {
    const carrier = fm.sineWave(freq);
    const envelope = fm.envelope(1, 0.01, 0.1, 0.8, 0.1);
    const wave = fm.modulateAmp(carrier, envelope);
    return fm.generate(wave, 1);
}

export function variableSine(startFreq: number, endFreq: number, duration: number)
{
    const carrier = fm.oscillator();
    const result = new Float32Array(duration * fm.sampleRate);
    for (let i = 0; i < result.length; i++) {
        const t = i / fm.sampleRate;
        const freq = startFreq + (endFreq - startFreq) * t / duration;
        result[i] = carrier(freq);
    }
    return result;
}
export function badVariableSine(startFreq: number, endFreq: number, duration: number)
{
    const result = new Float32Array(duration * fm.sampleRate);
    for (let i = 0; i < result.length; i++) {
        const t = i / fm.sampleRate;
        const freq = startFreq + (endFreq - startFreq) * t / duration;
        result[i] = fm.sineWave(freq)(t);
    }
    return result;
}

export function fm1(
    baseFreq: number,
    modFreq: number,
    modAmp: number,
) {
    const carrier = fm.sineWave(baseFreq);
    const modulator = fm.modulateAmp(fm.sineWave(baseFreq * modFreq), _ => modAmp);
    const envelope = fm.envelope(1, 0.01, 0.1, 0.8, 0.1);
    const wave = fm.modulateAmp(fm.modulateFreq(carrier, modulator), envelope);
    return fm.generate(wave, 1);
}

// /* Attempting to reproduce some tones from 
// https://web.eecs.umich.edu/~fessler/course/100/misc/chowning-73-tso.pdf */

// export function hat(left: number, center: number, right: number, height: number, t: number) {
//     if (t < left) {
//         return 0;
//     } else if (t < center) {
//         return height * (t - left) / (center - left);
//     } else if (t < right) {
//         return height * (right - t) / (right - center);
//     } else {
//         return 0;
//     }
// }

// export function brass() {
//     // It's easier to create Fig.11's envelope with hat functions
//     const envelope = (t: number) => {
//         return (
//             hat(0, 1/6, 2/6, 1, t) +
//             hat(1/6, 2/6, 5/6, 0.75, t) +
//             hat(2/6, 5/6, 1, 0.6, t));
//     }
//     const duration = 0.6;

//     const p3 = .6;
//     const p5 = 440;
//     const p6 = 440;
//     const p7 = 0;
//     const p8 = 5;

//     // now we attempt to follow fig 10
//     const dev1 = p7 * p6; // 0
//     const dev2 = (p8 - p7) * p6;
//     return fm.generate(t => {
//         const ug5 = envelope(t) * dev2;
//         const ug1 = fm.modulateFreq
//     }, duration)
// }