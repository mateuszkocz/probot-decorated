import { HttpWord } from "./http-word.type"

export interface InjectableRouterArgumentProperties {
  readonly word: HttpWord
  readonly path: string
  readonly index: number
}
