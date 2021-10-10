import { Worker } from "worker_threads";
export type typeCommand = ESystemCommandType | string;

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

export enum EStatusProcess {
  unknown = "unknown",
  worked = "worked",
  stopped = "stopped",
  error = "error",
}

export interface ICommand<T = typeCommand> {
  type: ECommandType;
  payload: T;
  uid?: string;
}

class Command<T = typeCommand> implements ICommand<T> {
  constructor(
    public type = ECommandType.info,
    public payload: T,
    public uid = null
  ) {}
}

export class SystemCommand extends Command<ESystemCommandType> {
  constructor(public payload: ESystemCommandType) {
    super(ECommandType.system, payload);
  }
}

export class ErrorCommand extends Command<string> {
  constructor(public payload: string) {
    super(ECommandType.error, payload);
  }
}

export class InfoCommand extends Command<string> {
  constructor(public payload: string) {
    super(ECommandType.info, payload);
  }
}

export class CodeCommand extends Command<string> {
  constructor(public payload: string) {
    super(ECommandType.code, payload);
  }
}

export type WorkerCallback = (err: any, result?: any) => any;

export interface IChildWorker {
  workerRef: Worker;
  status: EStatusProcess;
}
