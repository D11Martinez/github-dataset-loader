import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PullRequestEventDocument = PullRequestEvent & Document;

@Schema({ strict: false })
export class PullRequestEvent {
  @Prop()
  id: string;

  @Prop()
  type: string;

  @Prop()
  public: boolean;

  @Prop()
  created_at: Date;
}

export const PullRequestEventSchema =
  SchemaFactory.createForClass(PullRequestEvent);
