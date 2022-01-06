import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import api from "../../../../index";

const expect = chai.expect;
let db;
let user1token;
let token ="eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M";

describe("Users endpoint", () => {
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
      await User.deleteMany();
      // Register two users
      await request(api).post("/api/users?action=register").send({
        username: "user1",
        password: "test1",
      });
      await request(api).post("/api/users?action=register").send({
        username: "user2",
        password: "test2",
      });
    } catch (err) {
      console.error(`failed to Load user test Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close();
  });
  describe("GET /api/users ", () => {
    it("should return the 2 users and a status 200", (done) => {
      request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err,res) => {
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.equal(2);
          let result = res.body.map((user) => user.username);
          expect(result).to.have.members(["user1", "user2"]);
          done();
        });
    });
  });

  describe("POST /api/users ", () => {
    describe("For a register action", () => {
      describe("when the payload is correct", () => {
        it("should return a 201 status and the confirmation message", () => {
          return request(api)
            .post("/api/users?action=register")
            .send({
              username: "user3",
              password: "test3",
            })
            .expect(201)
            .expect({ msg: "Successful created new user.", code: 201 });
        });
        after(() => {
          return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.length).to.equal(3);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["user1", "user2", "user3"]);
            });
        });
      });
    });
    describe("For an authenticate action", () => {
      describe("when the payload is correct", () => {
        it("should return a 200 status and a generated token", () => {
          return request(api)
            .post("/api/users?action=authenticate")
            .send({
              username: "user1",
              password: "test1",
            })
            .expect(200)
            .then((res) => {
              expect(res.body.success).to.be.true;
              expect(res.body.token).to.not.be.undefined;
              user1token = res.body.token.substring(7);
            });
        });
      });
    });
  });

  describe("Get /api/users/:userName/favourites", () => {
    describe("when the userName is valid", () => {
      it("should return the matching favourites", () => {
        request(api)
          .get("/api/users/user1/favourites")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      });
    });
    describe("when the userName is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/users/aaaa/favourites")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "cannot find this user",
          });
      });
    });
  });

  describe("POST /api/users/:userName/favourites", () => {
    describe("when the id is valid", () => {
      it("should return a 201 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/favourites")
          .send({
            id: "634649",
            userName: "user1",
          })
          .expect(201)
      });
    });
    describe("when the id is invalid", () => {
      it("should return a 401 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/favourites")
          .send({
            id: "",
            userName: "",
          })
          .expect(401)
          .expect({ msg: "unable to add movies", code: 401 });
      });
      it("should return a 404 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/favourites")
          .send({
            id: "634649",
            userName: "user1",
          })
          .send({
            id: "634649",
            userName: "user1",
          })
          .expect(404)
          .expect({ msg: "cannot add duplicates", code: 404 });
      });
    });
  });

  describe("Get /api/users/:userName/likes", () => {
    describe("when the userName is valid", () => {
      it("should return the matching favourite actors", () => {
        request(api)
          .get("/api/users/user1/likes")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      });
    });
    describe("when the userName is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/users/aaaa/favourites")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "cannot find this user",
          });
      });
    });
  });

  describe("POST /api/users/:userName/likes", () => {
    describe("when the id is valid", () => {
      it("should return a 201 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/likes")
          .send({
            id: "67837",
            userName: "user1",
          })
          .expect(201)
      });
    });
    describe("when the id is invalid", () => {
      it("should return a 401 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/likes")
          .send({
            id: "",
            userName: "",
          })
          .expect(401)
          .expect({ msg: "unable to add movies", code: 401 });
      });
      it("should return a 404 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/likes")
          .send({
            id: "67837",
            userName: "user1",
          })
          .send({
            id: "67837",
            userName: "user1",
          })
          .expect(404)
          .expect({ msg: "cannot add duplicates", code: 404 });
      });
    });
  });


  describe("Get /api/users/:userName/tvPlaylist", () => {
    describe("when the userName is valid", () => {
      it("should return the matching tv playlist", () => {
        request(api)
          .get("/api/users/user1/tvPlaylist")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
      });
    });
    describe("when the userName is invalid", () => {
      it("should return the NOT found message", () => {
        request(api)
          .get("/api/users/aaaa/favourites")
          .set('Authorization', 'Bearer ' + token)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "cannot find this user",
          });
      });
    });
  });


  describe("POST /api/users/:userName/tvPlaylist", () => {
    describe("when the id is valid", () => {
      it("should return a 201 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/tvPlaylist")
          .send({
            id: "77169",
            userName: "user1",
          })
          .expect(201)
      });
    });
    describe("when the id is invalid", () => {
      it("should return a 401 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/tvPlaylist")
          .send({
            id: "",
            userName: "",
          })
          .expect(401)
          .expect({ msg: "unable to add tvs", code: 401 });
      });
      it("should return a 404 status and the confirmation message", () => {
        request(api)
          .post("/api/users/user1/tvPlaylist")
          .send({
            id: "77169",
            userName: "user1",
          })
          .send({
            id: "77169",
            userName: "user1",
          })
          .expect(404)
          .expect({ msg: "cannot add duplicates", code: 404 });
      });
    });
  });










});
