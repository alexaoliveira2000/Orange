const connection = require("../config/connection")
const User = require("../models/usersModel");

class JobSeeker extends User {

    constructor(obj) {
        super(obj);
        this.job_seeker_id = obj.job_seeker_id;
        this.gender = obj.gender;
        this.birthDate = obj.birth_date;
        this.location = obj.location;
        this.isVisibleToCompanies = obj.visible_to_companies;
        if (obj.courses_count) this.coursesCount = obj.courses_count;
        if (obj.workplaces_count) this.workplacesCount = obj.workplaces_count;
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
        const sql = "select users.*, job_seekers.* from job_seekers left join users on users.user_id = job_seekers.job_seeker_id;";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, null);
            } else {
                callBack(null, result.map(jobSeeker => new JobSeeker(jobSeeker)));
            }
        });
    }

    // devolver todos os resumes (com as contagens dos workplaces e courses)
    static getResumes(callBack) {
        const sql = `select users.*, job_seekers.*, courses.courses_count, workplaces.workplaces_count
                    from job_seekers
                    join users on users.user_id = job_seekers.job_seeker_id
                    left join (	select job_seekers.job_seeker_id as "user_id", count(courses.course_id) as "courses_count"
                            from job_seekers
                            join courses on courses.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) courses
                    on courses.user_id = job_seekers.job_seeker_id
                    left join (	select job_seekers.job_seeker_id as "user_id", count(workplaces.workplace_id) as "workplaces_count"
                            from job_seekers
                            join workplaces on workplaces.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) workplaces 
                    on workplaces.user_id = job_seekers.job_seeker_id
                    group by job_seekers.job_seeker_id;`;
        JobSeeker.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "users"`), null);
            } else {
                callBack(null, result.map(user => new JobSeeker(user)));
            }
        });
    }

    // devolver um JobSeeker (passar de json para JobSeeker)
    static getJobSeeker(id, callBack) {
        const params = [id];
        const sql = `select users.*, job_seekers.* from job_seekers 
                    join users on users.user_id = job_seekers.job_seeker_id 
                    where job_seeker_id = ?;`;
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
        this.queryDb(sql, params, callBack);
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