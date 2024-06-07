import supertest from "supertest";
import { app } from "../src/application/app";
import { UserTest } from "./test-util";
import jwt from "jsonwebtoken";
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
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });
  it("should success login user", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "test",
      password: "test",
    });
    expect(result.status).toBe(200);
    expect(result.body.data.username).toBe("test");
    expect(result.body.data.name).toBe("test");
    expect(result.body.data.token).toBeDefined();
  });
  it("should reject login because invalid username", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "tes",
      password: "test",
    });

    expect(result.status).toBe(401);
  });
  it("should reject login because invalid password", async () => {
    const result = await supertest(app).post("/api/users/login").send({
      username: "test",
      password: "tes",
    });

    expect(result.status).toBe(401);
  });
});

describe("GET /api/users", () => {
  beforeEach(async () => {
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
  });

  it("should success get user data", async () => {
    const token = jwt.sign({ username: "test" }, "secret", { expiresIn: "1h" });
    const result = await supertest(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(result.status).toBe(200);
  });
});

describe("PATCH /api/users/update", () => {
  beforeEach(async () => {
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject update user because of invalid request", async () => {
    const token = jwt.sign({ username: "test" }, "secret", { expiresIn: "1h" });
    const result = await supertest(app)
      .patch("/api/users/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "",
        password: "",
      });
    expect(result.status).toBe(400);
  });
  it("should succes update user name and password", async () => {
    const token = jwt.sign({ username: "test" }, "secret", { expiresIn: "1h" });
    const result = await supertest(app)
      .patch("/api/users/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test1",
        password: "test1",
      });
    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("test1");
  });
  it("should error User not found", async () => {
    const token = jwt.sign({ username: "test" }, "secret", { expiresIn: "1h" });
    await UserTest.delete();
    const result = await supertest(app)
      .patch("/api/users/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test1",
        password: "test1",
      });
    expect(result.status).toBe(404);
  });
});
