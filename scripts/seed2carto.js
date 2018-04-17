#!/usr/bin/env node

const request = require("request");
const config = require("./seed2carto_secrets.js");

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomEui(max, min) {
  let eui = Math.random() * (max - min);
  return Math.floor(eui);
}

function randomGeom(max, min, decimals) {
  let randomNum = Math.random() * (max - min) + min;
  let power = Math.pow(10, decimals);
  return Math.floor(randomNum * power) / power;
}

const today = new Date();
const date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
const time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = date + " " + time;

request({ url: config.propertiesUrl }, (error, response, body) => {
  console.log(`Requesting Database Entries for ${config.seedUsername}`);
  if (error) {
    console.log(error);
    return error;
  }
  let parsedBody = JSON.parse(body);
  let seedBuildings = parsedBody.results;
  let cartoBuildings = seedBuildings.map(building => {
    return {
      owner: building.owner,
      address: building.address_line_1,
      reported_gross_floor_area: building.gross_floor_area,
      yearbuilt: building.year_built,
      postal_code: building.postal_code,
      id: building.id,
      property_type: building.property_type,
      ghg_intensity: randomNumber(10, 1), // THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      ghg_emissions: randomNumber(500, 1), // THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      property_name: "BUILDING NAME", // THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      province: config.province, //THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      reporting_year: 2015, //THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      city: config.city, //THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      energy_star_score: randomNumber(100, 1), //THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      site_eui: randomNumber(100, 1), //THIS WILL NEED TO COME FROM REAL DATA AT SOME POINT.
      longitude: randomGeom(123.16, 123.1, 6) * -1,
      latitude: randomGeom(49.19, 49.15, 6)
    };
  });
  request.put(
    `${config.cartoUrl}/sql?q=UPDATE ${config.cartoDataSet} SET deleted_at=
    '${dateTime}' WHERE deleted_at IS NULL &api_key=20e0f2883fe8ea263d3b54cfa7758fb859961199`,
    function(err, res, body) {
      console.log(`Writing Entries...`);
      if (err) {
        console.log(err);
        return err;
      }
      if (res.statusCode === 200) {
        cartoBuildings.map(building => {
          let reported_gross_floor_area = building.reported_gross_floor_area;
          let energy_star_score = building.energy_star_score;
          let yearbuilt = building.yearbuilt;
          let postal_code = building.postal_code;
          let id = building.id;
          let province = building.province;
          let city = building.city;
          let site_eui = building.site_eui;
          let lat = building.latitude;
          let long = building.longitude;
          let building_owner = building.owner;
          let reported_address = building.address;
          let year = building.reporting_year;
          let property_name = building.property_name;
          let property_type = building.property_type;
          let total_ghg_emissions_intensity = building.ghg_intensity;
          let total_ghg_emissions = building.ghg_emissions;
          console.log(property_type);
          request.post(
            `${cartoUrl}/sql?q=INSERT INTO ${cartoDataSet} (
                    the_geom,
                    reported_address,
                    year,
                    reported_gross_floor_area,
                    yearbuilt,
                    postal_code,
                    id,
                    province,
                    city,
                    site_eui,
                    energy_star_score,
                    property_name,
                    property_type,
                    total_ghg_emissions_intensity,
                    total_ghg_emissions
                    ) VALUES (
                    ST_SetSRID(ST_Point(${long},${lat}),4326),
                    '${reported_address}',
                    ${year},
                    ${reported_gross_floor_area},
                    ${yearbuilt}, '${postal_code}',
                    ${id},
                    '${province}',
                    '${city}',
                    ${site_eui},
                    ${energy_star_score},
                    '${property_name}',
                    '${property_type}',
                    ${total_ghg_emissions_intensity},
                    ${total_ghg_emissions}
                    )&api_key=20e0f2883fe8ea263d3b54cfa7758fb859961199`,
            function(err, res, body) {
              if (err) {
                console.log(err);
                return err;
              }
              console.log(body);
            }
          );
        });
      }
    }
  );
});
