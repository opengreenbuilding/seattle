const async = require("async");
const _ = require("underscore");
const json2csv = require("json2csv");
const moment = require("moment")
const BUILDINGS = require("./test.json");

function initialRead(cb) {
    console.log("Reading Data")
    const buildingJSON = BUILDINGS.map(building => {
        return building
    })
    cb(null, buildingJSON)
}

function CSVify(dataset, cb) {
    console.log("Generating CSV")
    const fields = _.keys(dataset[0]); 
    const csv = json2csv({ data: dataset, fields: fields },
        function (err, csv) {
            console.log("CSV has been created");
            cb(err, csv);
        }
    )
}

async.waterfall([
    initialRead,
    CSVify
], 
    function(err, result) {
        if (err) {
            throw err;
        }
        console.log('finished report pipeline');
        console.log('writing report to stdout');
        process.stdout.write("# Generated at " + moment.utc().toISOString());
        process.stdout.write("\n");
        process.stdout.write(result);
        process.stdout.write("\n");
        process.exit(0);
    }
);

