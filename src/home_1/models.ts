export interface IAdapter<T> {
  getValue(): T;
  setValue(value: T);
}
export abstract class BaseAdapter<T = any> implements IAdapter<T> {
  constructor(protected obj: object, protected fieldKey: string) {}
  public getValue(): T {
    return this.obj[this.fieldKey];
  }
  public setValue(value: T) {
    this.obj[this.fieldKey] = value;
    return this;
  }
}
export abstract class CheckedAdapter<T> extends BaseAdapter<T> {
  public getValue(): T {
    const value: T = super.getValue();
    if (value === undefined || value === null) {
      throw `${this.fieldKey} not found`;
    }
    return value;
  }
}

export interface ICommand {
  execute(): void;
}
export interface IVector {
  x: number;
  y: number;
}
