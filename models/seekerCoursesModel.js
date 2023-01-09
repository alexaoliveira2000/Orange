const connection = require("../config/connection")

class SeekerCourse {

    constructor(obj) {
        this.id = obj.seeker_course_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.courseId = obj.course_id;
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

    // devolver todos os SeekerCourses (passar de json para SeekerCourse[])
    static getSeekerCourses(callBack) {
        const sql = "SELECT * FROM seeker_courses";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "seeker_courses"`), null);
            } else {
                callBack(null, result.map(seekerCourse => new SeekerCourse(seekerCourse)));
            }
        });
    }

    // devolver um SeekerCourse (passar de json para SeekerCourse)
    static getSeekerCourse(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM seeker_courses WHERE seeker_course_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let seekerCourse = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, seekerCourse ? new SeekerCourse(seekerCourse) : null);
            }
        });
    }

    // criar uma SeekerCourse
    static createSeekerCourse(jsonData, callBack) {
        const seekerCourseData = JSON.parse(jsonData);
        const params = [seekerCourseData.jobSeekerId, seekerCourseData.courseId];
        const sql = "insert into seeker_courses (job_seeker_id, course_id) values (?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um SeekerCourse
    static deleteSeekerCourse(id, callBack) {
        const params = [id];
        const sql = "delete from seeker_courses where seeker_course_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = SeekerCourse;