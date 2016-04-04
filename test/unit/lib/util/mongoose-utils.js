var chai = require('chai');

var expect = require('chai').expect;
chai.use(require("chai-as-promised"));

var dbHelper = require('../../../db-helper');
var mongooseUtils = require('../../../../lib/util/mongoose-utils');

var userDao;

/* jshint -W030 */
describe("mongoose-utils", function () {

    beforeEach(function (done) {
        dbHelper.connectToDatabase("user-service-unit-test")
            .then(dbHelper.dropDatabase)
            .then(dbHelper.ensureIndexes)
            .then(function () {
                userDao = require('../../../../lib/user-dao');
            })
            .then(done)
            .catch(done);
    });

    afterEach(function (done) {
        dbHelper.disconnectDatabase()
            .then(done)
            .catch(done);
    });

    describe("isValidationError", function () {
        it("should return true when validation error caused by type casting", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                location: {
                    zip: "thisShouldBetterBeANumber"
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(mongooseUtils.isValidationError(err)).to.be.equal(true);
                    done();
                })
                .catch(done);
        });

        it("should return true when validation error caused by missing property", function (done) {
            var promise = userDao.createUser({
                location: {
                    city: "Zurich"
                }
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(mongooseUtils.isValidationError(err)).to.be.equal(true);
                    done();
                })
                .catch(done);
        });

        it("should return true when validation error caused by property that doesn't exist in schema", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                randomProperty: 1
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(mongooseUtils.isValidationError(err)).to.be.equal(true);
                    done();
                })
                .catch(done);
        });

        it("should return true when validation error caused by invalid property value", function (done) {
            var promise = userDao.createUser({
                username: "foo",
                register: -1
            });

            expect(promise).to.be.rejected
                .then(function (err) {
                    expect(mongooseUtils.isValidationError(err)).to.be.equal(true);
                    done();
                })
                .catch(done);
        });

        it("should return true when validation error caused by non-unique property value", function (done) {
            userDao.createUser({username: "foo"})
                .then(function () {

                    var promise = userDao.createUser({username: "foo"});

                    expect(promise).to.be.rejected
                        .then(function (err) {
                            expect(mongooseUtils.isValidationError(err)).to.be.equal(true);
                            done();
                        })
                        .catch(done);
                })
                .catch(done);
        });

        it("should return false when error is something else", function (done) {
            expect(mongooseUtils.isValidationError(new Error("Not a validation error"))).to.be.equal(false);
            done();
        });
    });

});
/* jshint +W030 */
