import { Stmt } from "./Stmt";
import { Token } from "./token";

export interface Visitor<T> {
  visitAssignExpr(expr: Assign): T;
  visitLambdaExpr(expr: Lambda): T;
  visitTernaryExpr(expr: Ternary): T;
  visitBinaryExpr(expr: Binary): T;
  visitCallExpr(expr: Call): T;
  visitGetExpr(expr: Get): T;
  visitGroupingExpr(expr: Grouping): T;
  visitArrayExpr(expr: Array): T;
  visitArrayCallExpr(expr: ArrayCall): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitSetExpr(expr: Set): T;
  visitSuperExpr(expr: Super): T;
  visitThisExpr(expr: This): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}
export abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
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

export class Lambda implements Expr {
  constructor(params: Token[], body: Stmt[]) {
    this.params = params;
    this.body = body;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitLambdaExpr(this);

  readonly params: Token[];
  readonly body: Stmt[];
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

export class Call implements Expr {
  constructor(callee: Expr, paren: Token, args: Expr[]) {
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitCallExpr(this);

  readonly callee: Expr;
  readonly paren: Token;
  readonly args: Expr[];
}

export class Get implements Expr {
  constructor(object: Expr, name: Token) {
    this.object = object;
    this.name = name;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitGetExpr(this);

  readonly object: Expr;
  readonly name: Token;
}

export class Grouping implements Expr {
  constructor(expression: Expr) {
    this.expression = expression;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitGroupingExpr(this);

  readonly expression: Expr;
}

export class Array implements Expr {
  constructor(elements: Expr[]) {
    this.elements = elements;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitArrayExpr(this);

  readonly elements: Expr[];
}

export class ArrayCall implements Expr {
  constructor(callee: Token, index: Expr) {
    this.callee = callee;
    this.index = index;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitArrayCallExpr(this);

  readonly callee: Token;
  readonly index: Expr;
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

export class Set implements Expr {
  constructor(object: Expr, name: Token, value: Expr) {
    this.object = object;
    this.name = name;
    this.value = value;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitSetExpr(this);

  readonly object: Expr;
  readonly name: Token;
  readonly value: Expr;
}

export class Super implements Expr {
  constructor(keyword: Token, method: Token) {
    this.keyword = keyword;
    this.method = method;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitSuperExpr(this);

  readonly keyword: Token;
  readonly method: Token;
}

export class This implements Expr {
  constructor(keyword: Token) {
    this.keyword = keyword;
  }
  accept = <T>(visitor: Visitor<T>) => visitor.visitThisExpr(this);

  readonly keyword: Token;
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

