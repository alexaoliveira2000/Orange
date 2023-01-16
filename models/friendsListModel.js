const connection = require("../config/connection")

class FriendList {

    constructor(obj) {
        this.id = obj.friends_list_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.friendId = obj.friend_id;
        this.pending = obj.pending === 1;
    }

    // devolver uma query recebida como argumento (em json)
    static queryDb(sql, params, callBack) {
        const mysqlCon = connection();
        mysqlCon.query(sql, params, function (err, result) {
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, result);
            }
        });
        mysqlCon.end();
    }

    // devolver todas as FriendLists (passar de json para FriendList[])
    static getFriendLists(callBack) {
        const sql = "SELECT * FROM friends_lists";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, null);
            } else {
                callBack(null, result.map(friendList => new FriendList(friendList)));
            }
        });
    }

    // devolver uma FriendList (passar de json para FriendList)
    static getFriendList(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM friends_lists WHERE friends_list_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let friendList = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, friendList ? new FriendList(friendList) : null);
            }
        });
    }

    // devolver a Friendlist de um utilizador (passar de json para FriendList)
    static getFriendListUser(id, callBack) {
        const params = [id, id];
        const sql = "SELECT * FROM friends_lists WHERE job_seeker_id = ? OR friend_id = ?";
        this.queryDb(sql, params, function(err, result) {
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, result.map(friend => new FriendList(friend)));
            }
        });
    }

    static getFriendship(id, friendId, callBack) {
        const params = [id, friendId, friendId, id];
        const sql = "SELECT * FROM friends_lists WHERE (job_seeker_id = ? AND friend_id = ?) OR (job_seeker_id = ? AND friend_id = ?)";
        this.queryDb(sql, params, function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, null);
            } else {
                callBack(null, new FriendList(result[0]));
            }
        });
    }

    // criar uma FriendList
    static createFriendList(userId1, userId2, callBack) {
        const params = [userId1, userId2];
        const sql = "insert into friends_lists (job_seeker_id, friend_id, pending) values (?, ?, 1)";
        this.queryDb(sql, params, callBack);
    }

    // editar um FriendList
    static editFriendList(data, callBack) {
        const params = [data, data.friends_list_id];
        const sql = "UPDATE friends_lists SET ? WHERE friends_list_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um FriendList
    static deleteFriendList(id, callBack) {
        const params = [id];
        const sql = "delete from friends_lists where friends_list_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }

    // remover um amigo
    static removeFriend(friendId, id, callBack) {
        const params = [friendId, id, id, friendId];
        const sql = "delete from friends_lists where (job_seeker_id = ? AND friend_id = ?) OR (job_seeker_id = ? AND friend_id = ?) limit 1;";
        this.queryDb(sql, params, callBack);
    }

    // aceitar um amigo
    static acceptFriend(id, friendId, callBack) {
        const params = [id, friendId, friendId, id];
        const sql = "UPDATE friends_lists SET pending = 0 WHERE (job_seeker_id = ? AND friend_id = ?) OR (job_seeker_id = ? AND friend_id = ?)";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = FriendList;