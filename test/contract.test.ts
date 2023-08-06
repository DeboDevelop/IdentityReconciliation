import { expect } from 'chai';
import supertest from 'supertest';
import app from '../src/index';
import pool from "../src/database";
import { QueryResult } from 'pg';
import logger from '../src/logger';

const request = supertest(app);

async function insertContract(values: (string | Date | null)[]): Promise<QueryResult> {
    const insertQuery = `
        INSERT INTO Contract (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;

    return await pool.query(insertQuery, values);
}

describe('Contract', () => {
    let contractIds: number[] = [];
    before(async () => {
        try {
            const primaryValues = [
                '123456',
                'lorraine@hillvalley.edu',
                null,
                'primary',
                new Date(),
                new Date(),
                null,
            ];
    
            const primaryResult: QueryResult = await insertContract(primaryValues);
            contractIds.push(primaryResult.rows[0].id);
            const primaryContractId = primaryResult.rows[0].id
    
            const secondaryValues = [
                '123456',
                'mcfly@hillvalley.edu',
                primaryContractId,
                'secondary',
                new Date(),
                new Date(),
                null,
            ];
    
            const secondaryResult: QueryResult = await insertContract(secondaryValues);
            contractIds.push(secondaryResult.rows[0].id);
        } catch (error) {
            logger.error('Error inserting data:');
            logger.error(error);
        }
    });
    describe('POST /identify', () => {
        it('should result in server error', async () => {
            const response = await request.post('/identify');
            expect(response.status).to.equal(500);
            expect(response.body).to.have.property('message').that.is.a('string');
            expect(response.body.message).to.equal('Route is not yet implemented');
        });
    });
    after(async () => {
        try {
            const placeholders = contractIds.map((_, index) => `$${index + 1}`).join(', ');
            const deleteQuery = `
                DELETE FROM Contract WHERE id IN (${placeholders})
                RETURNING *; -- Return deleted rows for printing output
            `;
            const result = await pool.query(deleteQuery, contractIds);
            logger.info('Deleted rows:');
            logger.info(result.rows);
        } catch (error) {
            logger.error('Error deleting data:');
            logger.error(error);
        }
    });  
});
