import { Token } from "./token";

export interface Visitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
}
export abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
}
export class Binary implements Expr {
  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitBinaryExpr(this);

  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;
}

export class Grouping implements Expr {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitGroupingExpr(this);

  readonly expression: Expr;
}

export class Literal implements Expr {
  constructor(value: Object) {
    this.value = value;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitLiteralExpr(this);

  readonly value: Object;
}

export class Unary implements Expr {
  constructor(operator: Token, right: Expr) {
    this.operator = operator;
    this.right = right;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitUnaryExpr(this);

  readonly operator: Token;
  readonly right: Expr;
}
