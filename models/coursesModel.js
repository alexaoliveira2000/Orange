const CourseType = {
    "Graduation Degree" : 0,
    "Masters Degree" : 1,
    "Graduation Course" : 2
}

class Course {

    constructor(name, establishment, type, average) {
        this._id = Course.incrementId();
        this.name = name;
        this.establishment = establishment;
        this.type = type;
        this.average = average;
    }

    static incrementId() {
        if (!this.latestId) {
            this.latestId = 1;
        } else {
            this.latestId++;
        }
        return this.latestId;
      }

}