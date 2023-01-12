const connection = require("../config/connection")

class Headhunter {

    constructor(obj) {
        this.id = obj.headhunter_id;
        this.logoUrl = obj.logo_url;
        this.websiteUrl = obj.website_url;
        this.validated = obj.validated === 1;
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

    // devolver todos os Headhunters (passar de json para Headhunter[])
    static getHeadhunters(callBack) {
        const sql = "SELECT * FROM headhunter";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "headhunters"`), null);
            } else {
                callBack(null, result.map(headhunter => new Headhunter(headhunter)));
            }
        });
    }

    // devolver um Headhunter (passar de json para Headhunter)
    static getHeadhunter(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM headhunters WHERE headhunter_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let headhunter = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, headhunter ? new Headhunter(headhunter) : null);
            }
        });
    }

    // criar um Headhunter
    static createHeadhunter(userId, data, callBack) {
        const params = [
            userId,
            data.website,
            data.logo,
        ];
        const sql = "insert into headhunters (headhunter_id, website_url, website_logo, validated) values (?, ?, ?, 0)";
        this.queryDb(sql, params, callBack);
    }

    // editar um Headhunter
    static editHeadhunter(headhunter, callBack) {
        const params = [
            headhunter.logoUrl, 
            headhunter.websiteUrl, 
            headhunter.id];
        const sql = "UPDATE headhunters SET website_url = ?, website_logo = ?, validated = ? WHERE headhunter_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // editar um Headhunter
    static editHeadhunter(jsonData, callBack) {
        const headhunterData = JSON.parse(jsonData);
        convertObject(headhunterData);
        const params = [headhunterData, headhunterData.headhunter_id];
        const sql = "UPDATE headhunters SET ? WHERE headhunter_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um Headhunter
    static deleteHeadhunter(id, callBack) {
        const params = [id];
        const sql = "delete from headhunters where headhunter_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }

}

module.exports = Headhunter;