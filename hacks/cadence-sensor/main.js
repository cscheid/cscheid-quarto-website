let fft = new FFT(512, 60);
let fmt = d3.format(".2f");

function makeCadenceMeter() {
  let result;
  // here's my dumb algorithm: we first compute the first principal
  // component of the buffer, then we project all vectors onto the
  // first principal component, this gives a time series. Take the FFT
  // of this time series and identify the biggest periodic
  // component. That's the cadence.
  // What could possibly go wrong, right?

  // about 8 seconds worth of data, but we use an exponential decay below with ~1s half-life
  let bufferLength = 512;
  
  let xBuffer = new Float32Array(bufferLength);
  let yBuffer = new Float32Array(bufferLength);
  let zBuffer = new Float32Array(bufferLength);
  let tBuffer = new Float32Array(bufferLength);

  let ticks = 0;
  let ix = 0;
  let principalDirection = new Float32Array(3);
  let tv = new Float32Array(3);
  principalDirection[0] = Math.random();
  principalDirection[1] = Math.random();
  principalDirection[2] = Math.random();
  let cov = new Float32Array(9);

  function powerIteration() {
    let dl = 0;
    do {
      tv[0] = cov[0] * principalDirection[0] +
        cov[1] * principalDirection[1] +
        cov[2] * principalDirection[2];
      tv[1] = cov[3] * principalDirection[0] +
        cov[4] * principalDirection[1] +
        cov[5] * principalDirection[2];
      tv[2] = cov[6] * principalDirection[0] +
        cov[7] * principalDirection[1] +
        cov[8] * principalDirection[2];

      let l = Math.sqrt(tv[0] * tv[0] + tv[1] * tv[1] + tv[2] * tv[2]);
      tv[0] /= l;
      tv[1] /= l;
      tv[2] /= l;

      let dx = tv[0] - principalDirection[0];
      let dy = tv[1] - principalDirection[1];
      let dz = tv[2] - principalDirection[2];
      dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      principalDirection[0] = tv[0];
      principalDirection[1] = tv[1];
      principalDirection[2] = tv[2];
    } while (dl > 1e-4);
  }
  
  function makeCov(mx, my, mz) {
    for (let i=0; i<9; ++i) {
      cov[i] = 0;
    }
    for (let i=0; i<bufferLength; ++i) {
      let dx = xBuffer[i] - mx;
      let dy = yBuffer[i] - my;
      let dz = zBuffer[i] - mz;
      cov[0] += dx * dx;
      cov[1] += dx * dy;
      cov[2] += dx * dz;
      cov[3] += dy * dx;
      cov[4] += dy * dy;
      cov[5] += dy * dz;
      cov[6] += dz * dx;
      cov[7] += dz * dy;
      cov[8] += dz * dz;
    }
    cov[0] /= bufferLength;
    cov[1] /= bufferLength;
    cov[2] /= bufferLength;
    cov[3] /= bufferLength;
    cov[4] /= bufferLength;
    cov[5] /= bufferLength;
    cov[6] /= bufferLength;
    cov[7] /= bufferLength;
    cov[8] /= bufferLength;
  }
  
  let mx = 0, my = 0, mz = 0;
  function computePrincipalDirection() {
    mx = 0;
    my = 0;
    mz = 0;
    for (let i=0; i<bufferLength; ++i) {
      mx += xBuffer[i];
      my += yBuffer[i];
      mz += zBuffer[i];
    }
    mx /= bufferLength;
    my /= bufferLength;
    mz /= bufferLength;
    
    makeCov(mx, my, mz);
    powerIteration();
  }
  
  function updateData() {
    let decay = 64;
    for (let i = 0; i < bufferLength; ++i) {
      let t = Math.exp(-i / decay);
      tBuffer[i] = 
        ((xBuffer[(bufferLength + ix - i) % bufferLength] - mx) * principalDirection[0] +
         (yBuffer[(bufferLength + ix - i) % bufferLength] - my) * principalDirection[1] +
         (zBuffer[(bufferLength + ix - i) % bufferLength] - mz) * principalDirection[2]) * t;
    }

    fft.forward(tBuffer);
    fft.peak = 0;
    fft.calculateSpectrum();
    let freq = fft.getBandFrequency(fft.peakBand);
    let rpm = freq * 60;
    result.rpm = rpm;
  }

  let xScale1 = d3.scaleLinear().domain([0, bufferLength]).range([0, 400]);
  let yScale1 = d3.scaleLinear().range([200,0]);
  let xScale2 = d3.scaleLinear().domain([0, bufferLength]).range([0, 400]);
  let yScale2 = d3.scaleLinear().range([200,0]);
  let line1 = d3.line()
      .x(function(d, i) { return xScale1(i); })
      .y(function(d, i) { return yScale1(d); });
  let line2 = d3.line()
      .x(function(d, i) { return xScale2(i); })
      .y(function(d, i) { return yScale2(d); });

  let chart1 = d3.select("#chart1")
      .append("svg")
      .attr("width", 600)
      .attr("height", 300);
  let path1 = chart1.append("path")
      .datum(tBuffer)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "2px");

  let chart2 = d3.select("#chart2")
      .append("svg")
      .attr("width", 600)
      .attr("height", 300);
  let path2 = chart2.append("path")
      .datum(fft.spectrum)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "2px");

  result = {
    tick: function(obj) {
      xBuffer[ix] = obj.x;
      yBuffer[ix] = obj.y;
      zBuffer[ix] = obj.z;
      ix++;
      ticks++;
      if (ix === bufferLength)
        ix = 0;
      if (ticks % 15 === 0) { // update every .25s just to not completely destroy battery life
        computePrincipalDirection();
        updateData();
        // when this is a real thing, we won't need to plot it. Until then, the plotting
        // helps with debugging.
        yScale1.domain(d3.extent(tBuffer));
        path1.attr("d", line1);
        yScale2.domain(d3.extent(fft.spectrum));
        path2.datum(fft.spectrum).attr("d", line2);
      }
    }
  };

  return result;
}

let cadenceMeter;

// I regret everything
function onClick() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer
    // iOS 13+
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          cadenceMeter = makeCadenceMeter();

          window.addEventListener('devicemotion', (e) => {
            cadenceMeter.tick(e.accelerationIncludingGravity);
            d3.select("#x-axis").text(fmt(e.accelerationIncludingGravity.x));
            d3.select("#y-axis").text(fmt(e.accelerationIncludingGravity.y));
            d3.select("#z-axis").text(fmt(e.accelerationIncludingGravity.z));
            d3.select("#rpm-reader").text(fmt(cadenceMeter.rpm));
          });
        }
      })
      .catch(d => {
        d3.select("#error-message").text(d);
      });
  } else {
    // non iOS 13+
    let acl = new Accelerometer({frequency: 60});

    acl.addEventListener('reading', () => {
      d3.select("#x-axis").text(fmt(acl.x));
      d3.select("#y-axis").text(fmt(acl.y));
      d3.select("#x-axis").text(fmt(acl.z));
    });

    acl.start();
  }
}


d3.select("#start").on("click", onClick);
