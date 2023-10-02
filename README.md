# Branch Guard

A GitHub project for automating repository management tasks and ensuring security through webhooks and Azure Functions.

## Prerequisites

- Node.js > 20.7.0 installed on your machine
- Ngrok installed on your machine (for testing locally)
- GitHub API Key with the following permissions:
  - Read and Write access to administration and issues
  - Read access to metadata
- A GitHub Organisation (you can create one for free)
- Active Azure Account with the following extensions installed in your IDE:
  - Azure Account
  - Azure Functions
  - Azure Resources

## Usage

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your_username/branch-guard.git
   ```

2. **Rename .env.example file to .env and update GITHUB_API_KEY**
   ```bash
   GITHUB_API_KEY=<your_github_key>
   ```

3. **Install Azure Core Tools and Functions extensions**
   
4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start the function**
   ```bash
   func start
   ```
   The application will be accessible at: [http://localhost:7071/repository/lock](http://localhost:7071/repository/lock)

6. **Perform a Ping test**
   ```bash
   curl -X POST http://localhost:7071/repository/lock
   ```

### Ngrok Configuration

1. **Start tunnel**
   ```bash
   ngrok http 7071
   ```
   Ngrok started at: [https://abc.ngrok-free.app/repository/lock](https://abc.ngrok-free.app/repository/lock)

### Github Webhook Configuration

1. Create Organisation: `ABC` > Settings > Add webhook.
   
2. Subscribe for 'Repository Create / Update' events.
   
3. Add URL `https://abc.ngrok-free.app/repository/lock`.
   
4. Create a new repository to verify the app works locally.
   
5. An issue will be created tagging `@nanospeck`.
   
6. The main branch will be protected.

7. Logs will be printed locally.

### Serverless Deployment (Azure Functions)

1. Login to Azure account in VS Code.

2. Create Function App in Azure.

3. Right-click on the Function App > Deploy to Function App > Choose the function app created in the previous step.

4. Go to Azure Resources > Function App > Choose your App > Application Settings and add the `GITHUB_API_KEY`.

### Github Workflow Configuration (Automate deployments)

1. Select the function app's **Overview** page, and then select **Get publish profile**.

2. Go to Github > Repository > Settings > Secrets and variables > Actions.

3. Select new repository secret.

4. Add a new secret with the name `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` and the value set to the contents of the publishing profile file.

5. Select Add secret.

6. GitHub can now authenticate to your function app in Azure.

7. Update the `.yml` file in `.github/workflows` with Application name.

8. Push the code to Github and verify that the deployments are now automatically pushed to Azure.

For more reference, check out [Microsoft Azure Functions GitHub Actions guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-github-actions?tabs=windows%2Cjavascript&pivots=method-manual#example-workflow-configuration-file).

## License

This project is licensed under the [MIT License](LICENSE.md).