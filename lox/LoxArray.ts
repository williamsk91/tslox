import { Instance } from "./instance";
import { LoxClass } from "./loxClass";
import { Token } from "./token";

type ElementType = any;

const ArrayMetaClass = new LoxClass("ArrayMetaClass", null, new Map());

export class LoxArray extends Instance {
  private elements: ElementType[] = [];

  constructor(elements: ElementType[]) {
    super(ArrayMetaClass);
    this.elements = elements;
  }

  public get(name: Token): Object {
    switch (name.lexeme) {
      case "length":
        return this.length();
      default:
        return super.get(name);
    }
  }

  getElement(index: number): ElementType | undefined {
    return this.elements[index];
  }

  setElement(index: number, value: any): void {
    this.elements[index] = value;
  }

  length(): number {
    return this.elements.length;
  }

  toString(): string {
    return "[ " + this.elements.join(", ") + " ]";
  }
}
