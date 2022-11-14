import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";
import User from "../models/user.js"


afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe("POST /users", function () {
  test("should create a user", async function () {
    const res = await supertest(app)
      .post("/users")
      .send({
        name: "John Doe",
        password: "1234",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        name: "John Doe",
      })
    );

    expect(res.body).toBeObject();
    expect(res.body._id).toBeString();
    expect(res.body.name).toEqual("John Doe");
    expect(res.body).toContainAllKeys(["name", "pictures", "notes", "_id", "__v"]);
  });
});

describe("GET /users", function () {

    let johnDoe;
    let janeDoe;

    beforeEach(async function() {
      // Create 2 users before retrieving the list.
      [ johnDoe, janeDoe ] = await Promise.all([
        User.create({ name: 'John Doe',passwordHash:'test' }),
        User.create({ name: 'Jane Doe', passwordHash:'test' })
      ]);
    });


  test("should retrieve the list of users", async function () {
    const token = await generateValidJwt(johnDoe);
    const token2 = await generateValidJwt(janeDoe);
    const res = await supertest(app)
    .get('/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/);
    expect(res.body).toBeArray();
    expect(res.body).toHaveLength(2);
  });
});
