import Fastify from "fastify";

describe("Health endpoint", () => {
  const app = Fastify();

  beforeAll(async () => {
    app.get("/health", async () => ({
      status: "ok",
      ts: new Date().toISOString(),
      name: "SocialTV API",
    }));
    await app.ready();
  });

  afterAll(() => app.close());

  test("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe("ok");
    expect(body.name).toBe("SocialTV API");
    expect(body.ts).toBeDefined();
  });
});
