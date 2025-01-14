const TokenType = {
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
  member: 'member',
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
}

const ASTType = {
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
}

const keywordTypeMap = {
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
}

module.exports = {
  TokenType,
  ASTType,
  keywordTypeMap,
}
