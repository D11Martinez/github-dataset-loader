import { appendFile } from 'fs';
import { ICommit, IPullRequestEvent, IRawCommit, User } from '../interfaces';
import Bottleneck from 'bottleneck';
import { fetchData, fetchStreamData } from '../utils';
import { bootleneckConfig } from '../config';

export class EventsService {
  private wrappedAxios = null;

  constructor() {
    const limiter = new Bottleneck(bootleneckConfig);

    this.wrappedAxios = limiter.wrap(fetchData);
  }

  private async getFilteredEvents(filename: string): Promise<any[]> {
    const apiUrl = process.env.GITHUB_URL_API;
    const url = `${apiUrl}/${filename}.json.gz`;
    const filteredData = await fetchStreamData(url, false);
    return filteredData;
  }

  private async getCommits(commitsURL: string): Promise<ICommit[]> {
    const rawCommitsListBuffer = await this.wrappedAxios(commitsURL, true);

    if (!rawCommitsListBuffer) {
      return [];
    }

    const rawCommitsList: IRawCommit[] = JSON.parse(
      rawCommitsListBuffer.toString(),
    );

    const pendingCommits = rawCommitsList.map(
      async (rawCommit): Promise<ICommit> => {
        const { url } = rawCommit;

        const commitBuffer = await this.wrappedAxios(url, true);

        if (!commitBuffer) return;

        return JSON.parse(commitBuffer.toString());
      },
    );

    return Promise.all(pendingCommits);
  }

  private async getUser(userURL: string): Promise<User> {
    if (!userURL) return;

    const userBuffer = await this.wrappedAxios(userURL, true);

    if (!userBuffer) return;

    const user: User = JSON.parse(userBuffer.toString());

    return user;
  }

  private async attachExtraData(
    rawEvents: any[],
    filename: string,
  ): Promise<void> {
    const pendingUpdatedEvents = rawEvents.map(
      async (pullRequestEvent: IPullRequestEvent) => {
        const {
          actor: { url: actorURL },
          payload: {
            pull_request: {
              commits_url: commitsURL,
              user: { url: userURL },
              head: {
                user: { url: headUserURL },
              },
              base: {
                user: { url: baseUserURL },
              },
            },
          },
        } = pullRequestEvent;

        const orgURL = pullRequestEvent.org?.url;
        const mergedByUserURL =
          pullRequestEvent.payload.pull_request.merged_by?.url;

        const commitsList = await this.getCommits(commitsURL);

        const pendingActorUser = this.getUser(actorURL);
        const pendingUser = this.getUser(userURL);
        const pendingHeadUser = this.getUser(headUserURL);
        const pendingBaseUser = this.getUser(baseUserURL);
        const pendingOrgUser = this.getUser(orgURL);
        const pendingMergedByUser = this.getUser(mergedByUserURL);

        const [actorUser, user, headUser, baseUser, orgUser, mergedByUser] =
          await Promise.all([
            pendingActorUser,
            pendingUser,
            pendingHeadUser,
            pendingBaseUser,
            pendingOrgUser,
            pendingMergedByUser,
          ]);

        if (actorUser) pullRequestEvent.actor = actorUser;
        if (user) pullRequestEvent.payload.pull_request.user = user;
        if (headUser)
          pullRequestEvent.payload.pull_request.head.user = headUser;
        if (baseUser)
          pullRequestEvent.payload.pull_request.base.user = baseUser;
        if (mergedByUser)
          pullRequestEvent.payload.pull_request.merged_by = mergedByUser;
        if (orgUser) pullRequestEvent.org = orgUser;

        pullRequestEvent.payload.pull_request.commits_list = commitsList;

        this.saveDataInFile(filename, [pullRequestEvent]);
      },
    );

    await Promise.all(pendingUpdatedEvents);
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

  private async loadEvents(filename: string): Promise<void> {
    const rawEvents = await this.getFilteredEvents(filename);

    await this.attachExtraData(rawEvents, filename);

    const success = !!rawEvents?.length;

    this.writeLog(filename, success);
  }

  async loadFiles(filenames: string[]) {
    const pendingLoadedFiles = filenames.map((filename) =>
      this.loadEvents(filename),
    );

    await Promise.all(pendingLoadedFiles);
  }
}
