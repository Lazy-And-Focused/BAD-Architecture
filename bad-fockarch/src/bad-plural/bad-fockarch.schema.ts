import type { Path } from "@angular-devkit/core";

export interface Schema {
  /**
   * The name of the pipe.
   */
  name: string;
  /**
   * The plural name of the pipe.
   */
  plural: string;
  /**
   * The constant name of the pipe.
   */
  constant: string;
  /**
   * The path to create the pipe.
   */
  path?: string | Path;
  /**
   * Application language.
   */
  language?: string;
  /**
   * The source root path
   */
  sourceRoot?: string;
  /**
   * Specifies if a spec file is generated.
   */
  spec?: boolean;
  /**
   * Specifies the file suffix of spec files.
   * @default "test"
   */
  specFileSuffix?: string;
  /**
   * Flag to indicate if a directory is created.
   */
  flat?: boolean;
}
