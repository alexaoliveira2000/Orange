class Workplace {

    constructor() {
        this._id = Workplace.incrementId();
        
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