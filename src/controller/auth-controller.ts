import { Router } from "express";
import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { createConnection } from "../../database";
import jwt from 'jsonwebtoken';


export const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
      const user = rows.length ? rows[0] : null;
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email }, '12456', { expiresIn: '1h' });
        res.status(200).json({ token });
      }else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } finally {
      await connection.end();
    }
    
    res.send();
})