import { parentPort } from "worker_threads";
import { ICommand, ESystemCommandType } from "./models";
import { BaseWorkerModel } from "./shared";

class ChildWorkerModel extends BaseWorkerModel {
  isSoftStop = false;
  protected handleInfoCommand(command: ICommand<string>) {
    throw new Error("Method not implemented.");
  }
  protected handleErrorCommand(command: ICommand<string>) {
    throw new Error("Method not implemented.");
  }
  protected handleSystemCommand(command: ICommand<ESystemCommandType>) {
    throw new Error("Method not implemented.");
  }
  protected handleCodeCommand(command: ICommand<string>) {
    throw new Error("Method not implemented.");
  }
}
const childWorker = new ChildWorkerModel();
parentPort.on("message", (command) => {
  commands.push(command);
  if (!isEvolveCommand) {
    const nextCommand = commands.shift();
    evolveCommand(nextCommand);
  }
});

function evolveSystemCommand(command) {
  switch (command.payload) {
    case "soft stop":
      isSoftStop = true;
  }
}

function evolveCommand(command) {
  isEvolveCommand = true;
  try {
    switch (command.type) {
      case "info":
        console.log("child process info:", command.payload);
        break;
      case "code":
        eval(command.payload);
        break;
      case "system":
        evolveSystemCommand(command);
        break;
    }
    parentCmpleteCommandMessage(command.uid);
  } catch (error) {
    parentErrorMessage(`child process  error: ${error}`, command.uid);
  } finally {
    isEvolveCommand = false;
    const nextCommand = commands.shift();
    if (nextCommand) {
      evolveCommand(nextCommand);
    } else if (isSoftStop) {
      process.exit(0);
    }
  }
}

function parentPostMessage(message) {
  const postMessage = {
    type: "info",
    payload: message,
  };
  parentPort.postMessage(postMessage);
}

function parentCmpleteCommandMessage(commandUId) {
  const postMessage = {
    type: "system",
    payload: "command complete",
    uid: commandUId,
  };
  parentPort.postMessage(postMessage);
}

function parentErrorMessage(error, commandUId) {
  const postMessage = {
    type: "error",
    payload: error,
    uid: commandUId,
  };
  parentPort.postMessage(postMessage);
}
