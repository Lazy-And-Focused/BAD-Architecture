import type {
  <%= classify(name) %>CreateDto,
  <%= classify(name) %>UpdateDto
} from "./dto";

import { <%= classify(name) %>Service as Service } from "./<%= name %>.service";
import { Test, TestingModule } from "@nestjs/testing";

describe("<%= classify(name) %> Service", () => {
  let service: Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Service],
    }).compile();

    service = module.get<Service>(Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should return an array of <%= name %>", async () => {
      const result = await service.get();
      expect(result).to.deep.equal([]);
    });
  });

  describe("getOne", () => {
    it("should return a single <%= name %>", async () => {
      const id = "test-id";
      const result = await service.getOne(id);
      expect(result).to.deep.equal({});
    });

    it("should handle non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const result = await service.getOne(id);
      expect(result).to.deep.equal({});
    });
  });

  describe("post", () => {
    it("should create a new <%= name %>", async () => {
      const createDto: <%= classify(name) %>CreateDto = {
        // fill fields according to your DTO
      };
      
      const result = await service.post(createDto);
      expect(result).to.deep.equal({});
    });

    it("should validate creation data", async () => {
      const invalidDto = {} as <%= classify(name) %>CreateDto;
      const result = await service.post(invalidDto);
      expect(result).to.deep.equal({});
    });
  });

  describe("put", () => {
    it("should fully update a <%= name %>", async () => {
      const id = "test-id";
      const updateDto: <%= classify(name) %>UpdateDto = {
        // fill fields according to your DTO
      };
      
      const result = await service.put(id, updateDto);
      expect(result).to.deep.equal({});
    });

    it("should handle update for non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const updateDto: <%= classify(name) %>UpdateDto = {};
      
      const result = await service.put(id, updateDto);
      expect(result).to.deep.equal({});
    });
  });

  describe("patch", () => {
    it("should partially update a <%= name %>", async () => {
      const id = "test-id";
      const updateDto: <%= classify(name) %>UpdateDto = {
        // fill only fields to be updated
      };
      
      const result = await service.patch(id, updateDto);
      expect(result).to.deep.equal({});
    });

    it("should handle partial update for non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const updateDto: <%= classify(name) %>UpdateDto = {};
      
      const result = await service.patch(id, updateDto);
      expect(result).to.deep.equal({});
    });
  });

  describe("delete", () => {
    it("should delete a <%= name %>", async () => {
      const id = "test-id";
      const result = await service.delete(id);
      expect(result).to.equal("deleted");
    });

    it("should handle deletion of non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const result = await service.delete(id);
      expect(result).to.equal("deleted");
    });
  });
});