
export interface IPullRequest {
    id: string,
    type: string;
    actor: any;
    repo: any;
    payload: {
        action: string;
        number: any;
        pull_request: {
            commits_url: string;
        }
    };
    public: boolean;
    created_at: string;
    org: any;
}