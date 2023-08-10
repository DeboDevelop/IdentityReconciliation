import {
    ContractOutput,
    DBContract,
    InitialQueryContract,
} from "../../../../@types/contract";

export function processContracts(contracts: DBContract[]): ContractOutput {
    const output = {
        primaryContractId: 0,
        emails: new Set<string>(),
        phoneNumbers: new Set<string>(),
        secondaryContactIds: new Set<number>(),
    };
    for (const [i, contract] of contracts.entries()) {
        if (i == 0) {
            output.primaryContractId = contract.id;
            output.emails.add(contract.email);
            output.phoneNumbers.add(contract.phone_number);
        } else {
            output.secondaryContactIds.add(contract.id);
            output.emails.add(contract.email);
            output.phoneNumbers.add(contract.phone_number);
        }
    }
    const result: ContractOutput = {
        contact: {
            primaryContractId: output.primaryContractId,
            emails: Array.from(output.emails),
            phoneNumbers: Array.from(output.phoneNumbers),
            secondaryContactIds: Array.from(output.secondaryContactIds),
        },
    };
    return result;
}

export function identifyPrimaryAndMissing(
    contracts: InitialQueryContract[],
    email: string,
    phoneNumber: string
): [number | null, number | null, boolean, boolean, string, string] {
    let primary: number | null = null;
    let primaryEmail: string = "";
    let primaryPhoneNumber: string = "";
    let primaryLowPrec: number | null = null;
    let missingEmail = true;
    let missingPhone = true;

    contracts.forEach((contract) => {
        if (contract.contractEmail === email) {
            missingEmail = false;
        }
        if (contract.contractPhoneNumber === phoneNumber) {
            missingPhone = false;
        }
        if (primary === null) {
            // If the contract is marked as primary, update the primary variable
            if (contract.contractLinkPrecedence == "primary") {
                primary = contract.contractId;
                primaryEmail = contract.contractEmail;
                primaryPhoneNumber = contract.contractPhoneNumber;
            } else {
                // Otherwise, mark its parent as primary
                primary = contract.contractLinkedId;
                if (
                    contract.parentContractEmail !== null &&
                    contract.parentContractPhoneNumber !== null
                ) {
                    primaryEmail = contract.parentContractEmail;
                    primaryPhoneNumber = contract.parentContractPhoneNumber;
                }
            }
        } else {
            if (contract.contractLinkPrecedence == "primary") {
                // If a new primary with lower value is found, update the primary
                // update primaryLowPrec with old primary value - this will be converted to secondary
                if (primary > contract.contractId) {
                    primaryLowPrec = primary;
                    primary = contract.contractId;
                    primaryEmail = contract.contractEmail;
                    primaryPhoneNumber = contract.contractPhoneNumber;
                } else if (primary < contract.contractId) {
                    primaryLowPrec = contract.contractId;
                }
            } else {
                // If a new parent with a lower value is found, update the primary
                // update primaryLowPrec with old primary value - this will be converted to secondary
                if (
                    contract.contractLinkedId !== null &&
                    primary > contract.contractLinkedId
                ) {
                    primaryLowPrec = primary;
                    primary = contract.contractLinkedId;
                    if (
                        contract.parentContractEmail !== null &&
                        contract.parentContractPhoneNumber !== null
                    ) {
                        primaryEmail = contract.parentContractEmail;
                        primaryPhoneNumber = contract.parentContractPhoneNumber;
                    }
                } else if (primary < contract.contractId) {
                    primaryLowPrec = contract.contractLinkedId;
                }
            }
        }
    });

    // If email is marked as missing but is null, we want to avoid creating a record with null email
    if (missingEmail === true && email === null) {
        missingEmail = false;
    }

    // If phoneNumber is marked as missing but is null, we want to avoid creating a record with null phoneNumber
    if (missingPhone === true && phoneNumber === null) {
        missingPhone = false;
    }

    return [
        primary,
        primaryLowPrec,
        missingEmail,
        missingPhone,
        primaryEmail,
        primaryPhoneNumber,
    ];
}
