import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Place from "../models/place.js";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe("POST /places/", function () {
  test("should add a place", async function () {
    const res = await supertest(app)
      .post("/places")
      .send({
        name: "Test",
        canton: "VD",
        location: {
          type: "Point",
          coordinates: [120.0, 0.5],
        },
        tags: "JARDIN",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body.name).toEqual("Test");
    expect(res.body.canton).toEqual("VD");
    expect(res.body.tags).toEqual(["JARDIN"]);
  });
});

describe("DELETE /places", function () {
  beforeEach(async function () {

    let place;
     place = await Promise.all([
      Place.create({
        name: "Test",
        canton: "VD",
        location: {
          type: "Point",
          coordinates: [120.0, 0.5],
        },
        tags: "JARDIN",
      }),
    ]);

    let johnDoe = await Promise.all([
    User.create({ name: 'John Doe',surname: 'test', passwordHash:'test' })
    ]);
  });

  test("should delete place", async function () {
    const count = await Place.estimatedDocumentCount();
    // console.log(count)
    const token = await generateValidJwt(johnDoe);
    const res = await supertest(app)
      .delete('/places/${place.id}')
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

      //check if the place is deleted in the database
      const place2 = await Place.findById(Place.body._id);
      expect(place2).toBeNull();


    });
      /* .then(async (res) => {
        const newCount = await Place.estimatedDocumentCount();
        //    console.log(newCount)
        return newCount;
      });
       expect(res).toEqual(count-1); */
  
});
