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
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof Course
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
    @function getCourses
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of all courses in the table.
    @throws {Error} If there is an error with the query or no data found in table.
    @description Retrieves all courses from the table.
    @memberof Course
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
    @function getCourse
    @param {Number} id - The id of the course to retrieve
    @param {function} callBack - The callback function to handle the query result
    @returns {Course} The course with the matching id
    @throws {Error} if there is an error with the query
    @description Retrieves a specific course by id.
    @memberof Course
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
    @function getCoursesUser
    @param {number} id - The id of the user.
    @param {function} callBack - The function to call after the query.
    @description Get all the courses associated to a user with a specific id.
    @memberof Course
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
    @function getCoursesUser
    @param {Number} id - The id of the user associated with the courses
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of all courses associated with the user with the provided id.
    @throws {Error} If there is an error with the query or no courses associated to the user.
    @description Retrieves all courses associated with a specific user by id.
    @memberof Course
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
    @function Course.createCourse
    @param {Object} data - The data to create the course
    @param {String} data.name - The name of the course.
    @param {String} data.schoolName - The school name where the course was taken.
    @param {String} data.type - The type of the course.
    @param {Number} data.averageGrade - The average grade of the course.
    @param {Number} data.jobSeekerId - The id of the job seeker associated with the course.
    @param {function} callBack - The callback function to handle the query result.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description Creates a new course by inserting the provided data into the courses table.
    @memberof Course
    */
    static createCourse(data, callBack) {
        //const courseData = JSON.parse(jsonData);
        const params = [data.name, data.schoolName, data.type, 
            data.averageGrade, data.jobSeekerId];
        const sql = "insert into courses (course_name, school_name, course_type, average_grade, job_seeker_id) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function editCourse
    @param {Object} course - The data of the course to be edited.
    @param {String} course.name - The name of the course.
    @param {String} course.schoolName - The school name where the course was taken.
    @param {String} course.type - The type of the course.
    @param {Number} course.averageGrade - The average grade of the course.
    @param {Number} course.jobSeekerId - The id of the job seeker associated with the course.
    @param {Number} course.id - The id of the course.
    @param {function} callBack - The callback function to handle the query result.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description Edits an existing course in the database by updating the data associated with the course.
    @memberof Course
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
    @function deleteCourse
    @param {Number} id - The id of the course to be deleted.
    @param {function} callBack - The callback function to handle the query result.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description Deletes an existing course in the database by the course_id.
    @memberof Course
    */
    static deleteCourse(id, callBack) {
        const params = [id];
        const sql = "delete from courses where course_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Course;