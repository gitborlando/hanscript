/**
 * statement : expressionStatement | ifStatement | forStatement | functionDeclarationStatement
 *
 * expressionStatement : expression
 *
 * ifStatement : keywordIf bracketStart expression bracketEnd expression
 *             | keywordIf bracketStart expression bracketEnd blockStatement (keywordElse blockStatement)?
 *
 * forStatement : keywordFor bracketStart number operator identifier operator number blockStatement
 *
 * functionDeclarationStatement : identifier bracketStart (identifier)? bracketEnd blockStatement
 *
 * expression : identifier | number | string | assignmentExpression | binaryExpression | callExpression | memberExpression | objectExpression | arrayExpression
 *
 * binaryExpression : expression (operator expression)?
 *
 * assignmentExpression : identifier assignment expression
 *
 * objectExpression : bracketStart (assignmentExpression)? bracketEnd
 *
 * arrayExpression : bracketStart (identifer | string | number) bracketEnd
 *
 * callExpression : identifier bracketStart (expression)? bracketEnd
 *
 * memberExpression : identifier memberStart (identifer | string | number) memberEnd
 *
 * templateStringExpression : (templateString)? (expression)?
 */

const { TokenType, ASTType } = require('./type')

let i = 0
let tokens = []
let curToken = null
let nextToken = null
let curType = ''
let nextType = ''
let declarations = []

function walkNext() {
  curToken = nextToken
  nextToken = tokens[i++]
  curType = curToken?.type
  nextType = nextToken?.type
}
function walkTwice() {
  walkNext()
  walkNext()
}

function createNode(token = curToken) {
  return {
    value: token.value,
    type: token.type,
  }
}

function parser(arr) {
  tokens = arr
  walkTwice()
  const ast = []
  while (i < arr.length + 2) {
    ast.push(parseStatement())
    walkNext()
  }
  return ast
}

function parseStatement() {
  if (curToken.type === TokenType.keywordIf) {
    return parseIfStatement()
  } else if (curToken.type === TokenType.keywordFor) {
    return parseForStatement()
  }
  let _i = i - 2
  while (tokens[_i].type !== TokenType.bracketEnd) {
    if (tokens[_i].type === TokenType.semicolon) {
      _i = -999
      break
    }
    _i++
  }
  if (_i !== -999 && tokens[_i + 1].type === TokenType.blockStart) {
    return parseFunctionDeclartionStatement()
  }
  return parseExpressionStatement()
}

function parseBlockStatement() {
  const blockStatement = {}
  blockStatement.type = ASTType.BlockStatement
  blockStatement.body = []
  walkNext()
  while (curType !== TokenType.blockEnd) {
    blockStatement.body.push(parseStatement())
    walkNext()
  }
  walkNext()
  return blockStatement
}

function parseExpressionStatement() {
  const expressionStatement = {}
  expressionStatement.type = ASTType.ExpressionStatement
  expressionStatement.expression = parseExpression()
  return expressionStatement
}

function parseIfStatement() {
  const ifStatement = {}
  ifStatement.type = ASTType.IfStatement
  walkTwice()
  ifStatement.test = parseExpression()
  ifStatement.consequent = parseBlockStatement()
  if (curType === TokenType.keywordElif) {
    ifStatement.alternate = parseIfStatement()
  } else if (curType === TokenType.keywordElse) {
    walkNext()
    ifStatement.alternate = parseBlockStatement()
  }
  return ifStatement
}

function parseForStatement() {
  const forStatement = {}
  forStatement.type = ASTType.ForStatement
  walkTwice()
  let identifier = ''
  let initExpression = null
  let endExpression = null
  while (curType !== TokenType.bracketEnd) {
    if (curType !== TokenType.identifier) error('149:expected identifier')
    identifier = createNode()
    walkTwice()
    initExpression = parseExpression()
    walkNext()
    endExpression = parseExpression()
  }
  forStatement.init = {
    type: ASTType.VariableDeclaration,
    id: identifier,
    value: initExpression,
  }
  forStatement.test = {
    type: ASTType.BinaryExpression,
    left: identifier,
    operator: '<=',
    right: endExpression,
  }
  walkNext()
  forStatement.body = parseBlockStatement()
  return forStatement
}

function parseFunctionDeclartionStatement() {
  const functionStatement = {}
  functionStatement.type = ASTType.FunctionDeclaration
  functionStatement.params = []
  functionStatement.id = createNode()
  walkTwice()
  while (curType !== TokenType.bracketEnd) {
    if (curType === TokenType.comma) walkNext()
    if (curType !== TokenType.identifier) error('181:expected identifier')
    functionStatement.params.push(createNode())
    walkNext()
  }
  walkNext()
  functionStatement.body = parseBlockStatement()
  return functionStatement
}

function parseExpression() {
  const expressionNode = {}

  if (
    [
      TokenType.identifier,
      TokenType.string,
      TokenType.number,
      TokenType.keywordTrue,
      TokenType.keywordFalse,
    ].includes(curType) &&
    [
      TokenType.operator,
      TokenType.semicolon,
      TokenType.comma,
      TokenType.bracketEnd,
      TokenType.memberEnd,
      TokenType.templateSlotEnd,
      TokenType.keywordFromTo,
    ].includes(nextType)
  ) {
    const node = createNode()
    walkNext()
    return curType === TokenType.operator ? parseBinaryExpression(node) : node
  }

  if (curType === TokenType.templateStart) {
    return parseTemplateLiteral(expressionNode)
  }

  if (curType === TokenType.identifier) {
    if (nextType === TokenType.assignment) {
      return parseAssignmentExpression(expressionNode)
    }
    if (nextType === TokenType.bracketStart) {
      return parseCallExpression(expressionNode)
    }
    if (nextType === TokenType.memberStart) {
      return parseMemberExpression(expressionNode)
    }
  }

  if (curType === TokenType.bracketStart) {
    walkNext()
    let _i = i - 2
    while (tokens[_i].type !== TokenType.bracketEnd) {
      if (tokens[_i].type === TokenType.assignment) {
        return parseObjectExpression(expressionNode)
      }
      if (tokens[_i].type === TokenType.operator) {
        return parseExpression()
      }
      _i++
    }
    return parseArrayExpression(expressionNode)
  }

  if (curToken.value === '-') {
    return parsePreorderExpression(expressionNode)
  }

  error(`258:unexpected expression ${curType} ${curToken.value}`)
}

function parseBinaryExpression(curNode) {
  const expressionNode = {}
  expressionNode.type = ASTType.BinaryExpression
  expressionNode.left = curNode
  expressionNode.operator = curToken.value
  walkNext()
  expressionNode.right = parseExpression()
  if (curType === TokenType.bracketEnd) walkNext()
  return curType === TokenType.operator
    ? parseBinaryExpression(expressionNode)
    : expressionNode
}

function parseAssignmentExpression(expressionNode) {
  if (declarations.includes(curToken.value)) {
    expressionNode.type = ASTType.AssignmentExpression
  } else {
    expressionNode.type = ASTType.VariableDeclaration
    declarations.push(curToken.value)
  }
  expressionNode.id = createNode()
  walkTwice()
  expressionNode.value = parseExpression()
  return expressionNode
}

function parsePreorderExpression(expressionNode) {
  expressionNode.type = ASTType.PreorderExpression
  expressionNode.operator = curToken.value
  walkNext()
  expressionNode.expression = parseExpression()
  return expressionNode
}

function parseObjectExpression(expressionNode) {
  expressionNode.type = ASTType.ObjectExpression
  expressionNode.properties = []
  let tempStack = ['(']
  let tempNode = {}
  let isKey = true
  while (tempStack.length) {
    if (curType === TokenType.comma) walkNext()
    if (curType === TokenType.bracketStart) tempStack.push('(')
    if (curType === TokenType.bracketEnd) {
      tempStack.pop()
      continue
    }
    if (!tempStack.length) break

    if (isKey && curType !== TokenType.bracketEnd) {
      if (curType !== TokenType.identifier) error('298:expected identifier')
      tempNode.key = createNode()
      walkTwice()
      isKey = false
    } else {
      tempNode.value = parseExpression()
      expressionNode.properties.push(tempNode)
      tempNode = {}
      isKey = true
    }
  }
  walkNext()
  return expressionNode
}

function parseArrayExpression(expressionNode) {
  expressionNode.type = ASTType.ArrayExpression
  expressionNode.elements = []
  let tempStack = ['(']
  while (tempStack.length) {
    if (curType === TokenType.comma) walkNext()
    if (curType === TokenType.bracketStart) tempStack.push('(')
    if (curType === TokenType.bracketEnd) {
      tempStack.pop()
      continue
    }
    if (!tempStack.length) break
    expressionNode.elements.push(parseExpression())
  }
  walkNext()
  return expressionNode
}

function parseCallExpression(expressionNode) {
  expressionNode.type = ASTType.CallExpression
  expressionNode.callee = createNode()
  expressionNode.arguments = []
  walkTwice()
  while (curType !== TokenType.bracketEnd) {
    if (curType === TokenType.comma) walkNext()
    expressionNode.arguments.push(parseExpression())
  }
  walkNext()
  return curType === TokenType.operator
    ? parseBinaryExpression(expressionNode)
    : expressionNode
}

function parseMemberExpression(expressionNode) {
  expressionNode.type = ASTType.MemberExpression
  expressionNode.object = createNode()
  walkTwice()
  expressionNode.property = parseExpression()
  walkNext()
  return curType === TokenType.operator
    ? parseBinaryExpression(expressionNode)
    : expressionNode
}

function parseTemplateLiteral(expressionNode) {
  expressionNode.type = ASTType.TemplateLiteral
  expressionNode.items = []
  walkNext()
  while (curType !== TokenType.templateEnd) {
    if (curType === TokenType.templateSlotStart) {
      walkNext()
      expressionNode.items.push(parseExpression())
      walkNext()
    } else {
      expressionNode.items.push({
        type: TokenType.templateElement,
        value: { raw: curToken.value },
      })
      walkNext()
    }
  }
  walkNext()
  return curType === TokenType.operator
    ? parseBinaryExpression(expressionNode)
    : expressionNode
}

function error(err) {
  throw new Error(err)
}

module.exports = parser
