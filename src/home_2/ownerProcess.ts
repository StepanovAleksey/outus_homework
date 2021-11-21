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
type collbackCommand = (command: ICommand) => any;

export class OwnerProcessModel extends BaseWorkerModel {
  childWorker: IChildWorker = {
    status: EStatusProcess.unknown,
    workerRef: null,
  };
  collbacks: { [key in ESystemCommandType]?: collbackCommand[] } = {};

  public registerCommand(command: ICommand) {
    command.uid = command.uid || uuid();
    super.registerCommand(command);
  }

  public addSystemMsgCollback(
    type: ESystemCommandType,
    collback: collbackCommand
  ) {
    if (!this.collbacks[type]) {
      this.collbacks[type] = [];
    }
    this.collbacks[type].push(collback);
  }

  protected handleErrorCommand(command: ICommand<string>) {
    console.info("child process has error:", command.payload);
    this.completedCommand(command.uid);
  }

  protected handleSystemCommand(command: ICommand<ESystemCommandType>) {
    switch (command.payload) {
      case ESystemCommandType.start:
        this.childWorker.workerRef = this.runWorker();
        break;
      case ESystemCommandType.softStop:
        this.pushChildProcessCommand(command);
        break;
      case ESystemCommandType.hardStop:
        this.childWorker.workerRef.unref();
        this.childWorker.workerRef = null;
        this.childWorker.status = EStatusProcess.stopped;
        break;
      case ESystemCommandType.isStarted:
        this.childWorker.status = EStatusProcess.worked;
        break;
    }
    this.collbacks[command.payload]?.forEach((c) => c(command));
    this.completedCommand(command.uid);
  }

  private completedCommand(commandUId: string) {
    const indexCommand = this.allCommands.findIndex(
      (c) => c.uid === commandUId
    );
    this.allCommands.splice(indexCommand, 1);
  }

  protected handleInfoCommand(command: ICommand<string>) {
    this.pushChildProcessCommand(command);
  }

  protected handleCodeCommand(command: ICommand<string>) {
    this.pushChildProcessCommand(command);
  }

  private runWorker() {
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

    return worker;
  }

  private pushChildProcessCommand(command: ICommand) {
    this.childWorker.workerRef?.postMessage(command);
  }

  protected sendParentCommand(command: ICommand) {
    // console.log(`it's owner process! commandUId: `, command.uid);
  }
}
