import * as dotEnv from 'dotenv';
import { EventsService } from './services/events.service';
import { Worker, workerData, isMainThread } from 'worker_threads';

dotEnv.config();

//if (isMainThread) {
if (false) {
  const filenames = process.env.FILENAMES.split(',').map((filename) =>
    filename.trim(),
  );

  const { length: filenamesLength } = filenames;
  const isValidFilenamesLength = filenamesLength > 0 && filenamesLength <= 12;

  if (isValidFilenamesLength) {
    filenames.forEach((filename) => {
      new Worker(__filename, {
        workerData: filename,
      });
    });
  } else {
    const errorMsg1 = 'El maximo de archivo simultaneos es 12';

    console.error(errorMsg1);
  }
} else {
  //const filename = workerData;

  async function main() {
    const filenames = process.env.FILENAMES.split(',').map((filename) =>
      filename.trim(),
    );
    const eventService = new EventsService();

    await eventService.loadFiles(filenames);
  }

  main().catch((err) => console.error(err));
}
