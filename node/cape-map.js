'use strict';

/*
This is a command line tool to test the cape mapper is working. It's intended to usually be used via a Azure pipeline
 */

const fs = require('fs');
const CapeMapper = require( "./lib/CapeMapper/Site" );

const rawData = fs.readFileSync('../config.json').toString();
let config = JSON.parse(rawData);

let mapper = new CapeMapper(config);
const siteData = mapper.generateSiteData();
console.log( siteData );
console.log( "OK\n" );
