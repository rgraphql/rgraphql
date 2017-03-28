import {
  binarySearch,
  insertionIndex,
} from './binary-insertion';

describe('binary-insertion', () => {
  describe('binarySearch', () => {
    it('should return 0 for a empty array', () => {
      expect(binarySearch([], 0)).toBe(0);
    });
    it('should return 3 for 3 -> [0, 1, 2, 4]', () => {
      expect(binarySearch([0, 1, 2, 4], 3)).toBe(3);
    });
    it('should return 0 for 3 -> [4, 5, 6, 7]', () => {
      expect(binarySearch([4, 5, 6, 7], 3)).toBe(0);
    });
    it('should return 1 for 4.5 -> [4, 5, 6, 7]', () => {
      expect(binarySearch([4, 5, 6, 7], 4.5)).toBe(1);
    });
    fit('should splice 3 into [0, 1, 4, 5]', () => {
      let arr = [0, 1, 4, 5];
      let idx = binarySearch(arr, 3) + 1;
      arr.splice(idx, 0, 3);
      expect(arr).toEqual([0, 1, 3, 4, 5]);
    });
    fit('should splice 3 into []', () => {
      let arr: number[] = [];
      let idx = insertionIndex(arr, 3);
      arr.splice(idx, 0, 3);
      expect(arr).toEqual([3]);
    });
    fit('should splice 3 into [5]', () => {
      let arr: number[] = [5];
      let idx = insertionIndex(arr, 3);
      arr.splice(idx, 0, 3);
      expect(arr).toEqual([3, 5]);
    });
  });
});
