import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Place from "../models/place.js"


afterAll(async () => {
    await mongoose.disconnect();
  });
  
beforeEach(cleanUpDatabase);

describe("POST /places/delete", function () {
  test("should delete a user", async function () {
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