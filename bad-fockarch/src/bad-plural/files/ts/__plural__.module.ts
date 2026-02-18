import { Module } from "@nestjs/common";

import { <%= classify(plural) %>Controller } from "./<%= plural %>.controller";
import { <%= classify(plural) %>Service } from "./<%= plural %>.service";

@Module({
  imports: [],
  controllers: [<%= classify(plural) %>Controller],
  providers: [<%= classify(plural) %>Service]
})
export class <%= classify(plural) %>Module {}

export default <%= classify(plural) %>Module;
