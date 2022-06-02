/** @module cscheid/ml/data */

export function dataset(training, validation, testing, metadata) {
  return {
    trainingSet: training,
    validationSet: validation,
    testingSet: testing,
    metadata: metadata,
  };
}

