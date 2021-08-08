import { Token } from "./token";

export class Expr {
  static Binary = class {
    constructor(left: Expr, operator: Token, right: Expr) {
      this.left = left;
      this.operator = operator;
      this.right = right;
    }
    readonly left: Expr;
    readonly operator: Token;
    readonly right: Expr;
  };

  static Grouping = class {
    constructor(expression: Expr) {
      this.expression = expression;
    }
    readonly expression: Expr;
  };

  static Literal = class {
    constructor(value: Object) {
      this.value = value;
    }
    readonly value: Object;
  };

  static Unary = class {
    constructor(operator: Token, right: Expr) {
      this.operator = operator;
      this.right = right;
    }
    readonly operator: Token;
    readonly right: Expr;
  };
}
