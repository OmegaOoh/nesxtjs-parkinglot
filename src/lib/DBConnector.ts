import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export default class DBConnector {
  private static instance: DBConnector | undefined;
  private cached = global.mongoose = { conn: null, promise: null };

  private constructor() {}

  public static getInstance() {
    if (!DBConnector.instance) {
      DBConnector.instance = new DBConnector()
    }
    return DBConnector.instance
  }

  public async connect() {

    if (!MONGODB_URI)
      throw new Error('Please define the MONGODB_URI environment variable');

    if (this.cached.conn) {
      return this.cached.conn
    }

    if (!this.cached.promise) {
      this.cached.promise = mongoose.connect(MONGODB_URI).
        then((mongoose) => {
          return mongoose
        });
    }

    this.cached = await this.cached.promise;
    return this.cached.conn
  }
}
