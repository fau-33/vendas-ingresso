import { Router } from "express";
import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { createConnection } from "../../database";


export const partnerRoutes = Router();


partnerRoutes.post('/register', async (req, res) => {
  const {name, email, password, company_name} = req.body;

  const connection = await createConnection();

  try {
      // Verificar se o e-mail já existe
      const [existingUser] = await connection.execute<mysql.RowDataPacket[]>(
          'SELECT * FROM users WHERE email = ?',
          [email]
      );

      if (existingUser.length > 0) {
          res.status(409).json({ message: 'E-mail já está em uso' });
          return;
      }

      const createdAt = new Date();
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const [userResult] = await connection.execute<mysql.ResultSetHeader>(
          'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)',
          [name, email, hashedPassword, createdAt]
      );
      const userId = userResult.insertId;

      const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
          'INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)',
          [userId, company_name, createdAt]
      );
      
      res.status(201).json({ id: partnerResult.insertId, user_id: userId, company_name, created_at: createdAt });
  } catch (error) {
      console.error('Erro ao registrar parceiro:', error);
      res.status(500).json({ message: 'Erro ao registrar parceiro' });
  } finally {
      await connection.end();
  }
});


partnerRoutes.post('/events',async (req, res) => {
    const {name,description, date, location } = req.body;
    const userId = req.user!.id;
    const connection = await createConnection();

    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?",
      [userId]
      );
      const partner = rows.length ? rows[0] : null;
  
      if (!partner) {
        res.status(403).json({ message: "Not authorized" });
        return;
      }
      const eventDate = new Date(date);
      const createdAt = new Date();
      const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, eventDate, location, createdAt, partner.id]
      );
      res.status(201).json({
        id: eventResult.insertId,
        name,
        description,
        date: eventDate,
        location,
        created_at: createdAt,
        partner_id: partner.id,
      });
    } finally {
      await connection.end();
    }
})

partnerRoutes.get('/events', async (req, res) => {
  const userId = req.user!.id;
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );
    res.json(eventRows);
  } finally {
    await connection.end();
  }
    
})

partnerRoutes.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user!.id;
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );
    const partner = rows.length ? rows[0] : null;

    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ? and id = ?",
      [partner.id, eventId]
    );
    const event = eventRows.length ? eventRows[0] : null;

    if (!event) {
      res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } finally {
    await connection.end();
  }
});
