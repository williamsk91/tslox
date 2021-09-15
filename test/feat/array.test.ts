import { runLoxTest } from "../util/runner";

describe("array", () => {
  test("declaration", () => {
    const logs = runLoxTest(
      `
            var arr = [1, 2, 3] ;
            print arr ;
        `
    );
    expect(logs).toStrictEqual(["[ 1, 2, 3 ]"]);
  });

  test("redeclaration", () => {
    const logs = runLoxTest(
      `
            var arr = [1, 2, 3] ;
            arr = [4, 5, 6] ;
            print arr ;
        `
    );
    expect(logs).toStrictEqual(["[ 4, 5, 6 ]"]);
  });

  describe("access element - simple - complex", () => {
    test("number", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            print arr[0] ;
        `
      );
      expect(logs).toStrictEqual(["1"]);
    });
    test("complex", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            fun getIndex(i){
                return i ;
            }
            print arr[ getIndex(0) ] ;
        `
      );
      expect(logs).toStrictEqual(["1"]);
    });
    test("error if index is not a number", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            print arr[ "index" ] ;
        `
      );
      expect(logs).toStrictEqual([
        "[line 3] Only numbers are allowed as index.",
      ]);
    });
  });

  describe("set element", () => {
    test("number", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            arr[0] = 50 ;
            print arr[0] ;
            print arr ;
        `
      );
      expect(logs).toStrictEqual(["50", "[ 50, 2, 3 ]"]);
    });
    test("complex", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            fun getIndex(i){
                return i ;
            }
            arr[ getIndex(0) ] = getIndex(5) ;
            print arr[0] ;
        `
      );
      expect(logs).toStrictEqual(["5"]);
    });
    test("error if index is not a number", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            arr[ "index" ] = "chicken" ;
        `
      );
      expect(logs).toStrictEqual([
        "[line 3] Only numbers are allowed as index.",
      ]);
    });
  });

  describe("static methods", () => {
    test("length", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            print arr.length ;
        `
      );
      expect(logs).toStrictEqual(["3"]);
    });
    test("error non existing static methods", () => {
      const logs = runLoxTest(
        `
            var arr = [1, 2, 3] ;
            print arr.magic ;
        `
      );
      expect(logs).toStrictEqual(["[line 3] Undefined property 'magic'."]);
    });
  });

  test("nested array", () => {
    const logs = runLoxTest(
      `
        var arr = [ ["blib", "blub"], [[4], [5], [6]] ];
        print arr ;
      `
    );
    expect(logs).toStrictEqual(["[ [ blib, blub ], [ [ 4 ], [ 5 ], [ 6 ] ] ]"]);
  });
});
