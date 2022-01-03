const generate = require('./generate')
const parser = require('./parser')
const tokenizer = require('./tokenizer')

let callBacks = []

function compile(source) {
  const { ast, state } = parser(tokenizer(source))
  callBacks.forEach((c) => c(state))
  return generate(ast)
}

function onComplete(fn) {
  callBacks.push(fn)
}

function run(
  code,
  option = {
    打印: console.log,
    dy: console.log,
    长度: (a) => a.length,
    cd: (a) => a.length,
    四舍五入: parseInt,
    sswr: parseInt,
    从小到大: (arr) => arr.sort((a, b) => a < b),
    cxdd: (arr) => arr.sort((a, b) => a < b),
    从大到小: (arr) => arr.sort((a, b) => a > b),
    cddx: (arr) => arr.sort((a, b) => a > b),
  }
) {
  option = Object.assign(Math, option)
  new Function('option', 'with(option){' + code + '}')(option)
}

module.exports = {
  compile,
  onComplete,
  run,
}
