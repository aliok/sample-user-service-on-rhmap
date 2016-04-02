# Disclaimer

This application is implemented for a job application.

# Notes to reviewer

This web application is just a RESTful endpoint for the given dataset.

Following is a list of things that don't exist because of very limited time I had:

* Very limited business logic. Server just takes what client sends. It does some validation
  like checking uniqueness of username but it it doesn't do many things that a production
  application would do:
  * Server doesn't set `registered` timestamp to user document with the time of insertion.
    It just passes the value received from client.
  * Server doesn't generate `salt`, `md5`, `sha1` and `sha256`. It just passes the values received
    from client.
  * Nothing is required except `username`.
  * No format check exists (e.g. email). Only number fields are checked against being a number.

* There is no authentication.

* There is no clustering.

* There is no MongoDB replication/sharding etc.


I am perfectly capable of doing all of the things above.

* Business logic: see <https://github.com/aliok/rambo-li-char-customization-backend/blob/master/services/customizationValidator.js>
* Authentication: see [this](https://github.com/aliok/rambo-li-char-customization-backend/blob/master/routes/v1/login.js)
  and [this](https://github.com/aliok/rambo-li-char-customization-backend/blob/master/middlewares/v1/authenticate.js)
* Clustering: see <https://github.com/aliok/rambo-li-char-customization-backend/blob/master/app.js#L73>



You may find my _related_ following applications on Github:

* <https://github.com/aliok/henryvision> : RHMAP application (2 MBaaS + 1 Cloud app + 1 Cordova app)
  * A small demo of RHMAP and Google Vision API

* <https://github.com/aliok/rambo-li-char-customization-backend> : Node app (MongoDB,REST,Canvas etc.)
  * Check out the video there
  * Node app used in a Docker container
  * Somewhat different stack of things
  * ES6
  * Almost everything promisified


# Local development

### Requirements

As the time of implementing this application:

* RHMAP (OpenShift actually) offers Node 0.10.35 as the latest version. That's why you
  should have Node => 0.10.35 on your machine.
* Similarly RHMAP/OpenShift offers npm 1.4.28. You should have npm => 1.4.28 on your machine.

Install `istanbul`

    npm install --global istanbul

You should have a MongoDB instance up and running.

### Start

##### Start locally:

    npm run start-local

Go to <http://localhost:8001>.
Expects a MongoDB running locally at standard port w/ no authentication enabled.

##### Start on OpenShift/RHMAP:

    npm start

OpenShift/RHMAP environment variables are read.


### Tests

    npm run test

### Lint

    npm run lint

### Test coverage report

    npm run coverage

Open `./.coverage-report/lcov-report/index.html`.

### Code analysis report

    npm run code-analysis

Open `./.code-analysis/index.html`
