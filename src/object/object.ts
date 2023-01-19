type ObjectType = string;
type type = () => ObjectType;
type inspect = () => string;

export interface EvalObject {
  type: type;
  inspect: inspect;
}

export enum ObjectTypes {
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
}

export class Integer implements EvalObject {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  type() {
    return ObjectTypes.INTEGER;
  }

  inspect() {
    return this.value.toString();
  }
}

export class BooleanLiteral implements EvalObject {
  value: boolean;

  constructor(value: boolean) {
    this.value = value;
  }

  type() {
    return ObjectTypes.BOOLEAN;
  }

  inspect() {
    return this.value.toString();
  }
}

export class Null implements EvalObject {
  value: null = null;

  type() {
    return ObjectTypes.NULL;
  }

  inspect() {
    return 'null';
  }
}
