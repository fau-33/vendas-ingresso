import { Router } from "express";
import * as mysql from 'mysql2/promise';
import { createConnection } from "../../database";

export const eventRoutes = Router();


eventRoutes.get("/ ", async (req, res) => {
    const connection = await createConnection();
    try {
      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM events"
      );
      res.json(eventRows);
    } finally {
      await connection.end();
    }
  });
  
  eventRoutes.get("/:eventId", async (req, res) => {
    const { eventId } = req.params;
    const connection = await createConnection();
    try {
      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM events WHERE id = ?",
        [eventId]
      );
      const event = eventRows.length ? eventRows[0] : null;
  
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
  
      res.json(event);
    } finally {
      await connection.end();
    }
  });