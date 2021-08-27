import { runLoxTest } from "../util/runner";

describe("function", () => {
  test("should be declarable & callable", () => {
    const logs = runLoxTest(
      `
        var start = clock();

        var sum = 0 ;
        for (var i = 0; i < 1000000; i = i + 1) {
          sum = sum + i ;
        }
        
        var end = clock();
        
        print end - start ;
      `
    );
    expect(+logs[0]).toBeGreaterThan(0);
  });
});
