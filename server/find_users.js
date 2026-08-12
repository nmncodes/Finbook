const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    resetToken: String,
    expireToken: Date,
});

const User = mongoose.model('User', userSchema);

async function findUsers() {
    try {
        const DB_URL = process.env.DB_URL || 'mongodb+srv://namansurana52_db_user:q1BI7yNBRRm3FNcI@finbook01.xni7r7t.mongodb.net/';
        await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        
        console.log("Connected to MongoDB. Fetching users...");
        const users = await User.find({}, '-password'); // Exclude passwords for safety
        
        console.log("\n--- Users in Database ---");
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.name} | Email: ${user.email} | ID: ${user._id}`);
            });
        }
        console.log("-------------------------\n");
    } catch (error) {
        console.error("Error connecting or fetching users:", error);
    } finally {
        await mongoose.disconnect();
    }
}

findUsers();
