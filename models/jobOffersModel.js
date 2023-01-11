const connection = require("../config/connection")

class JobOffer {

    constructor(obj) {
        this.id = obj.offer_id;
        this.headhunterId = obj.headhunter_id;
        this.area = obj.area;
        this.duration = obj.duration;
        this.expirationDate = obj.expiration_date;
        this.totalValue = obj.total_value;
    }

    convertObject(obj) {
        this.offer_id = obj.id;
        this.headhunter_id = obj.headhunterId;
        this.area = obj.area;
        this.duration = obj.duration;
        this.expiration_date = obj.expirationDate;
        this.total_value = obj.totalValue;
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

    // devolver todos os JobOffers (passar de json para JobOffer[])
    static getJobOffers(callBack) {
        const sql = "SELECT * FROM job_offers";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "job_offers"`), null);
            } else {
                callBack(null, result.map(jobOffer => new JobOffer(jobOffer)));
            }
        });
    }

    // devolver todos os JobOffers de um Headhunter especifico (passar de json para JobOffer[])
    static getJobOffersHeadhunter(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM job_offers WHERE headhunter_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let jobOffer = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, jobOffer ? new JobOffer(jobOffer) : null);
            }
        });
    }

    // devolver um JobOffer (passar de json para JobOffer)
    static getJobOffer(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM job_offers WHERE offer_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let jobOffer = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, jobOffer ? new JobOffer(jobOffer) : null);
            }
        });
    }

    // criar um JobOffer
    static createJobOffer(jsonData, callBack) {
        const jobOfferData = JSON.parse(jsonData);
        const params = [jobOfferData.headhunterId, jobOfferData.area, jobOfferData.duration, 
            jobOfferData.expirationDate, jobOfferData.totalValue];
        const sql = "insert into job_offers (headhunter_id, area, duration, expiration_date, total_value) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // editar um JobOffer
    static editJobOffer(jsonData, callBack) {
        const jobOfferData = JSON.parse(jsonData);
        convertObject(jobOfferData);
        const params = [jobOfferData, jobOfferData.offer_id];
        const sql = "UPDATE job_offers SET ? WHERE offer_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um JobOffer
    static deleteJobOffer(id, callBack) {
        const params = [id];
        const sql = "delete from job_offers where offer_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = JobOffer;