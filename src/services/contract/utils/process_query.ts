import { ContractOutput, DBContract, InitialQueryContract } from "../../../@types/contract";
import logger from "../../../logger";

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
            output.contact.phoneNumbers.push(contract.phone_number);
        } else {
            output.contact.secondaryContactIds.push(contract.id);
            output.contact.emails.push(contract.email);
            output.contact.phoneNumbers.push(contract.phone_number);
        }
    }
    return output;
}

export function identifyPrimaryAndMissing
    (contracts: InitialQueryContract[], email: string, phoneNumber: string) :
    [(number | null), (number | null), boolean, boolean] {
    let primary: number | null = null;
    let primaryLowPrec: number | null = null;
    let missingEmail = true;
    let missingPhone = true;
    
    contracts.forEach((contract) => {
        logger.info(contract);
        if (contract.contractEmail == email) {
            missingEmail = false;
        }
        if (contract.contractPhoneNumber == phoneNumber) {
            missingPhone = false;
        }
        if (primary == null) {
            if (contract.contractLinkPrecedence == "primary") {
                primary = contract.contractId;
            } else {
                primary = contract.contractLinkedId;
            }
        } else {
            if(contract.contractLinkPrecedence == "primary") {
                if (primary > contract.contractId) {
                    primaryLowPrec = primary;
                    primary = contract.contractId;
                } else if(primary < contract.contractId) {
                    primaryLowPrec = contract.contractId;
                }
            } else {
                if (contract.contractLinkedId !== null && primary > contract.contractLinkedId) {
                    primaryLowPrec = primary;
                    primary = contract.contractLinkedId;
                } else if(primary < contract.contractId) {
                    primaryLowPrec = contract.contractLinkedId;
                }
            }
        }
    })

    return [primary, primaryLowPrec, missingEmail, missingPhone];
}