import { runLoxTest } from "../util/runner";

describe("flow", () => {
  test("if", () => {
    const logs = runLoxTest(
      `
      if( 5 > 3)
          print true ;
      else    
          print false ;
      `
    );
    expect(logs).toStrictEqual(["true"]);
  });
  test("ternary", () => {
    const logs = runLoxTest(
      `
        print 5 > 3 ? "yes" : "no" ;
      `
    );
    expect(logs).toStrictEqual(["yes"]);
  });
});
