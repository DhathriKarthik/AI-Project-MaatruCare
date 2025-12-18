const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

<<<<<<< HEAD
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
=======
app.use(cors());
>>>>>>> 3a78add0b4ed6a220d0894bc79df6e3faa729ddc
app.use(express.json());

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
<<<<<<< HEAD
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
=======

app.use('/api/auth', authRoutes);

>>>>>>> 3a78add0b4ed6a220d0894bc79df6e3faa729ddc
app.get('/', (req, res) => {
  res.send('IVPOI Backend is running...');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});