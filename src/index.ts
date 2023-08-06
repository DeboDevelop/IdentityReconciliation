require('dotenv').config({ path: __dirname+'/.env' });
import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './database';
import logger from "./logger";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.json('Hello World!!!');
});

// Graceful termination function
const shutdown = async () => {
    logger.info('Received signal to terminate. Closing connections...');
    try {
        await pool.end(); // Close all connections in the pool gracefully
        logger.info('Database connections closed. Shutting down server...');
        process.exit(0);
    } catch (error) {
        logger.error('Error while closing connections:', error);
        process.exit(1);
    }
};

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}`);
});

// Handle SIGINT (Ctrl+C) and SIGTERM signals for graceful termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Recommended to close the server and exit the process when there are unhandled promise rejections
    shutdown();
});