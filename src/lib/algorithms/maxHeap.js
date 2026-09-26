/**
 * ALGORITHM: Max Heap / Priority Queue
 * ──────────────────────────────────────
 * Purpose : Efficiently retrieve the highest-priority revision item.
 *
 * A Max Heap is a complete binary tree where every parent node has
 * a key ≥ its children's keys. We use an array representation:
 *   parent(i)    = Math.floor((i - 1) / 2)
 *   leftChild(i) = 2*i + 1
 *   rightChild(i)= 2*i + 2
 *
 * Operations:
 *   insert (push)  : O(log n)  — add to end, bubble up (sift up)
 *   extractMax     : O(log n)  — remove root, replace with last, sift down
 *   peekMax        : O(1)      — read root
 *   buildHeap      : O(n)      — heapify from unordered array
 *
 * Space: O(n)
 * Application: Revision prioritization (FR-07, FR-08)
 */

export class MaxHeap {
  constructor(compareFn = (a, b) => a.priority - b.priority) {
    this._data = [];
    this._compare = compareFn;
  }

  /**
   * Return the number of elements in the heap.
   */
  get size() {
    return this._data.length;
  }

  /**
   * Peek at the maximum-priority element without removing it. O(1)
   */
  peek() {
    return this._data[0] ?? null;
  }

  /**
   * Insert a new element into the heap. O(log n)
   * @param {object} item - must have a numeric `priority` field (or use compareFn)
   */
  insert(item) {
    this._data.push(item);
    this._siftUp(this._data.length - 1);
  }

  /**
   * Remove and return the maximum element. O(log n)
   * @returns {object|null}
   */
  extractMax() {
    if (this._data.length === 0) return null;
    if (this._data.length === 1) return this._data.pop();

    const max = this._data[0];
    this._data[0] = this._data.pop();
    this._siftDown(0);
    return max;
  }

  /**
   * Build a heap from an unordered array in O(n) time.
   * Uses Floyd's heap construction algorithm.
   * @param {object[]} items
   */
  buildFrom(items) {
    this._data = [...items];
    // Start from the last non-leaf node and sift down each
    for (let i = Math.floor(this._data.length / 2) - 1; i >= 0; i--) {
      this._siftDown(i);
    }
  }

  /**
   * Return all items sorted descending by priority (heap sort variant). O(n log n)
   * This creates a copy so the original heap is not modified.
   * @returns {object[]}
   */
  toSortedArray() {
    const copy = new MaxHeap(this._compare);
    copy.buildFrom([...this._data]);
    const sorted = [];
    while (copy.size > 0) {
      sorted.push(copy.extractMax());
    }
    return sorted;
  }

  // ─── Internal helpers ────────────────────────────────────────────

  _parentIndex(i) { return Math.floor((i - 1) / 2); }
  _leftIndex(i)   { return 2 * i + 1; }
  _rightIndex(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this._data[i], this._data[j]] = [this._data[j], this._data[i]];
  }

  /** Bubble element at index i upward until heap property is restored. */
  _siftUp(i) {
    while (i > 0) {
      const parent = this._parentIndex(i);
      if (this._compare(this._data[i], this._data[parent]) > 0) {
        this._swap(i, parent);
        i = parent;
      } else {
        break;
      }
    }
  }

  /** Push element at index i downward until heap property is restored. */
  _siftDown(i) {
    const n = this._data.length;
    while (true) {
      let largest = i;
      const left  = this._leftIndex(i);
      const right = this._rightIndex(i);

      if (left < n && this._compare(this._data[left], this._data[largest]) > 0) {
        largest = left;
      }
      if (right < n && this._compare(this._data[right], this._data[largest]) > 0) {
        largest = right;
      }

      if (largest !== i) {
        this._swap(i, largest);
        i = largest;
      } else {
        break;
      }
    }
  }
}

/**
 * PRIORITY SCORING FORMULA for Revision Items
 * ─────────────────────────────────────────────
 * Priority Score = w1·difficulty + w2·importance + w3·frequency + w4·recency
 *
 * Weights are tuned for academic revision priority:
 *   - importance (exam relevance)  → 35%
 *   - difficulty (harder topics)   → 25%
 *   - frequency (repeated topics)  → 25%
 *   - recency (overdue revision)   → 15%
 *
 * All inputs normalized to [0,100].
 */
export function calculateRevisionPriority(item) {
  const W_IMPORTANCE = 0.35;
  const W_DIFFICULTY = 0.25;
  const W_FREQUENCY  = 0.25;
  const W_RECENCY    = 0.15;

  const importance = Math.min(100, Math.max(0, item.importance || 50));
  const difficulty = Math.min(100, Math.max(0, item.difficulty || 50));
  const frequency  = Math.min(100, Math.max(0, item.frequency  || 50));

  // Recency: days since last revision → more days = higher urgency
  let recencyScore = 50;
  if (item.last_revised_at) {
    const daysSince = Math.floor(
      (Date.now() - new Date(item.last_revised_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyScore = Math.min(100, daysSince * 5); // caps at 20+ days
  }

  const priority =
    W_IMPORTANCE * importance +
    W_DIFFICULTY * difficulty +
    W_FREQUENCY  * frequency  +
    W_RECENCY    * recencyScore;

  return Math.round(priority);
}
