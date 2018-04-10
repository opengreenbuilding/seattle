const async = require("async");
const _ = require("underscore");
const json2csv = require("json2csv");
const moment = require("moment")
const BUILDINGS = require("./test.json");

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function initialRead(cb) {
    console.log("Reading data...")
    const buildingJSON = BUILDINGS.map(building => {
        return building
    })
    cb(null, buildingJSON);
}

function generateBuildingObject(buildingJSON, cb) {
    console.log("Compiling building object...")
    let dataset = buildingJSON.map(building => {
      return {...building,
        EUI: randomNumber(1, 100),
        ENERGY_STAR_SCORE: randomNumber(1, 100),
        GREENHOUSE_GAS_EMISSIONS: randomNumber(1, 100)
       }
    })
    cb(null, dataset);
}

function CSVify(dataset, cb) {
    console.log("Generating CSV")
    const fields = _.keys(dataset[0]); 
    const csv = json2csv({ data: dataset, fields: fields },
        function (err, csv) {
            console.log("CSV has been reated...");
            cb(err, csv);
        }
    )
}

async.waterfall([
    initialRead,
    generateBuildingObject,
    CSVify
], 
    function(err, result) {
        if (err) {
            throw err;
        }
        console.log("finished report pipeline");
        console.log("writing report to stdout");
        process.stdout.write("# Generated at " + moment.utc().toISOString());
        process.stdout.write("\n");
        process.stdout.write(result);
        process.stdout.write("\n");
        process.exit(0);
    }
);

