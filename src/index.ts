import * as dotEnv from 'dotenv';
import { EventsService } from './services/events.service';

dotEnv.config();

async function main() {
  const filenames = process.env.FILENAMES.split(',').map((filename) =>
    filename.trim(),
  );
  const eventService = new EventsService();

  await eventService.loadFiles(filenames);
}

main().catch((err) => console.error(err));
