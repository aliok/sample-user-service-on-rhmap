var service = module.exports = {
    getUserByUsername : getUserByUsername,
    deleteUserByUsername: deleteUserByUsername
};

function getUserByUsername(req, res){
    return res.json({foo:1});
}

function deleteUserByUsername(req, res){
    return res.json({foo:1});
}
