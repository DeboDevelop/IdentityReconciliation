import { Pool, PoolConfig } from "pg";

const poolConfig: PoolConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database:
        process.env.NODE_ENV === "test"
            ? process.env.DB_NAME_TEST
            : process.env.DB_NAME,
    host: process.env.DB_HOST_NAME,
    port: 5432, // PostgreSQL default port
};
if (process.env.NODE_ENV === "prod") {
    poolConfig.ssl = true;
}

const pool = new Pool(poolConfig);

export default pool;
