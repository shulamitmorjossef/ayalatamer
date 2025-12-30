import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import { fetchAndSaveCountries } from './services/country.service';
import countryRoutes from './routes/country.routes';

dotenv.config();

const app = express();

/* ===== Middlewares (חייבים להיות לפני routes) ===== */
app.use(cors({ origin: 'http://localhost:5173' })); // אפשר גם app.use(cors()) בפיתוח
app.use(express.json());

/* ===== Routes ===== */
app.use('/api/countries', countryRoutes);

/* ===== Health Check ===== */
app.get('/health', (_req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await fetchAndSaveCountries();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
