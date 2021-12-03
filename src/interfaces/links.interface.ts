import {
  Self,
  Html,
  Issue,
  Comments,
  ReviewComments,
  ReviewComment,
  Commits,
  Statuses,
} from '.';

export interface Links {
  self: Self;
  html: Html;
  issue: Issue;
  comments: Comments;
  review_comments: ReviewComments;
  review_comment: ReviewComment;
  commits: Commits;
  statuses: Statuses;
}
