function RFIREvent(nameVal,codeVal,remoteVal)
{
	this.name = nameVal;
	this.code = codeVal;
	this.remote = remoteVal;
}


/***********************************************************************************************************************************************************************************************/
function xhrSuccess() 	{ this.callback.apply(this, this.arguments); }
function xhrError() 	{ console.error(this.statusText); }
function LoadFile(theurl)
{
	var result = undefined;
	var xmlhttp = new XMLHttpRequest();
	// xmlhttp.onreadystatechange = function() {};
	// xmlhttp.onloadend = function() {};
	// xmlhttp.onload = xhrSuccess;				// called if request is ok
	// xmlhttp.onerror = xhrError;				// called if request is ko
	// xmlhttp.callback = LoadJsonRemote;		// just to memorize callback function, which will be called on success by xhrSuccess()
	xmlhttp.open('GET', theurl, false);  		// `false` makes the request synchronous
	// xmlhttp.timeout = 1000; 					// in milliseconds
	xmlhttp.send(null);
	if (xmlhttp.status === 200)  {result = JSON.parse('' + xmlhttp.responseText);}
	return result;
}

/***********************************************************************************************************************************************************************************************/
function CheckAndStartRFNotifierClient(theurl)
{
	var result = undefined;
	var xmlhttp = new XMLHttpRequest();
	// xmlhttp.onreadystatechange = function() {};
	// xmlhttp.onloadend = function() {};
	// xmlhttp.onload = xhrSuccess;				// called if request is ok
	// xmlhttp.onerror = xhrError;				// called if request is ko
	// xmlhttp.callback = LoadJsonRemote;		// just to memorize callback function, which will be called on success by xhrSuccess()
	xmlhttp.open('GET', theurl, false);  		// `false` makes the request synchronous
	// xmlhttp.timeout = 1000; 					// in milliseconds
	xmlhttp.send(null);
	if (xmlhttp.status === 200)  {result = JSON.parse('' + xmlhttp.responseText);}
	return result;
}

/***********************************************************************************************************************************************************************************************/
function GrabRFNotifierOutputs(theurl)
{
	var result = undefined;
	var xmlhttp = new XMLHttpRequest();
	// xmlhttp.onreadystatechange = function() {};
	// xmlhttp.onloadend = function() {};
	// xmlhttp.onload = xhrSuccess;				// called if request is ok
	// xmlhttp.onerror = xhrError;				// called if request is ko
	// xmlhttp.callback = LoadJsonRemote;		// just to memorize callback function, which will be called on success by xhrSuccess()
	xmlhttp.open('GET', theurl, false);  		// `false` makes the request synchronous
	// xmlhttp.timeout = 1000; 					// in milliseconds
	xmlhttp.send(null);
	if (xmlhttp.status === 200)  {result = JSON.parse('' + xmlhttp.responseText);}
	return result;
}


/***********************************************************************************************************************************************************************************************/
/* Les 3 arguments doivent être renseigné */
function ListDir(theurl, extension, mustContainStr)
{
	var fileList = undefined;
	if (theurl === undefined || extension === undefined || mustContainStr === undefined) {console.warn("ListDir : theurl, extension, mustContainStr must be set for call ; return undefined val"); return fileList;}
		
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', theurl, false);  		// `false` makes the request synchronous
	xmlhttp.send(null);
	if (xmlhttp.status === 200) 
	{
		domResult = $.parseHTML(xmlhttp.responseText);
		var arrayA = $("a:not([href^='?'])[href*='" + mustContainStr + "'][href$='" + extension + "']",domResult);  // selector chainé
		
		fileList = [];
		$.each(arrayA,function(index,data){
			var arrayElemOfPath = data.href.split("/");
			fileList.push(arrayElemOfPath[arrayElemOfPath.length-1]);
		});
	}
	return fileList;
}


/***********************************************************************************************************************************************************************************************/
function ExtractEvents(jsonHashmap)
{
	if (jsonHashmap === undefined) {console.warn("ExtractEvents : jsonHashmap is not set ; return undefined val"); return undefined;}
	var result = [];
	var remoteCount=0;
	for (var keyRemote in jsonHashmap) 
	{
		if (! /^protocole\d/.test(keyRemote))
		{
			remoteCount++;
			var remoteProps = jsonHashmap[keyRemote];
			for (var keySignal in remoteProps['signals'])
			{
				var signal = remoteProps['signals'][keySignal]				
				rfirevent = new	RFIREvent(keySignal,signal,keyRemote);
				result.push(rfirevent);
			}
		}
	}
	console.log("Found :",Object.keys(jsonHashmap).length - remoteCount, "protocols ,", remoteCount,"rfremotesJson, ", result.length, "events");
	return result;
}

/***********************************************************************************************************************************************************************************************/
function DisplayAllEvents()
{
	for (var it in $.rfirevents) 
		console.log("RFIREvent:", $.rfirevents[it].name, $.rfirevents[it]);
}

/***********************************************************************************************************************************************************************************************/
function Model_GetAllRfRemotes()
{
	var result = [];
	if ($.rfremotesJson === "NA") {console.warn("GetAllRfRemotes: $.rfremotesJson is not set"); return undefined;}
	var result = [];
	var remoteCount=0;
	for (var keyRemote in $.rfremotesJson) {if (! /^protocole\d/.test(keyRemote)) {result.push(keyRemote);}}
	return result;
}

/***********************************************************************************************************************************************************************************************/
/* type=RF or IR */
/* remote=remotename */
function Model_GetAllSignalsForRemote(type, remote)
{
	var result = [];
	if ($.rfremotesJson === "NA") {console.warn("Model_GetAllSignalsForRemote: $.rfremotesJson is not set"); return undefined;}
	
	/*
	if (type === "RF")
	{
		var remote 	= $.rfremotesJson[remote]
		var signals = remote["signals"]
		for (var signal in signals) {result.push(signal);}
	}
	*/
	return result;
}



// JSONP : function called by javascript executing bellowing section --- JQUERY via JSONP --- 
function LoadJsonRemote(data){console.log("JQUERY JSON jsoncallback data is ", data);}

//*********************************************************************************************************************************************************************************************//
$(document).ready(function() 
{
	$.rfremotesJson = "NA";
	
	//------------------------------------------------------------------------------------------------------------------------------------//
	//------------------------						 	Transformation de json en texte								----------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	// var textejson = JSON.stringify({"kiwis":3,"mangues":4})
	// console.log(textejson);
	//------------------------------------------------------------------------------------------------------------------------------------//
	//------------------------ 									pur AJAX asyncrone		 									----------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	// var courses = {};
	// var xmlhttp = new XMLHttpRequest();
	// var url="../data/test.json"; // cette url relative vaut C:\...\test.json si la page web est obtenue localement; sinon elle vaudra http://....../test.json
	// xmlhttp.open("GET", url, true); // `true` 
	// xmlhttp.onreadystatechange = function () 
	// {
		// if (xmlhttp.readyState == 4 && xmlhttp.status == 200)	{console.log("Asynchronous AJAX json request give : ",JSON.parse(''+xmlhttp.responseText));}
	// };
	// xmlhttp.send(null); // lancement de la requête
	//------------------------------------------------------------------------------------------------------------------------------------//
	//------------------------ 									pur AJAX syncrone		 									----------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	$.rfremotesJson 		= LoadFile('../data/RFSignals.json');	// $.rfremotesJson is global, i.e visible by all jQuery declarations and functions
	
	$.remoteShutdownJson	= LoadFile('../../xms_common/data/ShutdownOnLan.cfg.json');	
	
	// console.log("$.rfremotesJson is ... " ,$.rfremotesJson);
	// console.log("protocol1 is ... " ,$.rfremotesJson['protocole1']);
	// console.log("protocol1,startlock_low_NbPulseLength is ... " ,$.rfremotesJson['protocole1']['startlock_low_NbPulseLength']);
	$.rfirevents 	= ExtractEvents($.rfremotesJson);
	//DisplayAllEvents();
	$.plans 		= ListDir("../data/",'.json','Plan');
	
	
	$.deviceToState = {};
		
	$.cpt = 0;
	
	$.devicesLastUpdate = {};
	
	//------------------------------------------------------------------------------------------------------------------------------------//
	setInterval(function() 
	{
		$.devicesstatus = LoadFile("./GetDevicesStatus.php");
				
		for (first in $.devicesstatus) break;
		if (first === 'ERROR')	{	console.log("Error : have not been able to request device's state"); return;}
		
		var setDevicesSeen 		= new Set();
		var setDevicesNotSeen 	= new Set();
		
		var objects = $("#idDivViewer").iviewer('getPlan')['Objects'];		
		for (var deviceName in objects)	setDevicesNotSeen.add(deviceName);
		
		maxTime = 0;

		// Refresh shudownMethod on div objects
		for (var devFullName in $.remoteShutdownJson)
		{
			jsonObject = $.remoteShutdownJson[devFullName];
			if (jsonObject.rfirmanager !== undefined && jsonObject.rfirmanager.match(/^PC_.*$/) != undefined)
			{
				var idObjectStr = "#idDevice_" + jsonObject.rfirmanager;
				if ( $(idObjectStr).length )
				{
					if ($(idObjectStr).attr("shutdownMethod_"+devFullName) === undefined) 
					{ 
						//jsonObjectStr = JSON.stringify(jsonObject);
						$(idObjectStr).attr("shutdownMethod_"+devFullName,devFullName); 
						//JSON.parse(json)   pour retransfer en objet json l'attribut shudownMethod_<nomInterfaceReseau>
					}
				}
			}
		}
				
		// Pour chaque objet du plan courant
		for (var device in objects)
		{
			if (!(device in $.deviceToState))	$.deviceToState[device] = 0;
			
			macAdress = objects[device]['macAdress'];
			// Pour tous les devices vus sur le réseau
			for (var deviceRow in $.devicesstatus)
			{
				deviceMac 	= deviceRow.split('_')[0];
				deviceIp 	= deviceRow.split('_')[1];
				if (macAdress === deviceMac) // cela signifie qu'il est toujours détecté (le fichier des devices étant toujours présent)
				{
					setDevicesSeen.add(device);
					idObjectStr = "#idDevice_" + device;
					// récupérer la date la plus fraiche de raffraichissement des fichiers de description des devices sur le réseau local
					var dayHoro = $.devicesstatus[deviceRow].split('_');
					dateStr = dayHoro[0].substring(0,4)+'/'+dayHoro[0].substring(4,6)+'/'+dayHoro[0].substring(6,8)+' '+dayHoro[1].substring(0,2)+':'+dayHoro[1].substring(2,4)+':'+dayHoro[1].substring(4,6);
					time = Date.parse(dateStr) / 1000;
					if (maxTime < time)	maxTime = time;
					$("#idDevice_" + device).attr("LastStateUpdate",time);
					$("#idDevice_" + device).attr("deviceIp",deviceIp);
					
					setDevicesNotSeen.delete(device);
					break;
				}				
			}
		}
		
		// Recalage pour indiquer le temps du dernier raffraichissement depuis le temps de raffraichissement du device le plus à jour
		for (var device in objects) $("#idDevice_" + device).attr("LastStateUpdate", maxTime - $("#idDevice_" + device).attr("LastStateUpdate") );			
		
		$("#idDivNomadsList div").remove(); // raffraichissement de la liste affichée de tous les devices
		
		for (let seenDevice of setDevicesSeen)
		{
			$("#idDivViewer").iviewer('updateDivObject',$('#idDevice_'+seenDevice),1,$.devicesLastUpdate[seenDevice]); 	// updater le device affichable comme 'on'
			if ($.deviceToState[seenDevice] == 0)		$().LogEvent("","",seenDevice + " --> 'on'");					// logguer le changement d'état du device			
			$.deviceToState[seenDevice] = 1;																			// mémoriser le dernier état du device					
		}	
		for (let notSeenDevice of setDevicesNotSeen)
		{
			$device = $('#idDevice_'+notSeenDevice);
			if ($device[0] != undefined) {$("#idDivViewer").iviewer('updateDivObject',$device,0,0);}					// updater le device affichable comme 'off'
			if ($.deviceToState[notSeenDevice] == 1)	$().LogEvent("","",notSeenDevice + " --> 'off'");				// logguer le changement d'état du device						
			$.deviceToState[notSeenDevice] = 0;																			// mémoriser le dernier état du device			
		}
		
		for (let deviceName of Object.keys($.deviceToState).sort())
		{
			var couleur = ($.deviceToState[deviceName] != 0) ? "#269309" : "#FF0000";
			$('#idDivNomadsList').append('<div style="color:' + couleur + '; font-weight:bold; width:100px">' + deviceName + '</div>'); // ajouter le device dans tous les devices			
		}
		
	}, 2000);	
	
	
	//------------------------------------------------------------------------------------------------------------------------------------//
	setInterval(function() 
	{
		// check or launcher notifier client				
		$.processIsRunning 	= CheckAndStartRFNotifierClient("./CheckAndStartRFNotifierClient.php");
		if ($.processIsRunning == undefined) {console.log("Invalid php request");}
		else if ($.processIsRunning.isRunning !== 0)
		{
			// get lastoutputs from RFNotifierClientDaemon output file and clear it
			$.lastEventOutputs 	= GrabRFNotifierOutputs("./GrabRFNotifierClient.php");			
			if ($.lastEventOutputs != undefined && $.lastEventOutputs.length != 0)
			{
				for(i=0 ; i < $.lastEventOutputs.length ; i++)
				if ("remote" in $.lastEventOutputs[i] && $.lastEventOutputs[i]["remote"] !== "UNKNOWN")	{ $().LogEvent($.lastEventOutputs[i]["remote"],$.lastEventOutputs[i]["code"],"");}
			}
		
		}
		else console.log("Cannot start RFNotifierClient");
	}, 2000);	
	
/*	
	//------------------------------------------------------------------------------------------------------------------------------------//
	//------------------------- 								JQUERY via JSONP 									----------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	var url="../data/test.json.callback?fonctionDeCallback=?";   
	// fonctionDeCallback est un paramètre fantome pour php ; 
	var jqxhr = $.getJSON(url);
	jqxhr.done(function(data) {console.log("Request done",data);});
	
	var url="../data/test.json.callback";   
	// fonctionDeCallback est un paramètre fantome pour php ; 
	// Pour JQuery la présence de <NomFonction>=? dans une requête JSON sert à indiquer qu'il faut exécuter une fonction javascript retournée par l'url, sans doute 
	// via la fonction eval() qui exécute du code contenu dans une string passée en paramètre
	$.get("../data/test.json").done(function(data) {console.log("Request $.get done",data);});
	jqxhr.done(function(data) {console.log("Request $.get done",data);});
	

	jQuery.ajax({
        url: "../data/test.json.callback",
        success: function (result) {if (result.isOk == false) console.log("Request jQuery.ajax done",result);},
        async: false
    });	
	console.log("JQUERY JSON jsoncallback called ", $.rfremotesJson);
*/	
	
});