import request from "supertest";
import { app } from "../app";

describe("Countries API", () => {
  it("GET /api/countries → returns 200 and array", async () => {
    const res = await request(app).get("/api/countries");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/countries/:id → returns 400 for invalid id", async () => {
    const res = await request(app).get("/api/countries/123");
    expect(res.status).toBe(400);
  });

  it("POST /api/countries → creates a country", async () => {
    const res = await request(app)
      .post("/api/countries")
      .send({
        name: "Testland",
        flag: "https://example.com/flag.png",
        population: 1000,
        region: "Europe",
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Testland");
  });
});
