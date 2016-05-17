<?
	/*if(defined("CRYPT_BLOWFISH") && CRYPT_BLOWFISH) { echo "CRYPT_BLOWFISH is enabled!\n";} else { echo "CRYPT_BLOWFISH is NOT enabled!<br>"; }*/

	$expire = 365*24*3600;
	
	function better_crypt($input, $rounds = 7)
	{
		$salt = "";
		$salt_chars = array_merge(range('A','Z'), range('a','z'), range(0,9));
		for($i=0; $i < 22; $i++) {$salt .= $salt_chars[array_rand($salt_chars)];}
		return crypt($input, sprintf('$2a$%02d$', $rounds) . $salt); // retourne la concaténation de $2a$<LeNbDeBit>$<LeSalt><LeInputChiffre>
	}

	function generateBlowfishSecret()
	{
		$salt = "";
		$salt_chars = array_merge(range('A','Z'), range('a','z'), range(0,9));
		for($i=0; $i < 22; $i++) {$salt .= $salt_chars[array_rand($salt_chars)];}
		return sprintf('$2a$%02d$', 7) . $salt;
	}
	
	$bls = generateBlowfishSecret();
	
/*	
	$password_hash = better_crypt("monmdp"); // ==> génère le mot de passe --> on doit l'enregistrer en base ($password_hash) avec le login
	// Exemple : $password_hash = $2a$07$NwHzUJU5vaiw2qB7bBgC2eXMDrtXDHSZ5gPmAOJdnP1ymMDYNQxBO  --> <mot de passe chiffré> = XMDrtXDHSZ5gPmAOJdnP1ymMDYNQxBO				
	// echo $password_hash;
	
	// 1) Imaginons que l'utilisateur se connecte à nouveau par la suite ; je veux le forcer a se reloguer il rentre son login et son mot de passe monmdp de nouveau				
	// On récupère son $password_hash à partir de la base, puis, on fait
	if(crypt("monmdp", $password_hash) == $password_hash) {echo "<br/> Mot de passe correct";} else {echo "<br/> Mot de passe incorrect";}
	// Attention : la fonction crypt est 1-way : elle est asymétrique (indéchiffrable)
	// $password_hash contient l'algorithme de hashage et le sel ($2a$%<NbBit>$ suivi des 22 caractères du sel), 
	// Du coup la fonction crypt("monmdp", $password_hash) sait lire le préfix, le comprendre, et du récupérer ces informations ($2a$%<NbBit>$ suivi des 22 caractères du sel) pour chiffrer le mot de passe saisi.
	// Si ce mot de passe saisi est le même, alors crypt() retournera la même chose
	// Voir 	http://www.the-art-of-web.com/php/blowfish-crypt/
*/	
	
	header('Content-type: application/json');

	// var_dump($_GET);
	$login 					= $_GET['login'];	if (empty($login))		{ $login = $_POST['login']; 	}
	$pwd 					= $_GET['pwd'];		if (empty($pwd))		{ $pwd = $_POST['pwd']; }
	
	$result 				= array();

	if (empty($login) or empty($pwd))
	{
		$result["invalidUser"]=1; 	
		$result["wrongPassword"]=1;
		$result["responseMessage"]="No parameter given : must give 'login' and 'pwd' : login=".$login." and pwd=".$pwd;
	}
	else
	{
		$stringUsers 			= file_get_contents("../data/Users.json");
		$jsonUsers 				= json_decode($stringUsers, TRUE);
		
		$userCryptHashAndPwd 	= "";
		$loginExists 			= 0;
		$pwdIsCorrect 			= 0;
		
		foreach ($jsonUsers as $key => $value) // key is userlogin, pwd = user password with hashalgo and key
		{
			if ($key == $login)
			{

				$loginExists = 1;
				$userCryptHashAndPwd = $value["pwd"];
			}
		}
		if(crypt($pwd, $userCryptHashAndPwd) == $userCryptHashAndPwd) 
		{
			$pwdIsCorrect = 1;
			session_start();
			$_SESSION['SessionStartedAt'] = mktime();
			$_SESSION['userlogin'] = $login;
			setcookie("userlogin",$login,time()+$expire);
		}
		
		if ($loginExists === 0)			{ $result["invalidUser"]=1; 	$result["wrongPassword"]=0;		$result["responseMessage"]="Unknown account ; Please register";}
		elseif ($pwdIsCorrect === 0)	{ $result["invalidUser"]=0; 	$result["wrongPassword"]=1; 	$result["responseMessage"]="Incorrect password";}
		else 							{ $result["invalidUser"]=0; 	$result["wrongPassword"]=0;		$result["responseMessage"]="Login ok"; 		$result["logged"]=1; }		
	}
			
	echo json_encode($result,JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);    	
	
	
	//---------------------------------------- Crypter et décrypter avec Blowfish	--------------------------------------------------//
/*	
	$dataToProtect = 'my secret text';
	$key = 'my secret key';
	$iv = '12345678';

	$cipher = mcrypt_module_open(MCRYPT_BLOWFISH,'','cbc','');

	mcrypt_generic_init($cipher, $key, $iv);
	$encrypted = mcrypt_generic($cipher,$dataToProtect);
	mcrypt_generic_deinit($cipher);

	mcrypt_generic_init($cipher, $key, $iv);
	$decrypted = mdecrypt_generic($cipher,$encrypted);
	mcrypt_generic_deinit($cipher);

	// echo "<br /> encrypted : ".$encrypted . "   decrypted : ".$decrypted;
	// ==> On encrypt puis on fait un setcookie pour le fournir au navigateur
	// 		Quand on recoit du navigateur $cookie est crypté avec la clé secrete du serveur ==> on la décriffre
	
*/	
	//---------------------------------------- Gestion des sessions dans une page web --------------------------------------------------//
/*	
	session_start();	// indique à php qu'il faut récupérer l'identifiant de session envoyé par le navigateur
	// Pour mémoriser une variable de session ou la mettre à jour 		:		 $_SESSION["variableDeSession"]=uneValeur;
	//echo "<br /> variableSession=" . $_SESSION["variableSession"] . " sessionId=". session_id();
	//$_SESSION["variableSession"]=1111;
	
	// Pour fixer le timeout : si le gars fait une requete apres 15*30 secondes depuis la derniere requete qu'il a fait, alors, on le sort vers
	if (isSet($_SESSION['started'])){					
		if((mktime() - $_SESSION['started'] - 15*30) > 0){
			unset($_SESSION['started']);
			header("Location:../php/RFIRManagerLogin.php"); } //Logout, destroy session, etc.
	}
	else {$_SESSION['started'] = mktime();}	// Sinon, il faut mettre à jour la session
*/	
?>
