var chai = require('chai');
var Promise = require('bluebird');

var expect = require('chai').expect;
chai.use(require("chai-as-promised"));

var database;
var userDao;

/* jshint -W030 */
describe("/api", function () {
    beforeEach(function (done) {
        connectToDatabase()
            .then(dropDatabase)
            .then(ensureIndexes)
            .then(done)
            .catch(done);
    });

    afterEach(function (done) {
        disconnectDatabase()
            .then(done)
            .catch(done);
    });

    describe("createUser", function () {
        it("should not insert if doc is empty", function (done) {
            var promise = userDao.createUser({});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid user data to create user");
                    done();
                })
                .catch(done);
        });

        it("should not insert if a string field is too long", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                name: {
                    title: new Array(100).join('x')
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "User validation failed");
                    done();
                })
                .catch(done);
        });

        it("should not insert w/o username", function (done) {
            var promise = userDao.createUser({
                name: {
                    first: "Jane",
                    last: "Doe"
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "User validation failed");
                    done();
                })
                .catch(done);
        });

        it("should not insert if non-unique username", function (done) {
            userDao.createUser({username: "foo"})
                .then(function () {

                    var promise = userDao.createUser({username: "foo"});

                    expect(promise).to.be.rejected
                        .then(function () {
                            done();
                        })
                        .catch(done);
                })
                .catch(done);


        });

        it("should not insert if a number field is too large", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                location: {
                    zip: 100000
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "User validation failed");
                    done();
                })
                .catch(done);
        });

        it("should not insert if a number field is too small", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                location: {
                    zip: -1
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "User validation failed");
                    done();
                })
                .catch(done);
        });

        it("should not insert if gender is invalid", function (done) {
            var promise = userDao.createUser({
                "username": "foo",
                "gender": "foo"
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "User validation failed");
                    done();
                })
                .catch(done);
        });

        it("should not insert if a field is not in the schema", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                foo: "bar"
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Field `foo` is not in schema and strict mode is set to throw.");
                    done();
                })
                .catch(done);
        });

        it("should insert", function (done) {
            var inserted = {username: "foo"};
            userDao.createUser(inserted)
                .then(function (retrieved) {
                    expect(retrieved).to.have.property("_id");
                    expect(retrieved.username).to.equal(inserted.username);
                    done();
                })
                .catch(done);
        });
    });

    describe("findOneUser", function () {
        it("should return error if query is invalid", function (done) {
            var promise = userDao.findOneUser(1234);

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid query to find one user");
                    done();
                })
                .catch(done);
        });

        it("should return null if cannot find anything", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.findOneUser({"username": "iDontExist"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.equal(null);
                    done();
                })
                .catch(done);
        });

        it("should find the user", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "email": "foo@bar.com"});
                })
                .then(function () {
                    return userDao.findOneUser({"email": "foo@bar.com"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.have.property("username", "foo1");
                    expect(retrieved).to.have.property("email", "foo@bar.com");
                    done();
                })
                .catch(done);
        });

        it("should return the first user if many matched", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo2", "gender": "male"});
                })
                .then(function () {
                    return userDao.findOneUser({"gender": "male"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.have.property("username", "foo1");
                    expect(retrieved).to.have.property("gender", "male");
                    done();
                })
                .catch(done);
        });
    });

    describe("findUsers", function () {
        it("should return error if query is invalid", function (done) {
            var promise = userDao.findUsers(1234);

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid query to find users");
                    done();
                })
                .catch(done);
        });

        it("should return error if limit is invalid", function (done) {
            var promise = userDao.findUsers({foo: "bar"}, "notANumber");

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid limit to find users");
                    done();
                })
                .catch(done);
        });

        it("should return empty array if nothing found", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.findUsers({"username": "iDontExist"}, 10);
                })
                .then(function (retrieved) {
                    expect(retrieved).to.be.an('array').and.to.have.lengthOf(0);
                    done();
                })
                .catch(done);
        });

        it("should find the users", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo2", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo3", "gender": "female"});
                })
                .then(function () {
                    return userDao.findUsers({"gender": "male"}, 10);
                })
                .then(function (retrieved) {
                    expect(retrieved).to.be.an('array').and.to.have.lengthOf(2);
                    expect(retrieved[0]).to.have.property("username", "foo1");
                    expect(retrieved[1]).to.have.property("username", "foo2");
                    done();
                })
                .catch(done);
        });

        it("should return the first N users if too many matched", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo2", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo3", "gender": "female"});
                })
                .then(function () {
                    return userDao.findUsers({"gender": "male"}, 1);
                })
                .then(function (retrieved) {
                    expect(retrieved).to.be.an('array').and.to.have.lengthOf(1);
                    expect(retrieved[0]).to.have.property("username", "foo1");
                    done();
                })
                .catch(done);
        });
    });

    describe("deleteOneUser", function () {
        it("should return error if query is invalid", function (done) {
            var promise = userDao.deleteOneUser({});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid query to delete one user");
                    done();
                })
                .catch(done);
        });

        it("should delete the user", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.deleteOneUser({"username": "foo1"});
                })
                .then(function () {
                    return userDao.findOneUser({"username": "foo1"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.equal(null);
                    done();
                })
                .catch(done);
        });

        it("should delete the first user if multiple matched", function (done) {
            return Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.createUser({"username": "foo2", "gender": "male"});
                })
                .then(function () {
                    return userDao.deleteOneUser({"gender": "male"});
                })
                .then(function () {
                    return userDao.findUsers({"gender": "male"}, 10);
                })
                .then(function (retrieved) {
                    expect(retrieved).to.be.an('array').and.to.have.length(1);
                    expect(retrieved[0]).to.have.property("username", "foo2");
                    done();
                })
                .catch(done);
        });
    });

    describe("updateOneUser", function () {
        it("should not update if query is empty", function (done) {
            var promise = userDao.updateOneUser({});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid query to update one user");
                    done();
                })
                .catch(done);
        });

        it("should not update if doc is empty", function (done) {
            var promise = userDao.updateOneUser({foo: "bar"}, {});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid replacement to update one user");
                    done();
                })
                .catch(done);
        });

        // we don't test all validation cases again
        // we did it while testing `createUser`
        it("should not update if validation fails", function (done) {
            var promise = Promise.resolve()
                .then(function () {
                    return userDao.createUser({"username": "foo1", "gender": "male"});
                })
                .then(function () {
                    return userDao.updateOneUser({username: "foo1"}, {username: "foo1", registered: -1});
                });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Validation failed");
                    done();
                })
                .catch(done);
        });

        it("should update", function (done) {
            Promise.resolve()
                .then(function () {
                    return userDao.createUser({username: "foo1", gender: "male"});
                })
                .then(function () {
                    return userDao.updateOneUser({username: "foo1"}, {username: "foo1", gender: "female"});
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo1"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.exist;
                    expect(retrieved).to.have.property("username", "foo1");
                    expect(retrieved).to.have.property("gender", "female");
                    done();
                })
                .catch(done);
        });

        it("should update the first user if multiple matched", function (done) {
            Promise.resolve()
                .then(function () {
                    return userDao.createUser({username: "foo1", gender: "male"});
                })
                .then(function () {
                    return userDao.createUser({username: "foo2", gender: "male"});
                })
                .then(function () {
                    return userDao.updateOneUser({gender: "male"}, {username: "foo1", gender: "female"});
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo1"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.exist;
                    expect(retrieved).to.have.property("username", "foo1");
                    // should be modified
                    expect(retrieved).to.have.property("gender", "female");
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo2"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.exist;
                    expect(retrieved).to.have.property("username", "foo2");
                    // should be unchanged
                    expect(retrieved).to.have.property("gender", "male");
                    done();
                })
                .catch(done);
        });
    });

    describe("patchOneUser", function () {
        it("should not patch if query is empty", function (done) {
            var promise = userDao.patchOneUser({});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid query to patch one user");
                    done();
                })
                .catch(done);
        });

        it("should not patch if patch is empty", function (done) {
            var promise = userDao.patchOneUser({foo: "bar"}, {});

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Invalid patch to patch one user");
                    done();
                })
                .catch(done);
        });

        // we don't test all validation cases again
        // we did it while testing `createUser`
        it("should not patch if validation fails", function (done) {
            var promise = Promise.resolve()
                .then(function () {
                    return userDao.createUser({username: "foo", gender: "male"});
                })
                .then(function () {
                    return userDao.patchOneUser({username: "foo"}, {gender: "nothing"});
                });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(err).to.have.property("message", "Validation failed");
                    done();
                })
                .catch(done);
        });

        it("should patch", function (done) {
            Promise.resolve()
                .then(function () {
                    return userDao.createUser({username: "foo", gender: "male"});
                })
                .then(function () {
                    return userDao.patchOneUser({username: "foo"}, {gender: "female"});
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.have.property("gender", "female");
                    done();
                })
                .catch(done);
        });

        it("should patch the first user if multiple matched", function (done) {
            Promise.resolve()
                .then(function () {
                    return userDao.createUser({username: "foo1", gender: "male"});
                })
                .then(function () {
                    return userDao.createUser({username: "foo2", gender: "male"});
                })
                .then(function () {
                    return userDao.patchOneUser({gender: "male"}, {gender: "female"});
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo1"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.exist;
                    expect(retrieved).to.have.property("username", "foo1");
                    // should be modified
                    expect(retrieved).to.have.property("gender", "female");
                })
                .then(function () {
                    return userDao.findOneUser({username: "foo2"});
                })
                .then(function (retrieved) {
                    expect(retrieved).to.exist;
                    expect(retrieved).to.have.property("username", "foo2");
                    // should be unchanged
                    expect(retrieved).to.have.property("gender", "male");
                    done();
                })
                .catch(done);
        });
    });

});
/* jshint +W030 */

function connectToDatabase() {
    process.env.MONGODB_SERVICE_HOST = "localhost";
    process.env.MONGODB_USER = "";
    process.env.MONGODB_PASSWORD = "";
    process.env.MONGODB_SERVICE_PORT = "";
    process.env.MONGODB_DATABASE = "user-service-unit-test";
    database = require('../../lib/database');

    return new Promise(function (fulfill, reject) {
        database.connect(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });
}

function disconnectDatabase() {
    return new Promise(function (fulfill, reject) {
        database.disconnect(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });
}

/**
 * Drops the MongoDB database.
 */
function dropDatabase() {
    return new Promise(function (fulfill, reject) {
        // we have to get this fresh
        // otherwise connection is already closed
        var mongoose = require("mongoose");
        mongoose.connection.db.dropDatabase(function (err, result) {
            if (err) {
                reject(err);
            }
            else if (!result) {
                reject(new Error("Drop database call returned " + result));
            }
            else {
                fulfill();
            }
        });
    });
}

/**
 * While testing we can't do the index creation in the background.
 * Tests are run too fast and they fail in that case.
 *
 * We manually ensure indexes before doing the db operations first.
 */
function ensureIndexes() {
    return new Promise(function (fulfill, reject) {
        userDao = require('../../lib/user-dao');
        var userModel = require('../../lib/user-model');

        userModel.ensureIndexes(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });

}

