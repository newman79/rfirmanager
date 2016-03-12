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
	// xmlhttp.onload = xhrSuccess;				// called if request is ok
	// xmlhttp.onerror = xhrError;				// called if request is ko
	// xmlhttp.callback = LoadJsonRemote;		// just to memorize callback function, which will be called on success by xhrSuccess()
	xmlhttp.open('GET', theurl, false);  		// `false` makes the request synchronous
	// xmlhttp.timeout = 1000; 					// in milliseconds
	xmlhttp.send(null);
	if (xmlhttp.status === 200) 
	{
		result = JSON.parse('' + xmlhttp.responseText);
	}
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
	console.log("Found :",Object.keys(jsonHashmap).length - remoteCount, "protocols ,", remoteCount,"remotes, ", result.length, "events");
	return result;
}

/***********************************************************************************************************************************************************************************************/
function DisplayAllEvents()
{
	for (var it in $.rfirevents) 
		console.log("RFIREvent:", $.rfirevents[it].name, $.rfirevents[it]);
}

// JSONP : function called by javascript executing bellowing section --- JQUERY via JSONP --- 
/* function LoadJsonRemote(data){console.log("JQUERY JSON jsoncallback data is ", data);} */

//*********************************************************************************************************************************************************************************************//
$(document).ready(function() 
{
	$.remotes = "NA";
	
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
	$.remotes 		= LoadFile('../data/RFSignals.json');	// $.remotes is global, i.e visible by all jQuery declarations and functions
	// console.log("$.remotes is ... " ,$.remotes);
	// console.log("protocol1 is ... " ,$.remotes['protocole1']);
	// console.log("protocol1,startlock_low_NbPulseLength is ... " ,$.remotes['protocole1']['startlock_low_NbPulseLength']);
	$.rfirevents 	= ExtractEvents($.remotes);
	//DisplayAllEvents();
	$.plans 		= ListDir("../data/",'.json','Plan');
	
	//------------------------------------------------------------------------------------------------------------------------------------//
	//-------------------------------------------------- Extraction des plans disponibles ------------------------------------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	
	
	
	
/*	
	//------------------------------------------------------------------------------------------------------------------------------------//
	//------------------------- 								JQUERY via JSONP 									----------------------//
	//------------------------------------------------------------------------------------------------------------------------------------//
	var url="../data/test.json.callback?fonctionDeCallback=?";   
	// fonctionDeCallback est un paramètre fantome pour php ; 
	// Pour JQuery la présence de <NomFonction>=? dans une requête JSON sert à indiquer qu'il faut exécuter une fonction javascript retournée par l'url, sans doute 
	// via la fonction eval() qui exécute du code contenu dans une string passée en paramètre
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
	console.log("JQUERY JSON jsoncallback called ", $.remotes);
*/	
	
});