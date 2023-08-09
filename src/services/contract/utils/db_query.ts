import { InitialQueryContract, DBContract } from "../../../@types/contract";
import { QueryResult } from "pg";
import pool from "../../../database";

export async function getContractsByEmailAndPhoneNumber(
    email: string | null,
    phoneNumber: string | null
): Promise<InitialQueryContract[]> {
    let query =
        'SELECT c1.id AS "contractId", \
                    c1.email AS "contractEmail", \
                    c1.phone_number AS "contractPhoneNumber", \
                    c1.linked_id AS "contractLinkedId", \
                    c1.link_precedence AS "contractLinkPrecedence", \
                    c2.email AS "parentContractEmail", \
                    c2.phone_number AS "parentContractPhoneNumber", \
                    c2.link_precedence AS "parentContractLinkPrecedence" \
                FROM Contract c1 \
                LEFT JOIN Contract c2 ON c1.linked_id = c2.id \
                WHERE ';

    if (email !== null) {
        query += `c1.email = '${email}'`;
    }

    if (email !== null && phoneNumber !== null) {
        query += " OR ";
    }

    if (phoneNumber !== null) {
        query += `c1.phone_number = '${phoneNumber}'`;
    }

    const result: QueryResult<InitialQueryContract> = await pool.query(query);
    return result.rows;
}

async function insertContract(values: any[]): Promise<QueryResult> {
    const insertQuery = `
        INSERT INTO Contract (phone_number, email, linked_id, link_precedence, created_at, updated_at, deleted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    return await pool.query(insertQuery, values);
}

export async function createPrimaryContract(
    email: string,
    phoneNumber: string
): Promise<DBContract[]> {
    const values = [
        phoneNumber,
        email,
        null,
        "primary",
        new Date(),
        new Date(),
        null,
    ];

    const result: QueryResult<DBContract> = await insertContract(values);
    return result.rows;
}

export async function updateSecondaryContract(
    primary: number,
    primaryLowPrec: number
): Promise<QueryResult> {
    const updateQuery = `
        Update Contract SET linked_id = '${primary}', link_precedence = 'secondary'
        WHERE id = '${primaryLowPrec}' OR linked_id = ${primaryLowPrec};
    `;

    return await pool.query(updateQuery);
}
