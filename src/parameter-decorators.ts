import { ARGUMENTS_METADATA_KEY } from "./constants"
import { InjectableArgumentName } from "./injectable-keys.type"
import { InjectableArgumentProperties } from "./injectable-argument-properties.interface"

type ParamDecoratorCreator = () => ParameterDecorator
const createArgumentInjectionDecorator = (
  name: InjectableArgumentName
): ParamDecoratorCreator => {
  return () => (target, propertyKey, parameterIndex) => {
    const injectableArgumentProperties: InjectableArgumentProperties[] = [
      ...(Reflect.getMetadata(ARGUMENTS_METADATA_KEY, target, propertyKey) ??
        []),
      { name, index: parameterIndex },
    ]
    Reflect.defineMetadata(
      ARGUMENTS_METADATA_KEY,
      injectableArgumentProperties,
      target,
      propertyKey
    )
  }
}
export const Context = createArgumentInjectionDecorator("context")
export const Log = createArgumentInjectionDecorator("log")
export const GitHub = createArgumentInjectionDecorator("github")
export const Id = createArgumentInjectionDecorator("id")
export const Name = createArgumentInjectionDecorator("name")
export const Payload = createArgumentInjectionDecorator("payload")
export const Event = createArgumentInjectionDecorator("event")
export const IsBot = createArgumentInjectionDecorator("isBot")
export const Config = createArgumentInjectionDecorator("config")
export const Issue = createArgumentInjectionDecorator("issue")
export const PullRequest = createArgumentInjectionDecorator("pullRequest")
export const Repo = createArgumentInjectionDecorator("repo")
export const CommandValue = createArgumentInjectionDecorator("command")
