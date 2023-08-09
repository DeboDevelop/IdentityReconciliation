import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import logger from "../src/logger";
import { ContractInput } from "../src/@types/contract";

const request = supertest(app);

describe("POST /identify input validation", () => {
    it("Invalid email", async () => {
        const input: ContractInput = {
            email: "mcfly@hillvalley",
            phoneNumber: "123456",
        };
        try {
            const result = await request.post("/identify").send(input);
            expect(result.status).to.equal(400);
            expect(result.body).to.have.property("error").that.is.a("string");
            expect(result.body.error).to.equal('"email" must be a valid email');
        } catch (error) {
            logger.error("Error while testing invalid inputs");
            logger.error(error);
        }
    });
    it("Invalid phoneNumber", async () => {
        const input: ContractInput = {
            email: "mcfly@hillvalley.edu",
            phoneNumber: "+123456",
        };
        try {
            const result = await request.post("/identify").send(input);
            expect(result.status).to.equal(400);
            expect(result.body).to.have.property("error").that.is.a("string");
            expect(result.body.error).to.equal(
                '"phoneNumber" with value "+123456" fails to match the required pattern: /^\\d+$/'
            );
        } catch (error) {
            logger.error("Error while testing invalid inputs");
            logger.error(error);
        }
    });
    it("Null email and phoneNumber", async () => {
        const input: ContractInput = {
            email: null,
            phoneNumber: null,
        };
        try {
            const result = await request.post("/identify").send(input);
            expect(result.status).to.equal(400);
            expect(result.body).to.have.property("error").that.is.a("string");
            expect(result.body.error).to.equal(
                "Both Email and phoneNumber can't be null"
            );
        } catch (error) {
            logger.error("Error while testing invalid inputs");
            logger.error(error);
        }
    });
});
