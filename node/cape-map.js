'use strict';

/*
This is a command line tool to test the cape mapper is working. It's intended to usually be used via a Azure pipeline
 */

const fs = require('fs');
const CapeMapper = require( "./lib/CapeMapper/Site" );

const rawData = fs.readFileSync('../config.json').toString();
let config = JSON.parse(rawData);

const csvData = fs.readFileSync('../testenv/data/dataset1.csv').toString();


let mapper = new CapeMapper(config);
const siteData = mapper.generate({ "testenv":[csvData]});
console.log( JSON.stringify(siteData,{},4 ));

