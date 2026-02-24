import { ALIASES, MODES } from "./programm-mode.constants";

export type Alias = keyof typeof ALIASES;
export type Mode = (typeof MODES)[number];
export type NotAliasMode = Exclude<Mode, Alias>;
