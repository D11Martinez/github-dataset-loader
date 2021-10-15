import Axios from 'axios';
import { Readable } from 'stream';
import * as zlib from 'zlib';
import { eventType, requestTimeout } from '../common/constants';
import { appendFile } from 'fs';

export class EventsService {
  private findFilesByMonth(year: String, month: String): string[] {
    const filenameWithDays = Array.from(Array(31).keys()).map((counter) => {
      const day = counter + 1;
      const cleanDay = day < 10 ? `0${day}` : `${day}`;

      return `${year}-${month}-${cleanDay}`;
    });

    const filenamesWithHours = filenameWithDays
      .map((filenameWithDay) => this.findFilesByDay(filenameWithDay))
      .reduce((acc, filenameWithHour) => acc.concat(filenameWithHour), []);

    return filenamesWithHours;
  }

  private findFilesByDay(filenameWithDay: String) {
    const filenamesWithHours = Array.from(Array(23).keys()).map((hour) => {
      return `${filenameWithDay}-${hour}`;
    });

    return filenamesWithHours;
  }

  private filterEventsByType(rawData: string | null, eventType: string) {
    if (!rawData) return [];

    const filteredEvents = rawData
      .split(/\r?\n/)
      .slice(0, -2)
      .map((eventString) => JSON.parse(eventString))
      .filter((object) => object.type === eventType);

    return filteredEvents;
  }

  private async fetchData(filename: string): Promise<string> {
    const apiUrl = process.env.GITHUB_URL_API;

    const url = `${apiUrl}/${filename}.json.gz`;

    try {
      const response = await Axios.get(url, {
        responseType: 'stream',
        timeout: requestTimeout,
      });

      const dataStream: Readable = response.data;

      return await new Promise(async (resolve, reject) => {
        let dataBufferArr = [];

        dataStream.on('data', (chunk) => {
          dataBufferArr.push(chunk);
        });

        dataStream.on('end', () => {
          const rawData = Buffer.concat(dataBufferArr);

          zlib.gunzip(rawData, function (err, buffer) {
            if (err)
              console.error(
                `-- ${new Date().toISOString()} --filename = ${filename} || --message = Hubo un problema al cargar la data`,
              );

            resolve(buffer.toString());
          });
        });

        dataStream.on('error', (fooErr) => console.error(fooErr.message));
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  private async getFilteredEvents(filename: string, eventType: string) {
    const data = await this.fetchData(filename);

    if (!data) return;

    const filteredData = this.filterEventsByType(data, eventType);

    return filteredData;
  }

  private async writeLog(filename: string, success: boolean) {
    const message = success ? 'Archivo procesado' : 'Archivo no encontrado';
    const content = `{ "date": ${new Date().toISOString()}, "filename" : ${filename}, "message" : ${message} }`;

    //appendFile(logsFilename, `${content}\n`, (err) => {});

    if (success) console.info(content);
    else console.error(content);
  }

  private saveDataInFile(filename: string, data: any[]) {
    const finalFilesDirectory = process.env.FINAL_FILES_DIR || './data';
    const filePath = `${finalFilesDirectory}/${filename}.json`;

    const formatedDataWithNextLine = data.reduce((acc, item) => {
      const itemString = JSON.stringify(item);
      return `${acc}\n${itemString}`;
    }, '');

    const jsonData = formatedDataWithNextLine.slice(1);

    appendFile(filePath, `${jsonData}\n`, 'utf8', (err) => {});
  }

  async loadEvents(filenameWithDay: string): Promise<void> {
    const filenamesWithHours = this.findFilesByDay(filenameWithDay);

    const pendingPullRequestEvents = filenamesWithHours.map(
      async (filenameWithHour) => {
        const events = await this.getFilteredEvents(
          filenameWithHour,
          eventType,
        );

        const success = !!events?.length;

        if (success) {
          this.saveDataInFile(filenameWithDay, events);
        }

        this.writeLog(filenameWithHour, success);
      },
    );

    await Promise.all(pendingPullRequestEvents);
  }
}
