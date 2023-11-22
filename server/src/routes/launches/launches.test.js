const request = require("supertest");
// app in which we have all the routes of the and api is there
const app = require("../../app");
// before we test any http we have to connect to mongodb database so we can call this function for connect and decoonect the database
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
// model of the planets
const loadPlanetsData = require("../../models/Planets.mongo");

// the describe function is used to group together related test cases within a test suite. It helps in organizing and structuring your tests in a hierarchical manner. The describe function takes two arguments: a string describing the group of tests (often referred to as a test suite or test block), and a callback function that contains the actual test cases.
describe("Lauches API", () => {
  // before all mean we have to connect mongodb database for our request
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });
  //after our test complete we need to disconnect the database
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("TEST GET /launches", () => {
    //test mean we have to perform that test
    // .expect mean we expect that output that exact match output
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
      //.send mean send that data in our post request
      const response = await request(app)
        .post("/v1/launches")
        .send(completelauchdate)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestdate = new Date(completelauchdate.launchDate).valueOf(); //The .valueOf() method in JavaScript is a method that is called by JavaScript internally whenever an object needs to be represented as a primitive value.
      const responsedate = new Date(response.body.launchDate).valueOf();
      expect(responsedate).toBe(requestdate); //.toBe() matcher is used for asserting strict equality between the expected and received values in your test cases. It is commonly used to compare primitive values such as numbers, strings, booleans, etc.
      expect(response.body).toMatchObject(lauchdatewithoutdate); //.toMatchObject() matcher in Jest is used to assert that an object matches the expected object structure, including the properties and their values. It is often used when you want to check if an object has a subset of properties or when you want to ignore additional properties that are not relevant to the specific test case.
    });

    test("it should catch missing required property", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(lauchdatewithoutdate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing required launch property", //toStrictEqual mean eactly match that error or string
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