var _ = require('underscore');
var request = require('supertest');
var expect = require('chai').expect;

var dbHelper = require('./db-helper');

var host = "0.0.0.0";
var port = "9050";

var app;

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

    describe("GET /api/users/:username", function () {
        it("should return the user when user exists", function (done) {
            dbHelper.insertUsers([dbHelper.sampleUser_A, dbHelper.sampleUser_B])
                .then(function () {
                    request(app)
                        .get("/api/users/" + dbHelper.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body.username).to.equal("tinywolf709");
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

        it("should return all user info w/o credentials", function (done) {
            dbHelper.insertUser(dbHelper.sampleUser_A)
                .then(function () {
                    request(app)
                        .get("/api/users/" + dbHelper.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            // one way of checking it is exclusive check
                            // not gonna do here as we need to test the content anyway
                            expect(res.body.password).to.not.exist;
                            expect(res.body.salt).to.not.exist;
                            expect(res.body.md5).to.not.exist;
                            expect(res.body.sha1).to.not.exist;
                            expect(res.body.sha256).to.not.exist;

                            var expected = deepClone(dbHelper.sampleUser_A);
                            expected = _.omit(expected, ['_id', 'md5', 'sha1', 'sha256', 'salt', 'password']);

                            expect(res.body).to.deep.equal(expected);
                        })
                        .end(done);
                })
                .catch(done);
        });
    });

    describe("DELETE /api/users/:username", function () {
        it("should delete the user when user exists", function (done) {
            dbHelper.insertUser(dbHelper.sampleUser_A)
                .then(function () {
                    request(app)
                        .del("/api/users/" + dbHelper.sampleUser_A.username)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200, {OK: 1})
                        .end(function (err) {
                            if (err) {
                                return done(err);
                            }
                            request(app)
                                .get("/api/users/" + dbHelper.sampleUser_A.username)
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
            request(app)
                .post("/api/users")
                .set('Accept', 'application/json')
                .send({
                    "gender": "female",
                    "name": {
                        "title": "miss",
                        "first": "alison",
                        "last": "reid"
                    },
                    "location": {
                        "street": "1097 the avenue",
                        "city": "Newbridge",
                        "state": "ohio",
                        "zip": 28782
                    },
                    "email": "this_is_a_new_user@example.com",
                    "username": "this_is_a_new_user",
                    "password": "rockon",
                    // Salt and hash(es) are assigned by the backend
                    // "salt": "lypI10wj",
                    // "md5": "bbdd6140e188e3bf68ae7ae67345df65",
                    // "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
                    // "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
                    // Registration time is assigned by the backend
                    "registered": 1237176893,
                    "dob": 932871968,
                    "phone": "031-541-9181",
                    "cell": "081-647-4650",
                    "PPS": "3302243T",
                    "picture": {
                        "large": "https://randomuser.me/api/portraits/women/60.jpg",
                        "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
                        "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .expect(function () {
                    request(app)
                        .get("/api/users/this_is_a_new_user")
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body.username).to.equal("this_is_a_new_user");
                            expect(res.body.registered).to.be.within(new Date().getTime() - 1000, new Date().getTime() + 1000);
                        });
                })
                .end(done);
        });

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should return an error message when validation fails", function (done) {
            request(app)
                .post("/api/users")
                .set('Accept', 'application/json')
                .send({
                    "foo": "bar"
                })
                .expect('Content-Type', /json/)
                .expect(403, {"error": "Missing username"})
                .end(done);
        });
    });

    describe("PUT /api/users/:userId", function () {
        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should update the complete user resource when user exists and validation is successful", function (done) {
            // change lots of stuff
            request(app)
                .put("/api/users/tinywolf709")
                .set('Accept', 'application/json')
                .send({
                    "gender": "male",                    // changed
                    "name": {
                        "title": "mr",                   // changed
                        "first": "jack",                 // changed
                        "last": "reid"
                    },
                    "location": {
                        "street": "1097 the avenue",
                        "city": "dallas",                // changed
                        "state": "texas",                // changed
                        "zip": 12345                     // changed
                    },
                    "email": "jack.reid@example.com",
                    "username": "tinywolf709",
                    "password": "rockon",
                    "dob": 932871968,
                    "phone": "031-541-9181",
                    "cell": "081-647-4650",
                    "PPS": "3302243T",
                    "picture": {
                        "large": "https://randomuser.me/api/portraits/women/60.jpg",
                        "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
                        "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .expect(function () {
                    request(app)
                        .get("/api/users/tinywolf709")
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body.username).to.equal("tinywolf709");
                            expect(res.body.gender).to.equal("male");
                            expect(res.body.name).to.exist;
                            expect(res.body.name.title).to.equal("mr");
                            expect(res.body.name.first).to.equal("jack");
                            expect(res.body.location).to.exist;
                            expect(res.body.location.city).to.equal("dallas");
                            expect(res.body.location.state).to.equal("texas");
                            expect(res.body.location.zip).to.equal(12345);
                        });
                })
                .end(done);
        });

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should not update user when user exists but validation is not successful", function (done) {
            request(app)
                .put("/api/users/tinywolf709")
                .set('Accept', 'application/json')
                .send({
                    "gender": "male",
                    "FOOname": {                         // name is missing now
                        "title": "mr",
                        "first": "jack",
                        "last": "reid"
                    },
                    "location": {
                        "street": "1097 the avenue",
                        "city": "dallas",
                        "state": "texas",
                        "zip": 12345
                    },
                    "email": "jack.reid@example.com",
                    "username": "tinywolf709",
                    "password": "rockon",
                    "dob": 932871968,
                    "phone": "031-541-9181",
                    "cell": "081-647-4650",
                    "PPS": "3302243T",
                    "picture": {
                        "large": "https://randomuser.me/api/portraits/women/60.jpg",
                        "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
                        "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(400, {error: "Missing name"})
                .end(done);
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
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should patch user when user exists and validation is successful", function (done) {
            request(app)
                .patch("/api/users/tinywolf709")
                .set('Accept', 'application/json')
                .send({
                    "gender": "male",       // changed
                    "name": {
                        "last": "woods"      // changed
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .expect(function () {
                    request(app)
                        .get("/api/users/tinywolf709")
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(function (res) {
                            expect(res.body).to.exist;
                            expect(res.body.username).to.equal("tinywolf709");
                            expect(res.body.gender).to.equal("male");
                            expect(res.body.name).to.exist;
                            expect(res.body.name.last).to.equal("woods");
                        });
                })
                .end(done);
        });

        // TODO: a test to verify `patch` doesn't affect other fields

        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should not patch user when user exists but validation is not successful", function (done) {
            request(app)
                .put("/api/users/tinywolf709")
                .set('Accept', 'application/json')
                .send({
                    "location": {
                        "zip": -1
                    }
                })
                .expect('Content-Type', /json/)
                .expect(400, {error: "Invalid zip"})
                .end(done);
        });

        it("should not patch user when user does not exist", function (done) {
            request(app)
                .patch("/api/users/iDontExist")
                .set('Accept', 'application/json')
                .send({
                    foo: "bar"
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .end(done);
        });
    });

    describe("POST /api/search/users", function () {
        // NOTE: testing the validity cases of the query is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/search-query-validator.js`
        it("should return error when query is invalid", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        foo: "bar"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(403, {error: "Invalid search query"})
                .end(done);
        });


        it("should return error when there are no users matching the query", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        username: "foobar"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200, {
                    results: []
                })
                .end(done);
        });

        it("should limit returned results to N", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        "eq": {gender: "female"}
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.results).to.exist;
                    expect(res.body.results).be.an('array');
                    expect(res.body.results).to.have.lengthOf(10);
                })
                .end(done);
        });


        it("should return found users", function (done) {
            request(app)
                .post("/api/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        gender: "female",
                        name: {
                            first: "alison"
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.results).to.exist;
                    expect(res.body.results).be.an('array');
                    expect(res.body.results).to.have.lengthOf(1);
                    expect(res.body.results[0].username).to.equal("tinywolf709");
                })
                .end(done);
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
