import type { <%= classify(name) %> } from "v1/types/<%= name %>.types";

import { ApiProperty } from "@nestjs/swagger";

export class <%= classify(name) %>UpdateDto implements Partial<<%= classify(name) %>> {

}