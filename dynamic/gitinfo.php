<?php
header( "Content-type: application/javascript" );

$data = array(
	"branch"=>"",
	"commit_author"=>"",
	"commit_date"=>"",
	"commit_id"=>"",
	"commit_comment"=>"",
	"commit_merge"=>"",
);

$branch_out = read_cmd( 'git branch' );
if( preg_match( "/^\* (.*)/m", $branch_out, $matches ) ) {
	$data["branch"] = $matches[1];
}


$log_out = read_cmd( 'git log -1' );
$log_lines = preg_split( "/\n/", $log_out );

$i=0;
while( !empty($log_lines[$i]) && $i<sizeof($log_lines)) {
	$line = $log_lines[$i];
	if( preg_match( "/^commit\s+([0-9a-f]+)(\s+(.*))?/", $line, $matches ) ){
		# for now we throw away anything after the ID 
		$data["commit_id"] = $matches[1];
	}
	if( preg_match( "/^Merge:\s*(.*)/", $line, $matches ) ){
		$data["commit_merge"] = $matches[1];
	}
	if( preg_match( "/^Author:\s*(.*)/", $line, $matches ) ){
		$data["commit_author"] = $matches[1];
	}
	if( preg_match( "/^Date:\s*(.*)/", $line, $matches ) ){
		$data["commit_date"] = strtotime($matches[1]);
	}
	$i++;
}
$data["commit_comment"] = "";
while($i<sizeof($log_lines)) {
	$line = $log_lines[$i];
	if( !empty($line) ) {	
		$data["commit_comment"] .= preg_replace( "/^\s+/","",$line)."\n";
	}
	$i++;
}

print "git_info = ".json_encode( $data ).";\n";
exit(0);

function read_cmd( $cmd ) {
	$handle = popen($cmd, 'r');
	$read = fread($handle, 1024*16);
	pclose($handle);
	return $read;
}
