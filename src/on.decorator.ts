import { REGISTRABLE_PROPERTIES_METADATA_KEY } from "./constants"
import { RegistrableOnProperties } from "./registrable-on-properties.interface"

export const On = (
  event: RegistrableOnProperties["event"]
): MethodDecorator => {
  return (target, property): void => {
    const properties: RegistrableOnProperties[] = [
      ...(Reflect.getMetadata(REGISTRABLE_PROPERTIES_METADATA_KEY, target) ??
        []),
      { event, property },
    ]
    Reflect.defineMetadata(
      REGISTRABLE_PROPERTIES_METADATA_KEY,
      properties,
      target
    )
  }
}
