const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Add COOP and COEP headers to fix Cross-Origin-Opener-Policy errors
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  //console.log('🤖 Chat:', req.body.message);
  try {
    const pyRes = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await pyRes.json();
    //console.log('✅ Reply:', data.reply?.slice(0,50) + '...');
    res.json(data);
  } catch (err) {
    console.error('❌ Chatbot:', err.message);
    res.status(503).json({ error: 'Bot loading...' });
  }
});

// backend/index.js
app.post('/api/analyze-mood', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8001/analyze-mood', {  // 8001!
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB Connected Successfully');
  } catch (error) {
    console.error(' MongoDB Connection Error:', error);
    process.exit(1); 
  }
};

connectDB();

const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('IVPOI Backend is running...');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const journalRoutes = require("./routes/journal");
app.use("/api/journals", journalRoutes);

const happyMomentRoutes = require("./routes/happymoment");
app.use("/api/happymoments", happyMomentRoutes);