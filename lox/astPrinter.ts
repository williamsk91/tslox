import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Ternary,
  Unary,
  Visitor,
} from "./expr";

/**
 * Prints AST in LISP like structure with explicit parentheses
 */
export class AstPrinter implements Visitor<string> {
  print(expr: Expr) {
    return expr.accept(this);
  }

  public visitTernaryExpr(expr: Ternary) {
    return this.parenthesize("?:", expr.cond, expr.truthy, expr.falsy);
  }

  public visitBinaryExpr(expr: Binary) {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping) {
    return this.parenthesize("group", expr.expression);
  }

  public visitLiteralExpr(expr: Literal) {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name} ${exprs.map((e) => e.accept(this)).join(" ")})`;
  }
}
