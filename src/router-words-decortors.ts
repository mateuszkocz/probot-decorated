import { REGISTRABLE_ROUTES_METADATA_KEY } from "./constants"

const createRouteDecorator = (
  word: "get" | "post" | "put" | "patch" | "delete"
): ((path: string) => MethodDecorator) => {
  return (path: string) => (target, property, propertyDescriptior) => {
    const registrables = [
      ...(Reflect.getMetadata(REGISTRABLE_ROUTES_METADATA_KEY, target) ?? []),
      { word, path, property },
    ]
    Reflect.defineMetadata(
      REGISTRABLE_ROUTES_METADATA_KEY,
      registrables,
      target
    )
  }
}
export const Get = createRouteDecorator("get")
export const Post = createRouteDecorator("post")
export const Put = createRouteDecorator("put")
export const Patch = createRouteDecorator("patch")
export const Delete = createRouteDecorator("delete")
