import { ARGUMENTS_METADATA_KEY } from "../common/constants"
import { InjectableArgumentProperties } from "../common/injectable-argument-properties.interface"

type ParamDecoratorCreator = () => ParameterDecorator
const createArgumentInjectionDecorator = (
  name: string
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

export const Request = createArgumentInjectionDecorator("request")
export const Response = createArgumentInjectionDecorator("response")
