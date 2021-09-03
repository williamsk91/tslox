import { Callable } from "./callable";
import { Function } from "./function";
import { Instance } from "./instance";
import { Interpreter } from "./interpreter";

export class LoxClass implements Callable {
  readonly name: string;
  private readonly methods: Map<string, Function>;

  constructor(name: string, methods: Map<string, Function>) {
    this.name = name;
    this.methods = methods;
  }

  public findMethod(name: string): Function | null {
    return this.methods.get(name) ?? null;
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
