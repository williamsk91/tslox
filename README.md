# tslox

## The Repository

tslox is an interpreter of Lox language written entirely in TypeScript.

Lox is a scripting language created by Robert Nystrom for [Crafting Interpreters](https://craftinginterpreters.com/) book. tslox is the [Tree-Walk Interpreter](https://craftinginterpreters.com/a-tree-walk-interpreter.html) implemented in TypeScript.

## Status

- [x] Main parts implemented
- [ ] Challenges
- [ ] Personally interested features

## Usage

Install dependencies

```bash
$ yarn
```

### Running File

```bash
$ yarn lox <file name>
```

For example

```bash
$ yarn lox ex/helloWorld.lox
Hello world!
```

### Running REPL

```bash
$ yarn lox
```

For example

```bash
$ yarn lox
[lox]: var cookie = 5 ;
[lox]: print cookie ;
5
[lox]: Bye! # cmd + c to exit
```

### Running Test

```bash
yarn test # immediately in watch mode
```
