<?
	# Prerequisite : intall libssh for php : 					# sudo apt-get install libssh2-php
	# Ce php peut être testé directement à partir du shell : 	# php /var/www/rfirmanager/php/PowerOffNas.php

	#header('Content-type: application/json');
	
	$serverIP 	= $_GET['serverIP'];
	$sshuser 	= $_GET['sshuser'];
	$sshpwd 	= $_GET['sshpwd'];
	$shellcmd 	= $_GET['shellcmd'];
	$tcpPort 	= 22;
	
	if (empty($serverIP) or empty($sshuser)	or empty($sshpwd) or empty($shellcmd))	
	{  
		$result["status"] = "KO : missing arguments";
		$result["detail"] = "serverIP=".$serverIP." sshuser=".$sshuser." sshpwd=".$sshpwd." shellcmd=".$shellcmd;
		$result["result"] = "";
		echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    						
	}
	else
	{
		try
		{
			$result["detailConnection"] = "serverIP=".$serverIP." sshuser=".$sshuser." sshpwd=".$sshpwd." shellcmd=".$shellcmd;
			$conn = ssh2_connect($serverIP, $tcpPort); 	
			if ($conn) 
			{
				$result["connection"] = "OK";
				ssh2_auth_password($conn, $sshuser, $sshpwd);
				$result["authentification"] = "OK";
				$stream = ssh2_exec($conn, "ls");
				stream_set_blocking($stream, true );
				$result["status"] = "OK";			
				$result["result"] = fread( $stream, 4096 );
			}
			else
			{
				$result["connection"] = "KO";
			}
				
		}
		catch(Exception $exception)
		{
			$result["result"] = "KO.exception";
		}		
		echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    					
	}
?>