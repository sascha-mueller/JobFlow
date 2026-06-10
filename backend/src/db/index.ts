import mongoose from 'mongoose';

import { MONGODB_URI, DB_NAME } from '../config/index.ts';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
    });

    console.log('\x1b[35mMongoDB connected via Mongoose\x1b[0m');
  } catch (error: unknown) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
