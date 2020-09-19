import { ARGUMENTS_METADATA_KEY } from "./constants"

const createParamInjectionDecorator = (name: "request" | "response"): any => {
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
export const Req = createParamInjectionDecorator("request")
export const Res = createParamInjectionDecorator("response")
