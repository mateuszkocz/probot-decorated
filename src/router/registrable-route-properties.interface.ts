import { HttpWord } from "./http-word.type"

export interface RegistrableRouteProperties {
  readonly word: HttpWord
  readonly path: string
  readonly property: string | symbol
}
