import { Request, Response } from 'express';
import { ContractOutput } from "../../@types/contract";
import logger from '../../logger';
import { getContracts } from './utils/db_query';

export async function identityController(req: Request, res: Response) {
    try {
        const { email, phoneNumber } = req.body;
        const contracts = await getContracts(email, phoneNumber);
        logger.info(contracts);
        const output: ContractOutput = {
            contact: {
                primaryContractId: 0,
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