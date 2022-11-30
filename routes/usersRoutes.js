const path = require("path")

module.exports = function (app) {

    app.get('/api/jobOffers', function (req, res) {
        res.send([
            {
                _id: 1,
                title: "Programmer",
                company: "Ernst Young",
                salary: 13000,
                duration: "12 months",
                until_date: new Date(2022, 11, 31),
                description: "The ideal candidate is a JS programmer who is able to make effective decisions quickly.",
                creation_date: new Date(2022, 10, 22),
                work_type: "Full-Time",
                area: "Consultancy"
            },
            {
                _id: 2,
                title: "Team Leader",
                company: "KPMG",
                salary: 11000,
                duration: "6 months",
                until_date: new Date(2023, 3, 25),
                description: "Our client is looking for a 5+ years Team Leader experience, taking products from prototype to commercialization, with a solid emphasis on the test cycle.",
                creation_date: new Date(2022, 10, 18),
                work_type: "Full-Time",
                area: "Finance"
            },
            {
                _id: 3,
                title: "Developer",
                company: "Deloitte",
                salary: 9500,
                duration: "6 months",
                until_date: new Date(2023, 6, 1),
                description: "We're looking for a Computer Science student with basic software skills.",
                creation_date: new Date(2022, 10, 10),
                work_type: "Part-Time",
                area: "Audit"
            },
            {
                _id: 4,
                title: "Consultant",
                company: "Deloitte",
                salary: 16000,
                duration: "48 months",
                until_date: new Date(2023, 6, 1),
                description: "We're looking for a Computer Science student with basic software skills.",
                creation_date: new Date(2022, 10, 10),
                work_type: "Part-Time",
                area: "Consultancy"
            },
            {
                _id: 5,
                title: "Manager",
                company: "KPMG",
                salary: 19000,
                duration: "36 months",
                until_date: new Date(2023, 6, 1),
                description: "We're looking for a Computer Science student with basic software skills.",
                creation_date: new Date(2022, 10, 10),
                work_type: "Full-Time",
                area: "Audit"
            },
            {
                _id: 6,
                title: "Data Analyst",
                company: "KPMG",
                salary: 19000,
                duration: "36 months",
                until_date: new Date(2023, 6, 1),
                description: "We're looking for a Computer Science student with basic software skills.",
                creation_date: new Date(2022, 10, 10),
                work_type: "Full-Time",
                area: "IT"
            }
        ])
    })
}