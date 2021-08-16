import { Expr } from "./expr";

export interface Visitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
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
