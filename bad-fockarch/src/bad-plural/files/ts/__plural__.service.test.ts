import type { <%= classify(name) %>CreateDto, <%= classify(name) %>UpdateDto } from "./dto";

import { Test, TestingModule } from "@nestjs/testing";
import { <%= classify(plural) %>Service as Service } from "./<%= plural %>.service";

describe("<%= classify(plural) %> Service", () => {
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
    it("should return an array of <%= plural %>", async () => {
      const result = await service.get();
      expect(result).toEqual([]);
    });
  });

  describe("getOne", () => {
    it("should return a single <%= name %>", async () => {
      const id = "test-id";
      const result = await service.getOne(id);
      expect(result).toEqual({});
    });

    it("should handle non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const result = await service.getOne(id);
      expect(result).toEqual({});
    });
  });

  describe("post", () => {
    it("should create a new <%= name %>", async () => {
      const createDto: <%= classify(name) %>CreateDto = {
        // заполните поля в соответствии с вашим DTO
      };
      
      const result = await service.post(createDto);
      expect(result).toEqual({});
    });

    it("should validate creation data", async () => {
      const invalidDto = {} as <%= classify(name) %>CreateDto;
      const result = await service.post(invalidDto);
      expect(result).toEqual({});
    });
  });

  describe("put", () => {
    it("should fully update a <%= name %>", async () => {
      const id = "test-id";
      const updateDto: <%= classify(name) %>UpdateDto = {
        // заполните поля в соответствии с вашим DTO
      };
      
      const result = await service.put(id, updateDto);
      expect(result).toEqual({});
    });

    it("should handle update for non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const updateDto: <%= classify(name) %>UpdateDto = {};
      
      const result = await service.put(id, updateDto);
      expect(result).toEqual({});
    });
  });

  describe("patch", () => {
    it("should partially update a <%= name %>", async () => {
      const id = "test-id";
      const updateDto: <%= classify(name) %>UpdateDto = {
        // заполните только те поля, которые нужно обновить
      };
      
      const result = await service.patch(id, updateDto);
      expect(result).toEqual({});
    });

    it("should handle partial update for non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const updateDto: <%= classify(name) %>UpdateDto = {};
      
      const result = await service.patch(id, updateDto);
      expect(result).toEqual({});
    });
  });

  describe("delete", () => {
    it("should delete a <%= name %>", async () => {
      const id = "test-id";
      const result = await service.delete(id);
      expect(result).toBe("deleted");
    });

    it("should handle deletion of non-existent <%= name %>", async () => {
      const id = "non-existent-id";
      const result = await service.delete(id);
      expect(result).toBe("deleted");
    });
  });
});