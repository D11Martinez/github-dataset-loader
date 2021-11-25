import Axios, { AxiosRequestConfig } from 'axios';
import { Readable } from 'stream';
import * as zlib from 'zlib';
import { eventType, requestTimeout } from '../common/constants';
import { appendFile } from 'fs';
import { ICommit, IPullRequest, IRawCommit } from 'src/interfaces';

export class EventsService {
  private filterEventsByType(rawData: string | null, eventType: string) {
    if (!rawData) return [];

    const filteredEvents = rawData
      .split(/\r?\n/)
      .slice(0, -2)
      .map((eventString) => JSON.parse(eventString))
      .filter((object) => object.type === eventType);

    return filteredEvents;
  }

  private async decompressBuffer(
    rawData: Buffer,
    filename: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.gunzip(rawData, function (err, buffer) {
        if (err)
          console.error(
            `-- ${new Date().toISOString()} --filename = ${filename} || --message = Hubo un problema al cargar la data`,
          );

        resolve(buffer.toString());
      });
    });
  }

  private async fetchData(
    url: string,
    useGithubAuth: boolean,
  ): Promise<Buffer> {
    try {
      const requestOptions: AxiosRequestConfig = {
        responseType: 'stream',
        timeout: requestTimeout,
      };

      if (useGithubAuth) {
        const { USERNAME_GITHUB: username, PASSWORD_GITHUB: password } =
          process.env;

        const auth = {
          username,
          password,
        };

        requestOptions.auth = auth;
      }

      const response = await Axios.get(url, requestOptions);

      const dataStream: Readable = response.data;

      return await new Promise(async (resolve, reject) => {
        let dataBufferArr = [];

        dataStream.on('data', (chunk) => {
          dataBufferArr.push(chunk);
        });

        dataStream.on('end', () => {
          const rawData = Buffer.concat(dataBufferArr);

          resolve(rawData);
        });

        dataStream.on('error', (fooErr) => console.error(fooErr.message));
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  private async getFilteredEvents(filename: string, eventType: string) {
    const apiUrl = process.env.GITHUB_URL_API;

    const url = `${apiUrl}/${filename}.json.gz`;
    const bufferData = await this.fetchData(url, false);
    const data = await this.decompressBuffer(bufferData, filename);

    if (!data) return;

    const filteredData = this.filterEventsByType(data, eventType);

    return filteredData;
  }

  private async getCommits(pullRequestEvent: IPullRequest): Promise<ICommit[]> {
    const {
      payload: {
        pull_request: { commits_url: commitsUrl },
      },
    } = pullRequestEvent;

    const rawCommitsListBuffer = await this.fetchData(commitsUrl, true);
    const rawCommitsList: IRawCommit[] = JSON.parse(
      rawCommitsListBuffer.toString(),
    );

    const pendingCommits = rawCommitsList.map(
      async (rawCommit): Promise<ICommit> => {
        const { url } = rawCommit;

        const commitBuffer = await this.fetchData(url, true);

        return JSON.parse(commitBuffer.toString());
      },
    );

    return Promise.all(pendingCommits);
  }

  private attachCommits(rawEvents: any[]) {
    const pendingUpdatedEvents = rawEvents.map(async (pullRequestEvent) => {
      const commitsList = await this.getCommits(pullRequestEvent);

      const updatedPullRequestEvent = {
        ...pullRequestEvent,
        commitsList,
      };

      return updatedPullRequestEvent;
    });

    return Promise.all(pendingUpdatedEvents);
  }

  private async writeLog(filename: string, success: boolean) {
    const message = success ? 'Archivo procesado' : 'Archivo no encontrado';
    const content = `{ "date": ${new Date().toISOString()}, "filename" : ${filename}, "message" : ${message} }`;

    if (success) console.info(content);
    else console.error(content);
  }

  private saveDataInFile(filename: string, data: any[]): void {
    const finalFilesDirectory = process.env.FINAL_FILES_DIR || './data';
    const filePath = `${finalFilesDirectory}/${filename}.json`;

    const formatedDataWithNextLine = data.reduce((acc, item): string => {
      const itemString = JSON.stringify(item);
      return `${acc}\n${itemString}`;
    }, '');

    const jsonData = formatedDataWithNextLine.slice(1);

    appendFile(filePath, `${jsonData}\n`, 'utf8', (err) => {});
  }

  async loadEvents(filename: string): Promise<void> {
    const rawEvents = await this.getFilteredEvents(filename, eventType);
    const events = await this.attachCommits(rawEvents);

    const success = !!events?.length;

    if (success) {
      this.saveDataInFile(filename, events);
    }

    this.writeLog(filename, success);
  }
}
