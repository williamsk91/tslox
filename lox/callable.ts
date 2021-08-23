import { Interpreter } from "./interpreter";

export interface Callable {
  arity(): number;
  call(interpreter: Interpreter, args: Object[]): Object | null;
}

export const isCallable = (obj: any): obj is Callable => {
  return obj.call !== undefined;
};
