const connection = require("../config/connection")

class FriendList {

    constructor(obj) {
        this.id = obj.friends_list_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.friendId = obj.friend_id;
        this.pending = obj.pending;
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
                callBack(new Error(`No data found on table "friends_lists"`), null);
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

    // criar uma FriendList
    static createFriendList(jsonData, callBack) {
        const friendListData = JSON.parse(jsonData);
        const params = [friendListData.jobSeekerId, friendListData.friendId, friendListData.pending];
        const sql = "insert into friends_lists (job_seeker_id, friend_id, pending) values (?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um FriendList
    static deleteFriendList(id, callBack) {
        const params = [id];
        const sql = "delete from friends_lists where friends_list_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = FriendList;