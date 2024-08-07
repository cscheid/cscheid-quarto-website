const sampleRate = 48e3;
const oscillator = (carrier = Math.sin) => {
  let phase = 0;
  return (freq) => {
    phase += 2 * Math.PI * freq / sampleRate;
    return carrier(phase);
  };
};
function sineWave(freq) {
  return function(t) {
    return Math.sin(2 * Math.PI * freq * t);
  };
}
function modulateFreq(carrier, modulator) {
  return function(t) {
    return carrier(t + modulator(t));
  };
}
function modulateAmp(carrier, modulator) {
  return function(t) {
    return carrier(t) * modulator(t);
  };
}
function envelope(duration, attack, decay, sustain, release) {
  return function(t) {
    if (t < attack) {
      return t / attack;
    } else if (t < attack + decay) {
      return 1 - (1 - sustain) * (t - attack) / decay;
    } else if (t < duration - release) {
      return sustain;
    } else {
      return sustain * (duration - t) / release;
    }
  };
}
function generate(wave, duration) {
  const samples = new Float32Array(duration * sampleRate);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = wave(i / sampleRate);
  }
  return samples;
}
export {
  envelope,
  generate,
  modulateAmp,
  modulateFreq,
  oscillator,
  sampleRate,
  sineWave
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZm0udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCBzYW1wbGVSYXRlID0gNDgwMDA7XG5cbi8vIHRoZSByZXR1cm4gdmFsdWUgb2Ygb3NjaWxsYXRvciBuZWVkcyB0byBiZVxuLy8gY2FsbGVkIHNlcXVlbnRpYWxseSB3aXRoIHRoZSBpbnN0YW50YW5lb3VzIGZyZXF1ZW5jeSBcbi8vIG9mIHRoZSBjYXJyaWVyIHdhdmVcbmV4cG9ydCBjb25zdCBvc2NpbGxhdG9yID0gKGNhcnJpZXIgPSBNYXRoLnNpbikgPT4ge1xuICAgIGxldCBwaGFzZSA9IDA7XG4gICAgcmV0dXJuIChmcmVxOiBudW1iZXIpID0+IHtcbiAgICAgICAgcGhhc2UgKz0gMiAqIE1hdGguUEkgKiBmcmVxIC8gc2FtcGxlUmF0ZTtcbiAgICAgICAgcmV0dXJuIGNhcnJpZXIocGhhc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNpbmVXYXZlKGZyZXE6IG51bWJlcikge1xuICAgIHJldHVybiBmdW5jdGlvbih0OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc2luKDIgKiBNYXRoLlBJICogZnJlcSAqIHQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vZHVsYXRlRnJlcShcbiAgICBjYXJyaWVyOiAodDogbnVtYmVyKSA9PiBudW1iZXIsIFxuICAgIG1vZHVsYXRvcjogKHQ6IG51bWJlcikgPT4gbnVtYmVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gY2Fycmllcih0ICsgbW9kdWxhdG9yKHQpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2R1bGF0ZUFtcChcbiAgICBjYXJyaWVyOiAodDogbnVtYmVyKSA9PiBudW1iZXIsIFxuICAgIG1vZHVsYXRvcjogKHQ6IG51bWJlcikgPT4gbnVtYmVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQ6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gY2Fycmllcih0KSAqIG1vZHVsYXRvcih0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbnZlbG9wZShcbiAgICBkdXJhdGlvbjogbnVtYmVyLFxuICAgIGF0dGFjazogbnVtYmVyLCBcbiAgICBkZWNheTogbnVtYmVyLCBcbiAgICBzdXN0YWluOiBudW1iZXIsIFxuICAgIHJlbGVhc2U6IG51bWJlcikge1xuICAgIHJldHVybiBmdW5jdGlvbih0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHQgPCBhdHRhY2spIHtcbiAgICAgICAgICAgIHJldHVybiB0IC8gYXR0YWNrO1xuICAgICAgICB9IGVsc2UgaWYgKHQgPCBhdHRhY2sgKyBkZWNheSkge1xuICAgICAgICAgICAgcmV0dXJuIDEgLSAoMSAtIHN1c3RhaW4pICogKHQgLSBhdHRhY2spIC8gZGVjYXk7XG4gICAgICAgIH0gZWxzZSBpZiAodCA8IGR1cmF0aW9uIC0gcmVsZWFzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN1c3RhaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VzdGFpbiAqIChkdXJhdGlvbiAtIHQpIC8gcmVsZWFzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlKFxuICAgd2F2ZTogKHQ6IG51bWJlcikgPT4gbnVtYmVyLFxuICAgZHVyYXRpb246IG51bWJlcixcbikge1xuICAgIGNvbnN0IHNhbXBsZXMgPSBuZXcgRmxvYXQzMkFycmF5KGR1cmF0aW9uICogc2FtcGxlUmF0ZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzYW1wbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNhbXBsZXNbaV0gPSB3YXZlKGkgLyBzYW1wbGVSYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNhbXBsZXM7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiQUFBTyxNQUFNLGFBQWE7QUFLbkIsTUFBTSxhQUFhLENBQUMsVUFBVSxLQUFLLFFBQVE7QUFDOUMsTUFBSSxRQUFRO0FBQ1osU0FBTyxDQUFDLFNBQWlCO0FBQ3JCLGFBQVMsSUFBSSxLQUFLLEtBQUssT0FBTztBQUM5QixXQUFPLFFBQVEsS0FBSztBQUFBLEVBQ3hCO0FBQ0o7QUFFTyxTQUFTLFNBQVMsTUFBYztBQUNuQyxTQUFPLFNBQVMsR0FBVztBQUN2QixXQUFPLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxPQUFPLENBQUM7QUFBQSxFQUMxQztBQUNKO0FBRU8sU0FBUyxhQUNaLFNBQ0EsV0FBa0M7QUFDbEMsU0FBTyxTQUFTLEdBQVc7QUFDdkIsV0FBTyxRQUFRLElBQUksVUFBVSxDQUFDLENBQUM7QUFBQSxFQUNuQztBQUNKO0FBRU8sU0FBUyxZQUNaLFNBQ0EsV0FBa0M7QUFDbEMsU0FBTyxTQUFTLEdBQVc7QUFDdkIsV0FBTyxRQUFRLENBQUMsSUFBSSxVQUFVLENBQUM7QUFBQSxFQUNuQztBQUNKO0FBRU8sU0FBUyxTQUNaLFVBQ0EsUUFDQSxPQUNBLFNBQ0EsU0FBaUI7QUFDakIsU0FBTyxTQUFTLEdBQVc7QUFDdkIsUUFBSSxJQUFJLFFBQVE7QUFDWixhQUFPLElBQUk7QUFBQSxJQUNmLFdBQVcsSUFBSSxTQUFTLE9BQU87QUFDM0IsYUFBTyxLQUFLLElBQUksWUFBWSxJQUFJLFVBQVU7QUFBQSxJQUM5QyxXQUFXLElBQUksV0FBVyxTQUFTO0FBQy9CLGFBQU87QUFBQSxJQUNYLE9BQU87QUFDSCxhQUFPLFdBQVcsV0FBVyxLQUFLO0FBQUEsSUFDdEM7QUFBQSxFQUNKO0FBQ0o7QUFFTyxTQUFTLFNBQ2IsTUFDQSxVQUNEO0FBQ0UsUUFBTSxVQUFVLElBQUksYUFBYSxXQUFXLFVBQVU7QUFDdEQsV0FBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUNyQyxZQUFRLENBQUMsSUFBSSxLQUFLLElBQUksVUFBVTtBQUFBLEVBQ3BDO0FBQ0EsU0FBTztBQUNYOyIsCiAgIm5hbWVzIjogW10KfQo=
