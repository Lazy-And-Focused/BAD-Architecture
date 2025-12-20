import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import request from "supertest";

import { HttpStatus } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { createEndpoints } from "#constants";
import { ROUTE, ROUTES } from "./<%= name %>.routes";

import v1Module from "v1/v1.module";

const endpoints = createEndpoints({
  route: ROUTE,
  routes: ROUTES,
  version: "v1",
});

describe("<%= classify(name) %> controller", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [v1Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET ${endpoints.GET}`, () => {
    it("should return status 200 and array of <%= plural %>", async () => {
      const response = await request(app.getHttpServer())
        .get(endpoints.GET)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual([]);
    });
  });
});
