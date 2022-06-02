/** @module cscheid/ml/decision_tree */

import * as cscheid from '../../cscheid.js';

function leafNode(label) {
  return {
    label: label,
    classify: function() {
      return this.label;
    },
  };
}

function internalNode(featureName, featureValue, treeIfFalse, treeIfTrue) {
  return {
    treeIfFalse: treeIfFalse,
    treeIfTrue: treeIfTrue,
    condition: function(instance) {
      return instance[featureName] === featureValue;
    },
    classify: function(instance) {
      if (this.condition(instance)) {
        return this.treeIfTrue.classify(instance);
      } else {
        return this.treeIfFalse.classify(instance);
      }
    },
  };
}

// function majorityVote(samples)
// {
//   let h = cscheid.array.histogram(samples, (sample) => sample.label);
//   return cscheid.map.argmax(h);
// }

function majorityVoteCount(samples) {
  const h = cscheid.array.histogram(samples, (sample) => sample.label);
  return cscheid.map.max(h);
}

// decision tree training for datasets with purely categorical features.
export function simpleDecisionTree() {
  function internalTrain(
      labeledSamples, remainingFeatureValuePairs, remainingDepth) {
    const h = cscheid.array.histogram(
        labeledSamples,
        (sample) => sample.label);
    if (h.size === 0) {
      return leafNode(undefined);
    } else if (h.size === 1 ||
               remainingFeatureValuePairs.length === 0 ||
               remainingDepth === 0) {
      // avoid recomputing histogram
      const targetLabel = cscheid.map.argmax(h);
      return leafNode(targetLabel);
    }
    let bestScore = 0;
    let bestPair; let bestNo; let bestYes;
    remainingFeatureValuePairs.forEach((fName, fValue) => {
      const noList = []; const yesList = [];
      labeledSamples.forEach((sample) => {
        const v = sample.features[fName];
        if (v !== fValue) {
          noList.push(sample);
        } else {
          yesList.push(sample);
        }
      });
      const score = majorityVoteCount(noList) + majorityVoteCount(yesList);
      if (score > bestScore) {
        bestScore = score;
        bestPair = [fName, fValue];
        bestNo = noList;
        bestYes = yesList;
      }
    });
    const nextFeatures = remainingFeatureValuePairs.filter(
        ((kv) => (kv[0] !== bestPair[0] || kv[1] !== bestPair[1])));
    const leftNode = internalTrain(bestNo, nextFeatures, remainingDepth - 1);
    const rightNode = internalTrain(bestYes, nextFeatures, remainingDepth - 1);
    return internalNode(bestPair[0], bestPair[1], leftNode, rightNode);
  }

  return {
    train: function(dataset, maxDepth) {
      // FIXME this should check the metadata for compatibility.
      return internalTrain(dataset.trainingSet,
          dataset.featureValuePairs(),
          maxDepth);
    },
  };
}
