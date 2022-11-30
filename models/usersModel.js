const UserType = {
    "Jobseeker" : 0,
    "Headhunter" : 1,
    "Admin" : 2
}

class User {

    constructor(type, email, password, description) {
        this._id = User.incrementId();
        this.type = type;
        this.email = email;
        this.password = password;
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