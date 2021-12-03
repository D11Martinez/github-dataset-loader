import { User, Head, Base, Links } from '.';

export interface Self {
  href: string;
}

export interface Html {
  href: string;
}

export interface Issue {
  href: string;
}

export interface Comments {
  href: string;
}

export interface ReviewComments {
  href: string;
}

export interface ReviewComment {
  href: string;
}

export interface Commits {
  href: string;
}

export interface PullRequest {
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
  user: User;
  body: string;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  merged_at?: any;
  merge_commit_sha: string;
  assignee?: any;
  assignees: any[];
  requested_reviewers: any[];
  milestone?: any;
  commits_url: string;
  commits_list: any[];
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: Head;
  base: Base;
  _links: Links;
  author_association: string;
  merged: boolean;
  mergeable: boolean;
  rebaseable: boolean;
  mergeable_state: string;
  merged_by?: User;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}
