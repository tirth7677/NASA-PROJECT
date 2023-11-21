const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const loadPlanetsData = require("../../models/Planets.mongo");

describe("Lauches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("TEST GET /launches", () => {
    test("it should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completelauchdate = {
      mission: "USSR",
      rocket: "NCC USA",
      target: "Kepler-1652 b",
      launchDate: "january 4,2028",
    };

    const lauchdatewithoutdate = {
      mission: "USSR",
      rocket: "NCC USA",
      target: "Kepler-1652 b",
    };

    const lauchdatawithinvaliddate = {
      mission: "USSR",
      rocket: "NCC USA",
      target: "Kepler-1652 b",
      launchDate: "XYZ",
    };

    test("it should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completelauchdate)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestdate = new Date(completelauchdate.launchDate).valueOf();
      const responsedate = new Date(response.body.launchDate).valueOf();
      expect(responsedate).toBe(requestdate);
      expect(response.body).toMatchObject(lauchdatewithoutdate);
    });
    test("it should catch missing required propertys", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(lauchdatewithoutdate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    test("it should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(lauchdatawithinvaliddate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
