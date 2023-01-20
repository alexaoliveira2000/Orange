const connection = require("../config/connection")

class FriendList {

    constructor(obj) {
        this.id = obj.friends_list_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.friendId = obj.friend_id;
        this.pending = obj.pending === 1;
    }

    /**
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof FriendList
    *
    */
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

    /**
    @function getFriendLists
    @memberof FriendList
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves all friend lists from the database and maps them to instances of the FriendList class.
    */
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

    /**
    @function getFriendList
    @memberof FriendList
    @param {number} id - The id of the friend list to retrieve.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves a specific friend list from the database by its id and maps it to an instance of the FriendList class.
    */
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

    /**
    @function getFriendListUser
    @memberof FriendList
    @param {number} id - The id of the user.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves all friend list of a user by its id and maps it to an instance of the FriendList class.
    */
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

    /**
    @function getFriendship
    @memberof FriendList
    @param {number} id - The id of the first user.
    @param {number} friendId - The id of the second user.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves a specific friendship from the database by the ids of the two users involved, and maps it to an instance of the FriendList class.
    */
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

    /**
    @function createFriendList
    @memberof FriendList
    @param {number} userId1 - The id of the first user.
    @param {number} userId2 - The id of the second user.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Creates a new friend list in the database for the two given users, with a pending status of 1.
    */
    static createFriendList(userId1, userId2, callBack) {
        const params = [userId1, userId2];
        const sql = "insert into friends_lists (job_seeker_id, friend_id, pending) values (?, ?, 1)";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function editFriendList
    @memberof FriendList
    @param {Object} data - The data of the friend list to update.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Updates a friend list in the database using the given data and friend list id.
    */
    static editFriendList(data, callBack) {
        const params = [data, data.friends_list_id];
        const sql = "UPDATE friends_lists SET ? WHERE friends_list_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function deleteFriendList
    @memberof FriendList
    @param {number} id - The id of the friend list to delete.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Deletes a specific friend list from the database by its id.
    */
    static deleteFriendList(id, callBack) {
        const params = [id];
        const sql = "delete from friends_lists where friends_list_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function removeFriend
    @memberof FriendList
    @param {number} friendId - The id of the first user.
    @param {number} id - The id of the second user.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Deletes a specific friendship from the database by the ids of the two users involved.
    */
    static removeFriend(friendId, id, callBack) {
        const params = [friendId, id, id, friendId];
        const sql = "delete from friends_lists where (job_seeker_id = ? AND friend_id = ?) OR (job_seeker_id = ? AND friend_id = ?) limit 1;";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function acceptFriend
    @memberof FriendList
    @param {number} id - The id of the first user.
    @param {number} friendId - The id of the second user.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Accepts a pending friendship request by updating the pending status of the friendship to 0.
    */
    static acceptFriend(id, friendId, callBack) {
        const params = [id, friendId, friendId, id];
        const sql = "UPDATE friends_lists SET pending = 0 WHERE (job_seeker_id = ? AND friend_id = ?) OR (job_seeker_id = ? AND friend_id = ?)";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = FriendList;