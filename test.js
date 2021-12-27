const HanScript = require('./dist/index.cjs')

console.log(
  HanScript.compile(`
  数组{a} = 数组{b}
`)
)
