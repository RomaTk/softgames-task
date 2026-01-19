# softgames-task

Game Developer Assignment

## Game start

To start the game in development mode, run:

```bash
npm install
npm run start
```

This will start a development server at `http://localhost:9000`. Open this URL
in your web browser to play the game.

## Work with the project

Install dependencies:

```bash
npm install
```

Run build source code for tools (eslint, prettier, etc):

```bash
npm run tsc:build:tools
```

Install extensions for your IDE, for vscode check `.vscode/extensions.json`.

## Some additional notes

<!-- #TODO check all the time -->

- For react eslint used
  [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react), not
  [eslint-react](https://www.eslint-react.xyz/) because may be unstable and I do
  not rely on it yet, as main contributor is new.
- No eslint for json, html, markdown as no needed for now. Not many code there.
  May sense to add later if project will grow.
- I changed the `@pixi/layout` imports to use `.js`, so
  `"moduleResolution": "bundler"` is not required (I don`t like to set it). This
  may need to be revisited if the library is updated.
