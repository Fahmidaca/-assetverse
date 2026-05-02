import mongoose from "mongoose";

const RAW_URI = process.env.MONGODB_URI || "";
const isPlaceholder =
  !RAW_URI ||
  RAW_URI.includes("<user>") ||
  RAW_URI.includes("<password>") ||
  RAW_URI.includes("your_");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri: string | null;
  memoryServer: any;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, uri: null, memoryServer: null };
}

async function resolveUri(): Promise<string> {
  if (cached.uri) return cached.uri;
  if (!isPlaceholder) {
    cached.uri = RAW_URI;
    return RAW_URI;
  }
  // Fallback to in-memory MongoDB so the app runs without external setup
  console.warn("⚠️  MONGODB_URI is a placeholder — falling back to in-memory MongoDB (data will not persist across restarts)");
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  cached.memoryServer = mem;
  cached.uri = mem.getUri();
  console.log("🟢  In-memory MongoDB ready at", cached.uri);
  return cached.uri;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveUri();
      return mongoose.connect(uri, { bufferCommands: false });
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
