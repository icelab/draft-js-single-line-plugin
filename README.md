# Draft.js Single Line plugin

*This is a plugin for the [`draft-js-plugins-editor`](https://www.draft-js-plugins.com/), a plugin system that sits on top of Draft.js.*

This plugin adds support restricting [Facebook’s Draft.js editor](https://facebook.github.io/draft-js/) to a single line of content. It will condense any blocks into a single block, and (optionally) strip any rich entities.

## What, why?!

Madness I know, however there places you want to allow _some_ rich styling yet the underlying value should still be a single line. Allowing titles for things like blog posts or pages to contain strong/emphasis is our main use-case.

## Usage

```js
import createSingleLinePlugin from 'draft-js-single-line-plugin'
const singleLinePlugin = createSingleLinePlugin()
```

This can then be passed into a `draft-js-plugins-editor` component:

```js
import createSingleLinePlugin from 'draft-js-single-line-plugin'
const singleLinePlugin = createSingleLinePlugin()
import Editor from 'draft-js-plugins-editor'

const plugins = [singleLinePlugin]

<Editor plugins={plugins}
    blockRenderMap={singleLinePlugin.blockRenderMap} />
```

The plugin export a custom `blockRenderMap` that overrides the draft-js defaults and restricts the editor from rendering anything _except_ an `unstyled` block. You’ll need to manually pass it as above as the `draft-js-plugins-editor` doesn’t yet support this.

## Options

You can pass options to the plugin as you call it:

```js
const options = {
  stripEntities: false,
  stripNewlines: false,
}
const singleLinePlugin = createSingleLinePlugin(options)
```

### stripEntities

Strip Entities from text.

Type: `boolean` <br>
Default: `true` <br>
Options: `true` | `false`

### stripNewlines

Strip newline characters `\n` from text.

Type: `boolean` <br>
Default: `true` <br>
Options: `true` | `false`


## Developing

```
npm install
npm install react react-dom draft-js
npm run test
```
