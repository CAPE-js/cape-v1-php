<?php

$data = array(
	"branch"=>"?",
	"commit_user"=>"?",
	"commit_time"=>"?",
	"commit_id"=>"?",
	"commit_comment"=>"?",
);

$branch_out = read_cmd( 'git branch' );
if( preg_match( "/^\* (.*)/m", $branch_out, $matches ) ) {
	$data["branch"] = $matches[1];
}


$log_out = read_cmd( 'git log -1' );
if( preg_match( "/commit\s+([^\n]+)\nAuthor:\s*([^\n]+)\nDate:\s*([^\n]+)\n((.|\n)*)/", $log_out, $matches ) ){
	$data["commit_id"] = $matches[1];
	$data["commit_user"] = $matches[2];
	$data["commit_time"] = strtotime($matches[3]);
	$data["commit_comment"] = trim($matches[4]);
}

print "git_info = ".json_encode( $data );
exit(0);

function read_cmd( $cmd ) {
	$handle = popen($cmd, 'r');
	$read = fread($handle, 1024*16);
	pclose($handle);
	return $read;
}
