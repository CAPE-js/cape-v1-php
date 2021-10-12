'use strict';

const fs = require('fs');
const CapeMapper = require( "./CapeMapper" );

const rawData = fs.readFileSync('../config.json');
const config = JSON.parse(rawData);

let mapper = new CapeMapper(config);
const siteData = mapper.generateSiteData();
console.log( siteData );
console.log( "OK\n" );
