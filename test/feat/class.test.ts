import { runLoxTest } from "../util/runner";

describe("class", () => {
  test("should print name", () => {
    const logs = runLoxTest(
      `
        class DevonshireCream {
            serveOn() {
                return "Scones";
            }
            }
            
        print DevonshireCream;
      `
    );
    expect(logs).toStrictEqual(["DevonshireCream"]);
  });

  test("should have fields", () => {
    const logs = runLoxTest(
      `
        class DevonshireCream {}
        var inst = DevonshireCream() ;
        inst.flavour = "vanilla" ;
        print inst.flavour ;
      `
    );
    expect(logs).toStrictEqual(["vanilla"]);
  });

  test.only("should have methods", () => {
    const logs = runLoxTest(
      `
        class DevonshireCream {
          eat(){
            print "slurp..." ;
          }
        }
        DevonshireCream().eat() ;
      `
    );
    expect(logs).toStrictEqual(["slurp..."]);
  });
});
