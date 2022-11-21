import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Place from "../models/place.js";
import { cleanUpDatabase, generateValidJwt } from "./utils.js";
import User from "../models/user.js"

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(cleanUpDatabase);

describe("POST /places/", function () {

  let johnDoe;
    let janeDoe;

    beforeEach(async function() {
      // Create 2 users before retrieving the list.
      [ johnDoe, janeDoe ] = await Promise.all([
        User.create({ name: 'JohnDoe',surname: 'test', passwordHash:'test' }),
        User.create({ name: 'JaneDoe', surname: 'test', passwordHash:'test' })
      ]);
    });

  test("should add a place", async function () {
    const token = await generateValidJwt(johnDoe);
 
    const res = await supertest(app)
      .post("/places")
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: "Test",
        canton: "Vaud",
        location: {
          type: "Point",
          coordinates: [120.0, 0.5],
        },
        tags: "JARDIN",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body.name).toEqual("Test");
    expect(res.body.canton).toEqual("Vaud");
    expect(res.body.tags).toEqual(["JARDIN"]);
  });
});

describe("DELETE /places",function () {

  let johnDoe;
  let janeDoe;
  let place;

  beforeEach(async function () {

    

    [ johnDoe, janeDoe ] = await Promise.all([
      User.create({ name: 'JohnDoe',surname: 'test', passwordHash:'test' }),
      User.create({ name: 'JaneDoe', surname: 'test', passwordHash:'test' })
    ]);


    
    place = await Promise.all([
     Place.create({
       name: "Test",
       creator: johnDoe.id,
       canton: "Vaud",
       location: {
         type: "Point",
         coordinates: [120.0, 0.5],
       },
       tags: "JARDIN",
     }),
   ]);

  });
    

    test("should delete place", async function () {
      // console.log(count)
      const token = await generateValidJwt(johnDoe);
      const res = await supertest(app)
        .delete(`/places/${place.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
  
        //check if the place is deleted in the database
        const place2 = await Place.findById(Place.body._id);
        expect(place2).toBeNull();
  
    
  });
})
 


      /* .then(async (res) => {
        const newCount = await Place.estimatedDocumentCount();
        //    console.log(newCount)
        return newCount;
      });
       expect(res).toEqual(count-1); */
  
