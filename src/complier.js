const generate = require('./generate')
const parser = require('./parser')
const tokenizer = require('./tokenizer')

let callBacks = []

function compile(source) {
  const { ast, state } = parser(tokenizer(source))
  const code = generate(ast)
  callBacks.forEach((c) => c(state))
  return code
}

function onComplete(fn) {
  callBacks.push(fn)
}

module.exports = {
  compile,
  onComplete,
}
