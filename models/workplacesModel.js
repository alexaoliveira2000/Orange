const connection = require("../config/connection")

class Workplace {

    constructor(obj) {
        this.id = obj.workplace_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.name = obj.workplace_name;
        this.logoUrl = obj.logo_url;
        this.startDate = obj.start_date;
        this.endDate = obj.end_date;
        this.functionDescription = obj.function_description;
    }

    convertObject(obj) {
        this.workplace_id = obj.id;
        this.workplace_name = obj.name;
        this.logo_url = obj.logoUrl;
        this.start_date = obj.startDate;
        this.end_date = obj.endDate;
        this.function_description = obj.functionDescription;
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

    // devolver os Workplaces de um utilizador (passar de json para Workplace[])
    static getWorkplacesUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM workplaces where job_seeker_id = ?";
        this.queryDb(sql, params, function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                //callBack(new Error(`The user has no Workplaces associated to him`), null);
                callBack(null, []);
            } else {
                callBack(null, result.map(workplace => new Workplace(workplace)));
            }
        });
    }

    // criar um Workplace
    static createWorkplace(data, callBack) {
        //const workplaceData = JSON.parse(jsonData);
        const params = [data.name, data.logoUrl, data.startDate, 
            data.endDate, data.functionDescription, data.jobSeekerId];
        const sql = "insert into workplaces (workplace_name, logo_url, start_date, end_date, function_description, job_seeker_id) values (?, ?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // editar um Workplace
    static editWorkplace(workplace, callBack) {
        const params = [
            workplace.name,
            workplace.logoUrl,
            workplace.start_date,
            workplace.end_date,
            workplace.function_description,
            workplace.job_seeker_id];
        const sql = "UPDATE workplaces SET workplace_name = ?, logo_url = ?, start_date = ?, end_date = ?, function_description = ?, job_seeker_id = ? WHERE workplace_id = ?";
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