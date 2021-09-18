import { model } from 'mongoose';
import { EventSchema } from '../schemas/event.schema';

export class EventRepository {
  private EventModel = model('PullRequestEvent', EventSchema);

  async save(eventData: any): Promise<void> {
    const postInst1 = new this.EventModel(eventData);
    await postInst1.save();
  }
}
