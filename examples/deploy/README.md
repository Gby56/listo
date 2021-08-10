# Deploying Listo

This folder serves as an **example** for how Listo can be deployed to AWS and Heroku.

## AWS
 - `ecr.yaml` - CloudFormation stack for the ECR repository
 - `stack.yaml` - CloudFormation stack that:
   1. Creates an ALB to authenticate users with the OIDC-compatible IdP of your choice
   2. Launches Listo within Fargate
   3. Creates some AWS Secrets Manager secrets for a Slack Webhook and your Trello Credentials
   4. Creates a DynamoDB table for storing Listo projects
   5. Sets up a AWS CloudWatch log group called `/listo`
 - `Makefile` - Sample Makefile for building and deploying Listo into AWS using the above stack
 - `Dockerfile` - Sample Dockerfile that embeds custom data, as volumes 

### To use this example

 1. Deploy `ecr.yaml` to your AWS account via AWS CloudFormation (this can be done in the UI)
 2. Update the `Makefile` with your own settings (OIDC details, VPC settings, DNS settings, etc)
 3. Deploy Listo `make AWSACCOUNT=XXXXXX deploy`
 4. Update the secret values in the AWS Secrets Manager secrets created in deployment (Slack WebHook and Trello Credentials)

## Heroku

- Create a container application within your account and add the relevant environment variables to the Config Vars (Trello creds is the only mandatory vars to add).
- Create a new repo with your customised data directory and the Dockerfile.web.
- [manually] Add your application details to the Makefile and then run `make deploy_heroku`.
- [via CI] Checkout how we have deployed listo to Heroku using [Github Actions](heroku_deploy.yml).
