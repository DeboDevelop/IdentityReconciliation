import { expect } from "chai";
import supertest from "supertest";
import app from "../src/index";
import { ContractInput, ContractOutput } from "../@types/contract";
import { truncateContract } from "./utils/helper";

const request = supertest(app);

describe("POST /identify - new primary Contract", () => {
    it("Email and Phone Number", async () => {
        const input: ContractInput = {
            email: "emily.johnson@testsite.io",
            phoneNumber: "4567890",
        };
        const expectedOutput: ContractOutput = {
            contact: {
                primaryContractId: 0,
                emails: ["emily.johnson@testsite.io"],
                phoneNumbers: ["4567890"],
                secondaryContactIds: [],
            },
        };
        const response = await request.post("/identify").send(input);
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("contact").that.is.a("object");
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
