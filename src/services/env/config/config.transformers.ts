import { logger } from "@/services";
import { AUTH_DATA, REQUIRED_VALUES, UNIQUE_VALUES } from "./config.constants";
import { AuthTypes } from "@/v1/types";
import { AuthData } from "./config.types";
import { VALIDATORS } from "./config.validators";

type ErrorTransformerParameters = {
  error: unknown;
  property: string;
  value?: string;
}

type PropertiesInterface = readonly string[];

type FormatterParameters<
  Properties extends PropertiesInterface,
  Value = string,
  PropertyTransformerReturn extends string = Properties[number]
> = {
  properties: Properties;
  propertyTransformer: (property: Properties[number]) => PropertyTransformerReturn,
  valueTransformer: (value: string|undefined, key: PropertyTransformerReturn) => Value,
  errorTransformer: (parameters: ErrorTransformerParameters) => Error
}

export const formatProperties = <
  Properties extends PropertiesInterface,
  Value = string,
  PropertyTransformerReturn extends string = Properties[number],
  RecordObject extends Record<PropertyTransformerReturn, Value> = Record<PropertyTransformerReturn, Value>
>({
  properties,
  propertyTransformer,
  valueTransformer,
  errorTransformer
}: FormatterParameters<Properties, Value, PropertyTransformerReturn>) => {
  let errorAppeared: boolean = false;

  const entries = properties.map(property => {
    const key = propertyTransformer(property as Properties[number]);

    try {
      const value = valueTransformer(process.env[key], key);

      return [key, value] as const;
    } catch (err) {
      errorAppeared = true;

      const error = logger.error(errorTransformer({
        error: err,
        property,
        value: process.env[key]
      })).base.join("\n");

      return [key, error] as [PropertyTransformerReturn, Value];
    };
  });

  const data = Object.fromEntries(entries) as {
    [P in PropertyTransformerReturn]: RecordObject[P]
  };
  return {
    errorAppeared,
    data
  };
}

export const defaultValueTransformer = (value?: string) => {
  if (!value) {
    throw new Error("value is not defined");
  }

  return value;
}

const transformAuthTypes = (data: AuthData) => {
  const properties = Object.keys(AuthTypes) as AuthTypes[];
  return formatProperties({
    properties,
    propertyTransformer: (property) => `${property.toUpperCase()}_${data}` as `${Uppercase<typeof property>}_${typeof data}`,
    valueTransformer: defaultValueTransformer,
    errorTransformer: ({ property }) => new Error(`Auth data ${data} for type ${property} is not defined in env`)
  });
}

export const transformAuthData = () => {
  let errorAppeared: boolean = false;

  const { data } = AUTH_DATA.map(data => {
    return transformAuthTypes(data);
  }).reduce((previous, current) => {
    errorAppeared = previous.errorAppeared || current.errorAppeared;
    return {
      errorAppeared,
      data: {
        ...previous.data,
        ...current.data
      }
    }
  });

  return {
    data,
    errorAppeared
  }
};

export const transformRequired = () => {
  return formatProperties({
    properties: REQUIRED_VALUES,
    propertyTransformer: p => p,
    valueTransformer: defaultValueTransformer,
    errorTransformer: ({ property }) => new Error(`Key ${property} is not defined in env`)
  });
}

export const transformUnique = () => {
  return formatProperties({
    properties: UNIQUE_VALUES,
    propertyTransformer: p => p,
    valueTransformer: (value, key) => VALIDATORS[key](value),
    errorTransformer: ({ error }) => new Error(String(error))
  });
}