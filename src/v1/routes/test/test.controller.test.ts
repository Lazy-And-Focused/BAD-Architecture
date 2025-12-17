import type { App } from "supertest/types";
import type { INestApplication } from "@nestjs/common";
import { ThrottlerStorage } from "@nestjs/throttler";

import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";

import { Controller } from "./test.controller";
import { ROUTE, ROUTES } from "./test.routes";

import { urlize } from "#constants";
import v1Module from "v1/v1.module";

const toUrl = urlize({ version: "v1", route: ROUTE });

describe(ROUTE + " controller", () => {
  let controller: Controller;
  let app: INestApplication<App>;
  let throttlerStorage: ThrottlerStorage;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [Controller],
    }).compile();

    controller = moduleRef.get(Controller);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [v1Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    throttlerStorage = app.get(ThrottlerStorage);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET " + ROUTES.GET, () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and hello string", () => {
      return request(app.getHttpServer())
        .get(toUrl(ROUTES.GET))
        .expect(200)
        .expect("Hi from guarded test");
    });

    it("should return 429", async () => {
      jest.spyOn(throttlerStorage, "increment").mockResolvedValue({
        totalHits: 10,
        isBlocked: true,
        timeToBlockExpire: 20000,
        timeToExpire: 0,
      });

      return request(app.getHttpServer()).get(toUrl(ROUTES.GET)).expect(429);
    });
  });

  describe("GET " + ROUTES.GET_PUBLIC, () => {
    it("should return hello string", () => {
      const result = "Hi from public test";
      expect(controller.getPublic()).toBe(result);
    });
  });
});
