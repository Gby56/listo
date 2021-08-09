DOCKER_REPO_URL = $(AWSACCOUNT).dkr.ecr.us-east-1.amazonaws.com/listo
BUILD_NUMBER=$(date +%F)


deploy:
# source the env.sh to build Listo properly (some build-time variables are needed)
	source ../../env.sh;
	source ../../checkenv.sh;
# build container from the repository root and tag infosec/listo:latest
	docker build ../../Dockerfile -t infosec/listo:latest
# build the deploy container, which uses the previous container but adds the custom /data folder
	docker build --pull=false -t "$(DOCKER_REPO_URL):${BUILD_NUMBER}" .
# push the final production container build to the ECR (check the AWS console for the docker login commands)
	docker push "$(DOCKER_REPO_URL):${BUILD_NUMBER}"
# deploy Listo
	aws cloudformation deploy \
		--template-file stack-nonprod.yaml \
		--stack-name listo \
		--no-fail-on-empty-changeset \
		--parameter-overrides \
			'ImageUrl=$(DOCKER_REPO_URL):${BUILD_NUMBER}' \
			'VpcID=<Your vpc id>' \
			'PublicSubnetIds=<Your subnet ids>' \
			'PrivateSubnetIds=<Your subnet ids>' \
			'TrelloTeam=<Id of your trello team>' \
			'IngressCIDR=<CIDR Ingress Allowed in the SecGroup>' \
			'TRELLO_JIRA_MODE=<JIRA or TRELLO>' \
			'JIRA_HOST=<Your JIRA FQDN>' \
			'JIRA_USER=<Your user for the Jira integration>' \
			'JIRA_PROJECT=<The target JIRA project for Listo>' \
			'CertificateArn=<ARN of your ACM Certificate for TLS>' \
			'OidcAuthorizationEndpoint=<Your oidc authz endpoint>' \
			'OidcClientId=<Your oidc client id>' \
			'OidcClientSecret=<Your oidc client secret>' \
			'OidcIssuer=<Your oidc issuer url>' \
			'OidcTokenEndpoint=<Your oidc token url>' \
			'OidcUserInfoEndpoint=<Your oidc user info url>' \
			'AlbHostedZoneId=<Route53 zone ID for the DNS record>' \
			'AlbDnsName=<DNS name to assign the load balancer, e.g. listo.example.com>'

deploy_prod:
# source the env.sh to build Listo properly (some build-time variables are needed)
	source ../../env.sh;
	source ../../checkenv.sh;
# build container from the repository root and tag infosec/listo:latest
	docker build ../../Dockerfile -t infosec/listo:latest
# build the deploy container, which uses the previous container but adds the custom /data folder
	docker build --pull=false -t "$(DOCKER_REPO_URL):${BUILD_NUMBER}" .
# push the final production container build to the ECR (check the AWS console for the docker login commands)
	docker push "$(DOCKER_REPO_URL):${BUILD_NUMBER}"
# deploy Listo
	aws cloudformation deploy \
		--template-file stack.yaml \
		--stack-name listo \
		--no-fail-on-empty-changeset \
		--parameter-overrides \
			'ImageUrl=$(DOCKER_REPO_URL):${BUILD_NUMBER}' \
			'VpcID=<Your vpc id>' \
			'PublicSubnetIds=<Your subnet ids>' \
			'PrivateSubnetIds=<Your subnet ids>' \
			'TrelloTeam=<Id of your trello team>' \
			'IngressCIDR=<CIDR Ingress Allowed in the SecGroup>' \
			'TRELLO_JIRA_MODE=<JIRA or TRELLO>' \
			'JIRA_HOST=<Your JIRA FQDN>' \
			'JIRA_USER=<Your user for the Jira integration>' \
			'JIRA_PROJECT=<The target JIRA project for Listo>' \
			'CertificateArn=<ARN of your ACM Certificate for TLS>' \
			'OidcAuthorizationEndpoint=<Your oidc authz endpoint>' \
			'OidcClientId=<Your oidc client id>' \
			'OidcClientSecret=<Your oidc client secret>' \
			'OidcIssuer=<Your oidc issuer url>' \
			'OidcTokenEndpoint=<Your oidc token url>' \
			'OidcUserInfoEndpoint=<Your oidc user info url>' \
			'AlbHostedZoneId=<Route53 zone ID for the DNS record>' \
			'AlbDnsName=<DNS name to assign the load balancer, e.g. listo.example.com>'

.PHONY: deploy
