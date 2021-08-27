import { runLoxTest } from "../util/runner";

describe("function", () => {
  test("should be declarable & callable", () => {
    const logs = runLoxTest(
      `
        fun iden ( a , b ) {
            print a ;
            print b ;
            print a + b ;
        }
        
        iden(1,2);
      `
    );
    expect(logs).toStrictEqual(["1", "2", "3"]);
  });

  test("should allow recursion", () => {
    const logs = runLoxTest(
      `
        fun count(n) {
            if(n > 1) count(n-1);
            print n;
        }
        
        count(4);
      `
    );
    expect(logs).toStrictEqual(["1", "2", "3", "4"]);
  });

  test("should exit on return", () => {
    const logs = runLoxTest(
      `
          fun fib(n) {
            if (n <= 1) return n;
            return fib(n - 2) + fib(n - 1);
          }
          
          for (var i = 0; i < 5; i = i + 1) {
            print fib(i);
          }
        `
    );
    expect(logs).toStrictEqual(["0", "1", "1", "2", "3"]);
  });
});
