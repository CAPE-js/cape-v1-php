<?php
# This file does *some* checking of the validity of config.json file but not exhaustedly
# THis assumes that numbered field values are in the correct order in the source file.

$CONFIG_FILE = __DIR__."/../config.json";
$DATA_DIR = __DIR__."/../data";

ini_set("auto_detect_line_endings", "1");
header( "Content-type: text/json" );

# read configuration
$config = json_decode( file_get_contents( $CONFIG_FILE ), true );
if( !$config ) {
	exit_with_error( "Failed to read JSON config file" );
}

# read source file(s)
$datasets = array();
foreach( $config["datasets"] as $dataset_config ) {
	$dataset_file = latest_file_with_prefix( $DATA_DIR, $dataset_config["base_file_name"] );
        if( !isset( $dataset_config["format"]) || $dataset_config["format"] == "csv" ) {
		$table = read_csv( $dataset_file );
        } elseif( $dataset_config["format"] == "xlsx" ) {
		$table = read_xlsx( $dataset_file );
	} else {
		exit_with_error( "Unknown format: ".$dataset_config["format"] );
	}
	$raw_dataset = table_to_objects( $table );
	$datasets []= map_dataset( $dataset_config, $raw_dataset );
}

# output json file
print json_encode( array( "status"=>"OK", "datasets"=>$datasets ), JSON_NUMERIC_CHECK|JSON_PRETTY_PRINT );

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
			if( $fields[$heading]["type"] != "ignore" ) {
				$map[$heading] = $fields[$heading];
			}
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
			# strip any time data after the ISO date
			if( $field["type"] == "date" ) { $value = substr( $value, 0, 10 ); }
			if( $field["multiple"] ) {
				if( $field["source_split"] ) {
					$parts = preg_split( "/".$field["source_split"]."/", trim($value) );
					foreach( $parts as $part ) {
						$out_record[$field["id"]] []= $part;
						# force integers to be integers	
						if( $field["type"]=="integer" && !empty($part) ) { $value+=0; }
					}
				} else {
					# force integers to be integers	
					if( $field["type"]=="integer" && !empty($part) ) { $value+=0; }
					$out_record[$field["id"]] []= $value;
				}
			} else {
				$out_record[$field["id"]] = $value;
			}
		}
		$output["records"] []= $out_record;
	}

	# trim out fields of type "ignore"
	$fields = array();
	foreach( $output["config"]["fields"] as $field ) {
		if( $field["type"] != "ignore" ) {
			$fields []= $field;
		}
	}
	$output["config"]["fields"] = $fields;

	return $output;	
}

function exit_with_error($msg) {
	$result = array( "status"=>"ERROR", "error_message"=>$msg );
	print json_encode( $result );
	exit;
}

function read_xlsx( $file ) {
	require_once( "SimpleXLSX.php");
	$xlsx = SimpleXLSX::parse($file);
	if( !$xlsx ) {
		exit_with_error( "Error reading XSLX file ". SimpleXLSX::parseError() );
	}
	return $xlsx->rows();
}

function read_csv( $file ) {
	$handle = fopen($file, "r");
	if( $handle===FALSE ) {
		exit_with_error( "Can't open CSV file $file" );
	}
	$table = array();
	while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
		$table []= $row;
	}
	fclose($handle);
	return $table;
}

function table_to_objects( $table ) {
	$first_row = true;
	$headings = array();
	$records = array();
	foreach( $table as $row ) {
		if( $first_row ) {
			$headings = array();
			foreach( $row as $item ) { 
				$headings []= trim($item);
			};
			$first_row = false;
			continue;
		}
		$record = array();
		for( $i=0;$i<count($row);++$i ) {
			$record[ $headings[$i] ] = trim($row[$i]);
		}
		$records []= $record;
	}
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

