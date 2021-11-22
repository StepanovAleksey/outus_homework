import { Worker } from "worker_threads";
import { uuid } from "uuidv4";
import {
  AbstractCommandHandler,
  ECommandType,
  ErrorCommand,
  EStatusProcess,
  ESystemCommandType,
  IChildWorker,
  ICommand,
} from "./models";
import { BaseWorkerModel } from "./shared";

const workerPathJS = "./build/home_2/childProcess.js";

type collbackCommand = (command: ICommand) => any;

class HandleChildCommand extends AbstractCommandHandler<OwnerProcessModel> {
  commandTypes = [ECommandType.info, ECommandType.code];
  handle(command: ICommand<string>) {
    this.targetObject.pushChildProcessCommand(command);
  }
}

class HandleErrorCommand extends AbstractCommandHandler<OwnerProcessModel> {
  commandTypes = [ECommandType.error];

  handle(command: ICommand<string>) {
    console.info("process has error:", command.payload);
    this.targetObject.completedCommand(command.uid);
  }
}

class HandleSystemCommand extends AbstractCommandHandler<OwnerProcessModel> {
  commandTypes = [ECommandType.system];
  handle(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.hardStop:
      case ESystemCommandType.softStop:
        this.targetObject.pushChildProcessCommand(command);
        break;
      case ESystemCommandType.start:
        this.targetObject.runWorker();
        break;
      case ESystemCommandType.isStarted:
        this.targetObject.childWorker.status = EStatusProcess.worked;
        break;
      case ESystemCommandType.childStopped:
        this.targetObject.childWorker.status = EStatusProcess.stopped;
        break;
    }
    this.targetObject.systemCollbacks[command.payload]?.forEach((collback) =>
      collback(command)
    );
    this.targetObject.completedCommand(command.uid);
  }
}

export class OwnerProcessModel extends BaseWorkerModel {
  childWorker: IChildWorker = {
    status: EStatusProcess.unknown,
    workerRef: null,
  };
  systemCollbacks: { [key in ESystemCommandType]?: collbackCommand[] } = {};

  constructor() {
    super();
    this.handlers.push(
      new HandleSystemCommand(this),
      new HandleErrorCommand(this),
      new HandleChildCommand(this)
    );
  }

  public registerCommand(command: ICommand) {
    command.uid = command.uid || uuid();
    super.registerCommand(command);
  }

  public addSystemMsgCollback(
    type: ESystemCommandType,
    collback: collbackCommand
  ) {
    if (!this.systemCollbacks[type]) {
      this.systemCollbacks[type] = [];
    }
    this.systemCollbacks[type].push(collback);
  }

  public completedCommand(commandUId: string) {
    const indexCommand = this.allCommands.findIndex(
      (c) => c.uid === commandUId
    );
    this.allCommands.splice(indexCommand, 1);
  }
  public runWorker() {
    const worker = new Worker(workerPathJS);

    worker.on("message", this.registerCommand.bind(this));
    worker.on("error", this.registerCommand.bind(this));

    worker.on("exit", (exitCode) => {
      if (exitCode === 0) {
        this.childWorker.status = EStatusProcess.stopped;
        return null;
      }
      this.childWorker.status = EStatusProcess.error;
      return this.registerCommand(
        new ErrorCommand(`worker is error stopped. exitCode: ${exitCode}`)
      );
    });
    this.childWorker.status = EStatusProcess.worked;
    this.childWorker.workerRef = worker;
    return worker;
  }

  public pushChildProcessCommand(command: ICommand) {
    this.childWorker.workerRef?.postMessage(command);
  }
}
