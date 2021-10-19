process.env.NODE_ENV = "test";

const expect = require("chai").expect;
const server = require("../../server");

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const Acronym = require("../../db-models-loader").Acronym;

describe("Testing Acronym CRUD", () => {
  describe("GET /acronym?from=0&limit=10&search=:search", () => {
    it("should return correct acronym that match against KUTGW", async () => {
      const result = await chai
        .request(server)
        .get("/acronym?from=0&limit=10&search=KUTGW");

      expect(result.body).to.be.an("array");
      expect(result.body[0].definition).to.equal("Keep up the good work");
    });

    it("should return nothing with the status 404, if search doesn't match", async () => {
      const result = await chai
        .request(server)
        .get("/acronym?from=0&limit=10&search=NOTEXISTS123");

      expect(result.body).to.be.an("object").that.is.empty;
      expect(result.status).to.equal(404);
    });

    it("should find urlencoded string in the database", async () => {
      const result = await chai
        .request(server)
        .get("/acronym?from=0&limit=10&search=%3C33");

      expect(result.body).to.be.an("array");
      expect(result.body[0].definition).to.equal(
        "Meaning 'heart or love' (more 3s is a bigger heart)"
      );
    });

    it("should return a list of acronyms that fuzzy match against AM", async () => {
      const result = await chai
        .request(server)
        .get("/acronym?from=0&limit=10&search=AM");

      expect(result.body).to.be.an("array");
      expect(result.body).to.have.lengthOf.above(5);
    });
  });

  describe("POST /acronym", () => {
    after(async () => {
      const acronym = await Acronym.findOne({ where: { name: "JTTS" } });
      await acronym.destroy();
    });

    it("should insert a new acronym record into the database", async () => {
      const newAcronym = {
        name: "JTTS",
        definition: "Just testing this script!",
      };

      const result = await chai
        .request(server)
        .post("/acronym")
        .send(newAcronym);

      expect(result.status).to.equal(201);
      expect(result.body.id).to.be.above(1);
    });

    it("should reject insert with the status 400, if we don't pass a definition", async () => {
      const newAcronym = {
        name: "JTTS",
      };

      const result = await chai
        .request(server)
        .post("/acronym")
        .send(newAcronym);

      expect(result.status).to.equal(400);
    });
  });

  describe("PUT /acronym/:acronym", () => {
    afterEach(async () => {
      await Acronym.update({ definition: "I see" }, { where: { name: "IC" } });
    });

    it("should change acronym definition when we pass correct auth", async () => {
      // "IC": "I see" -> "I clean"

      const result = await chai
        .request(server)
        .put("/acronym/IC")
        .set("Authentication", "secretword")
        .send({ definition: "I clean" });

      const updatedRecord = await Acronym.findOne({ where: { name: "IC" } });

      expect(result.status).to.equal(200);
      expect(updatedRecord.definition).to.equal("I clean");
    });

    it("should deny acronym definition change when we pass wrong auth", async () => {
      const result = await chai
        .request(server)
        .put("/acronym/IC")
        .set("Authentication", "wrongword")
        .send({ definition: "I clean" });

      expect(result.status).to.equal(403);
    });

    it("should return 401 when missing Authentication header", async () => {
      const result = await chai
        .request(server)
        .put("/acronym/IC")
        .send({ definition: "I clean" });

      expect(result.status).to.equal(401);
    });
  });

  describe("DELETE /acronym/:acronym", () => {
    before(async () => {
      const newAcronym = {
        name: "JTTS",
        definition: "Just testing this script!",
      };

      await Acronym.create(newAcronym);
    });

    it("should delete acronym", async () => {
      const result = await chai
        .request(server)
        .delete("/acronym/JTTS")
        .set("Authentication", "secretword")
        .send();

      expect(result.status).to.equal(204);
    });
  });
});
