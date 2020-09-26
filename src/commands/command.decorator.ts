import { REGISTRABLE_COMMANDS_METADATA_KEY } from "../common/constants"
import { RegistrableCommandProperties } from "./registrable-command-properties.interface"

export const Command = (command: string): MethodDecorator => (
  target,
  property
): void => {
  const properties: RegistrableCommandProperties[] = [
    ...(Reflect.getMetadata(REGISTRABLE_COMMANDS_METADATA_KEY, target) ?? []),
    { command, property },
  ]
  Reflect.defineMetadata(REGISTRABLE_COMMANDS_METADATA_KEY, properties, target)
}
