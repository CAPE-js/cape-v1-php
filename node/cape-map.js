'use strict';

/*
This is a command line tool to test the cape mapper is working.
It's generally intended to usually be used via a Azure pipeline.

Usage:
node cape-map.js <config.json> <dataset1> (<dataset2> ...)
 */
const fs = require('fs');
const CapeMapper = require("./lib/CapeMapper/Site");

let args = process.argv;
args.shift(); // node
args.shift(); // this script
const json_config_file = args.shift();
const tabular_files = args;

const rawData = fs.readFileSync(json_config_file).toString();
let config = JSON.parse(rawData);

let tabular_datasets = [];
tabular_files.forEach((filename) => {
    let buffer = fs.readFileSync(filename);
    tabular_datasets.push(buffer);
})

let mapper = new CapeMapper(config);
const first_dataset_id = config['datasets'][0]['id'];
let site_datasets = {};
site_datasets[first_dataset_id] = tabular_datasets;

const site_data = mapper.generate(site_datasets);

// Pretty print the site JSON file to STDOUT
console.log(JSON.stringify(site_data, null, 4));
