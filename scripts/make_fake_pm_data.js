const fs = require("fs");
const Json2csvTransform = require("json2csv").Transform;
const _ = require("underscore");
const async = require("async");
const test = require("./test.json");
const argv = process.argv.slice(2);
const CITY_BUILDINGS_OBJECT = require("./" + argv[0]);

function generateEuiValue() {
  return Math.floor(Math.random() * 100);
}
function generateEnergyStarScore() {
  return Math.floor(Math.random() * 100);
}
function generateGreenhouseGasValue() {
  return Math.floor(Math.random() * 100);
}

function createNewCityBuildingsObject(cityBuildingsObject) {
  cityBuildingsObject.map(building => {
    (building.EUI = generateEuiValue()),
      (building.ENERGY_STAR_SCORE = generateEnergyStarScore()),
      (building.GREENHOUSE_GAS_EMISSIONS = generateGreenhouseGasValue());
  });
  return cityBuildingsObject;
}

function CSVify() {
  const input = fs.createReadStream(
    __dirname + "/updated_covered_buildings.json",
    { encoding: "utf8" }
  );
  const output = fs.createWriteStream(__dirname + "/test2.csv", {
    encoding: "utf8"
  });
  const json2csv = new Json2csvTransform();

  const processor = input.pipe(json2csv).pipe(output);
  console.log("File has been created");
}

fs.writeFile(
  "./updated_richmond.json",
  JSON.stringify(createNewCityBuildingsObject(CITY_BUILDINGS_OBJECT)),
  err => {
    if (err) {
      console.error(err);
      return;
    }
    CSVify();
  }
);
