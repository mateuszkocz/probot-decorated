import { ARGUMENTS_METADATA_KEY } from "./constants"

type ParamDecoratorCreator = () => ParameterDecorator
const createParamInjectionDecorator = (name: string): ParamDecoratorCreator => {
  return () => (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const params = [
      ...(Reflect.getMetadata(ARGUMENTS_METADATA_KEY, target, propertyKey) ??
        []),
      { name, index: parameterIndex },
    ]
    Reflect.defineMetadata(ARGUMENTS_METADATA_KEY, params, target, propertyKey)
  }
}
export const Context = createParamInjectionDecorator("context")
export const Log = createParamInjectionDecorator("log")
export const GitHub = createParamInjectionDecorator("github")
export const Id = createParamInjectionDecorator("id")
export const Name = createParamInjectionDecorator("name")
export const Payload = createParamInjectionDecorator("payload")
export const Event = createParamInjectionDecorator("event")
export const IsBot = createParamInjectionDecorator("isBot")
export const Config = createParamInjectionDecorator("config")
export const Issue = createParamInjectionDecorator("issue")
export const PullRequest = createParamInjectionDecorator("pullRequest")
export const Repo = createParamInjectionDecorator("repo")
export const CommandValue = createParamInjectionDecorator("command")
