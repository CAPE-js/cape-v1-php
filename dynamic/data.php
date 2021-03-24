<?php
# This file does *some* checking of the validity of config.json file but not exhaustedly
# THis assumes that numbered field values are in the correct order in the source file.

# using SERVER script filename as it might be symlinked and then __DIR__ gives the location
# of the real file not the symlink
$BASE_DIR = dirname(dirname($_SERVER['SCRIPT_FILENAME']));
$CONFIG_FILE = $BASE_DIR."/config.json";
$DATA_FILE = $BASE_DIR."/site-data.json";

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
	if( $dataset_config["data_dir"] ) {
		$data_dir = $BASE_DIR."/".$dataset_config["data_dir"];
	} else {
		$data_dir = $BASE_DIR."/data";
	} 

	# if base_file_name is a singular turn it into a one item array	
	if( is_array( $dataset_config["base_file_name"] ) ) {
		$base_files = $dataset_config["base_file_name"];
	} else {
		$base_files = [$dataset_config["base_file_name"]];
	}
	$records = [ "headings"=>[], "records"=>[] ];
	$source_files = [];
	foreach( $base_files as $base_file ) {
		$dataset_file = latest_file_with_prefix( $data_dir, $base_file );
		if( !isset( $dataset_config["format"]) || $dataset_config["format"] == "csv" ) {
			$table = read_csv( $dataset_file );
		} elseif( $dataset_config["format"] == "xlsx" ) {
			$table = read_xlsx( $dataset_file );
		} else {
			exit_with_error( "Unknown format: ".$dataset_config["format"] );
		}
		$source_files []= $dataset_file;
		$records_from_file = table_to_objects( $table );
		$records = [ 
			"headings"=>array_merge( $records["headings"], $records_from_file["headings"] ),
			"records"=>array_merge( $records["records"], $records_from_file["records"] ) 
		];
	}
	$dataset = map_dataset( $dataset_config, $records );
	$dataset["source_files"] = $source_files;;
	$datasets []= $dataset;
}

# output json file
$output = json_encode( array( "status"=>"OK", "datasets"=>$datasets ), JSON_NUMERIC_CHECK|JSON_PRETTY_PRINT );
print $output;
file_put_contents( $DATA_FILE, $output );

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

		if( $heading == "AUTO" ) {
			#field will auto increment instead
			unset( $to_map[$fields[$heading]["id"]] );
			continue;
		}
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
	$auto_incs = array();
	foreach( $source["records"] as $record ) {
		$out_record = array();
		foreach( $config["fields"] as $field ) {
			if( $field["type"] != "ignore" ) {
				if( @$field["multiple"] ) {
					$out_record[$field["id"]]=array();
				} else {
					$out_record[$field["id"]]=null;
				}
			}
			if( $field["source_heading"] == "AUTO" ) {
				if( !array_key_exists( $field["id"], $auto_incs ) ) {
					$auto_incs[$field["id"]] = 0;
				}
				$auto_incs[$field["id"]]++;
				$out_record[$field["id"]] = $auto_incs[$field["id"]];
			}
		}
		foreach( $record as $heading=>$value ) {
			if( @!$map[$heading] ) { continue; }
			$field = $map[$heading];
			if( empty( $value ) ) { continue; }
			# strip any time data after the ISO date
			if( $field["type"] == "date" ) { $value = substr( $value, 0, 10 ); }
			if( @$field["multiple"] ) {
				if( $field["source_split"] ) {
					$parts = preg_split( "/".$field["source_split"]."/", trim($value) );
					foreach( $parts as $part ) {
						if( !empty( $part )) {
							# force integers to be integers	
							if( $field["type"]=="integer" ) { $part+=0; }
							$out_record[$field["id"]] []= $part;
						}
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

