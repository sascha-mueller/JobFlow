import express from "express";
import cookieParser from "cookie-parser";

import { PORT } from './config/index.ts';
import connectDB from "./db/index.ts";
import { authRouter } from "./routes/index.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () =>
      console.log(
        `\x1b[34mMain app listening at http://localhost:${PORT}\x1b[0m`,
      ),
    );
  } catch (error: unknown) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
