var request = require('supertest');
var expect = require('chai').expect;


var port = "0.0.0.0";
var host = "9050";

var app;

// SAMPLE user object
// var x = {
//     "user": {
//         "gender": "female",
//         "name": {
//             "title": "miss",
//             "first": "alison",
//             "last": "reid"
//         },
//         "location": {
//             "street": "1097 the avenue",
//             "city": "Newbridge",
//             "state": "ohio",
//             "zip": 28782
//         },
//         "email": "alison.reid@example.com",
//         "username": "tinywolf709",
//         "password": "rockon",
//         "salt": "lypI10wj",
//         "md5": "bbdd6140e188e3bf68ae7ae67345df65",
//         "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
//         "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
//         "registered": 1237176893,
//         "dob": 932871968,
//         "phone": "031-541-9181",
//         "cell": "081-647-4650",
//         "PPS": "3302243T",
//         "picture": {
//             "large": "https://randomuser.me/api/portraits/women/60.jpg",
//             "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
//             "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
//         }
//     }
// };

describe("/api", function () {
    before(function (done) {
        startServer(done);
    });

    after(function (done) {
        stopServer(done);
    });

    it("should return 404 for unknown", function (done) {
        request(app)
            .get("/something")
            .expect(404, done);
    });

    describe("GET /users/:username", function () {
        it("should return the user when user exists", function (done) {
            request(app)
                .get("/users/tinywolf709")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.username).to.equal("tinywolf709");
                })
                .end(done);
        });

        it("should return 404 when user does not exist", function (done) {
            request(app)
                .get("/users/doesntExist")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(function (res) {
                    expect(res.body).to.not.exist;
                })
                .end(done);
        });

        it("should return all user info w/o credentials", function (done) {
            request(app)
                .get("/users/tinywolf709")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    // one way of checking it is exclusive check
                    // not gonna do here as we need to test the content anyway
                    // expect(res.body.password).to.not.exist;
                    // expect(res.body.salt).to.not.exist;
                    // expect(res.body.md5).to.not.exist;
                    // expect(res.body.sha1).to.not.exist;
                    // expect(res.body.sha256).to.not.exist;
                    expect(res.body).to.deepEqual({
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
                        "email": "alison.reid@example.com",
                        "username": "tinywolf709",
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
                    });
                })
                .end(done);
        });
    });

    describe("DELETE /users/:username", function () {
        it("should delete the user when user exists", function (done) {
            request(app)
                .del("/users/tinywolf709")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .expect(function () {
                    request(app)
                        .get("/users/tinywolf709")
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(404);
                })
                .end(done);
        });

        it("should return 404 when user does not exist", function (done) {
            request(app)
                .del("/users/doesntExist")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(function (res) {
                    expect(res.body).to.not.exist;
                })
                .end(done);
        });
    });

    describe("POST /users", function () {
        it("should create the user when validation is successful", function (done) {
            request(app)
                .post("/users")
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
                        .get("/users/this_is_a_new_user")
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
                .post("/users")
                .set('Accept', 'application/json')
                .send({
                    "foo": "bar"
                })
                .expect('Content-Type', /json/)
                .expect(403, {"error": "Missing username"})
                .end(done);
        });
    });

    describe("PUT /users/:userId", function () {
        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should update the complete user resource when user exists and validation is successful", function (done) {
            // change lots of stuff
            request(app)
                .put("/users/tinywolf709")
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
                        .get("/users/tinywolf709")
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
                .put("/users/tinywolf709")
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
                .put("/users/iDontExist")
                .set('Accept', 'application/json')
                .send({
                    foo: "bar"
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .end(done);
        });
    });

    describe("PATCH /users/:userId", function () {
        // NOTE: testing the validity cases of the user is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/user-validator.js`
        it("should patch user when user exists and validation is successful", function (done) {
            request(app)
                .patch("/users/tinywolf709")
                .set('Accept', 'application/json')
                .send({
                    "gender": "male",       // changed
                    "name": {
                        "last": "woods"      // changed
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200, {OK: 1})
                .expect(function (res) {
                    request(app)
                        .get("/users/tinywolf709")
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
                .put("/users/tinywolf709")
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
                .patch("/users/iDontExist")
                .set('Accept', 'application/json')
                .send({
                    foo: "bar"
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .end(done);
        })
    });

    describe("POST /search/users", function () {
        // NOTE: testing the validity cases of the query is unnecessary here in acceptance tests.
        //       those validation rules are tested in `test/unit/lib/search-query-validator.js`
        it("should return error when query is invalid", function (done) {
            request(app)
                .post("/search/users")
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
                .post("/search/users")
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
                .post("/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        "eq": {gender: "female"}
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function(res){
                    expect(res.body).to.exist;
                    expect(res.body.results).to.exist;
                    expect(res.body.results).be.an('array');
                    expect(res.body.results).to.have.lengthOf(10);
                })
                .end(done);
        });


        it("should return found users", function (done) {
            request(app)
                .post("/search/users")
                .set('Accept', 'application/json')
                .send({
                    query: {
                        gender: "female",
                        name:{
                            first:"alison"
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function(res){
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

function startServer(done) {
    require("../../application")
        .start(host, port)
        .then(function (_app) {
            app = _app;
            done();
        })
        .catch(done);
}

function stopServer(done) {
    require("../../application").stop()
        .then(function () {
            app = undefined;
            done();
        })
        .catch(done);
}
