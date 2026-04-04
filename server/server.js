import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookiesparser from 'cookie-parser';
import connectDB from './config/db.js';

dotenv.config();

connectDB(); // Connect to MongoDB
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookiesparser());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
