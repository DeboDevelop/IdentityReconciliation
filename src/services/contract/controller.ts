import { Request, Response } from 'express';
import { ContractOutput } from "../../@types/contract";

export function identityController(req: Request, res: Response) {
    const output: ContractOutput = {
        contact: {
            primaryContractId: 0,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: [],
        }
    }
    res.status(200).json(output);
}