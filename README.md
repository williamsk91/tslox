# tslox

## The Repository

tslox is an interpreter of Lox language written entirely in TypeScript.

Lox is a scripting language created by Robert Nystrom for [Crafting Interpreters](https://craftinginterpreters.com/) book. tslox is the [Tree-Walk Interpreter](https://craftinginterpreters.com/a-tree-walk-interpreter.html) implemented in TypeScript.

## Status

- [x] Main parts implemented
- [ ] Challenges
- [ ] Personally interested features

## Lox differences and challenges

Some differences to basic Lox implemented in the book

### Array

Check [test file](https://github.com/williamsk91/tslox/blob/main/test/feat/array.test.ts) for more detail

```
var n = 10 ;
var fib = [0, 1] ;

for(var i = 2; i < 20; i = i + 1){
    fib[i] = fib[ i-1 ] + fib[ i-2 ] ;
}
print fib ; // [ 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181 ]
print fib.length ; // 20
```

### Ternary operator

[Chapter 6, Challenge 2](https://craftinginterpreters.com/parsing-expressions.html#challenges)

```
    print 5 > 3 ? "yes" : "no" ; // "yes"
```

### lambda

[Chapter 10, Challenge 2](https://craftinginterpreters.com/functions.html#challenges)

```
    fun thrice(fn) {
        for (var i = 1; i <= 3; i = i + 1) {
            fn(i);
        }
    }

    thrice(fun (a) {
        print a ;
    });
```

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
