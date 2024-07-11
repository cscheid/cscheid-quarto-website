
To play sounds on a computer, programmers create an array of numbers whose values correspond to where they want the [voicecoil](https://en.wikipedia.org/wiki/Electrodynamic_speaker_driver) of the computer's speaker to be at any given point in time, and then ask the computer to play that sound. This array of numbers corresponds to the "wave form" of the sound.

## Simple sine waves

If you're a programmer and want a bland tone, a sine wave is the shape you want for the waveform. A sine wave oscillating at 440 times per second (Hz) sounds like this:

```{=html}
<p><button onclick="window.playit(0); return false;">440Hz sine</button></p>
```

In this example, the wave form is sampled 48,000 times per second and has one second of duration. The resulting array of numbers contains the values of `Math.sin(x)` computed at a frequency that oscillates 440 total times from the beginning to the end of the array:

```js
const waveform = [];
// Math.sin has period 2 * pi. We want period 1/440, and
// are sampling at 48000/s. So we multiply by 440 * 2 * pi / 48000
const baseFreq = 440;
const freq = baseFreq * 2 * Math.PI / 48000;
for (let i = 0; i < 48000; ++i) {
    waveform.push(Math.sin(i * freq));
}
```

If you want a tone that sounds one octave higher, then you need to double the frequency of the waveform. That's easy enough, just double the frequency of the sine wave itself, by changing the value of `baseFreq` to `880`.

```{=html}
<p><button onclick="window.playit(1); return false;">880Hz sine</button></p>
```

## ...slide

Now let's make this a little more interesting.
What if we want our tone to start at 440Hz, but end at 880Hz?

### A simple attempt

Naively inspecting the code above and trying the obvious change should get you close to something like this:

```js
const waveform = [];
const baseFreq = 440;
for (let i = 0; i < 48000; ++i) {
    const u = i / 48000;
    // currentFreq changes smoothly from 440 to 880
    // as we move along the loop
    const currentFreq = baseFreq * (1 + u); 
    const freq = currentFreq * 2 * Math.PI / 48000;
    waveform.push(Math.sin(i * freq));
}
```

That produces the following sound:

```{=html}
<p><button onclick="window.playit(3); return false;">slide 440-880?</button></p>
```

That's great, we got a sliding tone with a progressively higher pitch.
But pay attention to what happens if we join the three tones together. First, the 440 Hz tone, then this slide up, then the 880 Hz tone:

```{=html}
<p><button onclick="window.playit(4); return false;">Oh oh</button></p>
```

Somehow, at the end of the slide, we're at a frequency _higher_ than 880Hz (you can tell because the tone goes _down_ in pitch when it stabilizes). What happened?

### Phase

What that code above is doing is cutting tiny pieces of 48000 different sine waves and pasting them together, one from each frequency.

Unfortunately, sine waves oscillate, and sine waves of different frequencies oscillate at different rates.
As a result, we have no guarantee that the sine waves "line up" at the time we splice them.
And if they don't, then we might end up with a completely different tone.

In this specific case, each splicing we do is rushing the tone a little, because its frequency is just a little higher than before.
This repeated rushing of the tone makes the sine wave oscillate faster than the frequency we wanted, and so we end up with a higher pitch than we expected.

There are at least two ways to fix this.
The mathy way is to bust out your diff-eq and numerical integration knowledge, and write the waveform
directly.

It's not _that_ complicated, because sine waves have simple
derivatives and Taylor series give you a great approximation. You'd write something like $f(t + k) = f(t) + k f'(t) + 1/2k^2 f''(t) + \cdots$, remember that $\sin'(x) = \cos(x), \cos'(x) = -\sin(x)$, apply a chain rule here and there, etc.

But there's a much cleaner way.

When doing this computation numerically, we've already resigned ourselves to computing values of this function sequentially -- we can only get the next term if we have the previous one.

The mathy way asks us to keep the previous value of the function we've evaluated. But if we know that we are generating values for an oscillator, that tells us that we're always sampling from some base wave form (here, a sine wave). So we can instead maintain the _phase_ of the last value we've evaluated. Then, when the next evaluation comes, we know what is the instant frequency we want, use that to update the phase, and reevalute the base waveform at the new phase:

```js
const waveform = [];
const baseFreq = 440;
let phase = 0;
for (let i = 0; i < 48000; ++i) {
    const u = i / 48000;
    const currentFreq = baseFreq * (1 + u);
    phase += currentFreq * 2 * Math.PI / 48000;
    waveform.push(Math.sin(phase));
}
```

This small change guarantees that from one sample to another, we won't
cause big jumps in the resulting waveform.

That sounds like this:

```{=html}
<p><button onclick="window.playit(2); return false;">Slide 440-880</button></p>
```

And the three tones, concatenated, sound like this:

```{=html}
<p><button onclick="window.playit(5); return false;">Correct slide</button></p>
```

## Upshot

This implementation is nice for one big reason. If you want to sample a different periodic base wave that isn't a sine wave, you can just plug and play, and it all works.

And that turns out to be how [FM synthesis](https://en.wikipedia.org/wiki/Frequency_modulation_synthesis) is done; if you try to splice complicated base forms, you get completely wrong results. But integrating the phase explicitly works out great.

In addition, FM synthesis was invented in the [70s](https://web.eecs.umich.edu/~fessler/course/100/misc/chowning-73-tso.pdf), and sines were too expensive to compute in real time. But one could use lookup tables that were sine-like for the base wave, and that worked perfectly well. A decade later we got the [DX7](https://en.wikipedia.org/wiki/Yamaha_DX7), and the rest is electronic music history.

```{ojs}
//| output: false
import { simpleSine, badVariableSine, variableSine } from "/notes/music/fm-synthesis/examples.ts";
import { makePlayer } from "/src/audio/audio.js";

function init() {
    if (window.player === undefined) {
        let player = makePlayer();
        window.player = player;
    }
}

waves = [
    simpleSine(440),
    simpleSine(880),
    variableSine(440, 880, 1),
    badVariableSine(440, 880, 1),
    (() => {
        const tone1 = Array.from(simpleSine(440));
        const tone2 = Array.from(badVariableSine(440, 880, 1));
        const tone3 = Array.from(simpleSine(880));
        return new Float32Array([...tone1, ...tone2, ...tone3]);
    })(),
    (() => {
        const tone1 = Array.from(simpleSine(440));
        const tone2 = Array.from(variableSine(440, 880, 1));
        const tone3 = Array.from(simpleSine(880));
        return new Float32Array([...tone1, ...tone2, ...tone3]);
    })()

];

window.playit = function(which) {
    init();
    window.player.playBuffer(waves[which]);
}
```
