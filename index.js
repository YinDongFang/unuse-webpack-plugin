/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-08-05 22:48:19
 * @LastEditTime: 2020-08-06 17:27:32
 * @LastEditors: Ian
 * @Description: 打印没有使用的资源文件
 */

const path = require("path");
const fs = require("fs");

const PATH_QUERY_FRAGMENT_REGEXP = /^([^?#]*)(\?[^#]*)?(#.*)?$/;

/**
 * @param {string} str the path with query and fragment
 * @returns {{ path: string, query: string, fragment: string }} parsed parts
 */
function parsePathQueryFragment(str) {
  var match = PATH_QUERY_FRAGMENT_REGEXP.exec(str);
  return {
    path: match[1],
    query: match[2] || "",
    fragment: match[3] || ""
  };
}

const defaultOptions = {
  output: path.resolve(process.cwd(), "unuse.json"),
  root: path.resolve(process.cwd(), "src")
};

function mergeOptions(options) {
  if (options.root && !path.isAbsolute(options.root))
    options.root = path.resolve(process.cwd(), options.root);
  return {
    ...defaultOptions,
    ...options
  };
}

const readDirRecursively = (dir, set) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(f => {
    const filepath = path.resolve(dir, f.name);
    if (f.isDirectory()) readDirRecursively(filepath, set);
    else set.add(filepath);
  });
};

function fillWithAllFiles(root) {
  const res = new Set();
  readDirRecursively(root, res);
  return res;
}

function UnusePlugin(options) {
  this.options = mergeOptions(options || {});
  this.result = fillWithAllFiles(this.options.root);
}

UnusePlugin.prototype.apply = function apply(compiler) {
  const { output } = this.options;

  compiler.hooks.compilation.tap(
    "UnusePlugin",
    (compilation, { normalModuleFactory }) => {
      normalModuleFactory.hooks.module.tap("UnusePlugin", module => {
        const { path } = parsePathQueryFragment(module.resource);
        if (this.result.has(path)) this.result.delete(path);
      });
    }
  );

  compiler.hooks.emit.tapAsync("UnusePlugin", (compilation, done) => {
    fs.writeFileSync(output, JSON.stringify(Array.from(this.result)), "utf8");
  });
};

module.exports = UnusePlugin;
