import { Expr } from "./expr";
import { Token } from "./token";

export interface Visitor<T> {
  visitBlockStmt(stmt: Block): T;
  visitExpressionStmt(stmt: Expression): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
}
export abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T;
}
export class Block implements Stmt {
  constructor(statements: Stmt[]) {
    this.statements = statements;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitBlockStmt(this);

  readonly statements: Stmt[];
}

export class Expression implements Stmt {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitExpressionStmt(this);

  readonly expression: Expr;
}

export class If implements Stmt {
  constructor(cond: Expr, thenBranch: Stmt, elseBranch: Stmt|null) {
    this.cond = cond;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitIfStmt(this);

  readonly cond: Expr;
  readonly thenBranch: Stmt;
  readonly elseBranch: Stmt|null;
}

export class Print implements Stmt {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitPrintStmt(this);

  readonly expression: Expr;
}

export class Var implements Stmt {
  constructor(name: Token, initializer: Expr|null) {
    this.name = name;
    this.initializer = initializer;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitVarStmt(this);

  readonly name: Token;
  readonly initializer: Expr|null;
}

export class While implements Stmt {
  constructor(cond: Expr, body: Stmt) {
    this.cond = cond;
    this.body = body;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitWhileStmt(this);

  readonly cond: Expr;
  readonly body: Stmt;
}

