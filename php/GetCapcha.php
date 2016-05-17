<?php
// On crée la session avant tout
session_start();

// On définit la configuration :
$nbr_chiffres = 6; // Nombre de chiffres qui formeront le nombre

// Là, on définit le header de la page pour la transformer en image
header('Content-type: image/png');

// Là, on crée notre image
$_img = imagecreatefrompng('../img/capcha_bckg.png');

// On définit maintenant les couleurs
// Couleur de fond :
$arriere_plan = imagecolorallocate($_img, 0, 0, 0); // Au cas où on n'utiliserait pas d'image de fond, on utilise cette couleur-là.
// Autres couleurs :


##### Ici on crée la variable qui contiendra le nombre aléatoire #####
$i = 0;
$nombre = null;
while($i < $nbr_chiffres) {
	
    $chiffre = mt_rand(0, 9); // On génère le nombre aléatoire
    $chiffres[$i] = $chiffre;
		
	$avant_plan = imagecolorallocate($_img, rand(50,150), rand(50,150), rand(50,150)); // Couleur des chiffres
	imagestring($_img, 15, 5 + 15 * $i, 2 + rand(0,10), $chiffre, $avant_plan);	
	// $font = 'arial.ttf'; // replace by path of the font file
	// Add some shadow to the text
	//imagettftext($_img, 20, 20, 5 + 15 * $i, 2 + rand(0,10), $avant_plan, $font, $chiffre);
    $i++;
	$nombre .= $chiffre;
}
// On explore le tableau $chiffres afin d'y afficher toutes les entrées qui s'y trouvent
//foreach ($chiffres as $caractere) {$nombre .= $caractere;}

##### On a fini de créer le nombre aléatoire, on le rentre maintenant dans une variable de session #####
$_SESSION['session_capchacode'] = $nombre;
// On détruit les variables inutiles :
unset($chiffre);
unset($i);
unset($caractere);
unset($chiffres);

//imagestring($_img, 5, 18, 8, $nombre, $avant_plan);

imagepng($_img);
?>
