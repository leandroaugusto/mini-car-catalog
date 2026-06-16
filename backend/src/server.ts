import mongoose from 'mongoose';

import { app } from './app';

const port = Number(process.env.PORT ?? 5000);
const mongoUri =
  process.env.MONGODB_URI ?? 'mongodb://mongodb:27017/mini-car-catalog';

async function startServer() {
  await mongoose.connect(mongoUri);

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

void startServer();
