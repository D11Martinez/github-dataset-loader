import * as dotEnv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { EventsService } from './services/events.service';

dotEnv.config();

async function main() {
  // Db connection
  await connect(process.env.MONGO_DB_URL);
  console.log('Conexión a MongoDB establecida');

  const eventService = new EventsService();

  await eventService.loadEvents();

  await disconnect();
  console.log('Conexión a MongoDB finalizada');
}

main().catch((err) => console.log(err));
