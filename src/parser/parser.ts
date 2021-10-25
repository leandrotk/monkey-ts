import { Program, LetStatement, Identifier, ReturnStatement } from 'ast';
import { Expression } from 'ast';
import { Lexer } from 'lexer';
import { Token, Tokens, TokenType } from 'token';

export type ParserError = string;

type prefixParseFn = () => Expression;
type infixParseFn = (expression: Expression) => Expression;

export class Parser {
  private lexer: Lexer;
  private currentToken: Token;
  private peekToken: Token;
  private errors: ParserError[];
  private prefixParseFns: { [key: TokenType]: prefixParseFn } = {};
  private infixParseFns: { [key: TokenType]: infixParseFn } = {};

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.errors = [];
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram() {
    const program = new Program();

    while (this.currentToken.type !== Tokens.EOF) {
      const statement = this.parseStatement();

      if (statement !== null) {
        program.statements.push(statement);
      }

      this.nextToken();
    }

    return program;
  }

  getErrors() {
    return this.errors;
  }

  private parseStatement() {
    switch (this.currentToken.type) {
      case Tokens.LET:
        return this.parseLetStatement();
      case Tokens.RETURN:
        return this.parseReturnStatement();
      default:
        return null;
    }
  }

  private parseLetStatement() {
    const statement = new LetStatement(this.currentToken);

    if (!this.expectPeek(Tokens.IDENT)) {
      return null;
    }

    const identifier = new Identifier(
      this.currentToken,
      this.currentToken.literal
    );

    statement.name = identifier;

    if (!this.expectPeek(Tokens.ASSIGN)) {
      return null;
    }

    while (!this.currentTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  private parseReturnStatement() {
    const statement = new ReturnStatement(this.currentToken);

    while (!this.currentTokenIs(Tokens.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  private currentTokenIs(token: TokenType) {
    return this.currentToken.type === token;
  }

  private peekTokenIs(token: TokenType) {
    return this.peekToken.type === token;
  }

  private expectPeek(token: TokenType) {
    if (this.peekTokenIs(token)) {
      this.nextToken();
      return true;
    }

    this.peekError(token);
    return false;
  }

  private peekError(token: TokenType) {
    const msg = `expected next token to be ${token}, got ${this.peekToken.type} instead`;
    this.errors.push(msg);
  }

  private registerPrefix(tokenType: TokenType, fn: prefixParseFn) {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: TokenType, fn: infixParseFn) {
    this.infixParseFns[tokenType] = fn;
  }
}
