<?
	$filepath = "/var/www/rfirmanager/data/rfirevents/outputs.log";
	$handle = @fopen($filepath, "r");
	$result = array();
	if ($handle) 
	{
		$i = 0;
		while (($buffer = fgets($handle, 4096)) !== false) 
		{
			$line = rtrim($buffer);
			$lineElems = split(" ", $line);
			$result[$i]["remote"]	= str_replace("-remote=","",$lineElems[0]);
			$result[$i]["code"]		= str_replace("code=","",$lineElems[1]);
			$result[$i]["bits"]		= str_replace("bits=","",$lineElems[2]);
			$i = $i + 1;
		}
		fclose($handle);
		file_put_contents($filepath, "");
	}		
	else {$result[0]="N.A.";}
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    				
?>