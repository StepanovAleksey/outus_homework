import { ICommand } from "../home_1/models";
import { EBASE_IOC_COMMAND } from "./const";
import {
  //CreateIocCommand,
  IIoC,
  AddIoCRegisterCommand,
  IoCScopeMacroCommand,
  IoCModel,
  CreateResolveCommand,
} from "./model";

const IoC: IIoC = new IoCModel(null);  

new CreateResolveCommand(IoC).execute();

new AddIoCRegisterCommand(IoC).execute();

IoC.Resolve<ICommand>(
  EBASE_IOC_COMMAND["IoC.Register"],
  "summ",
  function (...args) {
    return { result: args.reduce((a, b) => a + b, 0) };
  }
).execute();

const singlToneObj = { a: "a", b: "b" };

IoC.Resolve<ICommand>(
  EBASE_IOC_COMMAND["IoC.Register"],
  "singlTone",
  function () {
    return singlToneObj;
  }
).execute();

const test1 = IoC.Resolve<object>("summ", 1, 2, 3, 4, 5);
const test2 = IoC.Resolve<object>("singlTone");

new IoCScopeMacroCommand(IoC).execute();
IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.New"], "test1").execute();
IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.New"], "test2").execute();

IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test1").execute();

IoC.Resolve<ICommand>(
  EBASE_IOC_COMMAND["IoC.Register"],
  "summ",
  function (...args) {
    return { result: args.reduce((a, b) => a + b, 10) };
  }
).execute();

IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "parent").execute();
IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test2").execute();

IoC.Resolve<ICommand>(
  EBASE_IOC_COMMAND["IoC.Register"],
  "summ",
  function (...args) {
    return { result: args.reduce((a, b) => a + b, 20) };
  }
).execute();
const test4 = IoC.Resolve<object>("summ", 1, 2, 3, 4, 5);
console.log(test4);

IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "parent").execute();
IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test1").execute();
const test3 = IoC.Resolve<object>("summ", 1, 2, 3, 4, 5);
console.log(test3);
