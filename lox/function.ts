import { Callable } from "./callable";
import { Environment } from "./environment";
import { Interpreter } from "./interpreter";
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

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
