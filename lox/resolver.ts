import { Stack } from "./ds/stack";
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
  Super,
  Ternary,
  This,
  Unary,
  Variable,
} from "./expr";
import { Interpreter } from "./interpreter";
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
  Visitor as StmtVisitor,
  Var,
  While,
} from "./Stmt";
import { Token } from "./token";

enum FunctionType {
  None,
  Function,
  Initializer,
  Lambda,
  Method,
}

enum ClassType {
  None,
  Class,
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly interpreter: Interpreter;
  private readonly scopes: Stack<Map<string, Boolean>> = new Stack();
  private currentFunction = FunctionType.None;
  private currentClass = ClassType.None;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  // ------------------------- Stmt var -------------------------

  public visitBlockStmt(stmt: Block) {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
  }

  public visitClassStmt(stmt: Class) {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.Class;

    this.declare(stmt.name);
    this.define(stmt.name);

    if (
      stmt.superclass !== null &&
      stmt.name.lexeme === stmt.superclass.name.lexeme
    ) {
      Lox.tokenError(
        stmt.superclass.name,
        "A class can't inherit from itself."
      );
    }

    if (stmt.superclass !== null) {
      this.resolveExpr(stmt.superclass);
    }

    if (stmt.superclass !== null) {
      this.beginScope();
      this.scopes.peek()?.set("super", true);
    }

    this.beginScope();
    this.scopes.peek()?.set("this", true);

    for (const method of stmt.methods) {
      let declaration = FunctionType.Method;
      if (method.name.lexeme === "init") {
        declaration = FunctionType.Initializer;
      }

      this.resolveFunction(method, declaration);
    }

    this.endScope();

    if (stmt.superclass !== null) this.endScope();

    this.currentClass = enclosingClass;
  }

  public visitFunStmt(stmt: Fun) {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.Function);
  }

  public visitVarStmt(stmt: Var) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  // ------------------------- Stmt etc -------------------------

  public visitExpressionStmt(stmt: Expression) {
    this.resolveExpr(stmt.expression);
  }

  public visitIfStmt(stmt: If) {
    this.resolveExpr(stmt.cond);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolveStmt(stmt.elseBranch);
  }

  public visitPrintStmt(stmt: Print) {
    this.resolveExpr(stmt.expression);
  }

  public visitReturnStmt(stmt: Return) {
    if (this.currentFunction === FunctionType.None) {
      Lox.tokenError(stmt.keyword, "Can't return from top-level code.");
    }
    if (stmt.value !== null) {
      if (this.currentFunction === FunctionType.Initializer) {
        Lox.tokenError(
          stmt.keyword,
          "Can't return a value from an initializer."
        );
      }

      this.resolveExpr(stmt.value);
    }
  }

  public visitWhileStmt(stmt: While) {
    this.resolveExpr(stmt.cond);
    this.resolveStmt(stmt.body);
  }

  // ------------------------- Expr var -------------------------

  public visitAssignExpr(expr: Assign) {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitLambdaExpr(expr: Lambda) {
    this.resolveFunction(expr, FunctionType.Lambda);
  }

  public visitTernaryExpr(expr: Ternary) {
    this.resolveExpr(expr.cond);
    this.resolveExpr(expr.truthy);
    this.resolveExpr(expr.falsy);
  }

  public visitVariableExpr(expr: Variable) {
    if (this.scopes.peek()?.get(expr.name.lexeme) === false) {
      Lox.tokenError(
        expr.name,
        "Can't read local variable in its own initializer."
      );
    }
    this.resolveLocal(expr, expr.name);
  }

  // ------------------------- Expr etc -------------------------

  public visitBinaryExpr(expr: Binary) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  public visitCallExpr(expr: Call) {
    this.resolveExpr(expr.callee);

    for (const a of expr.args) {
      this.resolveExpr(a);
    }
  }

  public visitGetExpr(expr: Get) {
    this.resolveExpr(expr.object);
  }

  public visitGroupingExpr(expr: Grouping) {
    this.resolveExpr(expr.expression);
  }

  public visitLiteralExpr(_expr: Literal) {}

  public visitLogicalExpr(expr: Logical) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  public visitSetExpr(expr: Set) {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.object);
  }

  public visitSuperExpr(expr: Super) {
    this.resolveLocal(expr, expr.keyword);
  }

  public visitThisExpr(expr: This) {
    if (this.currentClass === ClassType.None) {
      return Lox.tokenError(
        expr.keyword,
        "Can't use 'this' outside of a class."
      );
    }
    this.resolveLocal(expr, expr.keyword);
  }

  public visitUnaryExpr(expr: Unary) {
    this.resolveExpr(expr.right);
  }

  // ------------------------- Helper -------------------------

  resolveStmts(statements: Stmt[]) {
    for (const s of statements) {
      this.resolveStmt(s);
    }
  }

  private resolveStmt(stmt: Stmt) {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr) {
    expr.accept(this);
  }

  private resolveFunction(fun: Fun | Lambda, type: FunctionType) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const p of fun.params) {
      this.declare(p);
      this.define(p);
    }
    this.resolveStmts(fun.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private beginScope() {
    this.scopes.push(new Map());
  }

  private endScope() {
    this.scopes.pop();
  }

  private declare(name: Token) {
    const scope = this.scopes.peek();

    if (!scope) return;
    if (scope.has(name.lexeme)) {
      Lox.tokenError(name, "Already a variable with this name in this scope.");
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token) {
    const scope = this.scopes.peek();
    if (!scope) return;
    scope.set(name.lexeme, true);
  }

  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.size() - 1; i >= 0; i--) {
      if (this.scopes.get(i)?.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.size() - 1 - i);
        return;
      }
    }
  }
}
