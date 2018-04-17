const async = require("async");
const _ = require("underscore");
const json2csv = require("json2csv");
const argv = process.argv.slice(2);
const BUILDINGS = require("./" + argv[0]);

// Math Functions
function randomNumber(min, max) {
    return (Math.random() * (max - min + 1) + min);
}

function valueXStdDevFromMean(mean, stdDev) {
    if (Math.sign(randomNumber(-1, 1)) === -1) {
        return (Math.round(mean + (randomNumber(-1, 2) * stdDev)));
    } else {
        return (Math.round((randomNumber(-1, 1) * stdDev) + mean));
    };
}

function shiftCoordinates(coordinate, shiftValue) {
    return (coordinate - shiftValue);
}

function standardDeviation(mean, dataArray, numberOfEntries) {
    let sumDistanceFromMean = 0 
    dataArray.map(data => {
        sumDistanceFromMean += Math.pow((data - mean), 2);
    })

    let stdDev = Math.round(Math.sqrt((sumDistanceFromMean / numberOfEntries)))
    return stdDev;
}

//Waterfall
function generateBuildingObject(cb) {
    let dataset = BUILDINGS.map(building => {
      return {...building,
        site_eui: Math.floor(randomNumber(1, 100)),
        source_eui: Math.floor(randomNumber(1, 100)),
        energy_star_score: Math.floor(randomNumber(1, 100)),
        total_ghg_emissions: Math.floor(randomNumber(1, 100)),
        total_ghg_emissions_intensity: Math.floor(randomNumber(1, 100))
       }
    })
    cb(null, dataset);
}

function normalizeBuildingData(dataset, cb) {
    let sumSiteEui = 0;
    let sumSourceEui = 0;
    let sumEnergyStar = 0;
    let sumGhgEmissions = 0;
    let sumGhgIntensity = 0;

    let dataSiteEui = [];
    let dataSourceEui = [];
    let dataEnergyStar = [];
    let dataGhgEmissions = [];
    let dataGhgIntensity = [];

    dataset.map(building => {
        sumSiteEui += building.site_eui;
        sumSourceEui += building.source_eui;
        sumEnergyStar += building.energy_star_score;
        sumGhgEmissions += building.total_ghg_emissions;
        sumGhgIntensity += building.total_ghg_emissions_intensity;

        dataSiteEui.push(building.site_eui);
        dataSourceEui.push(building.source_eui);
        dataEnergyStar.push(building.energy_star_score);
        dataGhgEmissions.push(building.total_ghg_emissions);
        dataGhgIntensity.push(building.total_ghg_emissions_intensity);
    })

    let meanSiteEui = Math.round((sumSiteEui / dataset.length));
    let meanSourceEui = Math.round((sumSourceEui / dataset.length));
    let meanEnergyStar = Math.round((sumEnergyStar / dataset.length));
    let meanGhgEmissions = Math.round((sumGhgEmissions / dataset.length));
    let meanGhgIntensity = Math.round((sumGhgIntensity / dataset.length));

    let stdDevSite_Eui = standardDeviation(meanSiteEui, dataSiteEui, dataset.length);
    let stdDevSourceEui = standardDeviation(meanSourceEui, dataSourceEui, dataset.length);
    let stdDevEnergyStar = standardDeviation(meanEnergyStar, dataEnergyStar, dataset.length);
    let stdDevGhgEmissions = standardDeviation(meanGhgEmissions, dataGhgEmissions, dataset.length);
    let stdDevGhgIntensity = standardDeviation(meanGhgIntensity, dataGhgIntensity, dataset.length);
    let normalizedBuildingsObj = dataset.map(building => {
        return {
            ...building,
            latitude: shiftCoordinates(building.LAT_LONG[0], 3),
            longitude: shiftCoordinates(building.LAT_LONG[1], -3),
            city: "Springfield",
            year: 2016,
            reported_address: building.PROPERTY_ADDRESS,
            property_type: building.PRIMARY_USE,
            property_name: building.NOTES,
            numunits: Math.floor(randomNumber(1, 100)),
            numfloors: Number(building.FLOORS),
            numbuildings: Number(building.PROPERTY_BUILDINGS),
            yearbuilt: Number(building.YEAR_BUILT),
            reported_gross_floor_area: Number(building.APPROX_BUILDING_AREA.split(",").join("")),
            site_eui: valueXStdDevFromMean(meanSiteEui, stdDevSite_Eui),
            source_eui: valueXStdDevFromMean(meanSourceEui, stdDevSourceEui),
            energy_star_score: valueXStdDevFromMean(meanEnergyStar, stdDevEnergyStar),
            total_ghg_emissions: valueXStdDevFromMean(meanGhgEmissions, stdDevGhgEmissions),
            total_ghg_emissions_intensity: valueXStdDevFromMean(meanGhgIntensity, stdDevGhgIntensity),
        };
    })
    
    cb(null, normalizedBuildingsObj)
}

function CSVify(normalizedBuildingsObj, cb) {
    const fields = _.keys(normalizedBuildingsObj[0]);
    const csv = json2csv({ data: normalizedBuildingsObj, fields: fields });
    cb(null, csv);
}

async.waterfall([
    generateBuildingObject,
    normalizeBuildingData,
    CSVify
], 
function(err, csv) {
        if (err) {
            throw err;
        }
        process.stdout.write(csv)  
    }
);

