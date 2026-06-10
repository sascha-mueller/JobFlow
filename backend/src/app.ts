import express from 'express';

import connectDB from './db/index.ts';

const app = express();

app.use(express.json());

const startServer = async (PORT = 3000) => {
  try {
    await connectDB();

    app.listen(PORT, () =>
      console.log(
        `\x1b[34mMain app listening at http://localhost:${PORT}\x1b[0m`,
      ),
    );
  } catch (error: unknown) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
