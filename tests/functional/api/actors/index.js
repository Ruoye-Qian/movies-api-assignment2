import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import People from "../../../../api/people/peopleModel";
import api from "../../../../index";
import { getPeoples } from "../../../../api/tmdb-api";

const expect = chai.expect;
let db;
let token ="eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M";
let actors;

describe("Actors endpoint", () => {
  before(() => {
    mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
  });

  after(async () => {
    try {
      await db.dropDatabase();
    } catch (error) {
      console.log(error);
    }
  });

  beforeEach(async () => {
    try {
      actors= await getPeoples();
      // await People.deleteMany();
      // await People.collection.insertMany(actors);
      
    } catch (err) {
      console.error(`failed to Load actor Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close(); // To Release PORT 8080
  });
  describe("GET /api/actors ", () => {
    it("should return 20 actors and a status 200", (done) => {
      request(api)
        .get("/api/actors")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(10);
          done();
        });
    });
  });

  describe("GET /api/actors/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching actor", () => {
        return request(api)
          .get(`/api/actors/${actors[0].id}`)
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("name", actors[0].name);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        return request(api)
          .get("/api/actors/9999")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The resource you requested could not be found.",
          });
      });
    });
  });
});
