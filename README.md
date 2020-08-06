# Unuse plugin for webpack

Count unused files and write to output file.

## Installation

```sh
$ npm install --save-dev unuse-webpack-plugin
```

## Usage

```js
var UnusePlugin = require('unuse-webpack-plugin')

module.exports = {
  plugins: [
    new UnusePlugin({
      output: path.resolve('unuse.json'),
      root: path.resolve('src'),
    }),
  ],
}
```