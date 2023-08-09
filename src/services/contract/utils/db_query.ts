import { Contract } from "../../../@types/contract";
import { QueryResult } from 'pg';
import pool from '../../../database';

export async function getContracts(email: string | null, phoneNumber: string | null): Promise<Contract[]> {
    let query = "SELECT c1.id AS contractId, \
                    c1.email AS contractEmail, \
                    c1.phoneNumber AS contractPhoneNumber, \
                    c1.linkedId AS contractLinkedId, \
                    c1.linkPrecedence AS contractLinkPrecedence, \
                    c2.email AS parentContractEmail, \
                    c2.phoneNumber AS parentContractPhoneNumber, \
                    c2.linkPrecedence AS parentContractLinkPrecedence \
                FROM Contract c1 \
                LEFT JOIN Contract c2 ON c1.linkedId = c2.id \
                WHERE ";
  
    if (email !== null) {
        query += `c1.email = '${email}'`;
    }
  
    if (email !== null && phoneNumber !== null) {
        query += ' OR ';
    }
  
    if (phoneNumber !== null) {
        query += `c1.phoneNumber = '${phoneNumber}'`;
    }
  
    const result: QueryResult<Contract> = await pool.query(query);
    return result.rows;
}