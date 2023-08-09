import { Request, Response } from 'express';
import { ContractOutput, InitialQueryContract } from "../../@types/contract";
import logger from '../../logger';
import { createPrimaryContract, getContracts } from './utils/db_query';
import { identifyPrimaryAndMissing, processContracts } from './utils/process_query';

export async function identityController(req: Request, res: Response) {
    try {
        const { email, phoneNumber } = req.body;
        let contracts: InitialQueryContract[] = await getContracts(email, phoneNumber);
        if (contracts.length == 0) {
            let dbcontracts = await createPrimaryContract(email, phoneNumber);
            const output: ContractOutput = processContracts(dbcontracts);
            return res.status(200).json(output);
        } else {
            let [primary, primaryLowPrec, missingEmail, missingPhone] = identifyPrimaryAndMissing(contracts, email, phoneNumber);
            const output: ContractOutput = {
                contact: {
                    primaryContractId: 0,
                    emails: [],
                    phoneNumbers: [],
                    secondaryContactIds: [],
                }
            }
            return res.status(200).json(output);
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).json(error);
    }
}