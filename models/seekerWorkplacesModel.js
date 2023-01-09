const connection = require("../config/connection")

class SeekerWorkplace {

    constructor(obj) {
        this.id = obj.seeker_workplace_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.workplaceId = obj.workplace_id;
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

    // devolver todos os SeekerWorkplaces (passar de json para SeekerWorkplace[])
    static getSeekerWorkplaces(callBack) {
        const sql = "SELECT * FROM seeker_workplaces";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "seeker_workplaces"`), null);
            } else {
                callBack(null, result.map(seekerWorkplace => new SeekerWorkplace(seekerWorkplace)));
            }
        });
    }

    // devolver um SeekerWorkplace (passar de json para SeekerWorkplace)
    static getSeekerWorkplace(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM seeker_workplaces WHERE seeker_workplace_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let seekerWorkplace = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, seekerWorkplace ? new SeekerWorkplace(seekerWorkplace) : null);
            }
        });
    }

    // criar uma SeekerWorkplace
    static createSeekerWorkplace(jsonData, callBack) {
        const seekerWorkplaceData = JSON.parse(jsonData);
        const params = [seekerWorkplaceData.jobSeekerId, seekerWorkplaceData.workplaceId];
        const sql = "insert into seeker_workplaces (job_seeker_id, workplace_id) values (?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um SeekerWorkplace
    static deleteSeekerWorkplace(id, callBack) {
        const params = [id];
        const sql = "delete from seeker_workplaces where seeker_workplace_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = SeekerWorkplace;