import { Lox } from "../../lox/lox";

export const runLoxTest = (src: string) => {
  let logs: string[] = [];

  const log = console.log;

  // overwrite logging
  console.log = (data) => {
    logs.push(data);
  };

  Lox.run(src);
  console.log = log;

  return logs;
};
