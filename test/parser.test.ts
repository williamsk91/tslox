// import { AstPrinter } from "../lox/astPrinter";
import { AstPrinter } from "../lox/astPrinter";
import { Parser } from "../lox/parser";
import { Token } from "../lox/token";
import { TokenType } from "../lox/tokenType";

describe("ternary", () => {
  test("base", () => {
    /**
     * 1 ? 2 : 3
     */
    const tokens = [
      new Token(TokenType.NUMBER, "1", 1, 1),
      new Token(TokenType.QUESTION_MARK, "?", null, 1),
      new Token(TokenType.NUMBER, "2", 2, 1),
      new Token(TokenType.COLON, ":", null, 1),
      new Token(TokenType.NUMBER, "3", 3, 1),
      new Token(TokenType.EOF, "", null, 1),
    ];
    const expression = new Parser(tokens).parse();
    const prettyPrint = expression && new AstPrinter().print(expression);
    expect(prettyPrint).toBe("(?: 1 2 3)");
  });
});
