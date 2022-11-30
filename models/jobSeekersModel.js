const Gender = {
    "Male" : 0,
    "Female" : 1
}

class JobSeeker extends User {

    constructor(email, password, description, birthDate, gender, location, isVisible) {
        super(UserType.Jobseeker, email, password, description);
        this.birthDate = birthDate;
        this.gender = gender;
        this.location = location;
        this.isVisible = isVisible;
        this.resumes = [];
        this.friends = [];
        this.friendRequests = [];
    }

}