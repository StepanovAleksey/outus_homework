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

class HandleChildCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.info, ECommandType.code];
  handle(command: ICommand<string>) {
    // @ts-ignore
    const self = this as OwnerProcessModel;
    self.pushChildProcessCommand(command);
  }
}

class HandleErrorCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.error];
  handle(command: ICommand<string>) {
    // @ts-ignore
    const self = this as OwnerProcessModel;
    console.info("process has error:", command.payload);
    self.completedCommand(command.uid);
  }
}

class HandleSystemCommand extends AbstractCommandHandler {
  commandTypes = [ECommandType.system];
  handle(command: ICommand<ESystemCommandType>) {
    // @ts-ignore
    const self = this as OwnerProcessModel;
    switch (command.payload) {
      case ESystemCommandType.hardStop:
      case ESystemCommandType.softStop:
        self.pushChildProcessCommand(command);
        break;
      case ESystemCommandType.start:
        self.childWorker.workerRef = self.runWorker();
        break;
      case ESystemCommandType.isStarted:
        self.childWorker.status = EStatusProcess.worked;
        break;
      case ESystemCommandType.childStopped:
        self.childWorker.status = EStatusProcess.stopped;
        break;
    }
    self.systemCollbacks[command.payload]?.forEach((collback) =>
      collback(command)
    );
    self.completedCommand(command.uid);
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
      new HandleSystemCommand(),
      new HandleErrorCommand(),
      new HandleChildCommand()
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
    return worker;
  }

  public pushChildProcessCommand(command: ICommand) {
    this.childWorker.workerRef?.postMessage(command);
  }
}
