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

// COOP/COEP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());

// Chatbot proxy -> port 8001
app.post('/api/chat', async (req, res) => {
  try {
    const pyRes = await fetch('http://localhost:8001/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await pyRes.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Chatbot:', err.message);
    res.status(503).json({ error: 'Bot loading...' });
  }
});

// Mood report proxy -> port 8002  
app.get('/report/:userId', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:8002/report/${req.params.userId}`);
    const buffer = await response.arrayBuffer();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="maatru-report-${req.params.userId}.pdf"`
    });
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/user');
const doctorRoutes = require('./routes/doctor');
const journalRoutes = require("./routes/journal");
const happyMomentRoutes = require("./routes/happymoment");

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/happymoments", happyMomentRoutes);

app.get('/', (req, res) => {
  res.send('MaatruCare Backend is running...');
});

// MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1); 
  }
};
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
