const connection = require("../config/connection")

class JobSeeker {

    constructor(obj) {
        this.id = obj.job_seeker_id;
        this.gender = obj.gender;
        this.birthDate = obj.birth_date;
        this.isVisibleToCompanies = obj.visible_to_companies;
        this.friendListId = obj.friends_list_id;
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

    // devolver todos os JobSeekers (passar de json para JobSeeker[])
    static getJobSeekers(callBack) {
        const sql = "SELECT * FROM job_seekers";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "job_seekers"`), null);
            } else {
                callBack(null, result.map(jobSeeker => new JobSeeker(jobSeeker)));
            }
        });
    }

    // devolver um JobSeeker (passar de json para JobSeeker)
    static getJobSeeker(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM job_seekers WHERE job_seeker_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let jobSeeker = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, jobSeeker ? new JobSeeker(jobSeeker) : null);
            }
        });
    }

    // criar um JobSeeker
    static createJobSeeker(jsonData, callBack) {
        const jobSeekerData = JSON.parse(jsonData);
        const params = [jobSeekerData.gender, jobSeekerData.birthDate, jobSeekerData.isVisibleToCompanies, jobSeekerData.friendListId];
        const sql = "insert into job_seekers (gender, birth_date, visible_to_companies, friends_list_id) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um JobSeeker
    static deleteJobSeeker(id, callBack) {
        const params = [id];
        const sql = "delete from job_seekers where job_seeker_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = JobSeeker;