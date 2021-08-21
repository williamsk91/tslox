import { Token } from "./token";

export interface Visitor<T> {
  visitTernaryExpr(expr: Ternary): T;
  visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}
export abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
}
export class Ternary implements Expr {
  constructor(cond: Expr, truthy: Expr, falsy: Expr) {
    this.cond = cond;
    this.truthy = truthy;
    this.falsy = falsy;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitTernaryExpr(this);

  readonly cond: Expr;
  readonly truthy: Expr;
  readonly falsy: Expr;
}

export class Assign implements Expr {
  constructor(name: Token, value: Expr) {
    this.name = name;
    this.value = value;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitAssignExpr(this);

  readonly name: Token;
  readonly value: Expr;
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
  constructor(value: any) {
    this.value = value;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitLiteralExpr(this);

  readonly value: any;
}

export class Logical implements Expr {
  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitLogicalExpr(this);

  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;
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

export class Variable implements Expr {
  constructor(name: Token) {
    this.name = name;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitVariableExpr(this);

  readonly name: Token;
}

