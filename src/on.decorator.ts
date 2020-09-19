import { REGISTRABLE_PROPERTIES_METADATA_KEY } from "./constants"
import { OnProperties } from "./on-properties.interface"

export const On = (event: OnProperties["event"]): MethodDecorator => {
  return (target, property): void => {
    const properties: OnProperties[] = [
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
