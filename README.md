# Infer gui

A graphical user interface for local language models. It support different local backends:

- [Llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#llamacppexampleserver)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)

This interface uses no hidden magic: everything is explicit.

## Features

- Template editor
- Gbnf grammars support
- Multimodal support

## Screenshots

### Templates editor

![Screenshot](/docs/template_editor.png)

### Gbnf grammar editor

![Screenshot](/docs/grammar_editor.png)

### Multimodal

![Screenshot](/docs/multimodal.png)

## Install

Clone and install the dependencies:

```
npm i
```

## Run

```
npm run build
npm run local
```

Run a local backend and open `localhost:5173` in a browser

To run in dev mode with watch autoreload:

```
npm run dev
```
