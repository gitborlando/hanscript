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
  i = 0
  tokens = []
  curToken = null
  nextToken = null
  curType = ''
  nextType = ''
  declarations = []
  return ast
}

function parseStatement() {
  if (curType === TokenType.keywordIf) {
    return parseIfStatement()
  }
  if (curType === TokenType.keywordFor) {
    return parseForStatement()
  }
  if (curType === TokenType.keywordWhile) {
    return parseWhileStatement()
  }
  let j = i - 2
  while (tokens[j].type !== TokenType.bracketEnd) {
    if (tokens[j].type === TokenType.semicolon) {
      j = -999
      break
    }
    j++
  }
  if (j !== -999 && tokens[j + 1].type === TokenType.blockStart) {
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
  walkNext()
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
  identifier = createNode()
  walkTwice()
  forStatement.init = {
    type: ASTType.VariableDeclaration,
    left: identifier,
    right: parseExpression(),
  }
  walkNext()
  forStatement.test = {
    type: ASTType.BinaryExpression,
    left: identifier,
    operator: '<',
    right: parseExpression(),
  }
  walkNext()
  forStatement.body = parseBlockStatement()
  return forStatement
}

function parseWhileStatement() {
  const whileStatement = {}
  whileStatement.type = ASTType.WhileStatement
  walkTwice()
  whileStatement.test = parseExpression()
  walkNext()
  whileStatement.consequent = parseBlockStatement()
  return whileStatement
}

function parseFunctionDeclartionStatement() {
  const functionStatement = {}
  functionStatement.type = ASTType.FunctionDeclaration
  functionStatement.params = []
  functionStatement.id = createNode()
  walkTwice()
  while (curType !== TokenType.bracketEnd) {
    if (curType === TokenType.comma) walkNext()
    if (curType !== TokenType.identifier)
      error('parseFunctionDeclartionStatement:expected identifier')
    functionStatement.params.push(createNode())
    walkNext()
  }
  walkNext()
  functionStatement.body = parseBlockStatement()
  return functionStatement
}

function parseExpression() {
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
      TokenType.assignment,
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
    return parseAssignmentOrBinaryExpression(node)
  }

  if (curType === TokenType.templateStart) {
    return parseTemplateLiteral()
  }

  if (curType === TokenType.identifier) {
    if (nextType === TokenType.bracketStart) {
      return parseCallExpression()
    }
    if (nextType === TokenType.memberStart) {
      return parseMemberExpression()
    }
  }

  if (curType === TokenType.bracketStart) {
    walkNext()
    let j = i - 2
    let tempStack = ['(']
    while (
      !(tokens[j].type === TokenType.bracketEnd && tempStack.length === 1)
    ) {
      if (tokens[j].type === TokenType.bracketStart) tempStack.push('(')
      if (tokens[j].type === TokenType.bracketEnd) tempStack.pop()
      if (tokens[j].type === TokenType.operator && tempStack.length === 1) {
        return parseGroupExpression()
      }
      if (
        tokens[j].type === TokenType.propertyAssignment &&
        tempStack.length === 1
      ) {
        return parseObjectExpression()
      }
      j++
    }
    return parseArrayExpression()
  }

  if (curToken.value === '-') {
    return parsePreorderExpression()
  }

  error(`parseExpression: unexpected expression ${curType} ${curToken.value}`)
}

function parseAssignmentOrBinaryExpression(expressionNode) {
  if (curType === TokenType.assignment) {
    return parseAssignmentExpression(expressionNode)
  }
  if (curType === TokenType.operator) {
    return parseBinaryExpression(expressionNode)
  }
  return expressionNode
}

function parseAssignmentExpression(curNode) {
  const expressionNode = {}
  expressionNode.type = ASTType.AssignmentExpression
  if (
    curNode.type === TokenType.identifier &&
    !declarations.includes(curNode?.value)
  ) {
    expressionNode.type = ASTType.VariableDeclaration
    declarations.push(curNode.value)
  }
  expressionNode.left = curNode
  walkNext()
  expressionNode.right = parseExpression()
  return expressionNode
}

function parseBinaryExpression(curNode) {
  const expressionNode = {}
  expressionNode.type = ASTType.BinaryExpression
  expressionNode.left = curNode
  expressionNode.operator = curToken.value
  walkNext()
  expressionNode.right = parseExpression()
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parsePreorderExpression() {
  const expressionNode = {}
  expressionNode.type = ASTType.PreorderExpression
  expressionNode.operator = curToken.value
  walkNext()
  expressionNode.expression = parseExpression()
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseGroupExpression() {
  const expressionNode = {}
  expressionNode.type = ASTType.GroupExpression
  expressionNode.expression = parseExpression()
  walkNext()
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseObjectExpression() {
  const expressionNode = {}
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
      if (curType !== TokenType.identifier)
        error('parseObjectExpression: expected identifier')
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
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseArrayExpression() {
  const expressionNode = {}
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
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseCallExpression() {
  const expressionNode = {}
  expressionNode.type = ASTType.CallExpression
  expressionNode.callee = createNode()
  expressionNode.arguments = []
  walkTwice()
  while (curType !== TokenType.bracketEnd) {
    if (curType === TokenType.comma) walkNext()
    expressionNode.arguments.push(parseExpression())
  }
  walkNext()
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseMemberExpression() {
  const expressionNode = {}
  expressionNode.type = ASTType.MemberExpression
  expressionNode.object = createNode()
  walkTwice()
  expressionNode.property = parseExpression()
  walkNext()
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseTemplateLiteral() {
  const expressionNode = {}
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
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function error(err) {
  throw new Error(err)
}

module.exports = parser
