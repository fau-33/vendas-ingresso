import * as mysql from 'mysql2/promise';
import { EventModel } from '../models/event-model';
import { Database } from '../../database';

export class EventService {
    async create(data: {
        name: string;
        description: string | null;
        date: Date;
        location: string;
        partnerId: number;
      }) {
        const { name, description, date, location, partnerId } = data;
        const event = await EventModel.create({
          name,
          description,
          date,
          location,
          partner_id: partnerId,
        });
        return {
          id: event.id,
          name,
          description,
          date,
          location,
          created_at: event.created_at,
          partner_id: partnerId,
        };
      }

    async findAll(partnerId?: number) {
        const connection = Database.getInstance();
        const query = partnerId ? "SELECT * FROM events WHERE partner_id = ?" : "SELECT * FROM events";
            const params = partnerId ? [partnerId] : [];
            const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
                query,
                params
            );
            return eventRows;
        
        
            
    }

    async findById(eventId: number) {
        const connection = Database.getInstance();
        const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE id = ?",
            [eventId]
        );
        return eventRows.length ? eventRows[0] : null;
        
    }
}
