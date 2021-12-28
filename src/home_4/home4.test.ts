import { ICommand } from "../home_1/models";
import { EBASE_IOC_COMMAND } from "./const";
import {
  //CreateIocCommand,
  IIoC,
  AddIoCRegisterCommand,
  IoCScopeMacroCommand as AddIoCScopeMacroCommand,
  IoCModel,
  SetResolveContextCommand,
} from "./model";

const IoC: IIoC = new IoCModel(null);
new SetResolveContextCommand(IoC).execute();
new AddIoCRegisterCommand(IoC).execute();

test("test register IoC", () => {
  IoC.Resolve<ICommand>(
    EBASE_IOC_COMMAND["IoC.Register"],
    "summ",
    function (...args) {
      return args.reduce((a, b) => a + b, 0);
    }
  ).execute();
  expect(IoC.Resolve<object>("summ", 1, 2, 3, 4, 5)).toEqual(15);
});

test("test scope IoC", () => {
  new AddIoCScopeMacroCommand(IoC).execute();

  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.New"], "test1").execute();
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.New"], "test2").execute();
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test1").execute();
  IoC.Resolve<ICommand>(
    EBASE_IOC_COMMAND["IoC.Register"],
    "summ",
    function (...args) {
      return args.reduce((a, b) => a + b, 10);
    }
  ).execute();
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "parent").execute();
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test2").execute();
  IoC.Resolve<ICommand>(
    EBASE_IOC_COMMAND["IoC.Register"],
    "summ",
    function (...args) {
      return args.reduce((a, b) => a + b, 20);
    }
  ).execute();
  expect(IoC.Resolve<object>("summ", 1, 2, 3, 4, 5)).toEqual(35);
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "parent").execute();
  IoC.Resolve<ICommand>(EBASE_IOC_COMMAND["Scope.Current"], "test1").execute();
  expect(IoC.Resolve<object>("summ", 1, 2, 3, 4, 5)).toEqual(25);
});
