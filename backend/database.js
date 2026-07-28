const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB URI: default to localhost if MONGODB_URI is not provided in env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusswap';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB at:', MONGODB_URI);
    // Trigger migration check after connection is established
    migrateDataIfNeeded();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Schema definition for User (Student Profile Details)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Map from existing string IDs
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatarColor: { type: String, default: '#8b5cf6' },
  studentId: { type: String, default: '' },
  college: { type: String, default: 'Campus University' },
  major: { type: String, default: '' },
  yearOfStudy: { type: String, default: 'Freshman' },
  phoneNumber: { type: String, default: '' },
  bio: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Schema definition for Chat messages
const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Schema definition for Chat sessions
const ChatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Map from existing string IDs
  listingId: { type: Number, required: true },
  listingTitle: { type: String, required: true },
  price: { type: Number, default: 0 },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerAvatarColor: { type: String, default: '#8b5cf6' },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerAvatarColor: { type: String, default: '#8b5cf6' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Chat = mongoose.model('Chat', ChatSchema);

// Data migration function
async function migrateDataIfNeeded() {
  try {
    // 1. Migrate Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('MongoDB Users collection is empty. Checking users.json for migration...');
      const usersFilePath = path.join(__dirname, 'users.json');
      if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, 'utf8');
        const usersArray = JSON.parse(fileContent);
        
        if (Array.isArray(usersArray) && usersArray.length > 0) {
          console.log(`Migrating ${usersArray.length} users from users.json to MongoDB...`);
          
          const migrationUsers = usersArray.map(user => {
            const emailLower = user.email.toLowerCase().trim();
            const isVerified = emailLower.endsWith('.edu') || emailLower.endsWith('.edu.in');
            
            return {
              id: user.id,
              name: user.name,
              email: emailLower,
              passwordHash: user.passwordHash,
              avatarColor: user.avatarColor || '#8b5cf6',
              studentId: '',
              college: 'Campus University',
              major: '',
              yearOfStudy: 'Freshman',
              phoneNumber: '',
              bio: '',
              isVerified: isVerified,
              createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
            };
          });

          await User.insertMany(migrationUsers);
          console.log('User migration completed successfully!');
        }
      }
    }

    // 2. Migrate Chats
    const chatCount = await Chat.countDocuments();
    if (chatCount === 0) {
      console.log('MongoDB Chats collection is empty. Checking chats.json for migration...');
      const chatsFilePath = path.join(__dirname, 'chats.json');
      if (fs.existsSync(chatsFilePath)) {
        const fileContent = fs.readFileSync(chatsFilePath, 'utf8');
        const chatsArray = JSON.parse(fileContent);

        if (Array.isArray(chatsArray) && chatsArray.length > 0) {
          console.log(`Migrating ${chatsArray.length} chat threads from chats.json to MongoDB...`);
          await Chat.insertMany(chatsArray);
          console.log('Chat migration completed successfully!');
        }
      }
    }
  } catch (error) {
    console.error('Error migrating mock JSON data to MongoDB:', error);
  }
}

module.exports = {
  User,
  Chat
};
