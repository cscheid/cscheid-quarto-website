// now we SICP up our audio DSL

export function then(f, ...fs) {
  return function(...params) {
    let result = f(...params);
    for (const otherF of fs) {
      result = otherF(result);
    }
    return result;
  }
}

export function silenceAt(t) {
  return { v: 0, t: t, w: 0 };
}

export function constant(k) {
  return function (sample) {
    return { v: k, t: sample.t, w: 1 };
  };
}

export function liftV(f) {
  return function (sample) {
    return { v: f(sample.v), t: sample.t, w: sample.w };
  };
}

export function identityT(sample) {
  return { v: sample.t, t: sample.t, w: 1 };
}

//////////////////////////////////////////////////////////////////////////////

// sin(2 pi v t) so that base period is 1.
export function variableSine(sample) {
  return { v: Math.sin(2 * Math.PI * sample.v * sample.t), t: sample.t, w: 1 };
}

//////////////////////////////////////////////////////////////////////////////
// Base periodic waveforms, all with period 1, all creating values as
// a function of sample.t

export const baseSine = then(constant(1), variableSine);

export function baseWhiteNoise(sample) {
  return { v: Math.random() * 2 - 1, t: sample.t, w: 1 };
}

export function baseSawTooth(sample) {
  var v = sample.t % 1;
  return { v: v < 0 ? v + 1 : v, t: sample.t, w: 1 };
}

export function baseTriangle(sample) {
  var v = sample.t % 1;
  v = v < 0 ? v + 1 : v;
  v = Math.min(v, 1 - v);
  return { v: v, t: sample.t, w: 1 };
}

export function baseSquare(sample) {
  var v = sample.t % 1;
  v = v < 0 ? v + 1 : v;
  v = v < 0.5 ? 1 : -1;
  return { v: v, t: sample.t, w: 1 };
}

export function changedFreq(freq, f) {
  return function (sample) {
    var result = f({ v: sample.v, t: sample.t * freq, w: 1 });
    result.t = sample.t;
    return result;
  };
}

export function changedPhase(phase, f) {
  return function (sample) {
    var result = f({ v: sample.v, t: sample.t + phase, w: 1 });
    result.t = sample.t;
    return result;
  };
}

export function changeFreq(f) {
  return (freq) => changedFreq(freq, f);
}

export function addWave() {
  var args = [];
  for (var i = 0; i < arguments.length; ++i) {
    args.push(arguments[i]);
  }

  return function (sample) {
    var result = silenceAt(sample.t);
    for (var i = 0; i < args.length; ++i) {
      var thisSample = args[i](sample);
      result.v += thisSample.v;
      result.w += thisSample.w;
    }
    return result;
  };
}

//////////////////////////////////////////////////////////////////////////////
// attic

export function baseInverseSawTooth(sample) {
  var v = sample.t % 1;
  v = v < 0 ? v + 1 : v;
  v = 1.0 - v;
  return { v: v, t: sample.t, w: 1 };
}
export const inverseSawTooth = changeFreq(baseInverseSawTooth);

//////////////////////////////////////////////////////////////////////////////

export const sawTooth = changeFreq(baseSawTooth);
export const sine = changeFreq(baseSine);
export const triangle = changeFreq(baseTriangle);
export const square = changeFreq(baseSquare);

export function gain(g) {
  return function (sample) {
    return { v: sample.v * g, t: sample.t, w: sample.w * g };
  };
}

export function modulateWith(envelopeFun) {
  return function (sample) {
    var envelopeResult = envelopeFun(sample);
    return {
      v: sample.v * envelopeResult.w,
      t: sample.t,
      w: sample.w * envelopeResult.w,
    };
  };
}

//////////////////////////////////////////////////////////////////////////////
// combinators

export function expFadeInAt(t0, sharpness) {
  return function (sample) {
    var delta = sample.t - t0;
    var weight = delta < 0 ? 0.0 : (1.0 - Math.exp(-delta * sharpness));
    return { v: sample.v * weight, t: sample.t, w: sample.w * weight };
  };
}

export function expFadeOutAt(t0, sharpness) {
  return function (sample) {
    var delta = t0 - sample.t;
    var weight = delta < 0 ? 0.0 : (1.0 - Math.exp(-delta * sharpness));
    return { v: sample.v * weight, t: sample.t, w: sample.w * weight };
  };
}

export function expFadeOut2At(t0, sharpness) {
  return function (sample) {
    var delta = sample.t - t0;
    var weight = delta < 0 ? 1.0 : Math.exp(-delta * sharpness);
    return { v: sample.v * weight, t: sample.t, w: sample.w * weight };
  };
}

export function lerp(t0, v0, t1, v1) {
  var d = t1 - t0;
  return function (sample) {
    var w = (sample.t - t0) / d;
    return {
      v: w * v1 + (1 - w) * v0,
      t: sample.t,
      w: sample.w,
    };
  };
}

export function logLerp(t0, v0, t1, v1) {
  var d = t1 - t0;
  var lv0 = Math.log(v0);
  var lv1 = Math.log(v1);
  return function (sample) {
    var w = (sample.t - t0) / d;
    var lv = w * lv1 + (1 - w) * lv0;
    return {
      v: Math.exp(lv),
      t: sample.t,
      w: sample.w,
    };
  };
}

export const chirpT = (k) =>
  then(identityT, liftV((t) => k * t), variableSine);
export const expChirpT = (k) =>
  then(identityT, liftV((t) => Math.pow(k, t)), variableSine);

export function vibrato(waveFun, vibratoFreq, vibratoAmpl) {
  return function (sample) {
    var f = vibratoFreq * Math.PI * 2;
    var sampleIn = {
      v: sample.v,
      t: sample.t + Math.sin(f * sample.t) * vibratoAmpl / f,
      w: sample.w,
    };

    var result = waveFun(sampleIn);

    return {
      v: result.v,
      t: sample.t,
      w: result.w,
    };
  };
}

// ADSR envelope https://en.wikipedia.org/wiki/Envelope_(music)
// parameters:
//   - ta, aa: time at attack peak, amplitude at attack peak
//   - td, ad: time to end of decay, amplitude at end of decay
//   - ts:     time to end of sustain
//   - tr:     time to end or release
// envelope is directly encoded in weight
export function adsr(ta, aa, td, ad, ts, tr) {
  var t0 = ta,
    t1 = t0 + td,
    t2 = t1 + ts,
    t3 = t2 + tr;
  return function (sample) {
    var w = 0, u;
    if (sample.t > 0) {
      if (sample.t < t0) {
        u = (t0 - sample.t) / t0;
        w = (1 - u) * aa;
      } else if (sample.t < t1) {
        u = (t1 - sample.t) / (t1 - t0);
        w = (1 - u) * ad + u * aa;
      } else if (sample.t < t2) {
        // sustain amplitude is amplitude of decay
        w = ad;
      } else if (sample.t < t3) {
        u = (t3 - sample.t) / (t3 - t2);
        w = u * ad;
      }
    }
    return {
      v: 1,
      t: sample.t,
      w: w,
    };
  };
}
