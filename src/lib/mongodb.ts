import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reused across hot-reloads in dev and across serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to admin-panel/.env.local — see README.md."
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  // BUG FIX: if mongoose.connect() ever rejects (Atlas hiccup, IP-allowlist
  // blip, DNS timeout, credential rotation), cache.promise was left holding
  // the rejected promise forever. Every subsequent call to any /api/* route
  // — including the public /api/app/* endpoints the Android app depends on
  // — re-awaited that same already-rejected promise and failed immediately,
  // with no retry, until the whole Node process restarted. On serverless
  // (Vercel) the module scope persists across invocations, so this could
  // wedge every route until a redeploy. Reset cache.promise on failure so
  // the next call gets a fresh connection attempt instead of replaying a
  // dead one.
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
