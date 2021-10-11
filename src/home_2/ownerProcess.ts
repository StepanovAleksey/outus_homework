import { Worker } from "worker_threads";
import { uuid } from "uuidv4";
import {
  ErrorCommand,
  EStatusProcess,
  ESystemCommandType,
  IChildWorker,
  ICommand,
} from "./models";
import { BaseWorkerModel } from "./shared";

const workerPathJS = "./build/home_2/childProcess.js";

export class OwnerProcessModel extends BaseWorkerModel {
  childWorker: IChildWorker = {
    status: EStatusProcess.unknown,
    workerRef: null,
  };

  protected handleErrorCommand(command: ICommand<string>) {
    console.error(command.payload);
  }

  protected handleSystemCommand(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.start:
        this.childWorker.workerRef = this.runWorker();
        this.childWorker.status = EStatusProcess.worked;
        break;
      case ESystemCommandType.softStop:
        this.pushChildProcessCommand(command);
        break;
      case ESystemCommandType.hardStop:
        this.childWorker.workerRef.unref();
        this.childWorker.workerRef = null;
        this.childWorker.status = EStatusProcess.stopped;
        break;
      case ESystemCommandType.commandComplete:
        const indexCommand = this.allCommands.findIndex(
          (c) => c.uid === command.uid
        );
        this.allCommands.splice(indexCommand, 1);
        break;
    }
  }

  protected handleInfoCommand(command: ICommand<string>) {
    this.pushChildProcessCommand(command);
  }

  protected handleCodeCommand(command: ICommand<string>) {
    this.pushChildProcessCommand(command);
  }

  public addCommand(command: ICommand) {
    command.uid = command.uid || uuid();
    this.registerCommand(command);
  }

  private runWorker() {
    const worker = new Worker(workerPathJS);

    worker.on("message", this.collbackWorkerMsg.bind(this));
    worker.on("error", this.collbackWorkerMsg.bind(this));

    worker.on("exit", (exitCode) => {
      this.childWorker = null;
      if (exitCode === 0) {
        return null;
      }
      return this.collbackWorkerMsg(
        new ErrorCommand("worker is error stopped")
      );
    });

    return worker;
  }
  private collbackWorkerMsg(command: ICommand) {
    this.registerCommand(command);
  }
  private pushChildProcessCommand(command: ICommand) {
    this.childWorker.workerRef?.postMessage(command);
  }
}
