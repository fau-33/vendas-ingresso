import { Router } from "express";
import * as mysql from 'mysql2/promise';
import { createConnection } from "../../database";

export const eventRoutes = Router();


eventRoutes.get("/", async (req, res) => {
  const connection = await createConnection();
  try {
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events"
    );
    res.json(eventRows);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
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
      res.status(404).json({ message: "Evento não encontrado" });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  } finally {
    await connection.end();
  }
});
