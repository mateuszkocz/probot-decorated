import { REGISTRABLE_ROUTES_METADATA_KEY } from "../common/constants"
import { HttpWord } from "./http-word.type"
import { RegistrableRouteProperties } from "./registrable-route-properties.interface"

const createRouteDecorator = (
  word: HttpWord
): ((path: string) => MethodDecorator) => {
  return (path: string) => (target, property) => {
    const registrableRoutes: RegistrableRouteProperties[] = [
      ...(Reflect.getMetadata(REGISTRABLE_ROUTES_METADATA_KEY, target) ?? []),
      { word, path, property },
    ]
    Reflect.defineMetadata(
      REGISTRABLE_ROUTES_METADATA_KEY,
      registrableRoutes,
      target
    )
  }
}
export const Get = createRouteDecorator("get")
export const Post = createRouteDecorator("post")
export const Put = createRouteDecorator("put")
export const Patch = createRouteDecorator("patch")
export const Delete = createRouteDecorator("delete")
