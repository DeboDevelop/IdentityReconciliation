import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import pool from "../src/database";
import { QueryResult } from "pg";
import logger from "../src/logger";
import { ContractInput, ContractOutput } from "../src/@types/contract";

const request = supertest(app);

async function insertContract(values: any[]): Promise<QueryResult> {
    const insertQuery = `
        INSERT INTO Contract (phone_number, email, linked_id, link_precedence, created_at, updated_at, deleted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;

    return await pool.query(insertQuery, values);
}

async function truncateContract() {
    try {
        const truncateQuery = "TRUNCATE TABLE Contract;";
        await pool.query(truncateQuery);
    } catch (error) {
        logger.error("Error deleting data:");
        logger.error(error);
    }
}

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
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
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
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
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
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
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
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    after(async () => {
        truncateContract();
    });
});

describe("POST /identify - new primary Contract", () => {
    it("Email and Phone Number", async () => {
        const input: ContractInput = {
            email: "mcfly@hillvalley.edu",
            phoneNumber: "123456",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: 0,
                emails: ["mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: [],
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
    });
    after(async () => {
        truncateContract();
    });
});

describe("POST /identify - new secondary Contract", () => {
    let primaryContractId: number;
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
            primaryContractId = primaryResult.rows[0].id;
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
                primaryContractId: primaryContractId,
                emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
                phoneNumbers: ["123456"],
                secondaryContactIds: [],
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
    });
    after(async () => {
        truncateContract();
    });
});

describe("POST /identify - Multiple Primary and Secondary", () => {
    let contractIds: number[] = [];
    before(async () => {
        try {
            let primaryValues = [
                "123456",
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
                    "123456",
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
            phoneNumber: "123456",
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
                phoneNumbers: ["123456", "123789", "654321", "987654"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
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
                phoneNumbers: ["123456", "123789", "654321", "987654"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
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
                phoneNumbers: ["123456", "123789", "654321", "987654"],
                secondaryContactIds: contractIds.slice(1),
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
        expect(response.body.contact.primaryContractId).to.equal(
            expectedOutput.contact.primaryContractId
        );
        expect(response.body.contact.emails).to.equal(
            expectedOutput.contact.emails
        );
        expect(response.body.contact.phoneNumbers).to.equal(
            expectedOutput.contact.phoneNumbers
        );
        expect(response.body.contact.secondaryContactIds).to.equal(
            expectedOutput.contact.secondaryContactIds
        );
    });
    after(async () => {
        truncateContract();
    });
});
