import { Callable, isCallable } from "./callable";
import { Environment } from "./environment";
import {
  Assign,
  Binary,
  Call,
  Expr,
  Visitor as ExprVisitor,
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
import { Function } from "./function";
import { Instance } from "./instance";
import { Lox } from "./lox";
import { LoxClass } from "./loxClass";
import { ReturnException } from "./ReturnException";
import { RuntimeError } from "./runtimeError";
import {
  Block,
  Class,
  Expression,
  Fun,
  If,
  Print,
  Return,
  Stmt,
  Visitor as StmtVisitor,
  Var,
  While,
} from "./Stmt";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Interpreter
  implements ExprVisitor<Object | null>, StmtVisitor<void>
{
  readonly globals = new Environment();
  private environment = this.globals;
  private readonly locals: Map<Expr, number> = new Map();

  constructor() {
    const clock: Callable & { toString: () => string } = {
      arity: () => 0,
      call: () => Date.now(),
      toString: () => "<native fn>",
    };
    this.globals.define("clock", clock);
  }

  interpret(statements: Stmt[]): Object | void {
    try {
      for (const s of statements) {
        this.execute(s);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      }
    }
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
  }

  resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  public executeBlock(statements: Stmt[], environment: Environment) {
    const previousEnvironment = this.environment;

    try {
      this.environment = environment;
      for (const s of statements) this.execute(s);
    } finally {
      this.environment = previousEnvironment;
    }
  }

  private evaluate(expr: Expr): Object {
    return expr.accept(this);
  }

  // ------------------------- Statement -------------------------

  public visitFunStmt(stmt: Fun) {
    const fun = new Function(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, fun);
  }

  public visitVarStmt(stmt: Var) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  public visitIfStmt(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.cond))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  public visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  public visitReturnStmt(stmt: Return) {
    const value = stmt.value === null ? null : this.evaluate(stmt.value);

    throw new ReturnException(value);
  }

  public visitWhileStmt(stmt: While) {
    while (this.isTruthy(this.evaluate(stmt.cond))) {
      this.execute(stmt.body);
    }
  }

  public visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitClassStmt(stmt: Class) {
    this.environment.define(stmt.name.lexeme, null);

    const methods = new Map<string, Function>();
    for (const method of stmt.methods) {
      const fun = new Function(method, this.environment);
      methods.set(method.name.lexeme, fun);
    }

    const klass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
  }

  // ------------------------- Expression -------------------------

  public visitAssignExpr(expr: Assign) {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  public visitLambdaExpr(expr: Lambda) {
    return new Function(expr, this.environment);
  }

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

  public visitCallExpr(expr: Call) {
    const callee = this.evaluate(expr.callee);

    let args: Object[] = [];
    for (const a of expr.args) {
      args.push(this.evaluate(a));
    }

    if (!isCallable(callee)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    const fn: Callable = callee;
    if (args.length !== fn.arity()) {
      throw new RuntimeError(
        expr.paren,
        "Expected " + fn.arity() + " arguments but got " + args.length + "."
      );
    }

    return fn.call(this, args);
  }

  public visitGetExpr(expr: Get): Object {
    const object = this.evaluate(expr.object);
    if (object instanceof Instance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties.");
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression);
  }

  public visitLiteralExpr(expr: Literal) {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  public visitSetExpr(expr: Set) {
    const object = this.evaluate(expr.object);

    if (!(object instanceof Instance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  public visitThisExpr(expr: This) {
    return this.lookUpVariable(expr.keyword, expr);
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

  public visitVariableExpr(expr: Variable) {
    return this.lookUpVariable(expr.name, expr);
  }

  // ------------------------- Helper -------------------------

  private lookUpVariable(name: Token, expr: Expr) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

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
