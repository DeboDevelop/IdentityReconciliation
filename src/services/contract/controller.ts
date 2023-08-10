import { Request, Response } from "express";
import { ContractOutput, InitialQueryContract } from "../../../@types/contract";
import logger from "../../logger";
import {
    createPrimaryContract,
    createSecondaryContract,
    getContractsByEmailAndPhoneNumber,
    getContractsById,
    updateSecondaryContract,
} from "./utils/db_query";
import {
    identifyPrimaryAndMissing,
    processContracts,
} from "./utils/process_query";

export async function identityController(req: Request, res: Response) {
    try {
        const { email, phoneNumber } = req.body;
        // Query elements by Email and Phone Number
        const contracts: InitialQueryContract[] =
            await getContractsByEmailAndPhoneNumber(email, phoneNumber);
        // If the array is empty, no record exists. Create a new primary contract.
        if (contracts.length == 0) {
            const dbcontracts = await createPrimaryContract(email, phoneNumber);
            const output: ContractOutput = processContracts(dbcontracts);
            return res.status(200).json(output);
        } else {
            // Identify the following information:
            // - Primary of all records
            // - Primary contracts to be converted to secondary
            // - Whether the request has new information (marked by missingEmail or missingPhone)
            // - Email and phone number of the primary record
            const [
                primary,
                primaryLowPrec,
                missingEmail,
                missingPhone,
                primaryEmail,
                primaryPhoneNumber,
            ] = identifyPrimaryAndMissing(contracts, email, phoneNumber);
            if (primary !== null) {
                if (primaryLowPrec !== null) {
                    // Convert the primary record into secondary, as well as all secondary
                    // records that have this record as their primary in linkedId
                    await updateSecondaryContract(primary, primaryLowPrec);
                }
                if (missingEmail || missingPhone) {
                    // Create secondary records for new email/phoneNumber found in the request
                    await createSecondaryContract(
                        primary,
                        email === null ? primaryEmail : email,
                        phoneNumber === null ? primaryPhoneNumber : phoneNumber
                    );
                }
                // Fetch all data with the primary id – this will also fetch missing records that
                // were not found while querying with email and phoneNumber
                const dbcontracts = await getContractsById(primary);
                const output: ContractOutput = processContracts(dbcontracts);
                return res.status(200).json(output);
            }
            return res.status(400).json("Bad Request");
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).json(error);
    }
}
