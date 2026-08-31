import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db"; 
import { redisClient } from "./config/redis";
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import { startTaskWorker } from "./queue/task.queue";
import {setupSwagger} from './config/swagger'
const PORT = process.env.PORT || 5000;
export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
// setupSwagger(app)
const healthHandler = (req: Request, res: Response) => {
  const redisStatus =
    redisClient.status === "ready" ? "connected" : "disconnected";
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    success: true,
    message: "server is running",
    data: {
      status:
        mongoStatus === "connected" && redisStatus === "connected"
          ? "UP"
          : "DEGRADED",
      services: {
        mongoDb: mongoStatus,
        redis: redisStatus,
      },
    },
  });
};
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/tasks',taskRoutes)
app.get("/api/v1/health", healthHandler);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    errorCode: "RESOURCE NOT FOUND",
  });
});

if (process.env.NODE_ENV !== "test") {
  Promise.all([connectDatabase(), redisClient.connect()]).then(() => {
    // startTaskWorker();
    // while uncomment then need to be use version more then 5 for redis in local redis server right now its only 3 there is not problem in code
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  });
}
