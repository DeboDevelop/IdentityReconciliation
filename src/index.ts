require("dotenv").config();
import express from "express";
import cors from "cors";
import pool from "./database";
import logger from "./logger";
import contractRoutes from "./services/contract/routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/", contractRoutes);

// Graceful termination function
const shutdown = async () => {
    logger.info("Received signal to terminate. Closing connections...");
    try {
        await pool.end(); // Close all connections in the pool gracefully
        logger.info("Database connections closed. Shutting down server...");
        process.exit(0);
    } catch (error) {
        logger.error("Error while closing connections:", error);
        process.exit(1);
    }
};

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}`);
});

// Handle SIGINT (Ctrl+C) and SIGTERM signals for graceful termination
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:");
    logger.error(promise);
    logger.error("reason:");
    logger.error(reason);
    // Recommended to close the server and exit the process when there are unhandled promise rejections
    shutdown();
});

export default app;
