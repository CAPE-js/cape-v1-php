<?php

$branch = "???";
$branch_out = read_cmd( 'git branch' );
if( preg_match( "/^\* (.*)/m", $branch_out, $matches ) ) {
	print_r( $matches );
} 
$log_out = read_cmd( 'git log -1' );

print_r( $status );
print "--\n";
print "--\n";
print "--\n";
print_r( $log );


exit(0);

function read_cmd( $cmd ) {
	$handle = popen($cmd, 'r');
	$read = fread($handle, 1024*16);
	pclose($handle);
	return $read;
}
