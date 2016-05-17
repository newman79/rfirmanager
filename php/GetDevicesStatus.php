<?php
	// include('includes/json.php');
	
	error_reporting(E_ALL);
	ini_set('display_errors', 1);	
	ini_set('display_startup_errors', 1);
	
	set_error_handler(
		function($errno, $errstr, $errfile, $errline, array $errcontext) 
		{
			// error was suppressed with the @-operator
			if (0 === error_reporting()) {return false;}
			throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
		}
	);	
	
	function dirTreeToArray($dir) {
	  
		$result = array();
		try
		{
			$cdir = scandir($dir);
			
			foreach ($cdir as $key => $value)
			{
			  if (!in_array($value,array(".","..")))
			  {
				 if (is_dir($dir . DIRECTORY_SEPARATOR . $value))  	{ $result[$value] = dirToArray($dir . DIRECTORY_SEPARATOR . $value); }
				 else	 											{ $result[] = $value; }
			  }
			}  			
		}
		catch(ErrorException $exception)
		{
			echo 'Error :' ;
			$result['ERROR'] = 'Cannot list device folder : ';
			return $result;
		}
		return $result;
	} 

	header('Content-type: application/json');
	
	$deviceDir    = '/var/run/NDGrabber/devices';
	
	$result = array();
	if (!is_dir($deviceDir))
	{
		$result['ERROR'] = 'Device dir is not a folder : ' . $deviceDir;
	}
	else
	{
		$arrayFiles = dirTreeToArray($deviceDir);
		if (empty($arrayFiles))
		{
			$result['ERROR'] = 'NoDevicesFound in : ' . $deviceDir;
		}
		foreach ($arrayFiles as $key => $value)
		{		
			$devfilepath = $deviceDir . DIRECTORY_SEPARATOR . $value;
			$devLastSeen = date ("Ymd_His", filemtime($devfilepath));
			//echo ' $devfilepath='.$devfilepath. "  ". $devLastSeen  . "\n";
			$result[$value] = $devLastSeen;
		}		
	}
			
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    
	
	//$Json->send();		
	
/*
	// Include the json class
	include('includes/json.php');

	// Then create the PHP-Json Object to suits your needs

	// Set a variable ; var name = {}
	$Json = new json('var', 'name'); 
	// Fire a callback ; callback({});
	$Json = new json('callback', 'name'); 
	// Just send a raw JSON ; {}
	$Json = new json();

	// Build data
	$object = new stdClass();
	$object->test = 'OK';
	$arraytest = array('1','2','3');
	$jsonOnly = '{"Hello" : "darling"}';

	// Add some content
	$Json->add('width', '565px');
	$Json->add('You are logged IN');
	$Json->add('An_Object', $object);
	$Json->add("An_Array",$arraytest);
	$Json->add("A_Json",$jsonOnly);

	// Finally, send the JSON.

	$Json->send();	
*/	
?>