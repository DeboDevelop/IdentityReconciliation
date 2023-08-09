import { ContractOutput, DBContract } from "../../../@types/contract";

export function processContracts(contracts: DBContract[]): ContractOutput {
    const output: ContractOutput = {
        contact: {
            primaryContractId: 0,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: [],
        }
    };
    for (const [i, contract]  of contracts.entries()) {
        if (i == 0) {
            output.contact.primaryContractId = contract.id;
            output.contact.emails.push(contract.email);
            output.contact.phoneNumbers.push(contract.phonenumber);
        } else {
            output.contact.secondaryContactIds.push(contract.id);
            output.contact.emails.push(contract.email);
            output.contact.phoneNumbers.push(contract.phonenumber);
        }
    }
    return output;
}