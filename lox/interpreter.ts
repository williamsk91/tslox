import {
  Binary,
  Expr,
  Visitor as ExprVisitor,
  Grouping,
  Literal,
  Ternary,
  Unary,
} from "./expr";
import { Lox } from "./lox";
import { RuntimeError } from "./runtimeError";
import { Expression, Print, Stmt, Visitor as StmtVisitor } from "./Stmt";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Interpreter implements ExprVisitor<Object>, StmtVisitor<void> {
  interpret(statements: Stmt[]): Object | void {
    try {
      for (const s of statements) {
        this.execute(s);
      }
    } catch (error) {
      Lox.runtimeError(error);
    }
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
  }

  private evaluate(expr: Expr): Object {
    return expr.accept(this);
  }

  // ------------------------- Statement -------------------------

  public visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  public visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  // ------------------------- Expression -------------------------

  public visitTernaryExpr(expr: Ternary) {
    const value = this.evaluate(expr.cond);
    if (this.isTruthy(value)) {
      return this.evaluate(expr.truthy);
    } else {
      return this.evaluate(expr.falsy);
    }
  }

  public visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;

      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);

      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" || typeof right === "string") {
          return `${left}${right}`;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be 2 numbers or at least 1 strings."
        );

      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return +left - +right;
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return +left / +right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return +left * +right;
    }

    // Unreachable.
    throw new RuntimeError(
      expr.operator,
      "Unknown token type used as binary operator"
    );
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitUnaryExpr(expr: Unary) {
    const right: any = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    // Unreachable.
    throw new RuntimeError(
      expr.operator,
      "Unknown token type used as unary operator"
    );
  }

  // ------------------------- Helper -------------------------

  private checkNumberOperand(operator: Token, operand: Object) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: Object, right: Object) {
    if (typeof left === "number" && typeof right === "number") return;

    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private isTruthy(object: Object) {
    if (object === null) return false;
    if (typeof object === "boolean") return object;
    return true;
  }

  private isEqual(a: Object, b: Object) {
    return a === b;
  }

  private stringify(object: Object): string {
    if (object === null) return "nil";
    return object.toString();
  }
}