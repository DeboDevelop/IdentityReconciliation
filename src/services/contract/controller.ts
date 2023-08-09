import { Request, Response } from "express";
import { ContractOutput, InitialQueryContract } from "../../@types/contract";
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
        const contracts: InitialQueryContract[] =
            await getContractsByEmailAndPhoneNumber(email, phoneNumber);
        if (contracts.length == 0) {
            const dbcontracts = await createPrimaryContract(email, phoneNumber);
            const output: ContractOutput = processContracts(dbcontracts);
            return res.status(200).json(output);
        } else {
            const [primary, primaryLowPrec, missingEmail, missingPhone] =
                identifyPrimaryAndMissing(contracts, email, phoneNumber);
            if (primary !== null) {
                if (primaryLowPrec !== null) {
                    await updateSecondaryContract(primary, primaryLowPrec);
                }
                if (missingEmail) {
                    await createSecondaryContract(primary, email, phoneNumber);
                }
                if (missingPhone) {
                    await createSecondaryContract(primary, email, phoneNumber);
                }
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
