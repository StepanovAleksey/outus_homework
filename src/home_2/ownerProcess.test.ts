import { ECommandType, ESystemCommandType } from "./models";
import { OwnerProcessModel } from "./ownerProcess";

const ownerProcess = new OwnerProcessModel();
console.log("ssa");
ownerProcess.addCommand({
  type: ECommandType.system,
  payload: ESystemCommandType.start,
});

ownerProcess.addCommand({
  type: ECommandType.info,
  payload: "ha ha ha 1234",
});
ownerProcess.addCommand({
  type: ECommandType.info,
  payload: "ha ha ha 1234",
});
ownerProcess.addCommand({
  type: ECommandType.info,
  payload: "ha ha ha 1234",
});
