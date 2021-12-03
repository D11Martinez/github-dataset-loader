import { User, Repo } from '.';

export interface Base {
  label: string;
  ref: string;
  sha: string;
  user: User;
  repo: Repo;
}
