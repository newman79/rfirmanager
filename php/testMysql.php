<?php

	try
	{
		$bdd = new PDO('mysql:host=localhost;dbname=RBPIManager;charset=utf8', 'root', 'free1979');
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}

	try
	{	
		$reponse = $bdd->query('SELECT * FROM DeviceEvents');

		while ($donnees = $reponse->fetch())
		{
			echo '<p>'. $donnees['macadress'] . ' ' . $donnees['ip'] . ' ' . $donnees['status'] .'</p> <br />';		   
		}		
		$reponse->closeCursor();		
	}
	catch (Exception $e)
	{
		die('Erreur récupération données : ' . $e->getMessage());
	}
	
	
?>