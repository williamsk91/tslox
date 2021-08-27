import { runLoxTest } from "../util/runner";

describe("loops", () => {
  test("while", () => {
    const logs = runLoxTest(
      `
        var count = 0 ;
        while(count <= 4){
            print count ;
            count = count + 1 ;
        }
      `
    );
    expect(logs).toStrictEqual(["0", "1", "2", "3", "4"]);
  });

  test("for", () => {
    const logs = runLoxTest(
      `
        var curr = 0 ;
        var next = 1 ;
        
        for( var count = 0; count < 5; count = count + 1 ){
            print curr ;
            
            var temp = curr + next ;
            curr = next ; 
            next = temp ;
        }
      `
    );
    expect(logs).toStrictEqual(["0", "1", "1", "2", "3"]);
  });
});
