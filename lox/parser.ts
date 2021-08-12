import { Binary, Expr, Grouping, Literal, Ternary, Unary } from "./expr";
import { Lox } from "./lox";
import { Token } from "./token";
import { TokenType } from "./tokenType";

/**
 * Grammar:
 *
 *     expression     → equality
 *                      | ternary ;
 *     ternary        → comparison "?" comparison ":" comparison ;
 *     equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 *     comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 *     term           → factor ( ( "-" | "+" ) factor )* ;
 *     factor         → unary ( ( "/" | "*" ) unary )* ;
 *     unary          → ( "!" | "-" ) unary
 *                      | primary ;
 *     primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                      | "(" expression ")" ;
 */
export class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Expr | null {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  private expression(): Expr {
    if (this.checkAhead(TokenType.QUESTION_MARK)) {
      return this.ternary();
    }
    return this.equality();
  }

  private ternary(): Expr {
    let cond = this.comparison();

    this.consume(TokenType.QUESTION_MARK, "Expect '?' after condition.");
    const truthy = this.comparison();

    this.consume(TokenType.COLON, "Expect ':' after first expression.");
    const falsy = this.comparison();

    return new Ternary(cond, truthy, falsy);
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private checkAhead(type: TokenType): boolean {
    if (this.isAtEnd()) return false;

    for (let i = this.current + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.type === type) return true;
    }
    return false;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd = (): boolean => this.peek().type == TokenType.EOF;
  private peek = (): Token => this.tokens[this.current];
  private previous = (): Token => this.tokens[this.current - 1];

  private error(token: Token, message: string): ParseError {
    Lox.tokenError(token, message);
    return new ParseError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}

class ParseError extends Error {}
