const generate = require('./generate')
const parser = require('./parser')
const tokenizer = require('./tokenizer')

function compile(source) {
  return generate(parser(tokenizer(source)))
}

module.exports = {
  compile,
}
