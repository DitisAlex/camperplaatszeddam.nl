import { query } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const result = await query("SELECT * FROM parking");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Database error" });
  }
}
