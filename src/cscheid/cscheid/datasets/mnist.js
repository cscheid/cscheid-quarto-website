/** @module cscheid/datasets/mnist */

/* global d3*/
export function load(urlPath) {
  urlPath = urlPath || '/datasets/mnist';

  // http://yann.lecun.com/exdb/mnist/
  // we fetch everything at once, and assume that sources
  // are available uncompressed 🤷
  const trainImages = d3.buffer(urlPath + '/train-images-idx3-ubyte');
  const trainLabels = d3.buffer(urlPath + '/train-labels-idx1-ubyte');
  const testImages = d3.buffer(urlPath + '/t10k-images-idx3-ubyte');
  const testLabels = d3.buffer(urlPath + '/t10k-labels-idx1-ubyte');
  const resultPromise = Promise.all(
      [trainImages, trainLabels, testImages, testLabels])
      .then(function(values) {
        const trIBuf = values[0]; // trainImages;
        const trLBuf = values[1]; // trainlabels;
        const teIBuf = values[2]; // testImages;
        const teLBuf = values[3]; // testLabels;
        const trainLView = new DataView(trLBuf);
        const testLView = new DataView(teLBuf);
        return {
          getTrainingPoint: function(ix) {
            return {
              data: new Uint8Array(trIBuf, (ix * 28 * 28) + 16, 28 * 28),
              label: trainLView.getInt8(ix + 8),
            };
          },
          getTestPoint: function(ix) {
            return {
              data: new Uint8Array(teIBuf, (ix * 28 * 28) + 16, 28 * 28),
              label: testLView.getInt8(ix + 8),
            };
          },
        };
      });
  return resultPromise;
}
