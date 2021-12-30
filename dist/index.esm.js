const TokenType$3 = {
  declaration: 'declaration',
  identifier: 'identifier',
  string: 'string',
  comment: 'comment',
  number: 'number',

  operator: 'operators',
  assignment: 'assignment',
  propertyAssignment: 'propertyAssignment',
  bracketStart: 'bracketStart',
  bracketEnd: 'bracketEnd',
  memberStart: 'memberStart',
  memberEnd: 'memberEnd',
  templateElement: 'templateElement',
  templateStart: 'templateStart',
  templateEnd: 'templateEnd',
  templateSlotStart: 'templateSlotStart',
  templateSlotEnd: 'templateSlotEnd',
  blockStart: 'blockStart',
  blockEnd: 'blockEnd',
  comma: 'comma',
  semicolon: 'semicolon',

  keywordTrue: 'keywordTrue',
  keywordFalse: 'keywordFalse',
  keywordIn: 'keywordIn',
  keywordIf: 'keywordIf',
  keywordElif: 'keywordElif',
  keywordElse: 'keywordElse',
  keywordFor: 'keywordFor',
  keywordWhile: 'keywordWhile',
  keywordFromTo: 'keywordFromTo',
  keywordContinue: 'keywordContinue',
  keywordBreak: 'keywordBreak',
  keywordReturn: 'keywordReturn',
};

const ASTType$2 = {
  BlockStatement: 'BlockStatement',
  ExpressionStatement: 'ExpressionStatement',
  IfStatement: 'IfStatement',
  ForStatement: 'ForStatement',
  WhileStatement: 'WhileStatement',
  VariableDeclaration: 'VariableDeclaration',
  FunctionDeclaration: 'FunctionDeclaration',
  AssignmentExpression: 'AssignmentExpression',
  BinaryExpression: 'BinaryExpression',
  PreorderExpression: 'PreorderExpression',
  GroupExpression: 'GroupExpression',
  ObjectExpression: 'ObjectExpression',
  ArrayExpression: 'ArrayExpression',
  CallExpression: 'CallExpression',
  MemberExpression: 'MemberExpression',
  TemplateLiteral: 'TemplateLiteral',
};

const keywordTypeMap$1 = {
  是: 'keywordTrue',
  yes: 'keywordTrue',
  否: 'keywordFalse',
  no: 'keywordFalse',
  如果: 'keywordIf',
  if: 'keywordIf',
  或者: 'keywordElif',
  or: 'keywordElif',
  否则: 'keywordElse',
  else: 'keywordElse',
  循环: 'keywordFor',
  for: 'keywordFor',
  直到: 'keywordWhile',
  while: 'keywordWhile',
  跳过: 'keywordContinue',
  pass: 'keywordContinue',
  退出: 'keywordBreak',
  break: 'keywordBreak',
  返回: 'keywordReturn',
  return: 'keywordReturn',
};

var type = {
  TokenType: TokenType$3,
  ASTType: ASTType$2,
  keywordTypeMap: keywordTypeMap$1,
};

const { TokenType: TokenType$2, ASTType: ASTType$1 } = type;

const Preset = {
  打印: 'console.log',
  dy: 'console.log',
  长度: '(a) => a.length',
  cd: '(a) => a.length',
  四舍五入: 'parseInt',
  sswr: 'parseInt',
  绝对值: 'Math.abs',
  jdz: 'Math.abs',
  从小到大: '(arr) => arr.sort((a, b) => a < b)',
  cxdd: '(arr) => arr.sort((a, b) => a < b)',
  从大到小: '(arr) => arr.sort((a, b) => a > b)',
  cddx: '(arr) => arr.sort((a, b) => a > b)',
};
const OperatorMap = {
  '》': '>',
  '《': '<',
  '&': '&&',
  '|': '||',
};

function generate(ast) {
  const presetArr = Object.entries(Preset);
  return (
    presetArr
      .map(([key, value], i) => {
        return `const ${key} = ${value}\n${
          i === presetArr.length - 1 ? '\n' : ''
        }`
      })
      .join('') + generateStatement(ast)
  )
}

function generateStatement(statements) {
  return statements
    .map((statement) => {
      let fragment = '';
      if (statement.type === ASTType$1.ExpressionStatement) {
        fragment += generateExpressionStatement(statement);
        fragment += '\n';
        return fragment
      }
      fragment += generateBlockStatement(statement);
      fragment += '\n';
      return fragment
    })
    .join('\n')
}

function generateExpressionStatement({ expression }) {
  switch (expression.type) {
    case ASTType$1.VariableDeclaration: {
      return `let ${generateExpression(expression.left)} = ${generateExpression(
        expression.right
      )}`
    }
    case ASTType$1.AssignmentExpression: {
      return `${generateExpression(expression.left)} = ${generateExpression(
        expression.right
      )}`
    }
    default: {
      return generateExpression(expression)
    }
  }
}

function generateBlockStatement(statement) {
  switch (statement.type) {
    case ASTType$1.IfStatement: {
      return `if (${generateExpression(statement.test)}){\n${generateStatement(
        statement.consequent.body
      )}} ${
        statement.alternate
          ? statement.alternate.type === ASTType$1.IfStatement
            ? 'else ' + generateBlockStatement(statement.alternate)
            : 'else {\n' + generateStatement(statement.alternate.body) + '\n}'
          : ''
      }`
    }
    case ASTType$1.ForStatement: {
      return `for (${generateExpressionStatement({
        expression: statement.init,
      })};${generateExpression(statement.test)};${
        statement.init.left.value
      }++){\n${generateStatement(statement.body.body)}}`
    }
    case ASTType$1.WhileStatement: {
      return `while (${generateExpression(
        statement.test
      )}){\n${generateStatement(statement.consequent.body)}}`
    }
    case ASTType$1.FunctionDeclaration: {
      return `function ${statement.id.value}(${statement.params.map((param) =>
        generateExpression(param)
      )}) {\n${generateStatement(statement.body.body)}}`
    }
  }
}

function generateExpression(expression) {
  switch (expression.type) {
    case TokenType$2.identifier: {
      return expression.value
    }
    case TokenType$2.string: {
      return `'${expression.value}'`
    }
    case TokenType$2.number: {
      return expression.value
    }
    case TokenType$2.keywordTrue: {
      return 'true'
    }
    case TokenType$2.keywordFalse: {
      return 'false'
    }
    case ASTType$1.TemplateLiteral: {
      let templateString = '';
      while (expression.items.length) {
        const item = expression.items.shift();
        if (item.type === TokenType$2.templateElement) {
          templateString += item.value.raw;
        } else {
          templateString =
            templateString + '${' + generateExpression(item) + '}';
        }
      }
      return '`' + templateString + '`'
    }
    case ASTType$1.BinaryExpression: {
      return `${generateExpression(expression.left)} ${
        expression.operator in OperatorMap
          ? OperatorMap[expression.operator]
          : expression.operator
      } ${generateExpression(expression.right)}`
    }
    case ASTType$1.PreorderExpression: {
      return `${expression.operator}${generateExpression(
        expression.expression
      )}`
    }
    case ASTType$1.GroupExpression: {
      return `(${generateExpression(expression.expression)})`
    }
    case ASTType$1.ObjectExpression: {
      return (
        '\n{\n' +
        expression.properties
          .map(
            (property) =>
              `${generateExpression(property.key)}: ${generateExpression(
                property.value
              )}`
          )
          .join(',\n') +
        '\n}'
      )
    }
    case ASTType$1.ArrayExpression: {
      return (
        '[' +
        expression.elements
          .map((element) => `${generateExpression(element)}`)
          .join(',') +
        ']'
      )
    }
    case ASTType$1.CallExpression: {
      return `${expression.callee.value}(${expression.arguments.map(
        (argument) => generateExpression(argument)
      )})`
    }
    case ASTType$1.MemberExpression: {
      return `${expression.object.value}[${generateExpression(
        expression.property
      )}]`
    }
  }
}

var generate_1 = generate;

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

const { TokenType: TokenType$1, ASTType } = type;

let i$1, tokens$1, curToken$1, nextToken, curType$1, nextType, declarations, state$1;

function walkNext() {
  curToken$1 = nextToken;
  nextToken = tokens$1[i$1++];
  curType$1 = curToken$1?.type;
  nextType = nextToken?.type;
}
function walkTwice() {
  walkNext();
  walkNext();
}

function createNode(token = curToken$1) {
  return {
    value: token.value,
    type: token.type,
  }
}

function parser(arr) {
  i$1 = 0;
  tokens$1 = arr;
  curToken$1 = null;
  nextToken = null;
  curType$1 = '';
  nextType = '';
  declarations = [];
  state$1 = {
    variables: [],
    functions: [],
  };

  walkTwice();
  const ast = [];
  while (i$1 < arr.length + 2) {
    ast.push(parseStatement());
    walkNext();
  }
  return { ast, state: state$1 }
}

function parseStatement() {
  if (curType$1 === TokenType$1.keywordIf) {
    return parseIfStatement()
  }
  if (curType$1 === TokenType$1.keywordFor) {
    return parseForStatement()
  }
  if (curType$1 === TokenType$1.keywordWhile) {
    return parseWhileStatement()
  }
  let j = i$1 - 2;
  while (tokens$1[j].type !== TokenType$1.bracketEnd) {
    if (tokens$1[j].type === TokenType$1.semicolon) {
      j = -999;
      break
    }
    j++;
  }
  if (j !== -999 && tokens$1[j + 1].type === TokenType$1.blockStart) {
    return parseFunctionDeclartionStatement()
  }
  return parseExpressionStatement()
}

function parseBlockStatement() {
  const blockStatement = {};
  blockStatement.type = ASTType.BlockStatement;
  blockStatement.body = [];
  walkNext();
  while (curType$1 !== TokenType$1.blockEnd) {
    blockStatement.body.push(parseStatement());
    walkNext();
  }
  walkNext();
  return blockStatement
}

function parseExpressionStatement() {
  const expressionStatement = {};
  expressionStatement.type = ASTType.ExpressionStatement;
  expressionStatement.expression = parseExpression();
  return expressionStatement
}

function parseIfStatement() {
  const ifStatement = {};
  ifStatement.type = ASTType.IfStatement;
  walkTwice();
  ifStatement.test = parseExpression();
  walkNext();
  ifStatement.consequent = parseBlockStatement();
  if (curType$1 === TokenType$1.keywordElif) {
    ifStatement.alternate = parseIfStatement();
  } else if (curType$1 === TokenType$1.keywordElse) {
    walkNext();
    ifStatement.alternate = parseBlockStatement();
  }
  return ifStatement
}

function parseForStatement() {
  const forStatement = {};
  forStatement.type = ASTType.ForStatement;
  walkTwice();
  let identifier = '';
  identifier = createNode();
  walkTwice();
  forStatement.init = {
    type: ASTType.VariableDeclaration,
    left: identifier,
    right: parseExpression(),
  };
  walkNext();
  forStatement.test = {
    type: ASTType.BinaryExpression,
    left: identifier,
    operator: '<',
    right: parseExpression(),
  };
  walkNext();
  forStatement.body = parseBlockStatement();
  return forStatement
}

function parseWhileStatement() {
  const whileStatement = {};
  whileStatement.type = ASTType.WhileStatement;
  walkTwice();
  whileStatement.test = parseExpression();
  walkNext();
  whileStatement.consequent = parseBlockStatement();
  return whileStatement
}

function parseFunctionDeclartionStatement() {
  const functionStatement = {};
  functionStatement.type = ASTType.FunctionDeclaration;
  functionStatement.params = [];
  functionStatement.id = createNode();
  walkTwice();
  while (curType$1 !== TokenType$1.bracketEnd) {
    if (curType$1 === TokenType$1.comma) walkNext();
    if (curType$1 !== TokenType$1.identifier)
      error('parseFunctionDeclartionStatement:expected identifier');
    functionStatement.params.push(createNode());
    walkNext();
  }
  walkNext();
  functionStatement.body = parseBlockStatement();
  state$1.functions.push({
    id: functionStatement.id.value,
    params: functionStatement.params.map((p) => p.value),
  });
  return functionStatement
}

function parseExpression() {
  if (
    [
      TokenType$1.identifier,
      TokenType$1.string,
      TokenType$1.number,
      TokenType$1.keywordTrue,
      TokenType$1.keywordFalse,
    ].includes(curType$1) &&
    [
      TokenType$1.operator,
      TokenType$1.assignment,
      TokenType$1.semicolon,
      TokenType$1.comma,
      TokenType$1.bracketEnd,
      TokenType$1.memberEnd,
      TokenType$1.templateSlotEnd,
      TokenType$1.keywordFromTo,
    ].includes(nextType)
  ) {
    const node = createNode();
    walkNext();
    return parseAssignmentOrBinaryExpression(node)
  }

  if (curType$1 === TokenType$1.templateStart) {
    return parseTemplateLiteral()
  }

  if (curType$1 === TokenType$1.identifier) {
    if (nextType === TokenType$1.bracketStart) {
      return parseCallExpression()
    }
    if (nextType === TokenType$1.memberStart) {
      return parseMemberExpression()
    }
  }

  if (curType$1 === TokenType$1.bracketStart) {
    walkNext();
    let j = i$1 - 2;
    let tempStack = ['('];
    while (
      !(tokens$1[j].type === TokenType$1.bracketEnd && tempStack.length === 1)
    ) {
      if (tokens$1[j].type === TokenType$1.bracketStart) tempStack.push('(');
      if (tokens$1[j].type === TokenType$1.bracketEnd) tempStack.pop();
      if (tokens$1[j].type === TokenType$1.operator && tempStack.length === 1) {
        return parseGroupExpression()
      }
      if (
        tokens$1[j].type === TokenType$1.propertyAssignment &&
        tempStack.length === 1
      ) {
        return parseObjectExpression()
      }
      j++;
    }
    return parseArrayExpression()
  }

  if (curToken$1.value === '-') {
    return parsePreorderExpression()
  }

  error(`parseExpression: unexpected expression ${curType$1} ${curToken$1.value}`);
}

function parseAssignmentOrBinaryExpression(expressionNode) {
  if (curType$1 === TokenType$1.assignment) {
    return parseAssignmentExpression(expressionNode)
  }
  if (curType$1 === TokenType$1.operator) {
    return parseBinaryExpression(expressionNode)
  }
  return expressionNode
}

function parseAssignmentExpression(curNode) {
  const expressionNode = {};
  expressionNode.type = ASTType.AssignmentExpression;
  if (
    curNode.type === TokenType$1.identifier &&
    !declarations.includes(curNode?.value)
  ) {
    expressionNode.type = ASTType.VariableDeclaration;
    declarations.push(curNode.value);
    state$1.variables.push(curNode);
  }
  expressionNode.left = curNode;
  walkNext();
  expressionNode.right = parseExpression();
  return expressionNode
}

function parseBinaryExpression(curNode) {
  const expressionNode = {};
  expressionNode.type = ASTType.BinaryExpression;
  expressionNode.left = curNode;
  expressionNode.operator = curToken$1.value;
  walkNext();
  expressionNode.right = parseExpression();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parsePreorderExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.PreorderExpression;
  expressionNode.operator = curToken$1.value;
  walkNext();
  expressionNode.expression = parseExpression();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseGroupExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.GroupExpression;
  expressionNode.expression = parseExpression();
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseObjectExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.ObjectExpression;
  expressionNode.properties = [];
  let tempStack = ['('];
  let tempNode = {};
  let isKey = true;
  while (tempStack.length) {
    if (curType$1 === TokenType$1.comma) walkNext();
    if (curType$1 === TokenType$1.bracketStart) tempStack.push('(');
    if (curType$1 === TokenType$1.bracketEnd) {
      tempStack.pop();
      continue
    }
    if (!tempStack.length) break

    if (isKey && curType$1 !== TokenType$1.bracketEnd) {
      if (curType$1 !== TokenType$1.identifier)
        error('parseObjectExpression: expected identifier');
      tempNode.key = createNode();
      walkTwice();
      isKey = false;
    } else {
      tempNode.value = parseExpression();
      expressionNode.properties.push(tempNode);
      tempNode = {};
      isKey = true;
    }
  }
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseArrayExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.ArrayExpression;
  expressionNode.elements = [];
  let tempStack = ['('];
  while (tempStack.length) {
    if (curType$1 === TokenType$1.comma) walkNext();
    if (curType$1 === TokenType$1.bracketStart) tempStack.push('(');
    if (curType$1 === TokenType$1.bracketEnd) {
      tempStack.pop();
      continue
    }
    if (!tempStack.length) break
    expressionNode.elements.push(parseExpression());
  }
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseCallExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.CallExpression;
  expressionNode.callee = createNode();
  expressionNode.arguments = [];
  walkTwice();
  while (curType$1 !== TokenType$1.bracketEnd) {
    if (curType$1 === TokenType$1.comma) walkNext();
    expressionNode.arguments.push(parseExpression());
  }
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseMemberExpression() {
  const expressionNode = {};
  expressionNode.type = ASTType.MemberExpression;
  expressionNode.object = createNode();
  walkTwice();
  expressionNode.property = parseExpression();
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function parseTemplateLiteral() {
  const expressionNode = {};
  expressionNode.type = ASTType.TemplateLiteral;
  expressionNode.items = [];
  walkNext();
  while (curType$1 !== TokenType$1.templateEnd) {
    if (curType$1 === TokenType$1.templateSlotStart) {
      walkNext();
      expressionNode.items.push(parseExpression());
      walkNext();
    } else {
      expressionNode.items.push({
        type: TokenType$1.templateElement,
        value: { raw: curToken$1.value },
      });
      walkNext();
    }
  }
  walkNext();
  return parseAssignmentOrBinaryExpression(expressionNode)
}

function error(err) {
  throw new Error(err)
}

var parser_1 = parser;

const { TokenType, keywordTypeMap } = type;

const Letters = /[\u4e00-\u9fa5a-zA-Z0-9]/;
const Number = /[^\D]/;
const Operators = ['+', '-', '*', '/', '%', '《', '<', '》', '>', '|', '&'];

let i, source, curChar, curToken, curType, tokens;

const state = {
  isParsingModelString: false,
  isParsingMemberExpression: false,
  parsingBrackets: [],
};
const search = (x = 1) => source[i + x];

function tokenizer(input) {
  i = 0;
  curChar = '';
  curToken = '';
  curType = '';
  tokens = [];
  source =
    input
      .split(/\n/)
      .filter((i) => /[\S]/.test(i))
      .join('\n') + '\n'; // 去除空行
  let state = common;
  for (; i < source.length; i++) {
    curChar = source[i];
    state = state(curChar);
  }
  return tokens
}

function push(type = curType, value = curToken) {
  if (!value) return
  if (value in keywordTypeMap) type = keywordTypeMap[value];
  tokens.push({ type, value });
  curToken = '';
  curType = TokenType.identifier;
}

function isChar(...arr) {
  return arr.includes(curChar)
}

function common() {
  if (Number.test(curChar)) {
    curToken += curChar;
    curType = TokenType.number;
    return number
  }
  if (Letters.test(curChar)) {
    curToken += curChar;
    curType = TokenType.identifier;
    return identifier
  }
  if (isChar('=')) {
    if (state.parsingBrackets.length) {
      push(TokenType.propertyAssignment, '=');
    } else {
      push(TokenType.assignment, '=');
    }
    return common
  }
  if (isChar('‘', "'")) {
    return string
  }
  if (isChar('“', '”', '"', '"')) {
    state.isParsingModelString = true;
    push(TokenType.templateStart, '“');
    return templateString
  }
  if (isChar('{')) {
    push(TokenType.blockStart, '{');
    return common
  }
  if (isChar('（', '(')) {
    state.parsingBrackets.push('(');
    push(TokenType.bracketStart, '（');
    return common
  }
  if (isChar('！', '!')) {
    return comment
  }
  return end()
}

function identifier() {
  if (Letters.test(curChar)) {
    curToken += curChar;
    return identifier
  }
  if (isChar(' ')) {
    push();
    return common
  }
  if (isChar('=')) {
    push();
    if (state.parsingBrackets.length) {
      push(TokenType.propertyAssignment, '=');
    } else {
      push(TokenType.assignment, '=');
    }
    return common
  }
  if (isChar('（', '(')) {
    state.parsingBrackets.push('(');
    push();
    push(TokenType.bracketStart, '（');
    return common
  }
  if (isChar('{')) {
    state.isParsingMemberExpression = true;
    push();
    push(TokenType.memberStart, '{');
    return common
  }
  return end()
}

function string() {
  if (isChar('’', "'")) {
    push();
    return common
  }
  curType = TokenType.string;
  curToken += curChar;
  return string
}

function templateString() {
  if (isChar('“', '”', '"', '"')) {
    state.isParsingModelString = false;
    push();
    push(TokenType.templateEnd, '”');
    return common
  }
  if (isChar('{')) {
    push();
    push(TokenType.templateSlotStart, '{');
    return identifier
  }
  curType = TokenType.string;
  curToken += curChar;
  return templateString
}

function number() {
  if (Number.test(curChar) || isChar('.')) {
    curToken += curChar;
    return number
  }
  return end()
}

function comment() {
  if (isChar('\n')) {
    curToken = '';
    return common
  }
  curToken += curChar;
  curType = TokenType.comment;
  return comment
}

function end() {
  if (Operators.includes(curChar)) {
    push();
    push(TokenType.operator, curChar);
    return common
  }
  if (isChar('）', ')')) {
    state.parsingBrackets.pop();
    push();
    push(TokenType.bracketEnd, '）');
    return common
  }
  if (isChar('}')) {
    if (state.isParsingMemberExpression) {
      push();
      push(TokenType.memberEnd, '}');
      state.isParsingMemberExpression = false;
      return common
    }
    if (state.isParsingModelString) {
      push();
      push(TokenType.templateSlotEnd, '}');
      return templateString
    }
    push();
    push(TokenType.blockEnd, '}');
    return common
  }
  if (isChar('~')) {
    push();
    push(TokenType.keywordFromTo, '~');
    return common
  }
  if (isChar('，', ',')) {
    push();
    push(TokenType.comma, '，');
    return common
  }
  if (isChar(' ')) {
    push();
    return common
  }
  if (isChar('\n')) {
    push();
    const prev = search(-1);
    let nonNullIndex = 1;
    while (
      !/[^\s\n]/.test(search(nonNullIndex)) &&
      nonNullIndex < source.length - 1
    ) {
      nonNullIndex++;
    }
    const next = search(nonNullIndex);
    if (
      /[（(,，{]/.test(prev) ||
      /[（）(),，{]/.test(next) ||
      /[或否]/.test(next) ||
      next === '）' ||
      !prev
    ) {
      return common
    }
    push(TokenType.semicolon, ';');
    return common
  }
  console.log('error with: ', curChar);
}

var tokenizer_1 = tokenizer;

let callBacks = [];

function compile(source) {
  const { ast, state } = parser_1(tokenizer_1(source));
  callBacks.forEach((c) => c(state));
  return generate_1(ast)
}

function onComplete(fn) {
  callBacks.push(fn);
}

var compiler = {
  compile,
  onComplete,
};
var compiler_1 = compiler.compile;
var compiler_2 = compiler.onComplete;

export { compiler_1 as compile, compiler as default, compiler_2 as onComplete };
