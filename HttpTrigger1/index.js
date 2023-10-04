const { Octokit } = require("octokit");
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GITHUB_API_KEY;

const octokit = new Octokit({ auth: apiKey });

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a new request.');

    if (req.method !== "POST") {
        context.res = {
            status: 400,
            body: "Invalid request method. Only POST is supported."
        };
        return;
    }

    const githubEvent = req.headers['x-github-event'];
    const data = req.body;

    context.res = {
        status: 202,
        body: 'Accepted'
    };

    try {
        await handleGitHubEvent(context, githubEvent, data);
    } catch (error) {
        context.log.error('Error handling GitHub event:', error);
    }
}

async function handleGitHubEvent(context, event, data) {
    if (event === 'repository') {
        await handleRepositoryEvent(context, data);
    } else if (event === 'ping') {
        context.log('GitHub sent the ping event');
    } else {
        context.log(`Unhandled event: ${event}`);
    }
}

async function handleRepositoryEvent(context, data) {
    const action = data.action;

    context.log('GitHub sent a repository action event');
    if (action === 'created') {
        const owner = data.repository.owner.login;
        const repo = data.repository.name;

        try {
            const response_protection = await octokit.request('PUT /repos/{owner}/{repo}/branches/{branch}/protection', {
                owner,
                repo,
                branch: 'main',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                required_status_checks: null,
                enforce_admins: true,
                required_pull_request_reviews: {
                    require_code_owner_reviews: true,
                    required_approving_review_count: 2,
                    require_last_push_approval: true,
                },
                restrictions: null
            });
            context.log('Branch protection enforced:', response_protection.data);
        } catch (error) {
            throw new Error(`Error enforcing branch protection: ${error.message}`);
        }

        try {

            const issueBody = `
                        # 🔐 Branch Protection Enabled #

                        Exciting news! We've implemented enhanced protections for the main branch:

                        1. **Require Pull Request before Merging**: All changes to the main branch must now go through a pull request. This allows for thorough review and discussion before merging.

                        2. **Require Code Owner Reviews**: Code owners, our trusted experts, will review and approve pull requests before they can be merged.

                        3. **Minimum Approving Reviews**: A minimum of 2 approving reviews are required before a pull request can be merged.

                        4. **Last Push Approval Required**: The last push to the branch must also have received approval.

                        These measures ensure that changes to the main branch are meticulously reviewed and approved, ensuring code quality and stability!

                        For any feedback or assistance contact @nanospeck
                    `;

            const response_issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                title: '🔐 Branch protection enabled',
                body: issueBody,
                assignees: ['nanospeck'],
                labels: ['branch-settings'],
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            context.log('Issue created:', response_issue.data);
        } catch (error) {
            throw new Error(`Error creating issue: ${error.message}`);
        }
    } else {
        context.log(`Unhandled action for the repository event: ${action}`);
    }
}
