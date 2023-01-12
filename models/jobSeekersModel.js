const connection = require("../config/connection")

class JobSeeker {

    constructor(obj) {
        this.id = obj.job_seeker_id;
        this.gender = obj.gender;
        this.birthDate = obj.birth_date;
        this.location = obj.location;
        this.isVisibleToCompanies = obj.visible_to_companies;
    }

    convertObject(obj) {
        this.job_seeker_id = obj.id;
        this.gender = obj.logoUrl;
        this.birth_date = obj.websiteUrl;
        this.visible_to_companies = obj.isVisibleToCompanies;
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
    static createJobSeeker(userId, data, callBack) {
        const params = [
            userId,
            data.gender,
            data.birth_date,
            data.location,
            data.visible === 'true'
        ];
        const sql = "insert into job_seekers (job_seeker_id, gender, birth_date, location, visible_to_companies) values (?, ?, ?, ?, ?)";
    }
    
    // editar um JobSeeker
    static editJobSeeker(jsonData, callBack) {
        const jobSeekerData = JSON.parse(jsonData);
        convertObject(jobSeekerData);
        const params = [jobSeekerData, jobSeekerData.job_seeker_id];
        const sql = "UPDATE job_seekers SET ? WHERE job_seeker_id = ?";
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