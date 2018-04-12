const async = require("async");
const fs = require("fs");
const _ = require("underscore");
const json2csv = require("json2csv");
const argv = process.argv.slice(2);
const BUILDINGS = require("./" + argv[0]);

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomNumberOfStandardDeviations(min, max) {
    return ((Math.random() * (max - min + 1) + min))
}


function standardDeviation(mean, dataArray, numberOfEntries) {
    let sumDistanceFromMean = 0 
    dataArray.map(data => {
        sumDistanceFromMean += Math.pow((data - mean), 2);
    })

    let stdDev = Math.round(Math.sqrt((sumDistanceFromMean / numberOfEntries)))
    return stdDev;
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

function normalizeBuildingData(dataset, cb) {
    let sumEUI = 0;
    let sumEnergyStar = 0;
    let sumGreenhouseGas = 0;

    let dataEUI = [];
    let dataEnergyStar = [];
    let dataGreenhouseGas = [];

    dataset.map(building => {
        sumEUI += building.EUI;
        sumEnergyStar += building.ENERGY_STAR_SCORE;
        sumGreenhouseGas += building.GREENHOUSE_GAS_EMISSIONS;

        dataEUI.push(building.EUI);
        dataEnergyStar.push(building.ENERGY_STAR_SCORE);
        dataGreenhouseGas.push(building.GREENHOUSE_GAS_EMISSIONS);
    })

    let meanEUI = Math.round((sumEUI / dataset.length))
    let meanEnergyStar = Math.round((sumEnergyStar / dataset.length))
    let meanGreenhouseGas = Math.round((sumGreenhouseGas / dataset.length))

    let stdDevEUI = standardDeviation(meanEUI, dataEUI, dataset.length)
    let stdDevEnergyStar = standardDeviation(meanEnergyStar, dataEnergyStar, dataset.length)
    let stdDevGreenhouseGas = standardDeviation(meanGreenhouseGas, dataGreenhouseGas, dataset.length)

    let normalizedBuildingsObj = dataset.map(building => {
        return {
            ...building,
            EUI: (Math.sign(randomNumberOfStandardDeviations(-1, 1)) === -1) ? (Math.round(meanEUI + (randomNumberOfStandardDeviations(-1, 2) * stdDevEUI))) : (Math.round((randomNumberOfStandardDeviations(-1, 1) * stdDevEUI) + meanEUI)),
            ENERGY_STAR_SCORE: (Math.sign(randomNumberOfStandardDeviations(-1, 1)) === -1) ? (Math.round(meanEUI + (randomNumberOfStandardDeviations(-1, 2) * stdDevEUI))) : (Math.round((randomNumberOfStandardDeviations(-1, 1) * stdDevEUI) + meanEUI)),
            GREENHOUSE_GAS_EMISSIONS: (Math.sign(randomNumberOfStandardDeviations(-1, 1)) === -1) ? (Math.round(meanEUI + (randomNumberOfStandardDeviations(-1, 2) * stdDevEUI))) : (Math.round((randomNumberOfStandardDeviations(-1, 1) * stdDevEUI) + meanEUI))
        }
    })
    
    cb(null, normalizedBuildingsObj)
}

function CSVify(normalizedBuildingsObj, cb) {
    console.log("Generating CSV")
    const fields = _.keys(normalizedBuildingsObj[0]);
    const csv = json2csv({ data: normalizedBuildingsObj, fields: fields });
    cb(null, csv);
}

function writeToCsv(csv, cb) {
    fs.writeFile(`${argv[1]}`, csv, 'utf8', (err) => {
        if (err) {
            throw err;
        }
        console.log('The file has been saved!');
    }),
    function(err, result) {
        if (err) throw err;
        cb(null, result);
    }
}

async.waterfall([
    initialRead,
    generateBuildingObject,
    normalizeBuildingData,
    CSVify,
    writeToCsv
], 
function(err) {
        if (err) throw err;
    }
);

