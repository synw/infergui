# Infer gui

[![pub package](https://img.shields.io/npm/v/infergui)](https://www.npmjs.com/package/infergui)

A graphical user interface for local language models. It support different local backends:

- [Llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#llamacppexampleserver)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)

This interface uses no hidden magic: everything is explicit. What you see is what you prompt.

## Features

- Template editor, model configuration, inference params editor
- Gbnf grammars, multimodal
- Multiple local and remote servers config

## Install

### With npm

Install:

```bash
npm i -g infergui
```

Run:

```bash
infergui
```

Run a local backend and open `localhost:5183` in a browser

### With Python

```
git clone https://github.com/synw/infergui
cd infergui/dist
python3 -m http.server
```

Run a local backend and open `localhost:8000` in a browser

## Screenshots

### Templates editor

![Screenshot](/docs/template_editor.png)

### Gbnf grammar editor

![Screenshot](/docs/grammar_editor.png)

### Multimodal

![Screenshot](/docs/multimodal.png)

## Model picker (Ollama only)

![Screenshot](/docs/model_picker.png)

## Dev mode

Clone and install the dependencies:

```
npm i
```

To run in dev mode with watch autoreload:

```
npm run dev
```

Run a local backend and open `localhost:5173` in a browser

To build and run:

```
npm run build
npm run local
```
