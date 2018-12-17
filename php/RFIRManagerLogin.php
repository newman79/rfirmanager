<?php
	// On crée la session avant tout
	session_start();
	unset($_SESSION['SessionStartedAt']);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0//FR" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="language" content="fr">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" href="../../xms_common/js/jquery-ui-1.11.4/jquery-ui.css" />
		<link type="text/css" rel="stylesheet" href="../../xms_common/css/rbpi_login_style.css">
		<link type="text/css" rel="stylesheet" href="../../xms_common/css/rbpi_login_style_auth.css">
		<title>RFIRManager</title>
	</head>
	<body style="display: block; cursor: auto;">
		<div style="top:0px; height:30px;  left:0px; right:0px; text-align:center; font-size:20px; border-radius:10px;	border: 3px ridge #4d91b7; background:#d4ddd3;">
			<b style="color:#3d81a7;">RBPI : Domotic managment, RF/IR commands and signal events</b>			
		</div>
		
		<div id="form">
			<fieldset style="background-color: #e9f7ff;">
				<legend>Authentification</legend>
				<label>Login :</label>
				<br>
				<input value="xmarquis" style="background-color: rgb(255, 255, 255);" name="login" type="text">
				<br><br>
				
				<label>Password <span style="font-size:0.8em;"></span> :</label>
				<br>
				<input style="background-color: rgb(255, 255, 255);" name="passwd" type="password"/>
				
				<a id="idAnchorResetPassword" style="margin-top:40px;display:block" onmouseover="this.style.background='#6bbdfc';this.style.color='#FF0000';" onmouseout="this.style.background='';this.style.color='';">Reset my password</a>
				<br>				
				<a id="idAnchorRegister" onmouseover="this.style.background='#6bbdfc';this.style.color='#FF0000';" onmouseout="this.style.background='';this.style.color='';">Register</a>

				<button style="float: right; position:relative; bottom:75px" onclick="connectUser('../../xms_common/php/connect.php','../../rfirmanager/php/RFIRManagerMainPage.php');">Connexion</button>
				
				<br><br>
				<div id="idDivRegisterFieds">
					<label id="idLblEmail">Email <span style="font-size:0.8em;"></span> :</label>
					<br>
					<input id="idTxtEmail" style="background-color: rgb(255, 255, 255);" name="email" type="text">
					<br><br>

					<img id="idImgCapcha" src="../../../xms_common/php/getCapcha.php" /> <img id="idImgRefresh" src="../img/refresh.png" style="width:26px;height:26px;" />
					<label id="idLblRobot">Antirobot <span style="font-size:0.8em;"></span> :</label>
					<br>
					<input id ="idTxtRobot" style="background-color: rgb(255, 255, 255);" name="antirobot" type="text">
					<br><br>
					
					<button id="idBtnRegisterOrReset" 	style="float: left; display:none;" onclick="registerOrResetPwd();">Register</button>
					<button id="idBtnCancel" 			style="float: right; display:none;" onclick="cancelRegister();">Cancel</button>
				</div>
			</fieldset>
			<br>
		</div>

		<div aria-labelledby="ui-id-1" aria-describedby="dialogBox" role="dialog" tabindex="-1" style="height: 134px; width: 300px; top: 364px; left: 690px; display: none; z-index: 10001; right: auto; bottom: auto;" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front dialogBox_3 ui-draggable">
			<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle">
				<span class="ui-dialog-title" id="ui-id-1">Authentification</span><button title="Close" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" type="button">
				<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span><span class="ui-button-text">Close</span></button>
			</div>
			<div style="width: auto; min-height: 88px; max-height: none; height: auto;" class="ui-dialog-content ui-widget-content" id="dialogBox">GARDIAN : login incorrect</div>
		</div>
		
		<script type="text/javascript" src="../../xms_common/js/jqGrid_JS_5_0_2/js/jquery-1.11.0.min.js">			</script>		
        <script type="text/javascript" src="../../xms_common/js/jquery-ui-1.11.4/jquery-ui.js">						</script>								
		<script type="text/javascript">
            var TITLE_DIALOGBOX = [];
            var LOG_MESSAGE = [];
            var VERBOSE_INFO = 0;TITLE_DIALOGBOX[0] = "Information";var VERBOSE_WARNING = 1;TITLE_DIALOGBOX[1] = "Warning";var VERBOSE_ERROR = 2;TITLE_DIALOGBOX[2] = "Error";var VERBOSE_AUTH = 3;TITLE_DIALOGBOX[3] = "Authentification";var VERBOSE_HELP = 4;TITLE_DIALOGBOX[4] = "Assistance";LOG_MESSAGE[0] = "Habilité";LOG_MESSAGE[1] = "Mot de passe incorrect";LOG_MESSAGE[2] = "login incorrect";LOG_MESSAGE[3] = "Annuaire injoignable";LOG_MESSAGE[4] = "Non-habilité";LOG_MESSAGE[5] = "Habilitation insuffisante";var refreshTimeInMs = 25000;        </script>
        <script type="text/javascript" src="../../xms_common/js/rbpi_login_required.js"></script>
		<script type="text/javascript" src="../../xms_common/js/rbpi_login_DialogManager.js"></script>
		<script type="text/javascript" src="../../xms_common/js/rbpi_login_script_auth.js"></script>
	</body>
</html>