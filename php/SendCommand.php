<?php
	// Avant toute chose, il faut autoriser apache a exécuter les executables en les rajoutant dans /etc/sudoers avec le compte www-data (utilise pour l'execution d'apache)
	//	www-data ALL=(ALL) NOPASSWD:/home/pi/src/RadioFrequence/RFSendRemoteBtnCode

	// On crée la session avant tout
	session_start();
	
	header('Content-type: application/json');	
	try
	{
		// var_dump($_GET);
		$remote	= $_GET['remote'];	if (empty($remote))		{ $remote = $_POST['remote']; 	}
		$signal	= $_GET['signal'];	if (empty($signal))		{ $signal = $_POST['signal']; }	
		$result = array();	
		$pgrm = "sudo /home/pi/src/RadioFrequence/RFSendRemoteBtnCode -jsonconf=/home/pi/src/RadioFrequence/radioFrequenceSignalConfig.json -repeat=30 -remote=%REMOTE% -btn=%BUTTON%";
		$pgrm = str_replace("%REMOTE%",$remote,$pgrm);
		$pgrm = str_replace("%BUTTON%",$signal,$pgrm);
		$stdoutput 	= array();
		$exitcode 	= 0;
		exec($pgrm,$stdoutput,$exitcode);
		$result['exitcode'] = $exitcode;
		$result['exitcode'] = $exitcode;
	}
	catch(Exception $e)
	{
		$result['exitcode'] = 1;
		$result['exitmessage'] = $e->getMessage();
	}
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    	
?>
