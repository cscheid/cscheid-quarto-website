/*global AudioContext */

import vegaEmbed from "https://cdn.skypack.dev/vega-embed";

//////////////////////////////////////////////////////////////////////////////
// softeng nonsense

Float32Array.prototype.toArray = function (i, j) {
  const result = new Array(j - i);
  for (var ixr = 0; i < j; ++i, ++ixr) {
    result[ixr] = this[i];
  }
  return result;
};

export function getAudioContext() {
  let context; // Audio context

  if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
      alert(
        "Your browser does not support AudioContext and cannot play this audio.",
      );
      return false;
    }
    window.AudioContext = window.webkitAudioContext;
  }
  context = new AudioContext();

  context.playFloatArray = function (floatArray) {
    var buffer = context.createBuffer(1, floatArray.length, context.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < floatArray.length; ++i) {
      data[i] = floatArray[i];
    }

    var source = context.createBufferSource();
    source.buffer = buffer;
    // Connect to the final output node (the speakers)
    source.connect(context.destination);
    if (context._ourAnalyzer) {
      source.connect(context._ourAnalyzer);
    }
    // Play immediately
    source.start(0);
  };

  context.playByteArray = function (byteArray) {
    var arrayBuffer = new ArrayBuffer(byteArray.length);
    var bufferView = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteArray.length; i++) {
      bufferView[i] = byteArray[i];
    }

    // Play the loaded file
    function play(buf) {
      // Create a source node from the buffer
      var source = context.createBufferSource();
      source.buffer = buf;
      // Connect to the final output node (the speakers)
      source.connect(context.destination);
      if (context._ourAnalyzer) {
        source.connect(context._ourAnalyzer);
      }
      // Play immediately
      source.start(0);
    }

    context.decodeAudioData(arrayBuffer, function (buffer) {
      play(buffer);
    });
  };

  return context;
}

//////////////////////////////////////////////////////////////////////////////
// player

export function initPlayer() {
  if (window.player === undefined) {
    const player = makePlayer();
    window.player = player;
  }
}

export function makePlayer() {
  var ctx = getAudioContext();

  function timeToSample(t) {
    var sampleRate = ctx.sampleRate; // sampleRate samples per second
    return t * sampleRate;
  }

  function sampleToTime(t) {
    var sampleRate = ctx.sampleRate; // sampleRate samples per second
    return t / sampleRate;
  }

  return {
    makeWaveBuffer: function (f, window) {
      window = window || [0, 1];
      var sampleRate = ctx.sampleRate; // sampleRate samples per second
      var duration = window[1] - window[0]; // in seconds
      var bufferSize = ~~(sampleRate * duration);
      var buffer = new Float32Array(bufferSize);

      for (var i = 0; i < bufferSize; ++i) {
        var inSample = { t: sampleToTime(i) + window[0], v: 0.0, w: 1.0 };
        var outSample = f(inSample);
        if (outSample.w <= 1) {
          buffer[i] = outSample.v;
        } else {
          buffer[i] = outSample.v / outSample.w;
        }
      }

      return buffer;
    },

    spectrogram: function (callback, options) {
      const analyzer = ctx.createAnalyser();
      ctx._ourAnalyzer = analyzer;
      options = {
        fftSize: 256,
        minDecibels: -60,
        maxDecibels: -10,
        ...(options || {}),
      };
      analyzer.fftSize = options.fftSize;
      analyzer.minDecibels = options.minDecibels;
      analyzer.maxDecibels = options.maxDecibels;
      const dataArray = new Float32Array(analyzer.frequencyBinCount);
      let stopped = false;

      const innerK = () => {
        if (!stopped) {
          window.requestAnimationFrame(innerK);
        }
        analyzer.getFloatFrequencyData(dataArray);
        if (dataArray.some((x) => !isNaN(x))) {
          callback(dataArray);
        }
      };
      const rAF = window.requestAnimationFrame(innerK);
      return () => {
        stopped = true;
      };
    },

    makeWaveSamples: function (f, window) {
      window = window || [0, 1];
      var sampleRate = ctx.sampleRate; // sampleRate samples per second
      var duration = window[1] - window[0]; // in seconds
      var bufferSize = ~~(sampleRate * duration);
      var result = [];

      for (var i = 0; i < bufferSize; ++i) {
        var sample = { t: sampleToTime(i) + window[0], v: 0.0 };
        result.push(f(sample));
      }

      return result;
    },

    playWave: function (waveFun, window) {
      var buf = this.makeWaveBuffer(waveFun, window);
      ctx.playFloatArray(buf);
    },

    playTrack: function (track) {
      // let's make life easier for ourselves: a track can just be a waveform as well.
      if (track.waveForm) {
        ctx.playFloatArray(track.waveForm);
      } else {
        this.playWave(track.render, track.window);
      }
    },

    debugWaveBuffer: function (waveBuffer, window, div) {
      window = window || [0, 1];
      div = div || "#vis";
      const samples = Array.from(waveBuffer).map((d, i) => ({
        t: i / ctx.sampleRate,
        v: d,
      }));
      var yourVlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.0.0-rc10.json",
        "data": { "values": samples },
        "layer": [
          {
            "mark": {
              "type": "line",
              "interpolate": "monotone",
            },
            "encoding": {
              "x": { "field": "t", "type": "quantitative" },
              "y": { "field": "v", "type": "quantitative" },
            },
          },
          {
            "mark": {
              "type": "line",
              "interpolate": "monotone",
            },
            "encoding": {
              "x": { "field": "t", "type": "quantitative" },
              "y": { "field": "w", "type": "quantitative" },
            },
          },
        ],
      };
      vegaEmbed(div, yourVlSpec);
    },

    debugWave: function (waveFun, window, div) {
      window = window || [0, 1];
      div = div || "#vis";
      var yourVlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.0.0-rc10.json",
        "data": { "values": this.makeWaveSamples(waveFun, window) },
        "layer": [
          {
            "mark": {
              "type": "line",
              "interpolate": "monotone",
            },
            "encoding": {
              "x": { "field": "t", "type": "quantitative" },
              "y": { "field": "v", "type": "quantitative" },
            },
          },
          {
            "mark": {
              "type": "line",
              "interpolate": "monotone",
            },
            "encoding": {
              "x": { "field": "t", "type": "quantitative" },
              "y": { "field": "w", "type": "quantitative" },
            },
          },
        ],
      };
      vegaEmbed(div, yourVlSpec);
    },

    start: function () {
      ctx.resume();
    },
  };
}
