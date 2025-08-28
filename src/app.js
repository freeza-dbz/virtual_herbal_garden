import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";



const app = express();
dotenv.config()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(helmet());

// routes import

import userRouter from "./routes/user.routes.js";

import herbRouter from "./routes/herb.routes.js";



// routes declaration

app.use("/api/v1/users", userRouter);

app.use("/api/v1/herbs", herbRouter);



export { app };
