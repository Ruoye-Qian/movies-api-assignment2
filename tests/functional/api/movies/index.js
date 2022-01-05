import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import Movie from "../../../../api/movies/movieModel";
import api from "../../../../index";
//import movies from "../../../../seedData/movies";
import { getMovies } from "../../../../api/tmdb-api";

const expect = chai.expect;
let db;
let token ="eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M";
let movies;

describe("Movies endpoint", () => {
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
      movies= await getMovies();
      await Movie.deleteMany();
      await Movie.collection.insertMany(movies);
      
    } catch (err) {
      console.error(`failed to Load movie Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close(); // To Release PORT 8080
  });
  describe("GET /api/movies ", () => {
    it("should return 20 movies and a status 200", () => {
      request(api)
        .get("/api/movies?page=1&limit=20")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching movie", () => {
        request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("title", movies[0].title);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/movies/9999")
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

  describe("GET /api/movies/tmdb/upcoming ", (done) => {
    it("should return 20 upcoming movies and a status 200", () => {
      request(api)
        .get("/api/movies/tmdb/upcoming")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/nowplaying ", () => {
    it("should return 20 nowplaying movies and a status 200", () => {
      request(api)
        .get("/api/movies/tmdb/nowplaying")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/topRated ", () => {
    it("should return 20 topRated movies and a status 200", () => {
      request(api)
        .get("/api/movies/tmdb/topRated")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/tmdb/popular ", () => {
    it("should return 20 popular movies and a status 200", () => {
      request(api)
        .get("/api/movies/tmdb/popular")
        .set('Authorization', 'Bearer ' + token)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((err, res) => {
          expect(res.body.results).to.be.a("array");
          expect(res.body.results.length).to.equal(20);
        });
    });
  });

  describe("GET /api/movies/:id/reviews", () => {
    describe("when the id is valid", () => {
      it("should return the matching movie", () => {
        request(api)
          .get(`/api/movies/${movies[0].id}/reviews`)
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("title", movies[0].title);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/movies/9999/reviews")
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

  describe("POST /api/movies/:id/reviews", () => {
    describe("when the id is valid", () => {
      it("should return a 201 status and the confirmation message", () => {
        request(api)
          .post("/api/movies/:id/reviews")
          .send({
            author: "Alice",
            content: "This is a good movie and I enjoy it very much",
          })
          .expect(201)
          .expect({ msg: "Successful created new review.", code: 201 });
      });
      it("should return a 401 status and the confirmation message", () => {
        request(api)
          .post("/api/movies/:id/reviews")
          .send({
            author: "Alice",
            content: "a movie",
          })
          .expect(401)
          .expect({ msg: "This is not a good review format.", code: 401 });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .post("/api/movies/9999/reviews")
          .send({
            author: "Alice",
            content: "This is a good movie and I enjoy it very much",
          })
          .expect(404)
          .expect({ msg: "The resource you requested could not be found.", code: 404 });
      });
    });
  });

});

