import { describe, it, expect } from 'vitest';
import { IntegerLiteral, StatementKind } from 'ast';
import { ExpressionKind } from 'ast/base';
import { Lexer } from 'lexer';
import { Parser } from 'parser';
import { checkParserErrors } from './checkParserErrors';

describe('Parser', () => {
  describe('parseProgram', () => {
    it('parses infix expressions', () => {
      const tests = [
        { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
        { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
        { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
        { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
        { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
        { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
        { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
        { input: '5 != 5;', leftValue: 5, operator: '!=', rightValue: 5 },
      ];

      tests.forEach((test) => {
        const lexer = new Lexer(test.input);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        const statements = program.statements;
        const statement = statements[0];
        const errors = parser.getErrors();

        checkParserErrors(errors);

        if (statements.length !== 1) {
          throw new Error(
            `program does not contain 1 statement. got ${statements.length}`
          );
        }

        if (
          statement.kind === StatementKind.Expression &&
          statement.expression.kind === ExpressionKind.Infix
        ) {
          const { expression } = statement;
          const { operator } = expression;

          const left = expression.left as IntegerLiteral;
          const right = expression.right as IntegerLiteral;

          expect(left.value).toEqual(test.leftValue);
          expect(left.tokenLiteral()).toEqual(test.leftValue.toString());

          expect(operator).toEqual(test.operator);

          expect(right.value).toEqual(test.rightValue);
          expect(right.tokenLiteral()).toEqual(test.rightValue.toString());
        }
      });
    });
  });

  it('parses two infix expressions', () => {
    const input = '1 + 2 + 3';
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const errors = parser.getErrors();

    checkParserErrors(errors);
    expect(program.statements[0]).toEqual({
      token: {
        type: 'INT',
        literal: '1',
      },
      kind: 'expression',
      expression: {
        token: {
          type: '+',
          literal: '+',
        },
        operator: '+',
        left: {
          token: {
            type: '+',
            literal: '+',
          },
          operator: '+',
          left: {
            token: {
              type: 'INT',
              literal: '1',
            },
            value: 1,
            kind: 'integerLiteral',
          },
          kind: 'infix',
          right: {
            token: {
              type: 'INT',
              literal: '2',
            },
            value: 2,
            kind: 'integerLiteral',
          },
        },
        kind: 'infix',
        right: {
          token: {
            type: 'INT',
            literal: '3',
          },
          value: 3,
          kind: 'integerLiteral',
        },
      },
    });
  });

  it('parses two infix expressions with different precedences', () => {
    const input = '1 + 2 * 3';
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const errors = parser.getErrors();

    checkParserErrors(errors);
    expect(program.statements[0]).toEqual({
      token: {
        type: 'INT',
        literal: '1',
      },
      kind: 'expression',
      expression: {
        token: {
          type: '+',
          literal: '+',
        },
        operator: '+',
        left: {
          token: {
            type: 'INT',
            literal: '1',
          },
          value: 1,
          kind: 'integerLiteral',
        },
        kind: 'infix',
        right: {
          token: {
            type: '*',
            literal: '*',
          },
          operator: '*',
          kind: 'infix',
          left: {
            token: {
              type: 'INT',
              literal: '2',
            },
            value: 2,
            kind: 'integerLiteral',
          },
          right: {
            token: {
              type: 'INT',
              literal: '3',
            },
            value: 3,
            kind: 'integerLiteral',
          },
        },
      },
    });
  });
});
