const { TokenType, keywordTypeMap } = require('./type')

const Letters = /[\u4e00-\u9fa5a-zA-Z0-9|&]/
const Number = /[^\D]/
const Operators = ['+', '-', '*', '/', '%', '《', '<', '》', '>']
const noSemicolonChar = /[（(,，{]/

let i = 0
let source = ''
let curChar = ''
let curToken = ''
let curType = ''
let tokens = []

const state = {
  isParsingModelString: false,
  isParsingMemberExpression: false,
}
const search = (x = 1) => source[i + x]

function tokenizer(input) {
  source =
    input
      .split(/\n/)
      .filter((i) => /[\S]/.test(i))
      .join('\n') + '\n' // 去除空行
  let state = common
  for (; i < source.length; i++) {
    curChar = source[i]
    state = state(curChar)
  }
  return tokens
}

function push(type = curType, value = curToken) {
  if (!value) return
  if (value in keywordTypeMap) type = keywordTypeMap[value]
  tokens.push({ type, value })
  curToken = ''
  curType = TokenType.identifier
}

function isChar(...arr) {
  return arr.includes(curChar)
}

function common() {
  if (Number.test(curChar)) {
    curToken += curChar
    curType = TokenType.number
    return number
  }
  if (Letters.test(curChar)) {
    curToken += curChar
    curType = TokenType.identifier
    return identifier
  }
  if (isChar('=')) {
    push(TokenType.assignment, '=')
    return common
  }
  if (isChar('‘', "'")) {
    return string
  }
  if (isChar('“', '”', '"', '"')) {
    state.isParsingModelString = true
    push(TokenType.templateStart, '“')
    return templateString
  }
  if (isChar('{')) {
    push(TokenType.blockStart, '{')
    return common
  }
  if (isChar('（', '(')) {
    push(TokenType.bracketStart, '（')
    return common
  }
  if (isChar('！', '!')) {
    return comment
  }
  return end()
}

function identifier() {
  if (Letters.test(curChar)) {
    curToken += curChar
    curType = TokenType.identifier
    return identifier
  }
  if (isChar(' ')) {
    push()
    return common
  }
  if (isChar('=')) {
    push()
    push(TokenType.assignment, '=')
    return common
  }
  if (isChar('（', '(')) {
    push()
    push(TokenType.bracketStart, '（')
    return common
  }
  if (isChar('{')) {
    state.isParsingMemberExpression = true
    push()
    push(TokenType.memberStart, '{')
    return common
  }
  return end()
}

function string() {
  if (isChar('‘', "'")) {
    push()
    return common
  }
  curType = TokenType.string
  curToken += curChar
  return string
}

function templateString() {
  if (isChar('“', '”', '"', '"')) {
    state.isParsingModelString = false
    push()
    push(TokenType.templateEnd, '”')
    return common
  }
  if (isChar('《', '<')) {
    push()
    push(TokenType.templateSlotStart, '《')
    return identifier
  }
  curType = TokenType.string
  curToken += curChar
  return templateString
}

function number() {
  if (Number.test(curChar) || isChar('.')) {
    curToken += curChar
    curType = TokenType.number
    return common
  }
  return end()
}

function comment() {
  if (isChar('\n')) {
    curToken = ''
    return common
  }
  curToken += curChar
  curType = TokenType.comment
  return comment
}

function end() {
  if (Operators.includes(curChar)) {
    if (isChar('》', '>') && state.isParsingModelString) {
      push()
      push(TokenType.templateSlotEnd, '》')
      return templateString
    }
    push()
    push(TokenType.operator, curChar)
    return common
  }
  if (isChar('）', ')')) {
    push()
    push(TokenType.bracketEnd, '）')
    return common
  }
  if (isChar('}')) {
    if (state.isParsingMemberExpression) {
      push()
      push(TokenType.memberEnd, '}')
      state.isParsingMemberExpression = false
      return common
    }
    push()
    push(TokenType.blockEnd, '}')
    return common
  }
  if (isChar('~')) {
    push()
    push(TokenType.keywordFromTo, '~')
    return common
  }
  if (isChar('，', ',')) {
    push()
    push(TokenType.comma, '，')
    return common
  }
  if (isChar(' ')) {
    push()
    return common
  }
  if (isChar('\n')) {
    push()
    const prev = search(-1)
    let nonNullIndex = 1
    while (
      !/[^\s\n]/.test(search(nonNullIndex)) &&
      nonNullIndex < source.length - 1
    ) {
      nonNullIndex++
    }
    const next = search(nonNullIndex)
    if (
      noSemicolonChar.test(prev) ||
      noSemicolonChar.test(next) ||
      /[或否]/.test(next) ||
      next === '）' ||
      !prev
    ) {
      return common
    }
    push(TokenType.semicolon, ';')
    return common
  }
  console.log('error with: ', curChar)
}

module.exports = tokenizer
