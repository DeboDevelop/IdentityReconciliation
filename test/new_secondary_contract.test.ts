import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import { QueryResult } from "pg";
import logger from "../src/logger";
import { ContractInput, ContractOutput } from "../@types/contract";
import { insertContract, truncateContract } from "./utils/helper";

const request = supertest(app);

describe("POST /identify - new secondary Contract", () => {
    let primaryContractId: number;
    before(async () => {
        try {
            const primaryValues = [
                "543210",
                "lorraine11@hillvalley.edu",
                null,
                "primary",
                new Date(),
                new Date(),
                null,
            ];

            const primaryResult: QueryResult = await insertContract(
                primaryValues
            );
            primaryContractId = primaryResult.rows[0].id;
        } catch (error) {
            logger.error("Error inserting data:");
            logger.error(error);
        }
    });
    it("Email and Phone Number", async () => {
        const input: ContractInput = {
            email: "mcfly.11@hillvalley.edu",
            phoneNumber: "543210",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: primaryContractId,
                emails: [
                    "lorraine11@hillvalley.edu",
                    "mcfly.11@hillvalley.edu",
                ],
                phoneNumbers: ["543210"],
                secondaryContactIds: [],
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
    });
    after(async () => {
        truncateContract();
    });
});
