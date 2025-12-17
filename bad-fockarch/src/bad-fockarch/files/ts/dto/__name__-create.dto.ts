import type { <%= classify(name) %> } from "v1/types/<%= name %>.types";

import { ApiProperty } from "@nestjs/swagger";
import {  } from 'class-validator';

export class <%= classify(name) %>CreateDto implements Partial<<%= classify(name) %>> {

}