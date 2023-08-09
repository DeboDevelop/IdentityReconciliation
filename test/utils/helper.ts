import { Pool } from "pg";
import { QueryResult } from "pg";
import logger from "../../src/logger";

const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database:
        process.env.NODE_ENV === "test"
            ? process.env.DB_NAME_TEST
            : process.env.DB_NAME,
    host: process.env.DB_HOST_NAME,
    port: 5432, // PostgreSQL default port
});

export async function insertContract(values: any[]): Promise<QueryResult> {
    const insertQuery = `
        INSERT INTO Contract (phone_number, email, linked_id, link_precedence, created_at, updated_at, deleted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;

    return await pool.query(insertQuery, values);
}

export async function truncateContract() {
    try {
        const truncateQuery = "TRUNCATE TABLE Contract;";
        await pool.query(truncateQuery);
    } catch (error) {
        logger.error("Error deleting data:");
        logger.error(error);
    }
}
