// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import pkg from 'pg';
const {Pool} = pkg;
 const host = process.env.DB_ENDPOINT_ADDRESS || '';
  console.log(`host:${host}`);
  const database = process.env.DB_NAME || '';
  const secret_name = process.env.secret_name || '';  
  const region= process.env.region || '';  

const client = new SecretsManagerClient({
  region,
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret = response.SecretString;

console.log(secret);

    
  
const { username } = JSON.parse(secret);
const { password } = JSON.parse(secret);
console.log(password);
console.log(username);


export const handler = async(event,context) => {


  console.log(event.httpMethod);
  console.log(event);
  if (event.httpMethod == 'GET') {
    try {
      const pool = new Pool({
    user: 'postgres',
      host,
      // database:'public' , 
      password,
      port: 5432,
     });


const results = await pool.query('SELECT * from "users"');
// const results = await pool.query('SELECT * from "users" where jira_id  LIKE '%' || $1 || '%'', [userId]);
console.log('user:', results.rows);
   return {
        statusCode: 200,
        body: JSON.stringify(results.rows),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }
  }
  
  if (event.httpMethod == 'POST') {
    
    const { name, jira_id } = JSON.parse(event.body);
    console.log(name,jira_id);
    try {
      const pool = new Pool({
    user: 'postgres',
      host,
      // database:'public' , 
      password,
      port: 5432,
     });


const results = await pool.query("INSERT INTO users VALUES ( nextval('id_sequence'),$1 ,$2);",[name,jira_id]);

      return {
        statusCode: 200,
        body: JSON.stringify('User inserted successfully!'),
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }
  }
  
  // return {
  //   statusCode: 400,
  //   body: JSON.stringify('Invalid HTTP method'),
  // };
};



