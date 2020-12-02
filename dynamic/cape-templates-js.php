<?php
$TEMPLATE_DIR = __DIR__."/../templates";
$JS_DIR = __DIR__."/../js";

ini_set("auto_detect_line_endings", "1");
header( "Content-type: application/javascript" ); // needed on dev when running dynamically

$dh = opendir( $TEMPLATE_DIR );

$files = [];
while( $file = readdir( $dh ) ) {
	if( $file == "." ) { continue; }
	if( $file == ".." ) { continue; }
	list( $prefix, $suffix ) = preg_split( '/\./', $file );
	$files[$prefix][$suffix] = 1;
}
ksort($files);
$output = "";
foreach( $files as $template=>$suffixes ) {
	if( !array_key_exists( "js", $suffixes ) ){ 
		error_log( "Template $template missing .js\n" );
		continue;
	}
	if( !array_key_exists( "html", $suffixes ) ){ 
		error_log( "Template $template missing .html\n" );
		continue;
	}
	$js = file_get_contents( "$TEMPLATE_DIR/$template.js" );
	$html = file_get_contents( "$TEMPLATE_DIR/$template.html" );

	$output.= "// $template\n";
	$output.= "template = ".json_encode( $html ).";";
	$output.= "$js\n";
}
print $output;
file_put_contents( "$JS_DIR/cape-templates.js", $output );

