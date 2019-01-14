<?php
# This file does *some* checking of the validity of config.json file but not exhaustedly
# THis assumes that numbered field values are in the correct order in the source file.

$CONFIG_FILE = "config.json";
$DATA_DIR = "data";

header( "Content-type: text/json" );

# read configuration
$config = json_decode( file_get_contents( $CONFIG_FILE ), true );
if( !$config ) {
	exit_with_error( "Failed to read JSON config file." );
}

# read source file(s)
$datasets = array();
foreach( $config["datasets"] as $dataset_config ) {
	$dataset_file = latest_file_with_prefix( $DATA_DIR, $dataset_config["base_file_name"] );
	$raw_dataset = read_csv( $dataset_file );
	$datasets []= map_dataset( $dataset_config, $raw_dataset );
}

# output json file
print json_encode( $datasets );

exit;

function map_dataset( $config, $source ) {
	$output = array();
	$output["config"] = $config;
	$output["records"] = array();

	# sort config by source_heading
	$fields = array();
	$to_map = array();
	foreach( $config["fields"] as $field ) {
		$fields[ $field["source_heading"] ] = $field;
		$to_map[ $field["id"] ] = $field;
	}

	# map fields
	$map = array();
	$output["unmapped_headings"] = array();	
	$output["missing_headings"] = array();	
	foreach( $source["headings"] as $heading ) {
		if( array_key_exists( $heading, $fields ) ) {
			$map[$heading] = $fields[$heading];
			unset( $to_map[$fields[$heading]["id"]] );
			continue;
		}
		# OK, can we remove a trailing number and match a multiple heading?
		$base_heading = preg_replace( "/\s+\d+$/", "", $heading );
		if( $base_heading != $heading && array_key_exists( $base_heading, $fields ) && $fields[$base_heading]["multiple"]) {
			$map[$heading] = $fields[$base_heading];
			unset( $to_map[$fields[$base_heading]["id"]] );
			continue;
		}
			
		$output["unmapped_headings"] []= $heading;
	}
	$output["missing_headings"] = array_keys( $to_map );

	# map records
	foreach( $source["records"] as $record ) {
		$out_record = array();
		foreach( $config["fields"] as $field ) {
			if( $field["multiple"] ) {
				$out_record[$field["id"]]=array();
			} else {
				$out_record[$field["id"]]=null;
			}
		}
		foreach( $record as $heading=>$value ) {
			if( empty( $value ) ) { continue; }
			if( !$map[$heading] ) { continue; }
			$field = $map[$heading];
			if( $field["multiple"] ) {
				$out_record[$field["id"]] []= $value;
			} else {
				$out_record[$field["id"]] = $value;
			}
		}
		$output["records"] []= $out_record;
	}

	return $output;	
}

function exit_with_error($msg) {
	$result = array( "status"=>"ERROR", "error_message"=>$msg );
	print json_encode( $result );
	exit;
}

function read_csv( $file ) {
	$handle = fopen($file, "r");
	if( $handle===FALSE ) {
		exit_with_error( "Can't open CSV file $file" );
	}
	$first_row = true;
	$headings = array();
	$records = array();
	while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		if( $first_row ) {
			$headings = array();
			foreach( $data as $item ) { 
				$headings []= trim($item);
			};
			$first_row = false;
			continue;
		}
		$record = array();
		for( $i=0;$i<count($data);++$i ) {
			$record[ $headings[$i] ] = trim($data[$i]);
		}
		$records []= $record;
	}
	fclose($handle);
	return array( "headings"=>$headings, "records"=>$records );
}

function latest_file_with_prefix($dir,$prefix) {

	# get all files with the prefix 
	$candidate_files = array();
 	$handle = opendir($dir);
	if( $handle===FALSE ) {
		exit_with_error( "Can't open dir $dir" );
	}
	while( false !== ($file = readdir($handle)) ) {
		if( $file=="." || $file == ".." ) {
			continue; 
		}
		if( substr( $file, 0, strlen( $prefix ) ) != $prefix ) {
			continue;
		}
		$candidate_files []= $dir."/".$file;
	}
	closedir($handle);
	if( !sizeof( $candidate_files ) ) {
		exit_with_error( "No candidate files in $dir starting with $prefix" );
	}
	sort( $candidate_files );
	$dataset_file = array_pop( $candidate_files );

	return $dataset_file;
}

