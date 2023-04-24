import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function setupDatabase() {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS travel_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      departure_airport_iata TEXT,
      arrival_airport_iata TEXT,
      departure_date TEXT,
      return_date TEXT,
      num_adults INTEGER,
      num_children INTEGER,
      num_infants INTEGER,
      cabin_class TEXT,
      currency TEXT
    );
  `);

  return db;
}

export default setupDatabase;
