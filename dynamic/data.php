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
$datasets = [];
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

	$output = [];
	# snapshot config to use in the output JSON before we add bits
	$output["config"] = $config;

	# sanity check config makes sense
	$id_hash = [];
	$n=0;
	$fields = [];
	foreach( $config["fields"] as $field ) {
		$n++;
		if( !array_key_exists( "id", $field ) ) {
			exit_with_error( "Field missing ID in field #$n" );
		}
		if( !array_key_exists( "type", $field ) ) {
			exit_with_error( "Field ID '".$field["id"]."' is missing a type." );
		}
		if( array_key_exists( $field["id"], $id_hash ) ) {
			exit_with_error( "Field ID '".$field["id"]."' appears more than once in config." );
		}
		$id_hash[$field["id"]] = 1;

		# defaults
		if( !array_key_exists( "multiple", $field ) ) {
			$field["multiple"] = false;
		}

		# treat source_heading as a list always to simplify things
		if( array_key_exists( "source_heading", $field ) && !is_array( $field["source_heading"]) ) {
			$field["source_heading"] = [ $field["source_heading"] ];
		}
		# check if a multi heading field has AUTO (it shouldn't)
		if( array_key_exists( "source_heading", $field ) && count( $field["source_heading"] )> 1) {
			foreach( $field["source_heading"] as $heading ) {
				if( $heading == "AUTO" ) {
					exit_with_error( "Field ID '".$field["id"]."' has AUTO in a list of source_heading." );
				}
			}
		}
		$fields []= $field;
	}


	# map fields
	$output["records"] = [];

	# check mappings line up
	$headings_to_be_mapped = [];
	foreach( $source["headings"] as $heading ) {
		$headings_to_be_mapped[$heading] = true;
	}
	$missing_headings  = [];

	foreach( $fields as &$field ) {
		if( $field["source_heading"][0] == "AUTO" ) {
			$field['auto'] = true;
		}

		$field["actual_headings"] = [];	
		foreach( $field["source_heading"] as $source_heading ) {
			$found = false;
			foreach( $source["headings"] as $heading ) {
				if( $heading == $source_heading ) {
					$field["actual_headings"] []= $heading;
					unset( $headings_to_be_mapped[$heading] );
					$found = true;
					continue;
				}
				if( $field["multiple"] ) {
					// multiple headings can be of the form Foo 1, Foo 2 etc. The numbers are assumed to be in the correct order
					$base_heading = preg_replace( "/\s+\d+$/", "", $heading );
					if( $base_heading == $source_heading ) {
						$field["actual_headings"] []= $heading;
						unset( $headings_to_be_mapped[$heading] );
						$found = true;
					}
				}
			}
			if( !$found ) {
				$missing_headings[$source_heading]=true;
			}
		}
			
	}
	$output["unmapped_headings"] = array_keys( $headings_to_be_mapped );
	$output["missing_headings"] = array_keys( $missing_headings );

	# map records
	$auto_incs = [];
	foreach( $source["records"] as $record ) {
		$out_record = [];
		foreach( $fields as $field ) {
			if( $field["type"] == "ignore" ) {
				continue;
			}

			if( @$field["multiple"] ) {
				$out_record[$field["id"]]=[];
			} else {
				$out_record[$field["id"]]=null;
			}
			if( $field["source_heading"][0] == "AUTO" ) {
				if( !array_key_exists( $field["id"], $auto_incs ) ) {
					$auto_incs[$field["id"]] = 0;
				}
				$auto_incs[$field["id"]]++;
				$out_record[$field["id"]] = $auto_incs[$field["id"]];
				continue;
			}

			// a field can be split over several actual headings in the source data, eg. Foo, Foo 1, Foo 2 etc.
			foreach( $field["actual_headings"] as $actual_heading ) {
				if( !array_key_exists( $actual_heading, $record ) ) { continue; }
				if( !isset( $record[$actual_heading] ) ) { continue; }
				
				if( @$field["multiple"] && array_key_exists( "source_split", $field ) ) {
					$values = preg_split( "/".$field["source_split"]."/", trim($record[$actual_heading]) );
				} else {
					$values = [ $record[$actual_heading] ];
				}

				$processed_values = [];
				foreach( $values as $value ) {
					# only keep N chars?
					if( isset($field["source_chars"]) ) { $value = substr( $value, 0, $field["source_chars"] ); }
					# force value to be integer
					if( $field["type"]=="integer" ) { $value = (int) $value; } 
					# trim dates to 10 characters
					if( $field["type"]=="date" ) {  $value = substr( $value, 0, 10 ); }
					$processed_values []= $value;
				}
				foreach( $processed_values as $processed_value ) {
					if( !empty( $processed_value ) ) { 
						if( @$field["multiple"] ) {
							$out_record[$field["id"]] []= $processed_value;
						} else {
							// if this is a single value and we have a non empty value then we're done
							$out_record[$field["id"]] = $processed_value;
						}
					}	
				}
			}		
		}
		$output["records"] []= $out_record;
	}

	# Trim "ignore" fields from config
	$out_fields = [];
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
	$table = [];
	while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
		$table []= $row;
	}
	fclose($handle);
	return $table;
}

function table_to_objects( $table ) {
	$first_row = true;
	$headings = [];
	$records = [];
	foreach( $table as $row ) {
		if( $first_row ) {
			$headings = [];
			foreach( $row as $item ) { 
				$headings []= trim($item);
			};
			$first_row = false;
			continue;
		}
		$record = [];
		for( $i=0;$i<count($row);++$i ) {
			$record[ $headings[$i] ] = trim($row[$i]);
		}
		$records []= $record;
	}
	return array( "headings"=>$headings, "records"=>$records );
}

function latest_file_with_prefix($dir,$prefix) {

	# get all files with the prefix 
	$candidate_files = [];
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

