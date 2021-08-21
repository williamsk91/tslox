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
        "Ternary  : Expr cond, Expr truthy, Expr falsy",
        "Assign   : Token name, Expr value",
        "Binary   : Expr left, Token operator, Expr right",
        "Grouping : Expr expression",
        "Literal  : any value",
        "Unary    : Token operator, Expr right",
        "Variable : Token name",
      ],
      ['import { Token } from "./token";\n\n']
    );

    this.defineAst(
      outputDir,
      "Stmt",
      [
        "Block      : Stmt[] statements",
        "Expression : Expr expression",
        "If         : Expr cond, Stmt thenBranch, Stmt|null elseBranch",
        "Print      : Expr expression",
        "Var        : Token name, Expr|null initializer",
      ],
      [
        'import { Expr } from "./expr";\n',
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
