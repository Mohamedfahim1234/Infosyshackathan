import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './route/user.route';
import officerRouter from './route/officer.route';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const MongoDB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/yourdbname';

mongoose.connect(MongoDB_URL).then(() => {
  console.log('Connected to MongoDB');
}   ).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use('/user',router);
app.use('/officer', officerRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});