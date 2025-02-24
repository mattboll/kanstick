import { migrate } from "postgres-migrations";
import { Client } from "pg";
import dotenv from "dotenv";

const env = process.env.NODE_ENV || "local";

dotenv.config({ path: `.env.${env}` });

async function runMigrations() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });

  try {
    await client.connect();
    await migrate({ client }, "migrations");
    console.log("Migrations exécutées avec succès");
  } catch (error) {
    console.error("Erreur lors de l'exécution des migrations :", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
