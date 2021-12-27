const { TokenType, ASTType } = require('./type')

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
}
const OperatorMap = {
  '》': '>',
  '《': '<',
  '&': '&&',
  '|': '||',
}

function generate(ast) {
  const presetArr = Object.entries(Preset)
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
      let fragment = ''
      if (statement.type === ASTType.ExpressionStatement) {
        fragment += generateExpressionStatement(statement)
        fragment += '\n'
        return fragment
      }
      fragment += generateBlockStatement(statement)
      fragment += '\n'
      return fragment
    })
    .join('\n')
}

function generateExpressionStatement({ expression }) {
  switch (expression.type) {
    case ASTType.VariableDeclaration: {
      return `let ${generateExpression(expression.left)} = ${generateExpression(
        expression.right
      )}`
    }
    case ASTType.AssignmentExpression: {
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
    case ASTType.IfStatement: {
      return `if (${generateExpression(statement.test)}){\n${generateStatement(
        statement.consequent.body
      )}} ${
        statement.alternate
          ? statement.alternate.type === ASTType.IfStatement
            ? 'else ' + generateBlockStatement(statement.alternate)
            : 'else {\n' + generateStatement(statement.alternate.body) + '\n}'
          : ''
      }`
    }
    case ASTType.ForStatement: {
      return `for (${generateExpressionStatement({
        expression: statement.init,
      })};${generateExpression(statement.test)};${
        statement.init.left.value
      }++){\n${generateStatement(statement.body.body)}}`
    }
    case ASTType.WhileStatement: {
      return `while (${generateExpression(
        statement.test
      )}){\n${generateStatement(statement.consequent.body)}}`
    }
    case ASTType.FunctionDeclaration: {
      return `function ${statement.id.value}(${statement.params.map((param) =>
        generateExpression(param)
      )}) {\n${generateStatement(statement.body.body)}}`
    }
  }
}

function generateExpression(expression) {
  switch (expression.type) {
    case TokenType.identifier: {
      return expression.value
    }
    case TokenType.string: {
      return `'${expression.value}'`
    }
    case TokenType.number: {
      return expression.value
    }
    case TokenType.keywordTrue: {
      return 'true'
    }
    case TokenType.keywordFalse: {
      return 'false'
    }
    case ASTType.TemplateLiteral: {
      let templateString = ''
      while (expression.items.length) {
        const item = expression.items.shift()
        if (item.type === TokenType.templateElement) {
          templateString += item.value.raw
        } else {
          templateString =
            templateString + '${' + generateExpression(item) + '}'
        }
      }
      return '`' + templateString + '`'
    }
    case ASTType.BinaryExpression: {
      return `${generateExpression(expression.left)} ${
        expression.operator in OperatorMap
          ? OperatorMap[expression.operator]
          : expression.operator
      } ${generateExpression(expression.right)}`
    }
    case ASTType.PreorderExpression: {
      return `${expression.operator}${generateExpression(
        expression.expression
      )}`
    }
    case ASTType.GroupExpression: {
      return `(${generateExpression(expression.expression)})`
    }
    case ASTType.ObjectExpression: {
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
    case ASTType.ArrayExpression: {
      return (
        '[' +
        expression.elements
          .map((element) => `${generateExpression(element)}`)
          .join(',') +
        ']'
      )
    }
    case ASTType.CallExpression: {
      return `${expression.callee.value}(${expression.arguments.map(
        (argument) => generateExpression(argument)
      )})`
    }
    case ASTType.MemberExpression: {
      return `${expression.object.value}[${generateExpression(
        expression.property
      )}]`
    }
  }
}

module.exports = generate
