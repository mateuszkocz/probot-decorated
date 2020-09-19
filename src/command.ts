import { REGISTRABLE_COMMANDS_METADATA_KEY } from "./constants"

export function Command(command: string,): MethodDecorator {
  return (target, property, propertyDescriptor) => {
    const registerables = [
      ...(Reflect.getMetadata(
        REGISTRABLE_COMMANDS_METADATA_KEY,
        target
      ) ?? []),
      {command, property},
    ]
    Reflect.defineMetadata(
      REGISTRABLE_COMMANDS_METADATA_KEY,
      registerables,
      target
    )
  }
}
