import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import { QueryResult } from "pg";
import logger from "../src/logger";
import { ContractInput, ContractOutput } from "../src/@types/contract";
import { insertContract, truncateContract } from "./utils/helper";

const request = supertest(app);

describe("POST /identify - Multiple Primary and Secondary", () => {
    let contractIds: number[] = [];
    before(async () => {
        try {
            let primaryValues = [
                "876543",
                "debajyotid1@gmail.com",
                null,
                "primary",
                new Date(),
                new Date(),
                null,
            ];

            let primaryResult: QueryResult = await insertContract(
                primaryValues
            );
            contractIds.push(primaryResult.rows[0].id);
            let primaryContractId = primaryResult.rows[0].id;

            let secondaryValues = [
                [
                    "876543",
                    "debajyotid2@gmail.com",
                    primaryContractId,
                    "secondary",
                    new Date(),
                    new Date(),
                    null,
                ],
                [
                    "123789",
                    "debajyotid1@gmail.com",
                    primaryContractId,
                    "secondary",
                    new Date(),
                    new Date(),
                    null,
                ],
            ];
            for (let secondaryValue of secondaryValues) {
                const secondaryResult: QueryResult = await insertContract(
                    secondaryValue
                );
                contractIds.push(secondaryResult.rows[0].id);
            }

            primaryValues = [
                "654321",
                "debajyotid3@gmail.com",
                null,
                "primary",
                new Date(),
                new Date(),
                null,
            ];

            primaryResult = await insertContract(primaryValues);
            contractIds.push(primaryResult.rows[0].id);
            let primaryContractId2 = primaryResult.rows[0].id;

            secondaryValues = [
                [
                    "987654",
                    "debajyotid3@gmail.com",
                    primaryContractId2,
                    "secondary",
                    new Date(),
                    new Date(),
                    null,
                ],
                [
                    "654321",
                    "debajyotid4@gmail.com",
                    primaryContractId2,
                    "secondary",
                    new Date(),
                    new Date(),
                    null,
                ],
            ];
            for (let secondaryValue of secondaryValues) {
                const secondaryResult: QueryResult = await insertContract(
                    secondaryValue
                );
                contractIds.push(secondaryResult.rows[0].id);
            }
        } catch (error) {
            logger.error("Error inserting data:");
            logger.error(error);
        }
    });
    it("2 Primary", async () => {
        const input: ContractInput = {
            email: "debajyotid3@gmail.com",
            phoneNumber: "876543",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: [
                    "debajyotid1@gmail.com",
                    "debajyotid2@gmail.com",
                    "debajyotid3@gmail.com",
                    "debajyotid4@gmail.com",
                ],
                phoneNumbers: ["876543", "123789", "654321", "987654"],
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
    it("1 Primary, 1 Secondary", async () => {
        const input: ContractInput = {
            email: "debajyotid2@gmail.com",
            phoneNumber: "654321",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: [
                    "debajyotid1@gmail.com",
                    "debajyotid2@gmail.com",
                    "debajyotid3@gmail.com",
                    "debajyotid4@gmail.com",
                ],
                phoneNumbers: ["876543", "123789", "654321", "987654"],
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
    it("2 Secondary", async () => {
        const input: ContractInput = {
            email: "debajyotid2@gmail.com",
            phoneNumber: "987654",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: contractIds[0],
                emails: [
                    "debajyotid1@gmail.com",
                    "debajyotid2@gmail.com",
                    "debajyotid3@gmail.com",
                    "debajyotid4@gmail.com",
                ],
                phoneNumbers: ["876543", "123789", "654321", "987654"],
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
