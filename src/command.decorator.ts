import { REGISTRABLE_COMMANDS_METADATA_KEY } from "./constants"

export const Command = (command: string): MethodDecorator => (
  target,
  property
): void => {
  const properties = [
    ...(Reflect.getMetadata(REGISTRABLE_COMMANDS_METADATA_KEY, target) ?? []),
    { command, property },
  ]
  Reflect.defineMetadata(REGISTRABLE_COMMANDS_METADATA_KEY, properties, target)
}
