import * as dotEnv from 'dotenv';
import { EventsService } from './services/events.service';
import { Worker, workerData, isMainThread } from 'worker_threads';

dotEnv.config();

if (isMainThread) {
  const year = process.env.YEAR;
  const month = process.env.MONTH;
  const startDay = Number(process.env.START_DAY);
  const endDay = Number(process.env.END_DAY);
  const diffDays = endDay - startDay;

  if (diffDays > 0 && startDay > 0 && startDay <= 31) {
    const filenameWithDays = Array.from(Array(diffDays + 1).keys()).map(
      (counter) => {
        const day = startDay + counter;
        const cleanDay = day < 10 ? `0${day}` : `${day}`;

        return `${year}-${month}-${cleanDay}`;
      },
    );

    filenameWithDays.forEach((filenameWithDay) => {
      new Worker(__filename, {
        workerData: filenameWithDay,
      });
    });
  } else {
    const errorMsg1 = 'El dia de finalización debe ser mayor al dia de inicio.';
    const errorMsg2 =
      'El dia de inicio debe ser mayor a cero y menor o igual a 31.';

    console.error(`${errorMsg1}\n${errorMsg2}`);
  }
} else {
  const filenameWithDay = workerData;

  async function main() {
    const eventService = new EventsService();

    await eventService.loadEvents(filenameWithDay);
  }

  main().catch((err) => console.log(err));
}
