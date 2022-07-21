# Sahapaathi: A Collaborative Code Editor and Compiler
Online Code Editor and Compiler with Collaboration and A.I.
## **Prereqisites:** ##
> * [nodejs](https://www.nodejs.org)
> * [npm](https://www.npmjs.com)
> * [MongoDB Account](https://www.mongodb.com)
> * [AWS account with S3 Bucket](https://aws.amazon.com)
> * [Jdoodle Account](https://www.jdoodle.com)
> * [Heroku Account](https://www.heroku.com)(optional)

### Working
* The client side is built using HTML CSS Vanilla JS. 
* Clone the repository and navigate to the root directory.
* Open a terminal. 
* Run "npm install" to install dependencies.
* Create a .env file at root directory and add the following fields in it.

Field  | Value
------------- | -------------
DB_URL  | Your MongoDB URL
SECRET  | Any secret key
AWS_ACCESS_KEY_ID  | AWS access key ID (create one if not present)
AWS_SECRET_ACCESS_KEY | AWS secret access key
AWS_S3_BUCKET_NAME  | S3 bucket name
CLIENT_ID  | Jdoodle Client ID
CLIENT_SECRET  | Jdoodle Secret

* Then run "npm start" or "node server.js" to start the server. 
* Your app is now deployed locally

### Server Deployment : [Heroku](https://www.heroku.com)
* To deploy on heroku signin to your heroku account. Creat a nodeJS app.
* Follow further instrictions to deploy your app on heroku.

# Live Preview : [click here](https://sahapaathi.live)
