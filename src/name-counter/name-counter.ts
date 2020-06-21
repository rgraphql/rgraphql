// Increment from a, b, c, ..., aa, ab, ...
export class NameCounter {
  public parts: number[] = [0]

  get value(): string {
    let res = ''
    for (let part of this.parts) {
      res = this.numberToLetter(part) + res
    }
    return res
  }

  public increment(): string {
    this.incrementIndex(0)
    return this.value
  }

  private incrementIndex(idx: number) {
    if (idx === this.parts.length) {
      this.parts.push(-1)
    }
    let nval = ++this.parts[idx]
    if (nval > 51) {
      nval = this.parts[idx] = 0
      this.incrementIndex(idx + 1)
    }
  }

  private numberToLetter(num: number): string {
    let base = num + 65
    if (base > 90) {
      base += 6
    }
    return String.fromCharCode(base)
  }
}
