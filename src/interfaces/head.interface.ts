import { Repo } from './repo.interface';
import { User } from './user.interface';

export interface Head {
  label: string;
  ref: string;
  sha: string;
  user: User;
  repo: Repo;
}
