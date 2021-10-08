'use strict';

const fs = require('fs');
const CapeMapper = require( "./CapeMapper" );

let rawData = fs.readFileSync('../config.json');
let config = JSON.parse(rawData);

var mapper = new CapeMapper({"datasets":[]});
var siteData = mapper.generateSiteData();
console.log( siteData );
console.log( "OK\n" );
