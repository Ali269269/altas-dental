const mongoose = require("mongoose");

async function clearLegacyCollectionValidator(collectionName) {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();

    if (!collections.length) return;

    const validator = collections[0].options?.validator;
    if (!validator || Object.keys(validator).length === 0) return;

    await db.command({
      collMod: collectionName,
      validator: {},
      validationLevel: "off",
    });
    console.log(`Cleared legacy validator on "${collectionName}" collection`);
  } catch (error) {
    console.warn(
      `Could not clear validator on "${collectionName}":`,
      error.message
    );
  }
}

async function dropLegacyUuidIndex(collectionName) {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (!collections.length) return;

    const indexes = await db.collection(collectionName).indexes();
    const legacyUuid = indexes.find((idx) => idx.name === "uuid_1");
    if (legacyUuid) {
      await db.collection(collectionName).dropIndex("uuid_1");
      // console.log(`Dropped legacy "uuid_1" index on ${collectionName} collection`);
    }
  } catch (error) {
    console.warn(`${collectionName} uuid index cleanup:`, error.message);
  }
}

async function cleanupLegacyBlogIndexes() {
  await dropLegacyUuidIndex("blogs");
}

async function cleanupLegacyAdminIndexes() {
  await dropLegacyUuidIndex("admins");
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env file");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });

  await clearLegacyCollectionValidator("appointments");
  await clearLegacyCollectionValidator("blogs");
  await clearLegacyCollectionValidator("admins");
  await cleanupLegacyBlogIndexes();
  await cleanupLegacyAdminIndexes();

  console.log("====================================");
  console.log("✅ MongoDB Connected Successfully");
  console.log("====================================");

  return conn;
};

module.exports = connectDB;