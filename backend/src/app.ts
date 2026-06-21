import express from "express";
import cookieParser from "cookie-parser";

import { PORT } from "./config/index.ts";
import connectDB from "./db/index.ts";

import { baseErrHandler, extErrHandler } from "./middleware/index.ts";
import {
  applicationRouter,
  authRouter,
  companyRouter,
  contactRouter,
  userRouter,
  profileRouter,
} from "./routes/index.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/applications", applicationRouter);
app.use("/api/auth", authRouter);
app.use("/api/companies", companyRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/users", userRouter);
app.use("/api/profiles", profileRouter);

app.use((req, res) => {
  console.warn("[404 Route]", {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
  });
  res.status(404).json({ message: "Route not found" });
});

app.use(extErrHandler);
app.use(baseErrHandler);

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
