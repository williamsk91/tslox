import { Interpreter } from "../lox/interpreter";
import { Parser } from "../lox/parser";
import { Scanner } from "../lox/scanner";

// Mocked due to interpreter initialization erroring out
jest.mock("../lox/lox");

/**
 * Helper function interpreting source -> tokens -> AST -> value
 */
const interpreter = (source: string): Object | undefined => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  const parser = new Parser(tokens);
  const expression = parser.parse();

  if (expression === null) return undefined;

  const interpreter = new Interpreter();
  const value = interpreter.interpret(expression) as Object;
  return value;
};

describe("interpreter", () => {
  describe("termary", () => {
    test("boolean", () => {
      expect(interpreter("10 > 5 ? true : false")).toBe(true);
      expect(interpreter("10 > 15 ? true : false")).toBe(false);
    });
  });

  describe("binary", () => {
    test(">", () => {
      expect(interpreter("10 > 5")).toBe(true);
      expect(interpreter("10 > 10")).toBe(false);
      expect(interpreter("10 > 15")).toBe(false);
    });
    test(">= ", () => {
      expect(interpreter("10 >= 5")).toBe(true);
      expect(interpreter("10 >= 10")).toBe(true);
      expect(interpreter("10 >= 15")).toBe(false);
    });
    test("<", () => {
      expect(interpreter("10 < 5")).toBe(false);
      expect(interpreter("10 < 10")).toBe(false);
      expect(interpreter("10 < 15")).toBe(true);
    });
    test("<=", () => {
      expect(interpreter("10 <= 5")).toBe(false);
      expect(interpreter("10 <= 10")).toBe(true);
      expect(interpreter("10 <= 15")).toBe(true);
    });

    test("!=", () => {
      expect(interpreter("10 != 5")).toBe(true);
      expect(interpreter("true != false")).toBe(true);
    });
    test("==", () => {
      expect(interpreter("10 == 10")).toBe(true);
      expect(interpreter('10 == "10"')).toBe(false);
    });

    test("+", () => {
      expect(interpreter("10 + 10")).toBe(20);
      expect(interpreter('"10" + "10"')).toBe("1010");
      expect(interpreter('"10" + 10')).toBeUndefined();
    });

    test("-", () => {
      expect(interpreter("10 - 10")).toBe(0);
    });
    test("/", () => {
      expect(interpreter("10 / 10")).toBe(1);
    });
    test("*", () => {
      expect(interpreter("10 * 10")).toBe(100);
    });
  });

  describe("grouping", () => {
    test("( )", () => {
      expect(interpreter("(10)")).toBe(10);
    });
  });

  describe("literal", () => {
    test("string", () => {
      expect(interpreter('"10"')).toBe("10");
    });
    test("number", () => {
      expect(interpreter("10")).toBe(10);
    });
  });

  describe("unary", () => {
    test("!", () => {
      expect(interpreter("!true")).toBe(false);
    });
    test("-", () => {
      expect(interpreter("-10")).toBe(-10);
    });
  });
});
