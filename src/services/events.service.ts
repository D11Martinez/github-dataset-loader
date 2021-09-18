import { EventRepository } from '../repositories/event.repository';
import axios from 'axios';
import * as zlib from 'zlib';

export class EventsService {
  findFilesByDay(currentDate: String) {
    const filenamesWithHours = Array.from(Array(23).keys()).map((hour) => {
      return `${currentDate}-${hour}`;
    });

    return filenamesWithHours;
  }

  filterEventsByType(rawData: string | null, eventType: string) {
    if (!rawData) return [];

    const filteredEvents = rawData
      .split(/\r?\n/)
      .slice(0, -2)
      .map((eventString) => JSON.parse(eventString))
      .filter((object) => object.type === eventType);

    return filteredEvents;
  }

  async fetchData(filename: string): Promise<string> {
    const apiUrl = process.env.GITHUB_URL_API;
    const url = `${apiUrl}/${filename}.json.gz`;

    const { data: rawData } = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    return await new Promise(async (resolve) => {
      zlib.gunzip(rawData, function (err, buffer) {
        if (err)
          console.error(
            `-- ${new Date().toISOString()} --filename = ${filename} || --message = Hubo un problema al cargar la data`,
          );

        resolve(buffer.toString());
      });
    });
  }

  async getFilteredEvents(filename: string, eventType: string) {
    const data = await this.fetchData(filename);
    const filteredData = this.filterEventsByType(data, eventType);

    return filteredData;
  }

  async loadEvents(): Promise<any> {
    const eventType = 'PullRequestEvent';
    const filename = '2015-01-01';
    const message = `saving data of ${filename}`;

    const filenamesWithHours = this.findFilesByDay(filename);
    const eventRepository = new EventRepository();

    const pendingPullRequestEvents = filenamesWithHours.map(
      async (filenameWithHour) => {
        const events = await this.getFilteredEvents(
          filenameWithHour,
          eventType,
        );
        const pendingSaveEvents = events.map((prEvent) =>
          eventRepository.save(prEvent),
        );

        console.log(
          `-- ${new Date().toISOString()} --filename = ${filenameWithHour} || --message = Archivo procesado`,
        );

        await Promise.all(pendingSaveEvents);
      },
    );

    await Promise.all(pendingPullRequestEvents);

    return message;
  }
}
