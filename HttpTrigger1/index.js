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
        await handleGitHubEvent(githubEvent, data);
    } catch (error) {
        context.log.error('Error handling GitHub event:', error);
    }
}

async function handleGitHubEvent(event, data) {
    if (event === 'repository') {
        await handleRepositoryEvent(data);
    } else if (event === 'ping') {
        context.log('GitHub sent the ping event');
    } else {
        context.log(`Unhandled event: ${event}`);
    }
}

async function handleRepositoryEvent(data) {
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
                required_pull_request_reviews: null,
                restrictions: null
            });
            context.log('Branch protection enforced:', response_protection.data);
        } catch (error) {
            throw new Error(`Error enforcing branch protection: ${error.message}`);
        }

        try {
            const response_issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                title: '🔐 Branch protection enabled',
                body: 'Main branch is now protected @nanospeck .',
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
