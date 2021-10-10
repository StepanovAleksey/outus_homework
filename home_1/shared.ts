export abstract class Adapter {
  constructor(protected obj: UObject, protected fieldKey: string) {}
}
export interface ICommand {
  execute(): void;
}
export interface IVector {
  x: number;
  y: number;
}
