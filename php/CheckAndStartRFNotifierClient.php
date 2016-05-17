<?
	$result 				= array();

	$pid = shell_exec("pidof RFReceptHandler");
	
	if (empty($pid)) {
		$result["wasRunning"]=0;
		$cmdToCall = 'sudo /home/pi/src/RadioFrequence/RFReceptHandler -conf=/home/pi/src/RadioFrequence/radioFrequenceSignalConfig.json -call=/var/www/rfirmanager/php/dump.sh';
		$output = shell_exec($cmdToCall);
		$result["launchOutput"]=$output;
	}
	else $result["wasRunning"]=1;
	
	$pid = shell_exec("pidof RFReceptHandler");
	
	if (empty($pid)) $result["isRunning"]=0; else	$result["isRunning"]=1;
	
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    		
?>