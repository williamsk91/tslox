import { RuntimeError } from "./runtimeError";
import { Token } from "./token";

export class Environment {
  readonly enclosing: Environment | null;
  private values = new Map<string, Object | null>();

  constructor(enclosing: Environment | null = null) {
    this.enclosing = enclosing;
  }

  define(name: string, value: Object | null): void {
    this.values.set(name, value);
  }

  assign(name: Token, value: Object) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  assignAt(distance: number, name: Token, value: Object) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  get(name: Token): Object | null {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme) ?? null;
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  getAt(distance: number, name: string): Object | null {
    return this.ancestor(distance).values.get(name) ?? null;
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing as Environment;
    }
    return environment;
  }
}
