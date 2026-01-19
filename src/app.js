import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.routes.js'
import userRoutes from "./routes/user.routes.js"
import matchRoutes from "./routes/match.routes.js"


const app = express();

app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/match", matchRoutes);

export default app;