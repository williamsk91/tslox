import { Lox } from "./lox";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];

  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  static keywords: Record<string, TokenType> = {
    and: TokenType.AND,
    class: TokenType.CLASS,
    else: TokenType.ELSE,
    false: TokenType.FALSE,
    for: TokenType.FOR,
    fun: TokenType.FUN,
    if: TokenType.IF,
    nil: TokenType.NIL,
    or: TokenType.OR,
    print: TokenType.PRINT,
    return: TokenType.RETURN,
    super: TokenType.SUPER,
    this: TokenType.THIS,
    true: TokenType.TRUE,
    var: TokenType.VAR,
    while: TokenType.WHILE,
  };

  constructor(source: string) {
    this.source = source;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private isAtEnd = (): boolean => this.current >= this.source.length;

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case "?":
        this.addToken(TokenType.QUESTION_MARK);
        break;
      case ":":
        this.addToken(TokenType.COLON);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          this.blockCommentScanner();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;

      case '"':
        this.stringScanner();
        break;

      default:
        if (this.isDigit(c)) {
          this.numberScanner();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, `Unexpected character: [${c}]`);
        }
    }
  }

  private blockCommentScanner = () => {
    while (!this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      if (this.peek() === "*" && this.peekNext() === "/") {
        this.advance();
        this.advance();
        return;
      } else {
        this.advance();
      }
    }
    Lox.error(this.line, "Unterminated block comment.");
  };

  private identifier = () => {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    let type = Scanner.keywords[text];
    if (type === undefined) type = TokenType.IDENTIFIER;

    this.addToken(type);
  };

  private isAlpha = (c: string): boolean =>
    (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";

  private isAlphaNumeric = (c: string): boolean =>
    this.isAlpha(c) || this.isDigit(c);

  private isDigit = (c: string): boolean => c >= "0" && c <= "9";

  private numberScanner = () => {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    const value: number = parseFloat(
      this.source.substring(this.start, this.current)
    );
    this.addToken(TokenType.NUMBER, value);
  };

  private stringScanner = () => {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value: string = this.source.substring(
      this.start + 1,
      this.current - 1
    );
    this.addToken(TokenType.STRING, value);
  };

  /**
   * Checks if next char is the same as `expected`
   */
  private match = (expected: string): boolean => {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  };

  private peek = (): string => {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  };

  private peekNext = (): string => {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  };

  private advance = (): string => this.source.charAt(this.current++);

  private addToken(type: TokenType, literal: Object | null = null) {
    const text = this.source.substring(this.start, this.current);
    const token = new Token(type, text, literal, this.line);
    this.tokens.push(token);
  }
}
