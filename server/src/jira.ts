import { DirectoryData, AssessmentResult } from '../../frontend/src/types';
import { URL } from 'url';
import * as JiraApi from 'jira-client';
import * as AWS from 'aws-sdk';
import { region } from './config';


const JIRA_HOST = process.env.JIRA_HOST;
const JIRA_USER = process.env.JIRA_USER;
const JIRA_PASSWORD = process.env.JIRA_PASSWORD;
const JIRA_PROJECT = process.env.JIRA_PROJECT;
const JIRA_PROJECT_ID = process.env.JIRA_PROJECT_ID;
const JIRA_TASK_ID = process.env.JIRA_TASK_ID; // your jira task id (found by calling https://jira.talendforge.org/rest/api/2/issue/createmeta?projectKeys=XXXX&expand=projects.issuetypes.fields)
const JIRA_SUBTASK_ID = process.env.JIRA_SUBTASK_ID; // your jira subtask id (same as above)
const JIRA_ASSIGN_OR_COMPONENT = process.env.JIRA_ASSIGN_OR_COMPONENT; // the mode you wish to use, either assign the issue or auto assign via the component in the JIRA project
let cachedSecretResponse: AWS.SecretsManager.GetSecretValueResponse | undefined;
let jira_password, jira;
const JIRA_SECRET_ID = process.env.JIRA_SECRET_ID;


const sm = new AWS.SecretsManager({ region });
const getSecretParams: AWS.SecretsManager.GetSecretValueRequest = {
  SecretId: JIRA_SECRET_ID,
};

async function getJIRAPW() {
    if (process.env.JIRA_PASSWORD) {
      return process.env.JIRA_PASSWORD;
    }
  
    // avoid looking up the secret every time
    cachedSecretResponse =
      cachedSecretResponse ||
      (await sm.getSecretValue(getSecretParams).promise());
  
    const parsedSecrets = cachedSecretResponse.SecretString;
    return parsedSecrets;
}

const checkEnvVars = (vars) => {
    for(const v of vars){
        if (!process.env[v]) {
            console.error('[error]: The "'+v+'" environment variable is required')
            process.exit(1)
        }
    }
};

checkEnvVars(["JIRA_HOST","JIRA_USER","JIRA_TASK_ID","JIRA_SUBTASK_ID","JIRA_ASSIGN_OR_COMPONENT"]);
if(!process.env["JIRA_PASSWORD"] && !process.env["JIRA_SECRET_ID"]){
    console.error('[error]: Neither JIRA_PASSWORD or JIRA_SECRET_ID have been provided, at least one environment variable is required')
    process.exit(1)
}


const capitalize = (s) => {
if (typeof s !== 'string') return ''
return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function createJIRATasks(inputdata, listodata, listoProjectId){
jira_password = await getJIRAPW();
jira = new JiraApi({
    protocol: 'https',
    host: JIRA_HOST,
    username: JIRA_USER,
    password: jira_password,
    apiVersion: '2',
    strictSSL: true
  });
const projectname = inputdata.projectMetaResponses.boardName;
const projectdetails = inputdata.projectMetaResponses;
const selectedMaturity = inputdata.selectedMaturity[0].selection;
const selectedRisks = inputdata.selectedRisks;
try{
    let jiraproj;
    if(JIRA_PROJECT_ID != ""){
        jiraproj = { "id": JIRA_PROJECT_ID };
    } if(JIRA_PROJECT != ""){
        jiraproj = { "key": JIRA_PROJECT };
    } if(JIRA_PROJECT==="" && JIRA_PROJECT_ID===""){
        console.error('[error]: JIRA_PROJECT and JIRA_PROJECT_ID environment variables are not set ! At least one required');
        process.exit(1)
    }
    const workitemmeta = {id: JIRA_TASK_ID}
    const subtaskmeta = {id: JIRA_SUBTASK_ID}
    const maintask = await createMainTask(workitemmeta, jiraproj, listoProjectId, listodata, projectname, projectdetails, selectedRisks,selectedMaturity);
    const link = await linkMainTaskToEpic(maintask, projectdetails.jiraKey);
    if('jiraKey2' in projectdetails) await linkMainTaskToEpic(maintask, projectdetails.jiraKey2);

    const subtasks = await createCategorieSubTasks(maintask, inputdata, listodata, workitemmeta, jiraproj);
    return {'shortUrl': 'https://'+JIRA_HOST+'/browse/'+maintask.key};
} catch(err) {
    throw new Error(`${err}`);
}
};

async function linkMainTaskToEpic(maintask, jiraKey){
    let payload = {
        "type": {
            "name": "Blocks"
        },
        "inwardIssue": {
            "key": maintask.key
        },
        "outwardIssue": {
            "key": jiraKey
        }
    }
    try{
        const result = await jira.issueLink(payload);
        console.log(`JIRA ${jiraKey} was linked to ${maintask.key}`);
        return result;
    }catch (e){
        console.log(e.message);
        throw new Error('Calling JIRA API failed: '+e.message)
    }
}


//https://jira.talendforge.org/rest/api/2/issue/createmeta?projectKeys=xx&expand=projects.issuetypes.fields
async function createMainTask(workitemmeta, jiraproj, listoProjectId, listodata, projectname, projectdetails, selectedRisks, selectedMaturity){
try{
    let risks = "";
    for(const r of selectedRisks){
        risks += `-  ${r.text} : ${r.selection} \n`
    }
    let payload = {
        "fields": {
            "issuetype":{ "id": workitemmeta.id},
            "summary": `PSR | [${projectdetails.riskLevel}] [${projectdetails.jiraKey}] ${projectname}`,
            "project": jiraproj,
            "labels": ["risk_"+ projectdetails.riskLevel.split(' ')[0].toLowerCase()],
            "description": 
            `h3. *Team Epic:* ${projectdetails.jiraKey}
            h3. *Optional related task (opt):* ${projectdetails.jiraKey2}
            h3. *Feature name:* ${projectname}
            h3. *Project maturity:* ${selectedMaturity}
            h3. *Project risks:* 
            ${risks}
            h3. *Team Slack channel:* #${projectdetails.slackTeam}
            h3. *People involved in the assessment:* @${projectdetails.slackUserName}
            h3. *Documentation link:* [${projectdetails.codeLocation}|${projectdetails.codeLocation}]
            h3. *Jira username:* [~${projectdetails.trelloEmail}]
            `
        }
        };

    if(JIRA_ASSIGN_OR_COMPONENT == "COMPONENT"){
            payload.fields.components = [{name:"Risk Assessment"}];
    }
    if(JIRA_ASSIGN_OR_COMPONENT == "ASSIGN"){
        // payload.fields.assignee = {"name": JIRA_USER};
    }
    const result = await jira.addNewIssue(payload);

    console.log('JIRA created successfully, ID: ' + result.key)
    return result;
} catch (e){
    console.log(e.message);
    throw new Error('Calling JIRA API failed: '+e.message)
}
}

async function createCategorieSubTasks(parentTask, inputdata, listodata, subtaskmeta, jiraproj){
const moduleSubTasksProms = [];

for(const category in inputdata.selectedModulesByCategory){
    moduleSubTasksProms.push(createSubTaskForCategory(parentTask, category, inputdata, listodata, subtaskmeta, jiraproj))
}
return Promise.all(moduleSubTasksProms);
}

function createSubTaskForCategory(parentTask, category, inputData, listoData, subtaskmeta, jiraproj){
let subtaskDescription = ``;
const selectedCategory = listoData.data.modules[category];
for (let moduleKey of inputData.selectedModulesByCategory[category]) {

    let trelloDescription = [selectedCategory[moduleKey].assessmentQuestion];
    let resources = selectedCategory[moduleKey].resources;
    let moduleDescription = selectedCategory[moduleKey].guidance;

    let checkliststring = "";

    for(let checkCategory in selectedCategory[moduleKey].checkLists){
        let result = selectedCategory[moduleKey].checkLists[checkCategory].map(
            checklist => ({
              name: checklist.question,
              completed: checklist.tools
                ? checklist.tools.some(checklistTool =>
                    inputData.selectedTools.includes(checklistTool),
                  )
                : false,
            }),
          );
        for(let check of result){
            if(check.completed == true){
                checkliststring = checkliststring + "- (/) " + check.name.toString() + "\n";
            } else{
                checkliststring = checkliststring + "- (!) " + check.name.toString() + "\n";
            }
        }
    }
    subtaskDescription = subtaskDescription + `h3. *Module:* ${capitalize(moduleKey)}

    h6. Description:
    {noformat}${trelloDescription}{noformat}

    ${checkliststring}

    h6. Resources:
    {noformat}${resources}{noformat}

    ` + "\r\n\r\n";
}
let payload = {
    "fields": {
        "issuetype":{"name": "Sub-task"},
        "summary": "PSR | " + inputData.projectMetaResponses.boardName + " [Category: "+category+"]",
        "project": jiraproj,
        "description": subtaskDescription,
        "parent": { "key": parentTask.key }
    }
};

if(JIRA_ASSIGN_OR_COMPONENT == "COMPONENT"){
    payload.fields.components = [{name:"Risk Assessment"}];
}
if(JIRA_ASSIGN_OR_COMPONENT == "ASSIGN"){
    // payload.fields.assignee = {"name": JIRA_USER};
}
    return jira.addNewIssue(payload);
}