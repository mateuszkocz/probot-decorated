export interface UserProvidedFeature {
  new (): Record<string | symbol, (...args: unknown[]) => unknown>
}
