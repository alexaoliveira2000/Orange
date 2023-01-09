const connection = require("../config/connection")

class Course {

    constructor(obj) {
        this.id = obj.course_id;
        this.name = obj.course_name;
        this.schoolName = obj.school_name;
        this.type = obj.course_type;
        this.averageGrade = obj.average_grade;
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

    // criar um Curso
    static createCourse(jsonData, callBack) {
        const courseData = JSON.parse(jsonData);
        const params = [courseData.name, courseData.schoolName, courseData.type, 
            courseData.averageGrade];
        const sql = "insert into courses (course_name, school_name, course_type, average_grade) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um Curso
    static deleteCourse(id, callBack) {
        const params = [id];
        const sql = "delete from courses where course_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Course;