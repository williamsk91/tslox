import { WriteStream, createWriteStream, write, writeFileSync } from "fs";

class GenerateAst {
  public static main(args: string[]) {
    if (args.length != 1) {
      console.log("Usage: generate_ast <output directory>");
      process.exit(64);
    }
    const outputDir: string = args[0];
    this.defineAst(outputDir, "Expr", [
      "Binary   : Expr left, Token operator, Expr right",
      "Grouping : Expr expression",
      "Literal  : Object value",
      "Unary    : Token operator, Expr right",
    ]);
  }

  /**
   * Generate AST at `outputDir/basename.ts`
   */
  private static defineAst = (
    outputDir: string,
    baseName: string,
    types: string[]
  ) => {
    const path = outputDir + "/" + baseName + ".ts";

    writeFileSync(path, "");
    const writer = createWriteStream(path);

    // Imports
    writer.write('import { Token } from "./token";\n\n');

    writer.write("export class " + baseName + " {\n");

    for (const type of types) {
      const [className, fields] = type.split(":").map((t) => t.trim());
      this.defineType(writer, baseName, className, fields);
    }

    writer.write("}");
    writer.close();
  };

  private static defineType = (
    writer: WriteStream,
    _baseName: string,
    className: string,
    fieldList: string
  ) => {
    const fields = fieldList.split(", ").map((f) => f.split(" "));

    writer.write("  static " + className + " = class {\n");

    // Constructor.
    writer.write("    constructor(");

    const params = fields.map(([type, name]) => name + ": " + type).join(", ");
    writer.write(params);
    writer.write(") {\n");

    // assignments
    fields
      .map(([_, name]) => `      this.${name} = ${name};\n`)
      .forEach((a) => writer.write(a));
    writer.write("    }\n");

    // Fields.
    fields
      .map(([type, name]) => `    readonly ${name}: ${type};\n`)
      .forEach((a) => writer.write(a));

    writer.write("  };\n\n");
  };
}

GenerateAst.main(process.argv.slice(2));
