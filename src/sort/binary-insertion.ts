function doBinarySearch(a: number[], item: number, low: number, high: number): number {
  if (high <= low) {
    return (item > a[low]) ? (low + 1) : low;
  }

  let mid = (low + high) / 2;
  if (item === a[mid]) {
    return mid + 1;
  }

  if (item > a[mid]) {
    return doBinarySearch(a, item, mid + 1, high);
  }

  return doBinarySearch(a, item, low, mid - 1);
}

// Returns the closest index to the found value.
export function binarySearch(arr: number[], nval: number): number {
  return doBinarySearch(arr, nval, 0, arr.length);
}

// Returns the position to insert the element.
export function insertionIndex(arr: number[], nval: number): number {
  let givenIdx = binarySearch(arr, nval);
  return arr[givenIdx] < nval ? givenIdx + 1 : givenIdx;
}
