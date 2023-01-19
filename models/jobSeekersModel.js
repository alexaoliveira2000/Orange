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
        this.coursesCount = obj.courses_count || 0;
        this.workplacesCount = obj.workplaces_count || 0;
    }

    /**
    * Executes a query on the database
    *
    * @function
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
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
    This function retrieve all job seekers from the database
    @function
    @param {function} callBack - The callback function which will be called after the query execution
    */
    static getJobSeekers(callBack) {
        const sql = "select users.*, job_seekers.* from job_seekers left join users on users.user_id = job_seekers.job_seeker_id;";
        this.queryDb(sql, [], function (err, result) {
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
    static getResumes(filters, callBack) {
        let buildWhereClause = function (filters) {
            if (Object.keys(filters).length === 0) {
                return "";
            }
            let conditions = "WHERE";
            let isFirst = true;
            if (filters.minAge) {
                isFirst = false;
                conditions += ` DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y')+0 >= ${filters.minAge}`;
            }
            if (filters.maxAge) {
                if (isFirst) isFirst = false;
                else conditions += " AND";
                conditions += ` DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y')+0 <= ${filters.maxAge}`;
            }
            conditions += !isFirst && filters.location ? " AND (" : "";
            if (filters.location) {
                conditions += isFirst ? " (" : "";
                if (Array.isArray(filters.location)) {
                    let isFirstLocation = true;
                    console.log(filters.location)
                    filters.location.forEach(location => {
                        console.log(location)
                        if (isFirstLocation) isFirstLocation = false;
                        else conditions += " OR";
                        conditions += ` job_seekers.location = '${location.replaceAll("%20", " ")}'`;
                    });
                } else {
                    conditions += ` job_seekers.location = '${filters.location.replaceAll("%20", " ")}'`;
                }
            }
            conditions += filters.location ? ")" : "";
            return conditions;
        }
        const sql = `select users.*, job_seekers.*, courses.courses_count, workplaces.workplaces_count, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y') + 0 AS age
                    from job_seekers
                    join users on users.user_id = job_seekers.job_seeker_id
                    join (	select job_seekers.job_seeker_id as "user_id", count(courses.course_id) as "courses_count"
                            from job_seekers
                            left join courses on courses.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) courses
                    on courses.user_id = job_seekers.job_seeker_id
                    join (	select job_seekers.job_seeker_id as "user_id", count(workplaces.workplace_id) as "workplaces_count"
                            from job_seekers
                            left join workplaces on workplaces.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) workplaces 
                    on workplaces.user_id = job_seekers.job_seeker_id
                    ${buildWhereClause(filters)}
                    group by job_seekers.job_seeker_id;`;
        JobSeeker.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, []);
            } else {
                callBack(null, result.map(user => new JobSeeker(user)));
            }
        });
    }

    /**
    @function
    @param {number} id - The id of the JobSeeker
    @param {function} callBack - The function to be called after execution
    This function retrieves a single job seeker by their id and maps the results to a JobSeeker object.
    */
    static getJobSeeker(id, callBack) {
        const params = [id];
        const sql = `select users.*, job_seekers.* from job_seekers 
                    join users on users.user_id = job_seekers.job_seeker_id 
                    where job_seeker_id = ?;`;
        this.queryDb(sql, params, function (err, result) {
            let jobSeeker = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, jobSeeker ? new JobSeeker(jobSeeker) : null);
            }
        });
    }

    /**
    This function creates a new job seeker in the database.
    @function
    @param {number} userId - The user id of the job seeker.
    @param {Object} data - The data of the job seeker.
    @param {string} data.gender - The gender of the job seeker.
    @param {date} data.birth_date - The birth date of the job seeker.
    @param {string} data.location - The location of the job seeker.
    @param {string} data.visible - The visibility of the job seeker to companies.
    */
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

    /**
    This function updates the information of a specific job seeker in the database.
    @static
    @param {Object} data - The data of the job seeker to be updated
    @param {string} data.gender - The gender of the job seeker
    @param {string} data.birthDate - The birth date of the job seeker
    @param {string} data.location - The location of the job seeker
    @param {boolean} data.isVisibleToCompanies - Whether the job seeker's information is visible to companies
    @param {number} data.jobSeekerId - The id of the job seeker to update
    @param {Function} callBack - The function to be executed after the job seeker has been updated
    */
    static editJobSeeker(data, callBack) {
        const params = [
            data.gender,
            data.birthDate,
            data.location,
            data.isVisibleToCompanies,
            data.jobSeekerId
        ];
        const sql = "UPDATE job_seekers SET gender = ?, birth_date = ?, location = ?, visible_to_companies = ? WHERE job_seeker_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    This function is used to delete a Job Seeker from the database.
    @param {number} id - The id of the Job Seeker to be deleted.
    @param {function} callBack - The function that is called after the query is executed.
    */
    static deleteJobSeeker(id, callBack) {
        const params = [id];
        const sql = "delete from job_seekers where job_seeker_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = JobSeeker;