import express from 'express';
import * as mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { createConnection } from '../database';
import { authRoutes } from './controller/auth-controller';
import { partnerRoutes } from './controller/partner-controller';
import { customerRoutes } from './controller/customer-controller';
import { eventRoutes } from './controller/event-controller';


const app = express();

app.use(express.json());

const unprotectedRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isProtectedRoute = unprotectedRoutes.some(
    (route) => route.method === req.method && route.path.startsWith(req.path)
  )

  if (isProtectedRoute) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const payload = jwt.verify(token, "12456") as { id: number, email: string };
    const connection = await createConnection();
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [payload.id]
    )
    const user = rows.length ? rows[0] : null;
    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.user = user as { id: number, email: string };
    next();
    
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.use('/auth', authRoutes);
app.use('/partners', partnerRoutes);
app.use('/customers', customerRoutes);
app.use('/events', eventRoutes);

  





app.listen(3000, async () => {
    const connection = await createConnection();
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE events");
    await connection.execute("TRUNCATE TABLE customers");
    await connection.execute("TRUNCATE TABLE partners");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log('Server started on port 3000');
});