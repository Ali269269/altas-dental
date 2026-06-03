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

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env file");
  }

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });

  await clearLegacyCollectionValidator("appointments");

  console.log("====================================");
  console.log("✅ MongoDB Connected Successfully");
  console.log("====================================");

  return conn;
};

module.exports = connectDB;