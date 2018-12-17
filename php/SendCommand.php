<?php
	// Avant toute chose, il faut autoriser apache a exécuter les executables en les rajoutant dans /etc/sudoers avec le compte www-data (utilise pour l'execution d'apache)
	//	www-data ALL=(ALL) NOPASSWD:/home/pi/src/RadioFrequence/RFSendRemoteBtnCode

	// On crée la session avant tout
	session_start();
	
	$PAGE = "SendCommand.php";
	
	header('Content-type: application/json');	
	try
	{
		//$pgrmPattern = "sudo /home/pi/src/RadioFrequence/RFSendRemoteBtnCode -jsonconf=/home/pi/src/RadioFrequence/radioFrequenceSignalConfig.json -repeat=30 -remote=%REMOTE% -btn=%BUTTON%";
		$pgrmPattern = "sudo /home/pi/src/RadioFrequence/RFSendRemoteBtnCode -jsonconf=/var/www/rfirmanager/data/RFSignals.json -repeat=%REPEAT% -remote=%REMOTE% -btn=%BUTTON%";
		
		// var_dump($_GET);
		$remote	= $_GET['remote'];	if (empty($remote))		{ $remote = $_POST['remote']; 	}
		$signal	= $_GET['signal'];	if (empty($signal))		{ $signal = $_POST['signal']; }	

		$result = array();	
		
		// if (strpos($remote,"custom.") === 0 )
		// {
			// error_log($PAGE . " remote=".$remote . "  signal=".$signal, 0);			
			// $remote = preg_replace("/custom\.(\w+\.)*/","",$remote);
			// if (strpos($signal,"RF_") === 0)
			// {
				// $signal = str_replace("RF_","",$signal);
				// error_log($PAGE . "  signal=".$signal, 0);
				// $pgrm = str_replace("%REMOTE%",$remote,$pgrmPattern);
				// $pgrm = str_replace("%BUTTON%",$signal,$pgrm);
				// $pgrm = str_replace("%REPEAT%","3",$pgrm);
				// #3 fois  Power puis Bright+    10s  puis Bright-	20s
				
				// error_log($PAGE . "  pgrm=".$pgrm, 0);
				// exec($pgrm,$stdoutput,$exitcode);
				// sleep(5);
				// exec($pgrm,$stdoutput,$exitcode);
			// }
			// elseif (strpos($signal,"SSH_") === 0)
			// {
				// $signal = str_replace("SSH_","",$signal);
				// error_log($PAGE . "  signal=".$signal, 0);
				// header("Location:../../xms_common/php/ShutdownOnLan.php?devName=".$signal."&pcIp=192.168.1.5");
			// }
			// else
			// {
				// $exitcode 	= 3;
				// $result['exitcode'] = $exitcode;
			// }
			// # récupération du nom de la télécommande
		// }
		// else
		// {
			// $pgrm = str_replace("%REMOTE%",$remote,$pgrmPattern);
			// $pgrm = str_replace("%BUTTON%",$signal,$pgrm);
			// $pgrm = str_replace("%REPEAT%","30",$pgrm);
			// error_log($PAGE . "  pgrm=".$pgrm, 0);
			// $stdoutput 	= array();
			// $exitcode 	= 0;
			// exec($pgrm,$stdoutput,$exitcode);
			// $result['exitcode'] = $exitcode;
		// }
		$pgrm = str_replace("%REMOTE%",$remote,$pgrmPattern);
		$pgrm = str_replace("%BUTTON%",$signal,$pgrm);
		$pgrm = str_replace("%REPEAT%","10",$pgrm);
		error_log($PAGE . "  pgrm=".$pgrm, 0);
		$stdoutput 	= array();
		$exitcode 	= 0;
		exec($pgrm,$stdoutput,$exitcode);
		$result['exitcode'] = $exitcode;
	}
	catch(Exception $e)
	{
		$result['exitcode'] = 1;
		$result['exitmessage'] = $e->getMessage();
	}
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    	
?>
