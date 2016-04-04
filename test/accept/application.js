var request = require('supertest');
var expect = require('chai').expect;

var sampleData = require('./sample-data');
var dbHelper = require('../db-helper');

var host = "0.0.0.0";
var port = "9050";

var app;


//////////////// READ ME ////////////////////
// these are acceptance test cases.
// however, not everything is to be tested here.
// see unit tests as well.
/////////////////////////////////////////////

/* jshint -W030 */
describe("/api", function () {
    before(function (done) {
        startServer(done);
    });

    after(function (done) {
        stopServer(done);
    });

    beforeEach(function (done) {
        dbHelper.dropDatabase()
            .then(done)
            .catch(done);
    });

    it("should return 404 for unknown", function (done) {
        request(app)
            .get("/something")
            .expect(404, done);
    });

    describe("GET /api/users", function () {
        it("should return all users", function (done) {
            sampleData.insertUsers([sampleData.sampleUser_A, sampleData.sampleUser_B])
                .then(function () {
                    request(app)
                        .get("/api/users")
                        .set('Accept', 'application/json')
                        .send("")
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body).be.an('array');
                            expect(res.body).to.have.lengthOf(2);
                            expect(res.body[0].username).to.equal("tinywolf709");
                            expect(res.body[1].username).to.equal("crazybear293");
                        })
                        .end(done);
                })
                .catch(done);
        });
    });

    describe("GET /api/users/:username", function () {
        it("should return the user when user exists", function (done) {
            sampleData.insertUsers([sampleData.sampleUser_A, sampleData.sampleUser_B])
                .then(function () {
                    request(app)
                        .get("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;

                            var expected = deepClone(sampleData.sampleUser_A);

                            expect(res.body).to.deep.equal(expected);
                        })
                        .end(done);
                })
                .catch(done);
        });

        it("should return 404 when user does not exist", function (done) {
            request(app)
                .get("/api/users/doesntExist")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.message).to.equal("No user found");
                })
                .end(done);
        });

    });

    describe("DELETE /api/users/:username", function () {
        it("should delete the user when user exists", function (done) {
            sampleData.insertUser(sampleData.sampleUser_A)
                .then(function () {
                    request(app)
                        .del("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200, {OK: 1})
                        .end(function (err) {
                            if (err) {
                                return done(err);
                            }
                            request(app)
                                .get("/api/users/" + sampleData.sampleUser_A.username)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(404)
                                .end(done);
                        });

                })
                .catch(done);
        });

        it("should return 404 when user does not exist", function (done) {
            request(app)
                .del("/api/users/doesntExist")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.message).to.equal("No user found");
                })
                .end(done);
        });
    });

    describe("POST /api/users", function () {
        it("should create the user when validation is successful", function (done) {
            var toBeSaved = deepClone(sampleData.sampleUser_A);

            request(app)
                .post("/api/users")
                .set('Accept', 'application/json')
                .send(toBeSaved)
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    request(app)
                        .get("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body).to.deep.equal(toBeSaved);
                        })
                        .end(done);
                });
        });

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should return an error message when validation fails", function (done) {
            request(app)
                .post("/api/users")
                .set('Accept', 'application/json')
                .send({
                    "foo": "bar"
                })
                .expect('Content-Type', /json/)
                .expect(400, {
                    "message": "StrictModeError: Field `foo` is not in schema and strict mode is set to throw.",
                    "status": 400
                })
                .end(done);
        });
    });

    describe("PUT /api/users/:userId", function () {
        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should update the complete user resource when user exists and validation is successful", function (done) {
            sampleData.insertUser(sampleData.sampleUser_A)
                .then(function () {
                    var changedUserData = deepClone(sampleData.sampleUser_A);

                    changedUserData.name.first = "ali";
                    changedUserData.location.street = "grand street 123";
                    changedUserData.picture.large = undefined;

                    // change lots of stuff
                    request(app)
                        .put("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .send(changedUserData)
                        .expect('Content-Type', /json/)
                        .expect(200, {OK: 1})
                        .end(function (err) {
                            if (err) {
                                return done(err);
                            }
                            request(app)
                                .get("/api/users/" + sampleData.sampleUser_A.username)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(function (res) {
                                    expect(res.body).to.exist;
                                    expect(res.body.username).to.equal(sampleData.sampleUser_A.username);
                                    expect(res.body.name).to.exist;
                                    expect(res.body.name.first).to.equal("ali");
                                    expect(res.body.location).to.exist;
                                    expect(res.body.location.street).to.equal("grand street 123");
                                    expect(res.body.picture).to.exist;
                                    expect(res.body.picture.large).to.not.exist;
                                })
                                .end(done);
                        });
                })
                .catch(done);
        });

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should not update user when user exists but validation is not successful", function (done) {
            sampleData.insertUser(sampleData.sampleUser_A)
                .then(function () {
                    request(app)
                        .put("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .send({foo: "bar"})
                        .expect('Content-Type', /json/)
                        .expect(400, {
                            "message": "StrictModeError: Field `foo` is not in schema and strict mode is set to throw.",
                            "status": 400
                        })
                        .end(done);
                })
                .catch(done);
        });

        it("should not update user when user doesn't exist", function (done) {
            request(app)
                .put("/api/users/iDontExist")
                .set('Accept', 'application/json')
                .send({
                    foo: "bar"
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .end(done);
        });
    });

    describe("PATCH /api/users/:userId", function () {
        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should patch user when user exists and validation is successful", function (done) {
            sampleData.insertUser(sampleData.sampleUser_A)
                .then(function () {
                    request(app)
                        .patch("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .send({
                            "gender": "male",
                            "name.last": "woods",
                            "picture": {}
                        })
                        .expect('Content-Type', /json/)
                        .expect(200, {OK: 1})
                        .end(function (err) {
                            if (err) {
                                return done(err);
                            }
                            request(app)
                                .get("/api/users/" + sampleData.sampleUser_A.username)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(function (res) {
                                    expect(res.body).to.exist;
                                    expect(res.body.username).to.equal(sampleData.sampleUser_A.username);

                                    // verify things are changed
                                    expect(res.body.gender).to.equal("male");
                                    expect(res.body.name).to.exist;
                                    expect(res.body.name.last).to.equal("woods");
                                    expect(res.body.picture).to.not.exist;

                                    // verify patch doesn't affect other properties

                                    var expectedWithoutChanged = deepClone(sampleData.sampleUser_A);
                                    var retrievedWithoutChanged = deepClone(res.body);
                                    retrievedWithoutChanged.gender = expectedWithoutChanged.gender = undefined;
                                    retrievedWithoutChanged.picture = expectedWithoutChanged.picture = undefined;
                                    retrievedWithoutChanged.name.last = expectedWithoutChanged.name.last = undefined;

                                    expect(expectedWithoutChanged).to.deep.equal(retrievedWithoutChanged);
                                })
                                .end(done);
                        });
                })
                .catch(done);
        });

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should not patch user when user exists but validation is not successful", function (done) {
            sampleData.insertUser(sampleData.sampleUser_A)
                .then(function () {
                    request(app)
                        .put("/api/users/" + sampleData.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .send({
                            "location": {
                                "zip": "SOMESTRING"
                            }
                        })
                        .expect('Content-Type', /json/)
                        .expect(400, {
                            "message": "CastError: Cast to number failed for value \"SOMESTRING\" at path \"location.zip\"",
                            "status": 400
                        })
                        .end(done);
                })
                .catch(done);
        });

        it("should not patch user when user does not exist", function (done) {
            request(app)
                .patch("/api/users/iDontExist")
                .set('Accept', 'application/json')
                .send(sampleData.sampleUser_A)
                .expect('Content-Type', /json/)
                .expect(404)
                .end(done);
        });
    });

    describe("POST /api/search/users", function () {
        // NOTE: testing the validity cases of the query is unnecessary here in acceptance tests.
        //       those validation rules are tested in unit tests of the related code.
        it("should return error when query is invalid", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send("")
                .expect('Content-Type', /json/)
                .expect(400, {
                    "message": "No query passed",
                    "status": 400
                })
                .end(done);
        });


        it("should return empty when there are no users matching the query", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send({
                    username: "foobar"
                })
                .expect('Content-Type', /json/)
                .expect(200, [])
                .end(done);
        });

        it("should limit returned results to N", function (done) {
            sampleData.insertUsers(sampleData.sampleUsers)
                .then(function () {
                    request(app)
                        .post("/api/search/users")
                        .set('Accept', 'application/json')
                        .send({
                            gender: "female"
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body).be.an('array');
                            expect(res.body).to.have.lengthOf(30);
                        })
                        .end(done);
                })
                .catch(done);
        });


        it("should return found users", function (done) {
            sampleData.insertUsers(sampleData.sampleUsers)
                .then(function () {
                    request(app)
                        .post("/api/search/users")
                        .set('Accept', 'application/json')
                        .send({
                            "gender": "female",
                            "name.first": "alison",
                            "name.title": "miss"
                        })
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body).be.an('array');
                            expect(res.body).to.have.lengthOf(2);
                            expect(res.body[0].username).to.equal("tinywolf709");
                            expect(res.body[1].username).to.equal("bluesnake225");
                        })
                        .end(done);
                })
                .catch(done);
        });

    });

});
/* jshint +W030 */

function startServer(done) {
    process.env.MONGODB_SERVICE_HOST = "localhost";
    process.env.MONGODB_USER = "";
    process.env.MONGODB_PASSWORD = "";
    process.env.MONGODB_SERVICE_PORT = "";
    process.env.MONGODB_DATABASE = "user-service-accept-test";

    require("../../application")
        .start(host, port)
        .then(function (result) {
            app = result.app;
            console.log("Started server for acceptance tests");
            done();
        })
        .catch(done);
}

function stopServer(done) {
    require("../../application")
        .stop()
        .then(function () {
            app = undefined;
            done();
        })
        .catch(done);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
