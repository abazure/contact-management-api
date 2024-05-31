import supertest from "supertest";
import { app } from "../src/application/app";
import { UserTest } from "./test-util";
describe("POST /api/users", () => {
  afterEach(async () => {
    await UserTest.delete();
  });
  it("should reject register new user if request is invalid", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "",
      username: "",
      password: "",
    });
    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
  it("should success register new user", async () => {
    const result = await supertest(app).post("/api/users").send({
      name: "test",
      username: "test",
      password: "test",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
  });
  it("should reject register new user because of username already exist", async () => {
    let result = await supertest(app).post("/api/users").send({
      name: "test",
      username: "test",
      password: "test",
    });
    result = await supertest(app).post("/api/users").send({
      name: "test",
      username: "test",
      password: "test",
    });
    expect(result.status).toBe(409);
    // expect(result.body.data.username).toBe("test");
  });
});
