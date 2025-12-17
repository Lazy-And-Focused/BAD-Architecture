import type { App } from "supertest/types";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";

import request from "supertest";

import { HttpStatus } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { urlize } from "#constants";
import { ROUTE, ROUTES } from "./sentry.routes";
import v1Module from "v1/v1.module";

const toUrl = urlize({ version: "v1", route: ROUTE });

describe(ROUTE + " controller", () => {
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

  describe("GET " + ROUTES.GET, () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return 200 and \"Hello, World!\"", () => {
      return request(app.getHttpServer())
        .get(toUrl(ROUTES.GET))
        .expect(HttpStatus.OK)
        .expect("Hello, World!");
    });
  });

  describe("GET " + ROUTES.GET_ERROR, () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return internal server error", () => {
      return request(app.getHttpServer())
        .get(toUrl(ROUTES.GET_ERROR))
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("GET " + ROUTES.GET_HTTP, () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return \"not found\"", () => {
      return request(app.getHttpServer())
        .get(toUrl(ROUTES.GET_HTTP))
        .expect(HttpStatus.NOT_FOUND);
    });

    it("should return \"bad request\"", () => {
      const status = HttpStatus.BAD_REQUEST;
      return request(app.getHttpServer())
        .get(toUrl(ROUTES.GET_HTTP + "?status=" + status))
        .expect(status);
    });
  });
});
