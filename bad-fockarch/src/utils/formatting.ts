const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
const STRING_SPACE_REGEXP = /\s/g;

/**
 *
 * @param input
 * @returns formated string
 * @description normalizes input to supported path and file name format.
 * Changes camelCase strings to kebab-case, replaces spaces with dash and keeps underscores.
 */
export function convertToKebabCase(input: string) {
  return input
    ?.trim()
    ?.replace(STRING_DECAMELIZE_REGEXP, "$1-$2")
    ?.toLowerCase()
    ?.replace(STRING_SPACE_REGEXP, "-");
}

/**
 * Converts a string to CONSTANT_CASE format.
 *
 * @param input - The input string to normalize.
 * @returns The string transformed to CONSTANT_CASE.
 * @description Normalizes input to a valid CONSTANT_CASE format.
 * Changes camelCase strings to snake_case, replaces spaces with underscores,
 * and converts all letters to uppercase.
 */
export function convertToConstantCase(input: string): string {
  return input
    ?.trim()
    ?.replace(STRING_DECAMELIZE_REGEXP, "$1_$2")
    ?.toUpperCase()
    ?.replace(STRING_SPACE_REGEXP, "_");
}

/**
 * Pluralizes a given noun.
 *
 * @param name - The noun to pluralize.
 * @returns The plural form of the noun.
 * @description Converts a singular noun to its plural form following basic English pluralization rules:
 * - If the word ends with a consonant + "y", replace "y" with "ies".
 * - If the word ends with "s", "x", "z", "ch", or "sh", add "es".
 * - Otherwise, add "s".
 */
export function pluralize(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return name;
  }

  if (
    trimmed.endsWith("y") &&
    !trimmed.endsWith("ay") &&
    !trimmed.endsWith("ey") &&
    !trimmed.endsWith("iy") &&
    !trimmed.endsWith("oy") &&
    !trimmed.endsWith("uy")
  ) {
    return trimmed.slice(0, -1) + "ies";
  }

  if (
    trimmed.endsWith("s") ||
    trimmed.endsWith("x") ||
    trimmed.endsWith("z") ||
    trimmed.endsWith("ch") ||
    trimmed.endsWith("sh")
  ) {
    return trimmed + "es";
  }

  return trimmed + "s";
}
