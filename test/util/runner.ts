import { Lox } from "../../lox/lox";

interface Options {
  debug: boolean;
}

export const runLoxTest = (src: string, options: Options = { debug: true }) => {
  let logs: string[] = [];

  const log = console.log;

  // overwrite logging
  if (options.debug) {
    console.log = (data) => {
      logs.push(data);
    };
    Lox.run(src);
    console.log = log;
  } else {
    Lox.run(src);
  }

  return logs;
};
