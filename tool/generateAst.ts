import { WriteStream, createWriteStream, write, writeFileSync } from "fs";

class GenerateAst {
  public static main(args: string[]) {
    if (args.length != 1) {
      console.log("Usage: generate_ast <output directory>");
      process.exit(64);
    }
    const outputDir: string = args[0];
    this.defineAst(
      outputDir,
      "Expr",
      [
        "Assign   : Token name, Expr value",
        "Lambda   : Token[] params, Stmt[] body",
        "Ternary  : Expr cond, Expr truthy, Expr falsy",
        "Binary   : Expr left, Token operator, Expr right",
        "Call     : Expr callee, Token paren, Expr[] args",
        "Get      : Expr object, Token name",
        "Grouping : Expr expression",
        "Array    : Expr[] elements",
        "ArrayCall: Token callee, Expr index",
        "ArraySet : Token callee, Expr index, Expr value",
        "Literal  : any value",
        "Logical  : Expr left, Token operator, Expr right",
        "Set      : Expr object, Token name, Expr value",
        "Super    : Token keyword, Token method",
        "This     : Token keyword",
        "Unary    : Token operator, Expr right",
        "Variable : Token name",
      ],
      [
        'import { Stmt } from "./Stmt";\n',
        'import { Token } from "./token";\n\n',
      ]
    );

    this.defineAst(
      outputDir,
      "Stmt",
      [
        "Block      : Stmt[] statements",
        "Class      : Token name, Variable|null superclass, Fun[] methods",
        "Expression : Expr expression",
        "Fun        : Token name, Token[] params, Stmt[] body",
        "If         : Expr cond, Stmt thenBranch, Stmt|null elseBranch",
        "Print      : Expr expression",
        "Return     : Token keyword, Expr|null value",
        "Var        : Token name, Expr|null initializer",
        "While      : Expr cond, Stmt body",
      ],
      [
        'import { Expr, Variable } from "./expr";\n',
        'import { Token } from "./token";\n\n',
      ]
    );
  }

  /**
   * Generate AST at `outputDir/basename.ts`
   */
  private static defineAst = (
    outputDir: string,
    baseName: string,
    types: string[],
    extras: string[] = []
  ) => {
    const path = outputDir + "/" + baseName + ".ts";

    writeFileSync(path, "");
    const writer = createWriteStream(path);

    extras.forEach((e) => writer.write(e));

    this.defineVisitorInterface(writer, baseName, types);

    writer.write("export abstract class " + baseName + " {\n");

    this.defineVisitor(writer, baseName, types);

    writer.write("}\n");

    for (const type of types) {
      const [className, fields] = type.split(":").map((t) => t.trim());
      this.defineType(writer, baseName, className, fields);
    }

    writer.close();
  };

  private static defineVisitor = (
    writer: WriteStream,
    _baseName: string,
    _types: string[]
  ) => {
    writer.write("  abstract accept<T>(visitor: Visitor<T>): T;\n");
  };

  private static defineVisitorInterface = (
    writer: WriteStream,
    baseName: string,
    types: string[]
  ) => {
    writer.write("export interface Visitor<T> {\n");
    types
      .map((t) => t.split(":")[0].trim())
      .forEach((name) => {
        const fnName = "visit" + name + baseName;
        writer.write(`  ${fnName}(${baseName.toLowerCase()}: ${name}): T;\n`);
      });

    writer.write("}\n");
  };

  private static defineType = (
    writer: WriteStream,
    baseName: string,
    className: string,
    fieldList: string
  ) => {
    const fields = fieldList.split(", ").map((f) => f.split(" "));

    writer.write(
      "export class " + className + " implements " + baseName + " {\n"
    );

    // Constructor.
    writer.write("  constructor(");

    const params = fields.map(([type, name]) => name + ": " + type).join(", ");
    writer.write(params);
    writer.write(") {\n");

    // assignments
    fields
      .map(([_, name]) => `    this.${name} = ${name};\n`)
      .forEach((a) => writer.write(a));
    writer.write("  }\n");

    // Visitor pattern
    const fnName = "visit" + className + baseName;
    writer.write(
      `  accept = <T>(visitor: Visitor<T>) => visitor.${fnName}(this);\n\n`
    );

    // Fields.
    fields
      .map(([type, name]) => `  readonly ${name}: ${type};\n`)
      .forEach((a) => writer.write(a));

    writer.write("}\n\n");
  };
}

GenerateAst.main(process.argv.slice(2));
