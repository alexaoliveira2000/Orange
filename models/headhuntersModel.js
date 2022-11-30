class Headhunter extends User {

    constructor(email, password, description, name, urlSite, urlLogo) {
        super(UserType.Jobseeker, email, password, description);
        this.name = name;
        this.urlSite = urlSite;
        this.urlLogo = urlLogo;
        this.jobOffers = [];
    }

}