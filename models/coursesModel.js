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
    * Retrieves all courses from the database
    *
    * @function
    * @param {Function} callBack - The callback function to be called with the query result or error
    *
    */
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

    /**
    * Retrieves a specific course from the database based on its id
    *
    * @function
    * @param {number} id - The id of the course to be retrieved
    * @param {Function} callBack - The callback function to be called with the query result or error
    *
    */
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

    /**
    @function
    @param {number} id - The id of the user.
    @param {function} callBack - The function to call after the query.
    @description Get all the courses associated to a user with a specific id.
    */
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

    /**
    @function getCourseTypeOptions
    @param {function} callBack - The callback function that returns the result of the query.
    @description Gets the possible options for the course type field in the courses table.
    */
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

    /**
    This function creates a new course in the database
    @param {Object} data - An object containing the course data, with properties: name, schoolName, type, averageGrade, jobSeekerId
    @param {function} callBack - A callback function that is called after the query is executed, it takes two parameters: error and result
    */
    static createCourse(data, callBack) {
        //const courseData = JSON.parse(jsonData);
        const params = [data.name, data.schoolName, data.type, 
            data.averageGrade, data.jobSeekerId];
        const sql = "insert into courses (course_name, school_name, course_type, average_grade, job_seeker_id) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    /**
    This function is used to edit a course in the database. It takes in the course object and a callback function as arguments.
    The course object should contain the following properties: name, schoolName, type, averageGrade, jobSeekerId and id.
    The callback function is used to handle the result of the query, it will take in two arguments, an error and a success object.
    @param {Object} course - The course object to be updated in the database
    @param {Function} callBack - The callback function to handle the result of the query
    */
    static editCourse(course, callBack) {
        const params = [
            course.name,
            course.schoolName,
            course.type,
            course.averageGrade,
            course.jobSeekerId,
            course.id];
        const sql = "UPDATE courses SET course_name = ?, school_name = ?, course_type = ?, average_grade = ?, job_seeker_id = ? WHERE course_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    This function is used to delete a course from the database based on its id.
    @function
    @param {number} id - The id of the course that is going to be deleted.
    @param {function} callBack - A callback function that will be called after the deletion. It takes 2 parameters: an error and a success object.
    */
    static deleteCourse(id, callBack) {
        const params = [id];
        const sql = "delete from courses where course_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Course;