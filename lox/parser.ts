import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Lambda,
  Literal,
  Logical,
  Set,
  Ternary,
  This,
  Unary,
  Variable,
} from "./expr";
import { Lox } from "./lox";
import {
  Block,
  Class,
  Expression,
  Fun,
  If,
  Print,
  Return,
  Stmt,
  Var,
  While,
} from "./Stmt";
import { Token } from "./token";
import { TokenType } from "./tokenType";

class ParseError extends Error {}

/**
 * Grammar:
 *
 *     program        → declaration* EOF ;
 *
 *     declaration    → classDecl
 *                      | funDecl
 *                      | varDecl
 *                      | statement ;
 *     statement      → exprStmt
 *                      | ifStmt
 *                      | printStmt
 *                      | returnStmt
 *                      | whileStmt
 *                      | forStmt
 *                      | block ;
 *
 *     classDecl      → "class" IDENTIFIER ( "<" IDENTIFIER )?
 *                      "{" function* "}" ;
 *     funDecl        → "fun" function ;
 *     function       → IDENTIFIER "(" parameters? ")" block ;
 *     parameters     → IDENTIFIER ( "," IDENTIFIER )* ;
 *
 *     varDecl        → "var" IDENTIFIER ( "=" expression )? ;
 *     exprStmt       → expression ;
 *     ifStmt         → "if" "(" expression ")" statement
 *                      ( "else" statement )? ;
 *     printStmt      → "print" expression ;
 *     returnStmt     → "return" expression? ";" ;
 *     whileStmt      → "while" "(" expression ")" statement ;
 *     forStmt        → "for" "("
 *                       ( varDecl | exprStmt | ";" )
 *                       expression? ";"
 *                       expression?
 *                      ")" statement ;
 *     block          → "{" declaration* "}" ;
 *
 *     expression     → assignment
 *                      | lambda
 *                      | ternary ;
 *     assignment     → ( call "." )? IDENTIFIER "=" assignment
 *                      | logic_or ;
 *     lambda         → "fun" "(" parameters? ")" block ;
 *     ternary        → comparison "?" comparison ":" comparison ;
 *     logic_or       → logic_and ( "or" logic_and )* ;
 *     logic_and      → equality ( "and" equality )* ;
 *     equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 *     comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 *     term           → factor ( ( "-" | "+" ) factor )* ;
 *     factor         → unary ( ( "/" | "*" ) unary )* ;
 *     unary          → ( "!" | "-" ) unary
 *                      | call ;
 *     call           → primary ( "(" arguments? ")" | "." IDENTIFIER )* ;
 *     primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                      | "(" expression ")"
 *                      | IDENTIFIER ;
 *     arguments      → expression ( "," expression )* ;
 */
export class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt[] {
    let statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      try {
        statements.push(this.declaration());
      } catch {
        this.synchronize();
      }
    }

    return statements;
  }

  // ------------------------- Statement -------------------------

  private declaration(): Stmt {
    if (this.match(TokenType.CLASS)) return this.classDeclaration();
    if (this.match(TokenType.FUN)) return this.funDeclaration("function");
    if (this.match(TokenType.VAR)) return this.varDeclaration();
    return this.statement();
  }

  private statement(): Stmt {
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());

    return this.expressionStatement();
  }

  private classDeclaration(): Class {
    const name = this.consume(TokenType.IDENTIFIER, "Expect class name.");

    let superclass: Variable | null = null;
    if (this.match(TokenType.LESS)) {
      this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
      superclass = new Variable(this.previous());
    }

    this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

    let methods: Fun[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.funDeclaration("method"));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

    return new Class(name, superclass, methods);
  }

  private funDeclaration(kind: string): Fun {
    const name = this.consume(TokenType.IDENTIFIER, `Expects ${kind} name.`);
    const [params, body] = this.funVariables(kind);
    return new Fun(name, params, body);
  }

  private funVariables(kind: string): [Token[], Stmt[]] {
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} identifier.`);

    let params: Token[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (params.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 parameters.");
        }
        params.push(
          this.consume(TokenType.IDENTIFIER, "Expect parameter name.")
        );
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

    this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body.");
    const body = this.block();

    return [params, body];
  }

  private varDeclaration(): Var {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Var(name, initializer);
  }

  /**
   * For statements are desugared into While statements
   */
  private forStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer: Stmt | null;
    if (this.match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenType.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    const condition = this.check(TokenType.SEMICOLON)
      ? new Literal(true)
      : this.expression();

    this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

    let increment: Expr | null = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = this.statement();

    // desugaring `for` loop to `while` loop
    if (increment !== null) {
      body = new Block([body, new Expression(increment)]);
    }

    body = new While(condition, body);

    if (initializer !== null) {
      body = new Block([initializer, body]);
    }

    return body;
  }

  private ifStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = this.statement();
    const elseBranch = this.match(TokenType.ELSE) ? this.statement() : null;

    return new If(condition, thenBranch, elseBranch);
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Print(value);
  }

  private returnStatement(): Stmt {
    const keyword = this.previous();
    let value = null;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
    return new Return(keyword, value);
  }

  private whileStatement(): Stmt {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new While(condition, body);
  }

  private block(): Stmt[] {
    let statements: Stmt[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
  }

  // ------------------------- Expression -------------------------

  private expression(): Expr {
    if (this.match(TokenType.FUN)) return this.lambda();
    if (this.checkAhead(TokenType.QUESTION_MARK)) return this.ternary();

    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        const name = expr.name;
        return new Assign(name, value);
      } else if (expr instanceof Get) {
        const get = expr;
        return new Set(get.object, get.name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private lambda(): Expr {
    const [params, body] = this.funVariables("lambda");
    return new Lambda(params, body);
  }

  private ternary(): Expr {
    let cond = this.comparison();

    this.consume(TokenType.QUESTION_MARK, "Expect '?' after condition.");
    const truthy = this.comparison();

    this.consume(TokenType.COLON, "Expect ':' after first expression.");
    const falsy = this.comparison();

    return new Ternary(cond, truthy, falsy);
  }

  private or(): Expr {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
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

    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(
          TokenType.IDENTIFIER,
          "Expect property name after '.'."
        );
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    let args: Expr[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after arguments."
    );

    return new Call(callee, paren, args);
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING))
      return new Literal(this.previous().literal);
    if (this.match(TokenType.THIS)) return new This(this.previous());
    if (this.match(TokenType.IDENTIFIER)) return new Variable(this.previous());

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  // ------------------------- Helper -------------------------

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
