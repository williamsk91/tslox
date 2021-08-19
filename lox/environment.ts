import { RuntimeError } from "./runtimeError";
import { Token } from "./token";

export class Environment {
  private values = new Map<string, Object | null>();

  define(name: string, value: Object | null): void {
    this.values.set(name, value);
  }

  get(name: Token): Object | null {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme) ?? null;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
