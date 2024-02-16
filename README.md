# Infer gui

[![pub package](https://img.shields.io/npm/v/infergui)](https://www.npmjs.com/package/infergui)

A graphical user interface for local language models. It support different local backends:

- [Llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#llamacppexampleserver)
- [Koboldcpp](https://github.com/LostRuins/koboldcpp)
- [Ollama](https://github.com/jmorganca/ollama)

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

## Models server

![Screenshot](/docs/pick_model.png)

To be able to switch models at runtime use the models server. It is a Koboldcpp process
manager integrated in the `infergui` micro server. To enable the models server run the
command with these parameters:

- `-m=`: the absolute path to your models directory, that contains the gguf files
- `-k=`: the absolute path to your Koboldcpp command

Example:

```bash
infergui -m=/home/me/my/models -k=/home/me/bin/koboldcpp
```

With these parameters the frontend will display a list of available models
and let the user switch to any model at anytime.

