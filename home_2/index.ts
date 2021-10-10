import { Worker } from "worker_threads";
import { uuid } from "uuidv4";

import path from "path";
import {
  ECommandType,
  ESystemCommandType,
  ICommand,
  WorkerCallback,
} from "./models";

const workerPathTS = "./worker.ts";

require("ts-node").register();
require(path.resolve(__dirname, workerPathTS));

const allCommands: ICommand[] = [];

let childWorker: Worker = null;

function runWorker(path: string, cb: WorkerCallback) {
  const worker = new Worker(path, {
    workerData: {
      path: workerPathTS,
    },
  });

  worker.on("message", cb.bind(null));
  worker.on("error", cb);

  worker.on("exit", (exitCode) => {
    if (exitCode === 0) {
      childWorker = null;
      console.log(
        "завершение процесса! не обработанных комманд: ",
        allCommands.length
      );
      return null;
    }
    return cb(new Error(`Worker has stopped with code ${exitCode}`));
  });

  return worker;
}

function collbackWorkerMsg(command: ICommand) {
  switch (command.type) {
    case ECommandType.system:
      if (command.payload === ESystemCommandType.commandComplete) {
        const finfIndex = allCommands.findIndex((c) => c.uid === command.uid);
        allCommands.splice(finfIndex, 1);
      }
      break;
    case ECommandType.error:
      console.error("child process error:", command.payload);
      break;
  }
}

function handlerSystemCommand(command: ICommand<ESystemCommandType>) {
  switch (command.payload) {
    case ESystemCommandType.start:
      childWorker = runWorker("./worker.js", collbackWorkerMsg);
      break;
    case ESystemCommandType.softStop:
      pushChildProcessCommand(command);
      break;
    case ESystemCommandType.hardStop:
      childWorker.unref();
      console.log("hardStop! не обработанных комманд: ", allCommands.length);
      childWorker = null;
      break;
  }
}

function pushChildProcessCommand(command: ICommand) {
  allCommands.push(command);
  childWorker?.postMessage(command);
}

function addCommand(command: ICommand) {
  command.uid = command.uid || uuid();
  switch (command.type) {
    case ECommandType.system:
      handlerSystemCommand(command as ICommand<ESystemCommandType>);
      break;
    default:
      pushChildProcessCommand(command);
      break;
  }
}

addCommand({
  type: ECommandType.system,
  payload: ESystemCommandType.start,
});

for (let index = 0; index < 10; index++) {
  addCommand({
    type: ECommandType.info,
    payload: "task_" + index,
  });
}

addCommand({
  type: ECommandType.code,
  payload: "console.log('проверка кода 1')",
});

addCommand({
  type: ECommandType.system,
  payload: ESystemCommandType.softStop,
});
