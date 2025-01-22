import { Router } from "express";
import * as mysql from 'mysql2/promise';
import { createConnection } from "../../database";
import { PartnerService } from "../services/partner-service";
import { EventService } from "../services/event-service";


export const partnerRoutes = Router();


partnerRoutes.post('/register', async (req, res) => {
  const {name, email, password, company_name} = req.body;

  const partnerService = new PartnerService();
  const result = await partnerService.register({name, email, password, company_name});
  res.status(201).json(result); 
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
      const eventService = new EventService();
      const result = await eventService.create({
        name,
        description,
        date,
        location,
        partnerId: partner.id
      })
      
    } finally {
      await connection.end();
    }
})

partnerRoutes.get('/events', async (req, res) => {
  
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
