require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose');
const initData = require("./data.js");
const Post = require("../models/post.js");


const owner = "66806259795e54ed9882011c"
if (process.env.NODE_ENV === 'production') {
    console.log("This script should not be run in a production environment.");
    process.exit(1);
}

const URL = process.env.ATLASDB_URL || "mongodb+srv://thecampusdiariesofficial:fYUymWTtdESeznmD@project.9p4dbnn.mongodb.net/?retryWrites=true&w=majority&appName=project";

if (!URL) {
    console.error("MongoDB Atlas URL is not defined. Please set the ATLASDB_URL environment variable.");
    process.exit(1);
}

console.log("MongoDB Atlas URL:", URL);  // Log the URL to check if it's being read correctly

async function main() {
    try {
        await mongoose.connect(URL); // Simplified connection without deprecated options
        console.log("MongoATLAS connection successful");

        try {
            await initDB();
            console.log("DB initialization complete");
        } catch (initErr) {
            console.error(`Error during DB initialization: ${initErr.message}`);
        }
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
    } finally {
        try {
            await mongoose.disconnect();
            console.log("MongoDB disconnected successfully");
        } catch (disconnectErr) {
            console.error(`Error during disconnection: ${disconnectErr.message}`);
        }
    }
}

const initDB = async () => {
    await Post.deleteMany({});

    // Map and await for coordinates extraction
    initData.data = await Promise.all(initData.data.map(async obj => ({
        ...obj,
        owner: owner,
    })));
    await Post.insertMany(initData.data);
    console.log("Data was initialized");
};

main();
