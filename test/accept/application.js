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

    // TODO: check actual body content somewhere

    describe("GET /users?start=N&end=M", function () {
        it("should return empty array when there are no users", function (done) {
            request(app)
                .get("/users")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, {
                    total: 0,
                    start: 0,
                    end: 0,
                    results: []
                })
                .end(done);
        });

        it("should return first 10 users when no start/end params passed", function (done) {
            request(app)
                .get("/users")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    expect(res.body).to.exist;
                    expect(res.body.total).to.equal(100);
                    expect(res.body.start).to.equal(0);
                    expect(res.body.end).to.equal(9);
                    expect(res.body.results).to.be.an('array');
                    expect(res.body.results).to.have.lengthOf(10);
                    expect(res.body.results[0].username).to.equal("tinywolf709");
                    expect(res.body.results[10].username).to.equal("someone123");
                })
                .end(done);
        });

        it("should return empty array when there is nothing in the start/end range", function (done) {
            request(app)
                .get("/users?start=100000&end=100005")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, {
                    total: 100,
                    start: 100000,
                    end: 100005,
                    results: []
                })
                .end(done);
        });

        it("should return error when end is smaller than start", function (done) {
            request(app)
                .get("/users?start=51&end=50")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {"error": "Invalid start-end range"})
                .end(done);
        });

        it("should return error when start is negative", function (done) {
            request(app)
                .get("/users?start=-1&end=1")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {"error": "Invalid start-end range"})
                .end(done);
        });

        it("should return error when end is negative", function (done) {
            request(app)
                .get("/users?start=0&end=-1")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {"error": "Invalid start-end range"})
                .end(done);
        });

        it("should return error when start is not a number", function (done) {
            request(app)
                .get("/users?start=foo&end=1")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {"error": "Invalid start-end range"})
                .end(done);
        });

        it("should return error when end is not a number", function (done) {
            request(app)
                .get("/users?start=1&end=bar")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400, {"error": "Invalid start-end range"})
                .end(done);
        });
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

    describe("POST /users/:username", function () {
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
