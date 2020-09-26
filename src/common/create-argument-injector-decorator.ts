import { InjectableCommandKey } from "../commands/injectable-command-key.type"
import { ARGUMENTS_METADATA_KEY } from "./constants"
import { InjectableArgumentProperties } from "./injectable-argument-properties.interface"
import { InjectableContextKey } from "../webhooks/injectable-context-keys.type"

type ParamDecoratorCreator = () => ParameterDecorator
export const createArgumentInjectionDecorator = (
  name: InjectableContextKey | InjectableCommandKey
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
