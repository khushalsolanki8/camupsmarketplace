/**
 * Production-ready Express Server for CampusSwap
 * 
 * Sets up API endpoints to communicate with Anthropic's Claude API:
 * 1. POST /api/chat - Integrates the floating chatbot widget with full conversation history and safety guardrails.
 * 2. POST /api/autofill - Integrates the image listing assistant utilizing Claude's Vision capabilities.
 * 
 * Prerequisites:
 * npm init -y
 * npm install express cors dotenv @anthropic-ai/sdk
 * Set ANTHROPIC_API_KEY inside your .env file
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const { User, Chat } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend cross-origin requests
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger payloads for Base64 image upload

// Serve static frontend files from Vite build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Initialize Anthropic SDK Client
// It automatically retrieves process.env.ANTHROPIC_API_KEY
const anthropic = new Anthropic();

// Define System Prompt to instruct Claude on safety guidelines, anti-fraud rules, and formatting
const UNIBOT_SYSTEM_PROMPT = `
You are "UniBot", a smart, friendly, and trustworthy AI assistant for CampusSwap, a college campus marketplace.
Your goal is to help students buy, sell, trade textbooks, notes, and furniture.

Guiding Principles:
1. SAFETY FIRST: Remind users to only meet in public, well-lit spaces on campus (like the Library Lobby or Student Center).
2. ANTI-FRAUD: Warn users never to pay in advance. If a user suggests shipping items, report that campus transactions must be done in person.
3. ACADEMIC INTEGRITY: Do not facilitate selling exam answer keys, homework papers, or test papers. Report that this violates university honor code.
4. NO SHADY GOODS: Restrict selling alcohol, weapons, drugs, or illegal items.
5. NEGOTIATING: Help buyers draft polite offers or sellers respond to offers while maintaining a friendly community tone.
6. CONCISE: Keep responses conversational, readable, and under 3-4 sentences unless explaining safety procedures or details guidelines.
`;

/**
 * 1. AI Chatbot API Endpoint
 * Handles conversation messages, incorporating history to provide conversational memory.
 */
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Convert generic chat history format to Anthropic messages payload
    // Expected roles: 'user' and 'assistant'
    const formattedMessages = [];
    
    if (Array.isArray(history)) {
      history.forEach(msg => {
        formattedMessages.push({
          role: msg.sender === 'bot' ? 'assistant' : 'user',
          content: msg.text
        });
      });
    }

    // Add current user input
    formattedMessages.push({
      role: 'user',
      content: message
    });

    // Invoke Anthropic Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.5,
      system: UNIBOT_SYSTEM_PROMPT,
      messages: formattedMessages
    });

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('Claude API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with Claude API' });
  }
});

/**
 * 2. AI Vision Listing Generator Endpoint
 * Accepts base64 image + media type, returning structured JSON for title, description, category, and price.
 */
app.post('/api/autofill', async (req, res) => {
  const { imageBase64, mediaType } = req.body; // e.g., mediaType = 'image/jpeg'

  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ error: 'imageBase64 and mediaType are required fields.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 600,
      temperature: 0.2, // Low temperature for high precision/consistency
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Analyze this photo and suggest a marketplace listing. Return ONLY a valid JSON object (no markdown, no extra commentary) containing exactly these keys: "title", "category" (must choose one of: "textbooks", "notes", "electronics", "housing"), "description" (2-3 sentences summarizing condition and specifications), and "suggested_price_inr" (a fair integer price estimate in Indian Rupees based on current used market value).'
            }
          ],
        },
      ],
    });

    const resultText = response.content[0].text;
    
    // Safely parse JSON returned by Claude
    try {
      const listingData = JSON.parse(resultText.trim());
      res.json(listingData);
    } catch (parseErr) {
      console.warn("Failed to parse JSON directly. Response text:", resultText);
      res.status(422).json({ 
        error: "Failed to extract formatted JSON from AI response", 
        rawText: resultText 
      });
    }

  } catch (error) {
    console.error('Claude Vision API Error:', error);
    res.status(500).json({ error: 'Failed to analyze listing image' });
  }
});

// User Auth Helper Utilities and Endpoints
const sessions = new Map(); // token -> userId

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getUserIdFromAuthHeader(headers) {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return sessions.get(token);
}

function getSimulatedStudentReply(userMsg, sellerName, itemTitle) {
  const msg = userMsg.toLowerCase();
  
  if (msg.includes('available') || msg.includes('still have') || msg.includes('buy')) {
    return `Hey! Yes, the "${itemTitle}" is still available. I'm looking to sell it soon. Would you like to meet on campus to check it out?`;
  }
  if (msg.includes('meet') || msg.includes('where') || msg.includes('when')) {
    return `Sure, we can meet up. I'm usually free tomorrow afternoon. How about we meet at the Central Library Lobby around 3 PM?`;
  }
  if (msg.includes('price') || msg.includes('cheaper') || msg.includes('discount') || msg.includes('negotiate')) {
    return `I think the price is pretty fair given its condition, but I could do a small discount if we meet today. What price were you thinking?`;
  }
  if (msg.includes('condition') || msg.includes('damage') || msg.includes('work')) {
    return `It's in really good condition, just typical light college use. I can show you everything when we meet up!`;
  }
  
  return `Sounds good! Let's coordinate a place and time to meet up on campus. Does the Student Center lobby work for you?`;
}

// 3. User Authentication APIs

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, avatarColor, studentId, college, major, yearOfStudy, phoneNumber, bio } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const passwordHash = hashPassword(password);
    const isVerified = emailLower.endsWith('.edu') || emailLower.endsWith('.edu.in');

    const newUser = new User({
      id: userId,
      name: name.trim(),
      email: emailLower,
      passwordHash: passwordHash,
      avatarColor: avatarColor || '#8b5cf6',
      studentId: studentId ? studentId.trim() : '',
      college: college ? college.trim() : 'Campus University',
      major: major ? major.trim() : '',
      yearOfStudy: yearOfStudy || 'Freshman',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      bio: bio ? bio.trim() : '',
      isVerified: isVerified
    });

    await newUser.save();

    // Auto-login: generate token
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, userId);

    res.status(201).json({
      message: 'Registration successful',
      token: token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarColor: newUser.avatarColor,
        studentId: newUser.studentId,
        college: newUser.college,
        major: newUser.major,
        yearOfStudy: newUser.yearOfStudy,
        phoneNumber: newUser.phoneNumber,
        bio: newUser.bio,
        isVerified: newUser.isVerified
      }
    });
  } catch (err) {
    console.error('Registration API Error:', err);
    res.status(500).json({ error: 'Registration failed due to database error.' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const passwordHash = hashPassword(password);

    const user = await User.findOne({ email: emailLower, passwordHash });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        studentId: user.studentId,
        college: user.college,
        major: user.major,
        yearOfStudy: user.yearOfStudy,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Login API Error:', err);
    res.status(500).json({ error: 'Login failed due to database error.' });
  }
});

// Get Current User Profile (Auth Check)
app.get('/api/auth/me', async (req, res) => {
  const userId = getUserIdFromAuthHeader(req.headers);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        studentId: user.studentId,
        college: user.college,
        major: user.major,
        yearOfStudy: user.yearOfStudy,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Me API Error:', err);
    res.status(500).json({ error: 'Database lookup failed.' });
  }
});

// Update Profile Details
app.post('/api/auth/profile', async (req, res) => {
  const userId = getUserIdFromAuthHeader(req.headers);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session token.' });
  }

  const { name, studentId, college, major, yearOfStudy, phoneNumber, bio, avatarColor } = req.body;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (avatarColor) user.avatarColor = avatarColor;
    user.studentId = studentId !== undefined ? studentId.trim() : user.studentId;
    user.college = college !== undefined ? college.trim() : user.college;
    user.major = major !== undefined ? major.trim() : user.major;
    user.yearOfStudy = yearOfStudy !== undefined ? yearOfStudy : user.yearOfStudy;
    user.phoneNumber = phoneNumber !== undefined ? phoneNumber.trim() : user.phoneNumber;
    user.bio = bio !== undefined ? bio.trim() : user.bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        studentId: user.studentId,
        college: user.college,
        major: user.major,
        yearOfStudy: user.yearOfStudy,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Profile Update API Error:', err);
    res.status(500).json({ error: 'Failed to update student profile.' });
  }
});

// Logout User
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  sessions.delete(token);

  res.json({ message: 'Logout successful' });
});

// ==========================================
// PEER-TO-PEER MESSAGING APIS
// ==========================================

// 1. Get All Chats for User
app.get('/api/chats', async (req, res) => {
  const userId = getUserIdFromAuthHeader(req.headers);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session.' });
  }

  try {
    const userChats = await Chat.find({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    });
    res.json(userChats);
  } catch (err) {
    console.error('Fetch Chats Error:', err);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
});

// 2. Start or Retrieve a Chat Session
app.post('/api/chats/start', async (req, res) => {
  const userId = getUserIdFromAuthHeader(req.headers);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session.' });
  }

  const { listingId, listingTitle, sellerName, sellerId, price, avatarColor } = req.body;
  if (!listingId || !listingTitle || !sellerName) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const buyer = await User.findOne({ id: userId });
    if (!buyer) {
      return res.status(401).json({ error: 'Buyer student not found.' });
    }

    // Determine sellerId (registered vs mock)
    let resolvedSellerId = sellerId;
    if (!resolvedSellerId) {
      const cleanSellerName = sellerName.split(' ')[0].toLowerCase();
      const matchingUser = await User.findOne({ name: new RegExp('^' + cleanSellerName + '$', 'i') });
      resolvedSellerId = matchingUser ? matchingUser.id : `mock_${cleanSellerName}`;
    }

    let chat = await Chat.findOne({
      listingId,
      buyerId: userId,
      sellerId: resolvedSellerId
    });

    if (!chat) {
      chat = new Chat({
        id: 'chat_' + crypto.randomBytes(8).toString('hex'),
        listingId,
        listingTitle,
        price: price || 0,
        buyerId: userId,
        buyerName: buyer.name,
        buyerAvatarColor: buyer.avatarColor,
        sellerId: resolvedSellerId,
        sellerName: sellerName,
        sellerAvatarColor: avatarColor || '#8b5cf6',
        messages: []
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error('Start Chat Error:', err);
    res.status(500).json({ error: 'Failed to initialize chat session.' });
  }
});

// 3. Post Message to a Chat Session
app.post('/api/chats/message', async (req, res) => {
  const userId = getUserIdFromAuthHeader(req.headers);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session.' });
  }

  const { chatId, text } = req.body;
  if (!chatId || !text) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    const chat = await Chat.findOne({ id: chatId });
    if (!chat) {
      return res.status(404).json({ error: 'Conversation thread not found.' });
    }

    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You are not in this chat.' });
    }

    const sender = await User.findOne({ id: userId });
    const senderName = sender ? sender.name : 'Unknown';

    const newMsg = {
      senderId: userId,
      senderName: senderName,
      text: text,
      timestamp: new Date()
    };

    chat.messages.push(newMsg);
    chat.updatedAt = new Date();
    await chat.save();

    res.status(200).json({ status: 'sent', message: newMsg });

    // Handle mock student response if recipient is mock
    const isBuyer = chat.buyerId === userId;
    const targetRecipientId = isBuyer ? chat.sellerId : chat.buyerId;

    if (targetRecipientId.startsWith('mock_')) {
      setTimeout(async () => {
        try {
          const currentChat = await Chat.findOne({ id: chatId });
          if (!currentChat) return;

          const recipientName = isBuyer ? currentChat.sellerName : currentChat.buyerName;
          const title = currentChat.listingTitle;
          const price = currentChat.price;

          let replyText = '';

          if (process.env.ANTHROPIC_API_KEY) {
            try {
              const chatHistoryForClaude = currentChat.messages.map(m => ({
                role: m.senderId === userId ? 'user' : 'assistant',
                content: m.text
              }));

              const sysPrompt = `You are simulating a college student named ${recipientName} who is selling a "${title}" for ₹${price} on a campus marketplace.
The user is texting you to buy it.
Write a response in a friendly, casual college student tone. Keep it short (1-3 sentences max).
Adhere strictly to safety:
- Only agree to meet in public campus locations (e.g., Central Library Lobby, Student Center food court, or campus coffee shop).
- Do NOT agree to ship the item.
- Do NOT request advance payments (e.g. Venmo/GPay before inspection).
- If the user asks shady or violates university honor code (e.g., selling exam keys), refuse politely.`;

              const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 200,
                temperature: 0.7,
                system: sysPrompt,
                messages: chatHistoryForClaude
              });
              replyText = response.content[0].text;
            } catch (error) {
              console.error('Claude Chat Simulation Error:', error);
              replyText = getSimulatedStudentReply(text, recipientName, title);
            }
          } else {
            replyText = getSimulatedStudentReply(text, recipientName, title);
          }

          currentChat.messages.push({
            senderId: targetRecipientId,
            senderName: recipientName,
            text: replyText,
            timestamp: new Date()
          });
          currentChat.updatedAt = new Date();
          await currentChat.save();
        } catch (simErr) {
          console.error('Error saving simulated student reply:', simErr);
        }
      }, 1500);
    }
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ error: 'Failed to deliver message.' });
  }
});

// Fallback index.html route for SPA routing support
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Listen on designated port
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` CampusSwap Server running at: http://localhost:${PORT}`);
  console.log(` Serve static assets & API integration dynamically`);
  console.log(`=======================================================`);
});
