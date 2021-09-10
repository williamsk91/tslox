type ElementType = any;

export class LoxArray {
  private elements: ElementType[] = [];

  constructor(elements: ElementType[]) {
    this.elements = elements;
  }

  get(index: number): ElementType | undefined {
    return this.elements[index];
  }

  toString(): string {
    return "[ " + this.elements.join(", ") + " ]";
  }
}
