import type { <%= classify(name) %> } from "v1/types/<%= name %>.types";

export class <%= classify(name) %>UpdateDto implements Partial<<%= classify(name) %>> {

}