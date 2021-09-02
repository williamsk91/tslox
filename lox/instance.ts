import { LoxClass } from "./loxClass";
import { RuntimeError } from "./runtimeError";
import { Token } from "./token";

export class Instance {
  private klass: LoxClass;
  private readonly fields: Map<String, Object> = new Map();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  public get(name: Token): Object {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme) as Object;
    }
    throw new RuntimeError(name, "Undefined property '" + name.lexeme + "'.");
  }

  public set(name: Token, value: Object): void {
    this.fields.set(name.lexeme, value);
  }

  public toString(): string {
    return this.klass.name + " instance";
  }
}
