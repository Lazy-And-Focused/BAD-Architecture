import { Validators } from "./config.types";
import {
  validateString as validateExpirationString,
} from "@/services";

export const VALIDATORS: Validators = {
  TOKEN_EXPIRATION: validateExpirationString,
};
