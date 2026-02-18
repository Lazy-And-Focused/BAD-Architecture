import { MODES, ALIASES } from "./programm-mode.constants";

const aliases = Object.keys(ALIASES);

export const isAlias = (value: string): boolean => {
  return aliases.includes(value);
}

export const isMode = (value: string): boolean => {
  return (MODES as readonly string[]).includes(value);
}
