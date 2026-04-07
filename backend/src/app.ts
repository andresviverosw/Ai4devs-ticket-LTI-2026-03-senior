import express, { Request, Response } from 'express';
import cors from 'cors';
import candidateRoutes from './routes/candidate.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

export const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.send('Hola LTI!');
});

app.use('/api/candidates', candidateRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: true, message: 'Not found.' });
});

app.use(errorHandler);
