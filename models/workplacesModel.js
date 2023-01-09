const connection = require("../config/connection")

class Workplace {

    constructor(obj) {
        this.id = obj.workplace_id;
        this.name = obj.workplace_name;
        this.logoUrl = obj.logo_url;
        this.startDate = obj.start_date;
        this.endDate = obj.end_date;
        this.functionDescription = obj.function_description;
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

    // devolver todos os Workplaces (passar de json para Workplace[])
    static getWorkplaces(callBack) {
        const sql = "SELECT * FROM workplaces";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "workplaces"`), null);
            } else {
                callBack(null, result.map(workplace => new Workplace(workplace)));
            }
        });
    }

    // devolver um Workplace (passar de json para Workplace)
    static getWorkplace(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM workplaces WHERE workplace_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let workplace = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, workplace ? new Workplace(workplace) : null);
            }
        });
    }

    // criar um Workplace
    static createWorkplace(jsonData, callBack) {
        const workplaceData = JSON.parse(jsonData);
        const params = [workplaceData.name, workplaceData.logoUrl, workplaceData.startDate, 
            workplaceData.endDate, workplaceData.functionDescription];
        const sql = "insert into workplaces (workplace_name, logo_url, start_date, end_date, function_description) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // eliminar um Workplace
    static deleteWorkplace(id, callBack) {
        const params = [id];
        const sql = "delete from workplaces where workplace_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Workplace;