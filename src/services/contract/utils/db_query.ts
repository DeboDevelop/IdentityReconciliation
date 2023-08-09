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

async function insertContract(values: any[]): Promise<QueryResult> {
    const insertQuery = `
        INSERT INTO Contract (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;

    return await pool.query(insertQuery, values);
}

export async function createPrimaryContract(email: string, phoneNumber: string): Promise<number> {
    const values = [
        phoneNumber,
        email,
        null,
        'primary',
        new Date(),
        new Date(),
        null,
    ];
    
    const result: QueryResult<{ id: number }> = await insertContract(values);
    return result.rows[0].id;
  }