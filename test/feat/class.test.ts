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

  test("should have methods", () => {
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

  test("should bound this", () => {
    const logs = runLoxTest(
      `
        class Cake {
          taste() {
            var adjective = "delicious";
            print "The " + this.flavor + " cake is " + adjective + "!";
          }
        }
        
        var cake = Cake();
        cake.flavor = "German chocolate";
        cake.taste(); 
      `
    );
    expect(logs).toStrictEqual(["The German chocolate cake is delicious!"]);
  });
});
