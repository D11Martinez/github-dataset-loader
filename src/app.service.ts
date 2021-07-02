import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PullRequestEvent,
  PullRequestEventDocument,
} from './schemas/github-event.schema';
import { getEvents } from './utils/loader';
@Injectable()
export class AppService {
  constructor(
    @InjectModel(PullRequestEvent.name)
    private readonly prEventModel: Model<PullRequestEventDocument>,
  ) {}

  async import(): Promise<any> {
    const eventType = 'PullRequestEvent';
    const filename = '2015-01-01-15';
    const message = `saving data of ${filename}`;

    const events = await getEvents(filename, eventType);
    const pendingPREvents = events.map((prEvent) => this.save(prEvent));

    await Promise.all(pendingPREvents);

    return message;
  }

  async save(pullRequestEventData: any): Promise<PullRequestEvent> {
    const createdPREvent = new this.prEventModel(pullRequestEventData);
    return createdPREvent.save();
  }
  getHello(): string {
    return 'Hello World!';
  }
}
