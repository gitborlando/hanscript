const generate = require('./generate')
const parser = require('./parser')
const tokenizer = require('./tokenizer')

let callBacks = []
const preset = {
  打印: console.log,
  dy: console.log,
  长度: (a) => a.length,
  cd: (a) => a.length,
  取整: parseInt,
  qz: parseInt,
  从小到大: (arr) => arr.sort((a, b) => a < b),
  cxdd: (arr) => arr.sort((a, b) => a < b),
  从大到小: (arr) => arr.sort((a, b) => a > b),
  cddx: (arr) => arr.sort((a, b) => a > b),
}

function compile(source) {
  const { ast, state } = parser(tokenizer(source))
  callBacks.forEach((c) => c(state))
  return generate(ast)
}

function onComplete(fn) {
  callBacks.push(fn)
}

function run(code, option = {}) {
  Object.entries(option).forEach(([key, value]) => (preset[key] = value))
  new Function('preset', 'with(preset){' + code + '}')(preset)
}

module.exports = {
  compile,
  onComplete,
  run,
}
