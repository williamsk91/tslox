import { Expr } from "./expr";
import { Token } from "./token";

export interface Visitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
}
export abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T;
}
export class Expression implements Stmt {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitExpressionStmt(this);

  readonly expression: Expr;
}

export class Print implements Stmt {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitPrintStmt(this);

  readonly expression: Expr;
}

export class Var implements Stmt {
  constructor(name: Token, initializer: Expr | null) {
    this.name = name;
    this.initializer = initializer;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitVarStmt(this);

  readonly name: Token;
  readonly initializer: Expr | null;
}
