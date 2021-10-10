import { Worker } from "worker_threads";
import { uuid } from "uuidv4";
import {
  ECommandType,
  ErrorCommand,
  ESystemCommandType,
  ICommand,
} from "./models";

const workerPathJS = "./build/home_2/childProcess.js";

export class OwnerProcessModel {
  allCommands: ICommand[] = [];
  childWorker: Worker = null;

  public addCommand(command: ICommand) {
    command.uid = command.uid || uuid();
    switch (command.type) {
      case ECommandType.system:
        this.handlerSystemCommand(command as ICommand<ESystemCommandType>);
        break;
      default:
        this.pushChildProcessCommand(command);
        break;
    }
  }

  private runWorker() {
    const worker = new Worker(workerPathJS);

    worker.on("message", this.collbackWorkerMsg.bind(this));
    worker.on("error", this.collbackWorkerMsg.bind(this));

    worker.on("exit", (exitCode) => {
      if (exitCode === 0) {
        this.childWorker = null;
        return null;
      }
      return this.collbackWorkerMsg(
        new ErrorCommand("worker is error stopped")
      );
    });

    return worker;
  }
  private collbackWorkerMsg(command: ICommand) {
    switch (command.type) {
      case ECommandType.system:
        if (command.payload === ESystemCommandType.commandComplete) {
          const finfIndex = this.allCommands.findIndex(
            (c) => c.uid === command.uid
          );
          this.allCommands.splice(finfIndex, 1);
        }
        break;
      case ECommandType.error:
        console.error("child process error:", command.payload);
        break;
    }
  }
  private handlerSystemCommand(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.start:
        this.childWorker = this.runWorker();
        break;
      case ESystemCommandType.softStop:
        this.pushChildProcessCommand(command);
        break;
      case ESystemCommandType.hardStop:
        this.childWorker.unref();
        console.log(
          "hardStop! не обработанных комманд: ",
          this.allCommands.length
        );
        this.childWorker = null;
        break;
    }
  }
  private pushChildProcessCommand(command: ICommand) {
    this.allCommands.push(command);
    this.childWorker?.postMessage(command);
  }
}
