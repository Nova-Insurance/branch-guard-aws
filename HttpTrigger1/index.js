module.exports = async function (context, req) {
    const { Octokit, App } = require("octokit");
    const express = require('express');

    const apiKey = process.env.API_KEY;

    context.log('JavaScript HTTP trigger function processed a new request.');

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    // context.res = {
    //     // status: 200, /* Defaults to 200 */
    //     body: responseMessage
    // };

    const app = express();

    const octokit = new Octokit({ auth: apiKey });

    if (req.method === "POST") {
        const githubEvent = req.headers['x-github-event'];
        const data = req.body;

        context.res = {
            status: 202,
            body: 'Accepted'
        };

        if (githubEvent === 'repository') {
            const action = data.action;
            context.log('GitHub sent a repository action event');
            if (action === 'created') {
                context.log(`A repository was created with this title: ${data.repository.name}`);

                try {
                    const response_protection = await octokit.request('PUT /repos/{owner}/{repo}/branches/{branch}/protection', {
                        owner: data.repository.owner.login,
                        repo: data.repository.name,
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
                    context.log.error('Error enforcing branch protection:', error);
                }

                try {
                    const response_issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
                        owner: data.repository.owner.login,
                        repo: data.repository.name,
                        title: 'Branch protection enabled',
                        body: 'Main branch is now protected @nanospeck .',
                        assignees: ['nanospeck'],
                        labels: ['branch-settings'],
                        headers: {
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    });
                    context.log('Issue created:', response_issue.data);
                } catch (error) {
                    context.log.error('Error creating issue:', error);
                }

            } else {
                context.log(`Unhandled action for the repository event: ${action}`);
            }
        } else if (githubEvent === 'ping') {
            context.log('GitHub sent the ping event');
        } else {
            context.log(`Unhandled event: ${githubEvent}`);
        }
    } else {
        context.res = {
            status: 400,
            body: "Invalid request method. Only POST is supported."
        };
    }


}