import type { <%= classify(name) %>CreateDto, <%= classify(name) %>UpdateDto } from "./dto";
import type { <%= classify(name) %> } from "@1/entities";

import { Injectable } from "@nestjs/common";

@Injectable()
export class <%= classify(plural) %>Service {
  public async get(): Promise<<%= classify(name) %>[]> {
    return [];
  }

  public async getOne(id: string): Promise<<%= classify(name) %>> {
    return {};
  }

  public async post(data: <%= classify(name) %>CreateDto): Promise<<%= classify(name) %>> {
    return {};
  }

  public async put(id: string, data: <%= classify(name) %>UpdateDto): Promise<<%= classify(name) %>> {
    return {};
  }

  public async patch(id: string, data: <%= classify(name) %>UpdateDto): Promise<<%= classify(name) %>> {
    return {};
  }

  public async delete(id: string): Promise<string> {
    return "deleted";
  }
}

export default <%= classify(plural) %>Service;
