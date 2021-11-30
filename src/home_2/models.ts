import { Worker } from "worker_threads";
import { v4 } from "uuid";

export type typeCommand = any;

export enum ECommandType {
  info = "info",
  code = "code",
  system = "system",
  error = "error",
  completeCommand = "completeCommand",
}

export enum ESystemCommandType {
  start = "start",
  hardStop = "hard stop",
  softStop = "soft stop",
  completeCommand = "command complete",
  isStarted = "isStarted",
  childStopped = "childStopped",
}

export enum EStatusProcess {
  unknown = "unknown",
  worked = "worked",
  stopped = "stopped",
  error = "error",
}
export interface IChildWorker {
  workerRef: Worker;
  status: EStatusProcess;
}

export interface ICommand<T = typeCommand> {
  type: ECommandType;
  payload: T;
  uid?: string;
}

export interface ICommandHandler {
  commandTypes: ECommandType[];
  handle(command: ICommand): void;
  isCommandType: (commandType: ECommandType) => boolean;
}

export abstract class AbstractCommandHandler<T> implements ICommandHandler {
  abstract commandTypes: ECommandType[];

  abstract handle(command: ICommand): void;

  constructor(protected targetObject: T) {}

  isCommandType(commandType: ECommandType) {
    return this.commandTypes.includes(commandType);
  }
}

class Command<T = typeCommand> implements ICommand<T> {
  constructor(
    public type = ECommandType.info,
    public payload: T,
    public uid = v4()
  ) {}
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

export class SystemCommand extends Command<ESystemCommandType> {
  constructor(public payload: ESystemCommandType, uid?: string) {
    super(ECommandType.system, payload, uid);
  }
}

export class CompleteCommand extends SystemCommand {
  constructor(uid: string) {
    super(ESystemCommandType.completeCommand, uid);
  }
}
export class ChildStoppedCommand extends SystemCommand {
  constructor() {
    super(ESystemCommandType.childStopped);
  }
}
