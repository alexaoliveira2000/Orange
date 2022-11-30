class JobOffer {

    constructor(headhunter, title, salary, duration, untilDate, creationDate, workType, area, description) {
        this._id = JobOffer.incrementId();
        this.headhunter = headhunter;
        this.title = title;
        this.salary = salary;
        this.duration = duration;
        this.untilDate = untilDate;
        this.creationDate = creationDate;
        this.workType = workType;
        this.area = area;
        this.description = description;
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