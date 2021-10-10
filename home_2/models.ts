export interface ICommand<T = ESystemCommandType | string> {
  type: ECommandType;
  payload: T;
  uid?: string;
}
export enum ECommandType {
  info = "info",
  code = "code",
  system = "system",
  error = "error",
}

export enum ESystemCommandType {
  start = "start",
  hardStop = "hard stop",
  softStop = "soft stop",
  commandComplete = "command complete",
}
export type WorkerCallback = (err: any, result?: any) => any;

