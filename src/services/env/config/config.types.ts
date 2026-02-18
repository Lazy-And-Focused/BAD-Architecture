import type { AuthTypes } from "@1/types";
import type { StringValue } from "@/services";

import { ALL_VALUES, AUTH_DATA, REQUIRED_VALUES } from "./config.constants";

export type AuthData = (typeof AUTH_DATA)[number];

export type UniqueProperties = {
  TOKEN_EXPIRATION: StringValue;
};

export type RequiredProperties =
  | (typeof REQUIRED_VALUES)[number]
  | `${Uppercase<AuthTypes>}_${AuthData}`;

export type AllProperties = (typeof ALL_VALUES)[number];
export type UssualyProperties = Exclude<AllProperties, keyof UniqueProperties>;
export type PartialProperties = Exclude<AllProperties, RequiredProperties>;

export type Env = Record<UssualyProperties, string> & UniqueProperties;

export type Validators = {
  [P in keyof UniqueProperties]: (value?: string) => UniqueProperties[P];
};
