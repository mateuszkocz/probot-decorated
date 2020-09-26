export interface InjectableArgumentProperties<
  Name extends string | symbol = string | symbol
> {
  readonly name: Name
  readonly index: number
}
