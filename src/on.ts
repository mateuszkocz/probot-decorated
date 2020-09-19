import { REGISTRABLE_PROPERTIES_METADATA_KEY } from "./constants"

export function On(event: string): MethodDecorator {
  return <T>(
    target: any,
    property: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    const registerables = [
      ...(Reflect.getMetadata(
        REGISTRABLE_PROPERTIES_METADATA_KEY,
        target
      ) ?? []),
      {event, property},
    ]
    Reflect.defineMetadata(
      REGISTRABLE_PROPERTIES_METADATA_KEY,
      registerables,
      target
    )
  }
}
