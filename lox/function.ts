import { Callable } from "./callable";
import { Environment } from "./environment";
import { Interpreter } from "./interpreter";
import { ReturnException } from "./ReturnException";
import { Fun } from "./Stmt";

export class Function implements Callable {
  private readonly declaration: Fun;

  constructor(declaration: Fun) {
    this.declaration = declaration;
  }

  public arity() {
    return this.declaration.params.length;
  }

  public call(interpreter: Interpreter, args: Object[]) {
    const environment = new Environment(interpreter.globals);

    this.declaration.params.forEach((p, i) =>
      environment.define(p.lexeme, args[i])
    );

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof ReturnException) return err.value;
      throw err;
    }
    return null;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
