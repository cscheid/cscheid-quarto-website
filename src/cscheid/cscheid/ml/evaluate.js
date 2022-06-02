/** @module cscheid/ml/evaluate */

function classifyLabeledSet(model, labeledSamples) {
  return labeledSamples.map((sample) => {
    return {prediction: model.classify(sample.features),
      label: sample.label};
  });
}

export function accuracy(model, labeledSamples) {
  let result = 0;
  classifyLabeledSet(model, labeledSamples).forEach((d) => {
    if (d.prediction === d.label) {
      result += 1;
    }
  });
  return result;
}

