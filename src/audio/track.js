import { silenceAt } from "./wave.js";

//////////////////////////////////////////////////////////////////////////////
// tracks
// a track has a beginning and an end time and can render its own samples with
// a function that will zero out all samples outside its window

export function sequence(tracks)
{
  var track_origins   = tracks.map(track => track.window[0]);
  var track_durations = tracks.map(track => track.window[1] - track.window[0]);
  var track_offsets   = [0];
  
  for (var i=1; i<=tracks.length; ++i) {
    track_offsets.push(track_offsets[i-1] + track_durations[i-1]);
  }

  // FIXME JS has no binary search in stdlib?!
  function locate_track(sample) {
    var t = sample.t, l = tracks.length;
    for (var i=0; i<l; ++i) {
      if (t >= track_offsets[i] && t < track_offsets[i+1])
        return i;
    }
    return -1;
  }
  
  return {
    window: [0, track_offsets[tracks.length]],
    render: function(sample) {
      var ix = locate_track(sample);
      if (ix === -1) {
        return silenceAt(sample.t);
      }
      var inSample = {
        v: sample.v,
        t: sample.t - track_offsets[ix] + track_origins[ix],
        w: sample.w
      };
      var outSample = tracks[ix].render(inSample);
      return {
        v: inSample.v,
        t: sample.t,
        w: inSample.w
      };
    }
  };
}

export function parallel(tracks)
{
  var min = Math.min.apply(null, tracks.map(track => track.window[0]));
  var max = Math.max.apply(null, tracks.map(track => track.window[1]));
  return {
    window: [min, max],
    render: function(sample) {
      var result = silenceAt(sample.t);
      for (var i=0; i<tracks.length; ++i) {
        var outSample = tracks[i].render(sample);
        result.v += outSample.v;
        result.w += outSample.w;
      }
      return result;
    }
  };
}

export function baseTrack(f, duration)
{
  return {
    window: [0, duration],
    render: function(sample) {
      if (sample.t < this.window[0] || sample.t > this.window[1]) {
        return silenceAt(sample.t);
      } else {
        return f(sample);
      }
    }
  };
}

export function delay(track, amount)
{
  return {
    window: [track.window[0] + amount, track.window[1] + amount],
    render: function(sample) {
      var this_sample = { v: sample.v, t: sample.t - amount, w: sample.w };
      return track.render(this_sample);
    }
  };
}

export function overlappingSeq(tracks, wait)
{
  return parallel(tracks.map((track,i) => delay(track, i * wait)));
}

export function seqDelays(tracks)
{
  var wait = 0;
  return parallel(tracks.map(track => {
    var r = delay(track[0], wait);
    wait += track[1];
    return r;
  }));
}
