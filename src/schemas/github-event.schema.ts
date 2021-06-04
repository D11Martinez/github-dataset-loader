import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PushRequestEventDocument = PushRequestEvent & Document;

@Schema()
export class PushRequestEvent {
  @Prop()
  id: string;

  @Prop()
  type: string;

  @Prop()
  public: boolean;

  @Prop()
  created_at: Date;

  @Prop()
  actor: {
    id: number;
    login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };

  @Prop()
  repo: {
    id: number;
    name: string;
    url: string;
  };

  @Prop()
  payload: {
    action: string;
    number: number;
    pull_request: {
      url: string;
      id: number;
      html_url: string;
      diff_url: string;
      patch_url: string;
      issue_url: string;
      number: number;
      state: string;
      locked: boolean;
      title: string;
      user: any;
      body: string;
      created_at: Date;
      updated_at: Date;
      closed_at: Date;
      merged_at: Date;
      merge_commit_sha: string;
      assignee: null;
      milestone: null;
      commits_url: string;
      review_comments_url: string;
      review_comment_url: string;
      comments_url: string;
      statuses_url: string;
      head: any;
      base: any;
      _links: any;
      merged: boolean;
      mergeable: any;
      mergeable_state: string;
      merged_by: any;
      comments: number;
      review_comments: number;
      commits: number;
      additions: number;
      deletions: number;
      changed_files: number;
    };
    org: {
      id: number;
      login: string;
      gravatar_id: string;
      url: string;
      avatar_url: string;
    };
  };
}

export const PushRequestEventSchema =
  SchemaFactory.createForClass(PushRequestEvent);
