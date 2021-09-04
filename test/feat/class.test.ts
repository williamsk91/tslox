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

  describe("should be initializeable", () => {
    test("should be callable", () => {
      const logs = runLoxTest(
        `
        class Cake {
          init(state) {
            this.internalState = state ;
          }
        }
        
        var cake = Cake("exists") ;
        print cake.internalState ;
        `
      );
      expect(logs).toStrictEqual(["exists"]);
    });

    test("should return itself", () => {
      const logs = runLoxTest(
        `        
        class Cookie {
          init(state) {
            this.internalState = state ;
            return ;
          }
        }
                
        print Cookie("why?").internalState ;
        
        var cookie = Cookie("some reason") ;
        cookie.internalState = "other reason" ;
        print cookie.init("no reason").internalState ;
        `
      );
      expect(logs).toStrictEqual(["why?", "no reason"]);
    });
  });
});
