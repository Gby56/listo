if [ "$TRELLO_JIRA_MODE" == "" ];
    then echo "Mising TRELLO_JIRA_MODE variable !" && exit;
fi;

if [ "$TRELLO_JIRA_MODE" == "JIRA" ];
    then if [ "$REACT_APP_TRELLO_JIRA_MODE" != "JIRA" ] || [ "$JIRA_HOST" == "" ] || [ "$JIRA_USER" == "" ] || [ "$JIRA_PASSWORD" == "" ] || [ "$JIRA_PROJECT" == "" ];
    then echo "Missing REACT_APP_TRELLO_JIRA_MODE or JIRA_HOST or JIRA_USER or JIRA_PASSWORD or JIRA_PROJECT env variable !" && exit 1
    fi;
fi;

if [ "$TRELLO_JIRA_MODE" == "TRELLO" ];
    then if [ "$REACT_APP_TRELLO_JIRA_MODE" != "TRELLO" ] || [ "$TRELLO_API_KEY" == "" ] || [ "$TRELLO_TOKEN" == "" ];
    then echo "Missing REACT_APP_TRELLO_JIRA_MODE or TRELLO_API_KEY or TRELLO_TOKEN env variable !" && exit 1
    fi;
fi;