import { runLoxTest } from "../util/runner";

describe("logical operator", () => {
  test("or", () => {
    const logs = runLoxTest(
      `
      print "hi" or 2; 
      print nil or "yes"; 
      `
    );
    expect(logs).toStrictEqual(["hi", "yes"]);
  });

  test("and", () => {
    const logs = runLoxTest(
      `
      print "1" and "2"; 
      `
    );
    expect(logs).toStrictEqual(["2"]);
  });
});
