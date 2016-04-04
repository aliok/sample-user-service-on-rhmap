var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var userDao;
var userApi;

var mockRequest = {
    status: function(){},
    json: function(){}
};

/* jshint -W030 */
describe("mongoose-utils", function () {

    beforeEach(function (done) {
        userDao = sinon.mock({
            getAllUsers: function(){},
            createUser: function(){},
            findOneUser: function(){},
            findUsers: function(){},
            deleteOneUser: function(){},
            updateOneUser: function(){},
            patchOneUser: function(){}
        });
        userApi = proxyquire('../../../lib/user-api', {'./user-dao': userDao});
        done();
    });

    afterEach(function (done) {
        userDao = null;
        userApi = null;
        done();
    });

    describe("getUserByUsername", function () {
        it("should not hit DB when no username passed", function (done) {
            var req = {params: {username: ""}};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("findOneUser").never();

            userApi.getUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });

    describe("deleteUserByUsername", function () {
        it("should not hit DB when no username passed", function (done) {
            var req = {params: {username: ""}};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("deleteOneUser").never();

            userApi.deleteUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });

    describe("updateUserByUsername", function () {
        it("should not hit DB when no username passed", function (done) {
            var req = {params: {username: ""}, body: {foo:"bar"}};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("updateOneUser").never();

            userApi.updateUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });

        it("should not hit DB when no update passed", function (done) {
            var req = {params: {username: "foo"}, body: ""};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("updateOneUser").never();

            userApi.updateUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });

    describe("patchUserByUsername", function () {
        it("should not hit DB when no username passed", function (done) {
            var req = {params: {username: ""}, body: {foo:"bar"}};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("patchOneUser").never();

            userApi.patchUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });

        it("should not hit DB when no update passed", function (done) {
            var req = {params: {username: "foo"}, body: ""};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("patchOneUser").never();

            userApi.patchUserByUsername(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });

    describe("createUser", function () {
        it("should not hit DB when no data passed", function (done) {
            var req = {body: ""};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("createUser").never();

            userApi.createUser(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });

    describe("searchUsers", function () {
        it("should not hit DB when no query passed", function (done) {
            var req = {body: ""};

            var res = sinon.mock(mockRequest);
            res.status = res.expects("status").withArgs(400).returns(res);
            res.json = res.expects("json").once().returns(res);

            userDao.expects("findUsers").never();

            userApi.searchUsers(req, res);

            res.verify();
            userDao.verify();

            done();
        });
    });



});
/* jshint +W030 */

