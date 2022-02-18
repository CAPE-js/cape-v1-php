'use strict';

/*
This is a command line tool to test the cape mapper is working.
It's generally intended to usually be used via a Azure pipeline.

Usage:
node cape-map.js <config.json> <dataset1> (<dataset2> ...)
 */
const fs = require('fs');
const CapeMapper = require( "./lib/CapeMapper/Site" );

let args = process.argv;
args.shift(); // node
args.shift(); // this script
const json_config_file = args.shift();
const tabular_files = args;

const rawData = fs.readFileSync(json_config_file).toString();
let config = JSON.parse(rawData);

let tabular_datasets = [];
tabular_files.forEach( (filename)=>{
    tabular_datasets.push( fs.readFileSync( filename ).toString() );
})

let mapper = new CapeMapper(config);
const first_dataset_id = config['datasets'][0]['id'];

const siteData = mapper.generate({ first_dataset_id:tabular_datasets});

// Pretty print the site JSON file to STDOUT
console.log( JSON.stringify(siteData,{},4 ));
