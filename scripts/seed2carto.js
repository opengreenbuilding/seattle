#!/usr/bin/env node

const request = require("request");
const config = require("./seed2carto_secrets.js");
const today = new Date();
const date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
const dateTime = date + " " + time;

request({ url: config.seedPropertiesUrl }, (error, response, body) => {
  console.log(`Requesting Database Entries for ${config.seedUsername}`);
  if (error) {
    console.log("Error: ", error);
    return error;
  }
  let parsedBody = JSON.parse(body);
  let seedBuildings = parsedBody.properties.map(building => {
    return {
      latitude: Number(building.state.extra_data.latitude),
      longitude: Number(building.state.extra_data.longitude),
      city: building.state.city,
      year: 2016,
      postal_code: building.state.extra_data.PROPERTY_POSTAL_CODE,
      reported_address: building.state.extra_data.reported_address,
      property_type: building.state.extra_data.PRIMARY_USE,
      property_name: building.state.extra_data.NOTES,
      numunits: Number(building.state.extra_data.numunits),
      numfloors: Number(building.state.extra_data.numfloors),
      numbuildings: Number(building.state.extra_data.numbuildings),
      yearbuilt: Number(building.state.extra_data.yearbuilt),
      reported_gross_floor_area: Number(building.state.extra_data.reported_gross_floor_area),
      site_eui: Number(building.state.site_eui),
      source_eui: Number(building.state.source_eui),
      energy_star_score: Number(building.state.extra_data.energy_star_score),
      total_ghg_emissions: Number(building.state.extra_data.total_ghg_emissions),
      total_ghg_emissions_intensity: Number(building.state.extra_data.total_ghg_emissions_intensity)
    }
  });
  request.put(
    `${config.cartoQueryUrl} UPDATE ${config.cartoDataSet} SET deleted_at=
    '${dateTime}' WHERE deleted_at IS NULL &api_key=${config.cartoApi}`,
    function(err, res, body) {
      console.log(`Writing Entries...`);
      if (err) {
        console.log(err);
        return err;
      }
      if (res.statusCode === 200) {
        seedBuildings.map(building => {
          let reported_gross_floor_area = building.reported_gross_floor_area;
          let energy_star_score = building.energy_star_score;
          let yearbuilt = building.yearbuilt;
          let source_eui = building.source_eui;
          let postal_code = building.postal_code;
          let city = building.city;
          let site_eui = building.site_eui;
          let latitude = building.latitude;
          let longitude = building.longitude;
          let reported_address = building.reported_address;
          let year = building.year;
          let numunits = building.numunits;
          let numfloors = building.numfloors;
          let numbuildings = building.numbuildings;
          let property_name = building.property_name;
          let property_type = building.property_type;
          let total_ghg_emissions_intensity = building.total_ghg_emissions_intensity;
          let total_ghg_emissions = building.total_ghg_emissions;
          let insertUrl = config.cartoQueryUrl + "INSERT INTO " + config.cartoDataSet + " ("
                   + "the_geom, "
                   + "reported_gross_floor_area, "
                   + "energy_star_score, "
                   + "yearbuilt, "
                   + "postal_code, "
                   + "city, "
                   + "site_eui, "
                   + "source_eui, "
                   + "latitude, "
                   + "longitude, "
                   + "reported_address, "
                   + "year, "
                   + "property_name, "
                   + "property_type, "
                   + "total_ghg_emissions_intensity, "
                   + "total_ghg_emissions, "
                   + "numunits, "
                   + "numfloors, "
                   + "numbuildings" +
                    ") " + "VALUES" + " ("
                   + "ST_SetSRID(ST_Point(" + longitude + ", " + latitude + "),4326), "
                   + reported_gross_floor_area +", "
                   + energy_star_score + " ,"
                   + yearbuilt + ", "
                   + `'${postal_code}'` + ", "
                   + `'${city}'` + ", "
                   + site_eui + ", "
                   + source_eui + ", "
                   + latitude + ", "
                   + longitude + ", "
                   + `'${reported_address}'` + ", "
                   + year + ", "
                   + `'${property_name}'` + ", "
                   + `'${property_type}'` + ", "
                   + total_ghg_emissions_intensity + ", "
                   + total_ghg_emissions + ", "
                   + numunits + ", "
                   + numfloors + ", "
                   + numbuildings
                   + ")&api_key=" + config.cartoApi
            request.post( insertUrl, function(err, res, body) {
              if (err) {
                console.log(err);
                return err;
              }
              console.log("Upload Successful")
            }
          );
        });
      }
    }
  );
});
