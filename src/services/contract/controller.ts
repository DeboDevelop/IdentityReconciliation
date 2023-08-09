import { Request, Response } from 'express';
import { ContractOutput } from "../../@types/contract";
import logger from '../../logger';
import { createPrimaryContract, getContracts } from './utils/db_query';

export async function identityController(req: Request, res: Response) {
    try {
        const { email, phoneNumber } = req.body;
        const contracts = await getContracts(email, phoneNumber);
        // TODO: Remove default value
        let primaryContractId = 0;
        if (contracts.length == 0) {
            primaryContractId = await createPrimaryContract(email, phoneNumber);
        }
        const output: ContractOutput = {
            contact: {
                primaryContractId: primaryContractId,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: [],
            }
        }
        res.status(200).json(output);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}