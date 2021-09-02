import { Callable } from "./callable";
import { Instance } from "./instance";
import { Interpreter } from "./interpreter";

export class LoxClass implements Callable {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public call(interpreter: Interpreter, args: Object[]): Object {
    const instance = new Instance(this);
    return instance;
  }

  public arity(): number {
    return 0;
  }

  public toString() {
    return this.name;
  }
}
