import { runLoxTest } from "../util/runner";

describe("lamda", () => {
  test("should be assignable", () => {
    const logs = runLoxTest(
      `
        var lam = fun (a) {
            print a ;
        } ;
    
        lam(4) ;
      `
    );
    expect(logs).toStrictEqual(["4"]);
  });

  test("should be passable", () => {
    const logs = runLoxTest(
      `
        fun thrice(fn) {
            for (var i = 1; i <= 3; i = i + 1) {
                fn(i);
            }
        }  
        
        thrice(fun (a) {
            print a ;
        });
      `
    );
    expect(logs).toStrictEqual(["1", "2", "3"]);
  });
});
