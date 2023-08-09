import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import { QueryResult } from "pg";
import logger from "../src/logger";
import { ContractInput, ContractOutput } from "../src/@types/contract";
import { insertContract, truncateContract } from "./utils/helper";

const request = supertest(app);

describe("POST /identify - 1 Primary, 1 Secondary", () => {
    let contractIds: number[] = [];
    before(async () => {
        try {
            const primaryValues = [
                "123456",
                "lorraine@hillvalley.edu",
                null,
                "primary",
                new Date(),
                new Date(),
                null,
            ];

            const primaryResult: QueryResult = await insertContract(
                primaryValues
            );
            contractIds.push(primaryResult.rows[0].id);
            const primaryContractId = primaryResult.rows[0].id;

            const secondaryValues = [
                "123456",
                "mcfly@hillvalley.edu",
                primaryContractId,
                "secondary",
                new Date(),
                new Date(),
                null,
            ];

            const secondaryResult: QueryResult = await insertContract(
                secondaryValues
            );
            contractIds.push(secondaryResult.rows[0].id);
        } catch (error) {
            logger.error("Error inserting data:");
            logger.error(error);
        }
    });
    it("Email and Phone Number", async () => {
        const input: ContractInput = {
            email: "mcfly@hillvalley.edu",
            phoneNumber: "123456",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.deep.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.deep.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.deep.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    it("Phone Number", async () => {
        const input: ContractInput = {
            email: null,
            phoneNumber: "123456",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.deep.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.deep.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.deep.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    it("Email - lorraine@hillvalley.edu", async () => {
        const input: ContractInput = {
            email: "lorraine@hillvalley.edu",
            phoneNumber: null,
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.deep.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.deep.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.deep.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    it("Email - mcfly@hillvalley.edu", async () => {
        const input: ContractInput = {
            email: "mcfly@hillvalley.edu",
            phoneNumber: null,
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.deep.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.deep.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.deep.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    after(async () => {
        truncateContract();
    });
});
