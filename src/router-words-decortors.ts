import { REGISTRABLE_ROUTES_METADATA_KEY } from "./constants"
import { HttpWord } from "./http-word.type"
import { InjectableRouterArgumentProperties } from "./injectable-router-argument-properties.interface"

const createRouteDecorator = (
  word: HttpWord
): ((path: string) => MethodDecorator) => {
  return (path: string) => (target, property) => {
    const injectableRouterArgumentProperties: InjectableRouterArgumentProperties[] = [
      ...(Reflect.getMetadata(REGISTRABLE_ROUTES_METADATA_KEY, target) ?? []),
      { word, path, property },
    ]
    Reflect.defineMetadata(
      REGISTRABLE_ROUTES_METADATA_KEY,
      injectableRouterArgumentProperties,
      target
    )
  }
}
export const Get = createRouteDecorator("get")
export const Post = createRouteDecorator("post")
export const Put = createRouteDecorator("put")
export const Patch = createRouteDecorator("patch")
export const Delete = createRouteDecorator("delete")
