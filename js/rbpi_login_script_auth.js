var dialogBox = null;

(function() {
	var userAgent = navigator.userAgent.toLowerCase();
	var firefoxVersion = ((/firefox\/(\d+?)\./g.exec(userAgent)) || [])[1];
	console.log("UserAgent",userAgent);
	if(typeof firefoxVersion === 'undefined' || parseInt(firefoxVersion) < 30) {
		//alert("ORME requiert Mozilla Firefox en version > 30");
		//window.location.href = "https://intraneterdf.fr/";
	}
		
	$.ajaxSetup({
		error: function(xhr){
			switch(xhr.status) {
				case 309:
					window.location.href = "connect.php?deconnexion";
					break;
				case 419:
					eventTrigger({
						type: "dialog",
						verbose: VERBOSE_ERROR,
						message: xhr.statusText
					});
					break;
				default:
					if(!userAborted(xhr))
						eventTrigger({
							type: "dialog",
							verbose: VERBOSE_ERROR,
							message: "Error #" + xhr.status + " : " + xhr.statusText
						});
					break;
			}
		}
	});
	
	$("body").css("display", "block");

	
	dialogBox = new DialogManager("#dialogBox");
	// var dialogEvent = jQuery.Event( "dialog" );
	// dialogEvent.message = "un message";
	// dialogEvent.verbose = VERBOSE_INFO;
	// $(document).trigger(dialogEvent);
	// Equivalent en une ligne : 			$(document).trigger( {type: "dialog", verbose: VERBOSE_ERROR, message: "En une seule ligne"} );
	// ou encore plus rapide : 				eventTrigger({type: "dialog",verbose: VERBOSE_ERROR,message: data});

	$("input[name=login]").keyup(function (e) {	if(e.keyCode == 13)	connectUser();})
	$("input[name=passwd]").keyup(function (e) {	if(e.keyCode == 13)	connectUser();})
	$("input").on("focus", function() {$(this).css("background-color","white");});


	$("#idImgRefresh").click(function()	{$("#idImgCapcha").attr("src","../php/GetCapcha.php?" + (new Date()).getTime());});
	
	$("#idDivRegisterFieds").css("display","none");
	$("#idAnchorRegister").click( function(){$("#idBtnRegisterOrReset").html("Register"); $("#idDivRegisterFieds").css("display","visible"); $("#idImgCapcha").attr("src","../php/GetCapcha.php?" + (new Date()).getTime()); });
	$("#idAnchorResetPassword").click(function(){$("#idBtnRegisterOrReset").html("Reset"); $("#idDivRegisterFieds").css("display","visible"); $("#idImgCapcha").attr("src","../php/GetCapcha.php?" + (new Date()).getTime()); });
	
	$("input[name=antirobot]").keyup(function (e) {	if(e.keyCode == 13)	registerOrResetPwd();})
	$("input[name=email]").keyup(function (e) {	if(e.keyCode == 13)	registerOrResetPwd();})
	
}).call(this);

/**********************************************************************************************************************************************************************************/
function cancelRegister() {$("#idDivRegisterFieds").css("display","none");}

/**********************************************************************************************************************************************************************************/
function registerOrResetPwd() {
	var login 		= $("input[name=login]");
	var passwd 		= $("input[name=passwd]");
	var capchacode 	= $("input[name=antirobot]");
	var mail 		= $("input[name=email]");

	var resetOrRegisterVal = $("#idBtnRegisterOrReset").html();
	
	if (resetOrRegisterVal === "Reset")
		if (confirm("Do you really want to reset your password") != true) {return;} 
	
	if($.trim(login.val()) && $.trim(passwd.val())) 
	{
		$.ajax({
			url: "registerOrReset.php",
			type: "POST",
			data: {connexion:"", login:login.val(), pwd:passwd.val(), capchacode:capchacode.val(), mail:mail.val(), resisterOrReset:""+resetOrRegisterVal},			
			dataType: "json",
			success: function(data){
				if(data.registered===1)
				{
					eventTrigger({
						type: "dialog",
						verbose: VERBOSE_INFO,
						message: "A mail with your informations has been sent to your specified e-mail adresse. If you just register, please wait that administrator give you access. Else you must now connect with your new password."
					});
					$("#idDivRegisterFieds").css("display","none");
				}
				else
				{
					eventTrigger({
						type: "dialog",
						verbose: VERBOSE_AUTH,
						message: "Operation failed : <br/> " + data.responseMessage
					});
					if(data.invalidUser===1)
					{
						login.css("background-color","#e7cdff");
						passwd.css("background-color","#e7cdff");
						mail.css("background-color","#e7cdff");						
					}
					else if(data.wrongPassword===1)
					{
						login.css("background-color","#e7cdff");
						passwd.css("background-color","#e7cdff");
						mail.css("background-color","#e7cdff");						
					}
					else if(data.mail===1)
					{
						login.css("background-color","#e7cdff");
						passwd.css("background-color","#e7cdff");
						mail.css("background-color","#e7cdff");						
					}
					else if(data.capchacode===1)
					{
						capchacode.css("background-color","#ffb18e");
					}					
				}
			}
		});
	}
	else  // Login ou Mot de passe mal renseigné
	{
		login.css("background-color","#FFD100");
		passwd.css("background-color","#FFD100");
	}	
}

/**********************************************************************************************************************************************************************************/
function connectUser() {
	var login 	= $("input[name=login]");
	var passwd 	= $("input[name=passwd]");
	if($.trim(login.val()) && $.trim(passwd.val())) 
	{
		$.ajax({
			url: "connect.php",
			type: "POST",
			data: {connexion:"", login:login.val(), pwd:passwd.val()},
			dataType: "json",
			success: function(data){
				if(data.invalidUser===0 && data.wrongPassword===0)
					window.location.href = "../php/RFIRManagerMainPage.php";
				else
				{
					eventTrigger({
						type: "dialog",
						verbose: VERBOSE_AUTH,
						message: "Login failed : <br/> " + data.responseMessage
					});
					if(data.invalidUser===1)
					{
						login.css("background-color","#e7cdff");
						passwd.css("background-color","#e7cdff");
					}
					else if(data.wrongPassword===1)
					{
						login.css("background-color","#ffb18e");
						passwd.css("background-color","#ffb18e");
					}
				}
			}
		});
	}
	else  // Login ou Mot de passe mal renseigné
	{
		login.css("background-color","#FFD100");
		passwd.css("background-color","#FFD100");
	}
}
