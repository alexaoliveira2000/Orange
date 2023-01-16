const connection = require("../config/connection")

class Course {

    constructor(obj) {
        this.id = obj.course_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.name = obj.course_name;
        this.schoolName = obj.school_name;
        this.type = obj.course_type;
        this.averageGrade = obj.average_grade;
    }

    convertObject(obj) {
        this.course_id = obj.id;
        this.course_name = obj.name;
        this.school_name = obj.schoolName;
        this.course_type = obj.type;
        this.average_grade = obj.averageGrade;
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

    // devolver todos os Courses (passar de json para Course[])
    static getCourses(callBack) {
        const sql = "SELECT * FROM courses";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "courses"`), null);
            } else {
                callBack(null, result.map(course => new Course(course)));
            }
        });
    }

    // devolver um Course (passar de json para Course)
    static getCourse(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM courses WHERE course_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let course = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, course ? new Course(course) : null);
            }
        });
    }

    // devolver os Courses de um utilizador (passar de json para Course[])
    static getCoursesUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM courses where job_seeker_id = ?";
        this.queryDb(sql, params, function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                //callBack(new Error(`The user has no Courses associated to him`), null);
                callBack(null, []);
            } else {
                callBack(null, result.map(course => new Course(course)));
            }
        });
    }

    static getCourseTypeOptions(callBack) {
        const sql = "SHOW COLUMNS FROM courses WHERE Field = 'course_type'";
        this.queryDb(sql, [], function(err, result) {
            let fieldOptions = result[0].Type || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, fieldOptions);
            }
        });
    }

    // criar um Course
    static createCourse(data, callBack) {
        //const courseData = JSON.parse(jsonData);
        const params = [data.name, data.schoolName, data.type, 
            data.averageGrade, data.jobSeekerId];
        const sql = "insert into courses (course_name, school_name, course_type, average_grade, job_seeker_id) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // editar um Course
    static editCourse(jsonData, callBack) {
        const courseData = JSON.parse(jsonData);
        convertObject(courseData);
        const params = [courseData, courseData.course_id];
        const sql = "UPDATE courses SET ? WHERE course_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um Course
    static deleteCourse(id, callBack) {
        const params = [id];
        const sql = "delete from courses where course_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Course;