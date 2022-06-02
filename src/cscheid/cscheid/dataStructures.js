/** @module cscheid/dataStructures */

// maxHeap
export function binaryHeap(values, priorities) {
  const heap = (values || []).slice();
  priorities = (priorities || []).slice();
  function left(i) {
    return 2 * i + 1;
  }
  function right(i) {
    return 2 * i + 2;
  }
  function parent(i) {
    return ~~((i - 1) / 2);
  }
  function swap(i, j) {
    const tp = priorities[i]; const tv = heap[i];
    priorities[i] = priorities[j];
    priorities[j] = tp;
    heap[i] = heap[j];
    heap[j] = tv;
  }
  function maxHeapify(i) {
    const l = left(i);
    const r = right(i);
    let largest;
    if (l < heap.length && priorities[l] > priorities[i]) {
      largest = l;
    } else {
      largest = i;
    }
    if (r < heap.length && priorities[r] > priorities[largest]) {
      largest = r;
    }
    if (largest !== i) {
      swap(i, largest);
      maxHeapify(largest);
    }
  }

  // buildMaxHeap
  if (heap.length) {
    for (let i = ~~((heap.length - 1) / 2); i >= 0; --i) {
      maxHeapify(i);
    }
  }

  // this is an annoying function to make public because in general
  // no one should know the internal index of a value in the heap,
  // so we're making it private.
  function increaseKey(i, key) {
    if (key < priorities[i]) {
      throw new Error('new priority is smaller than current priority');
    }
    priorities[i] = key;
    while (i > 0 && priorities[parent(i)] < priorities[i]) {
      swap(i, parent(i));
      i = parent(i);
    }
  }

  /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "checkHealth" }]*/
  function checkHealth() {
    for (let i = 0; i < heap.length; ++i) {
      const ci = [left(i), right(i)];
      ci.forEach((j) => {
        if (j < heap.length && priorities[j] > priorities[i]) {
          throw new Error('checkHealth failed: this is currently not a heap.');
        }
      });
    }
  }

  return {
    size: function() {
      return heap.length;
    },
    max: function() {
      return {p: heap[0], priority: priorities[0]};
    },
    maxPriority: function() {
      return priorities[0];
    },
    maxPoint: function() {
      return heap[0];
    },

    // max() then pop() is extract-max()
    pop: function() {
      heap[0] = heap[heap.length - 1];
      priorities[0] = priorities[priorities.length - 1];
      heap.pop();
      priorities.pop();
      maxHeapify(0);
    },

    add: function(point, priority) {
      heap.push(point);
      priorities.push(-Infinity);
      increaseKey(priorities.length - 1, priority);
    },
  };
}
