import { runLoxTest } from "../util/runner";

describe("closure", () => {
  test("function should remember environment on declaration", () => {
    const logs = runLoxTest(
      `
        fun makeCounter() {
            var i = 0;
            fun count() {
                i = i + 1;
                print i;
            }
        
            return count;
        }
        
        var counter = makeCounter();
        counter(); 
        counter(); 
      `
    );
    expect(logs).toStrictEqual(["1", "2"]);
  });

  test.only("no leak", () => {
    const logs = runLoxTest(
      `
        var a = "global";
        {
          fun showA() {
            print a;
          }
        
          showA();
          var a = "block";
          showA();
        }
        `
    );
    expect(logs).toStrictEqual(["global", "global"]);
  });
});
