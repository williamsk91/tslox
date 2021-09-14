import { Instance } from "./instance";
import { LoxClass } from "./loxClass";

type ElementType = any;

const ArrayMetaClass = new LoxClass("ArrayMetaClass", null, new Map());

export class LoxArray extends Instance {
  private elements: ElementType[] = [];

  constructor(elements: ElementType[]) {
    super(ArrayMetaClass);
    this.elements = elements;

    super.setField("length", this.length());
  }

  getElement(index: number): ElementType | undefined {
    return this.elements[index];
  }

  length(): number {
    return this.elements.length;
  }

  toString(): string {
    return "[ " + this.elements.join(", ") + " ]";
  }
}
