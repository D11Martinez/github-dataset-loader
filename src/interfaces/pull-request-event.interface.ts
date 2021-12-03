import { Actor } from './actor.interface';
import { Org } from './org.interface';
import { PullRequest } from './pull-request.interface';
import { Repo } from './repo.interface';

export interface Statuses {
  href: string;
}

export interface Payload {
  action: string;
  number: number;
  pull_request: PullRequest;
}

export interface IPullRequestEvent {
  id: string;
  type: string;
  actor: Actor;
  repo: Repo;
  payload: Payload;
  public: boolean;
  created_at: Date;
  org: Org;
}
