$(document).ready(function() {
	
	var $eventsTable = $("#idTableEvents");
  
	var myevents = [	{horodate: "01/10/2007", 		remote: "Remote1",	command: "BTN_1",code: "0111101011101"}, 
					{horodate: "01/10/2007 11:52",	remote: "Remote2",	command: "BTN_2",code: "0110011001001"}];

	$eventsTable.jqGrid(
		{
			datatype: "local",
			data: myevents,
			colNames: ['Event at ', 'Remote', 'Button', 'Signal'],
			colModel: [	{name: 'horodate',	index: 'horodate',		key: true,	width: "90px",						sorttype: "date"	}, 
						{name: 'remote',	index: 'remote',					width: "90px"											}, 
						{name: 'command',	index: 'command',					width: "90px"											}, 
						{name: 'code',		index: 'code',						width: "90px",		align: "right",	sorttype: "float"	} 	],
			search: true,
			pager: '#idTableEventsPager',
			jsonReader: {cell: ""},
			rowNum: 100,
			rowList: [16, 100],
			sortname: 'remote',
			sortorder: 'asc',
			viewrecords: false,	
			width:"100%",
			height: "220px",
			caption: "Evénements",
		}
	);
  
	$eventsTable.jqGrid('navGrid', '#idTableEventsPager', {
		add: false,
		edit: false,
		del: false,
		search: true,
		refresh: true
		}, 
		{}, 
		{}, 
		{}, 
		{
			multipleSearch: true,
			multipleGroup: true,
			showQuery: true	
		}
	);
	
	
	// Ajouter des lignes au tableau
	for (var i = 0; i <= 100; i++) 
	{
		var newItem = {horodate: new Date().getTime(),	remote: "Remote2",	command: "BTN_2",code: "0110011001001"}
	//	$eventsTable.jqGrid('addRowData', 0, newItem);
	}
	
	$eventsTable.trigger("reloadGrid");
	
	// jQuery("#mygridid").jqGrid('getRowData')     ---> pour avoir toute les données de la table (Converted to JSON and packed as base64 I'm sending all the grid data via jQuery.post(...) back to the server)
	
	var $widgetJqGrid = $eventsTable.data('ui-jqgrid');
	
	console.log ($eventsTable);
	
	//$widgetJqGrid.aaabbb = function() {console.log( "aaabbb" );};
	//$widgetJqGrid.jqGrid("aaabbb");
	
	//console.log($widgetJqGrid);
	
	//------------------------- AJOUTER UNE METHODE A UN OBJET JQUERY -------------------------//
	// Solution1 :   
	$eventsTable.LogTheEvent = function(remoteVal, commandVal,codeVal)
	{
		// $(this) vaut $eventsTable
		var newTime = new Date();
		var dayStr;	if (newTime.getDay() < 10)	dayStr = '0' + newTime.getDay(); else dayStr = newTime.getDay();
		var monthStr;	if (newTime.getMonth() < 10)	monthStr = '0' + newTime.getMonth(); else monthStr = newTime.getMonth();
		
		var newTimeStr = '' + dayStr + '/' + monthStr + '/' + (newTime.getYear()+1900) + ' ' + newTime.getHours() + ':' + newTime.getMinutes() + ':' + newTime.getSeconds();		
		$(this).jqGrid('addRowData', 0, {horodate: newTimeStr,	remote: remoteVal,	command: commandVal,code: codeVal});
		$(this).trigger("reloadGrid"); 
		
	};	
	// Solution2 :   
	$.extend($eventsTable,{Log2:function() {console.log("Log2");}});	
	// Solution3 : mettre le code suivant dans le corps du constructeur ou de la fonction de création de l'objet
	$.fn.Log3 = function() { //$.fn is just an alias for the global jQuery objet's prototype
		var myObject = $(this); // $(this) représentera sans doute l'objet dans lequel la fonction est déclarée
		console.log("Log3",myObject);
	};
	jQuery.prototype.Log4= function() { console.log("Log4"); }; // cela signifie que jQuery.prototype = $.fin $ signifie jQuery et fn signifie prototype
	// Call defined methods
	//$eventsTable.Log1();
	//$eventsTable.Log1.call(this);
	//$eventsTable.Log2();
	//$eventsTable.Log3();
	// $().Log3(); $().Log4(); // Ca marche
	
	
	// Pour rendre la fonction globale ; pas d'autre moyen jusque là de faire un resize autrement, à part windows.mafonction = function() {...}
	// Ensuite, on peut appeler ça sur n'importe quel objet jquery ou même $() : $().LogEvent(...);
	$.fn.LogEvent = function(remote,command,code)
	{
		$eventsTable.LogTheEvent(remote,command,code);
		return this;
	}
	
	/* Pour rendre la fonction globale ; pas d'autre moyen jusque là de faire un resize autrement */	
	$.fn.resizeAlljqGrids = function() 
	{		
		var $eventsTableFirstParent = $eventsTable.closest(".ui-jqgrid").parent();
        $eventsTable.jqGrid("setGridWidth", $eventsTableFirstParent.width()-5, true); 	//$eventsTable.setGridWidth(520); works to
        $eventsTable.jqGrid("setGridHeight", $eventsTableFirstParent.height()-80, true);
		return this;
	}
	$().resizeAlljqGrids();
	
	
		
	$.fn.LogObj = function() {if (window.console && console.log) {console.log(this);} return this;}	
	// Permet de faire des appels comme ceci :	$(#monobjet).LogObj().UneMethodeDeLObjet();
	
	$().LogEvent("TELECOMM1","BTN1","0100011110101");
	console.log('C est un log avec l objet `$eventsTable` : gagné',$eventsTable, ' c pas fini');
	
	// 2 remarques : 
	//		- pas de polymorphisme : lire https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/
	// 		- si la methode Log1 est définie dans une classe de base BaseClass, l'appel à Log3 ne fera jamais appel à BaseClass.Log3.
	//				==> il faut, dans la redéfinition de Log3, faire appel à la fonction _super() ou _superApply
	
	//------------------------- AJOUTER UNE METHODE A UN WIDGET : en utilisant son instance -------------------------//
	/*	
	var dialogInstance = $( "<div id='11111'>" ).dialog().data("ui-dialog"); // Retrieve the dialog's instance and store it : http://stackoverflow.com/questions/8506621/accessing-widget-instance-from-outside-widget ;
	// Override the close() method for this dialog
	dialogInstance.close = function() {console.log( "close" );};	 
	dialogInstance.TestMethod = function() {console.log( "TestMethod" );};	 
	// Create a second dialog
	$("#11111").dialog();	
	// Select both dialogs and call close() on each of them. "close" will only be logged once.
	$(":data(ui-dialog)").dialog("close");	
	// Call TestMethod 1 
	$("#11111").dialog("TestMethod");
	// Call TestMethod 2
	$1111 = $("#11111")
	dialogInstance	= $1111.data("ui-dialog");
	dialogInstance.TestMethod();

	Because the plugin instance is directly linked to the DOM element, you can access the plugin instance directly instead of going through the exposed plugin method if you want. 
	This will allow you to call methods directly on the plugin instance instead of passing method names as strings and will also give you direct access to the plugin's properties.
	If the "custom-progressbar" widget has been developped
		var bar = $("<div></div>").appendTo("body").progressbar().data("custom-progressbar" );
		bar.option( "value", 50 );	
			// instead of 
		bar.progressbar( "option", "value", 100 );
	*/
		
	//$eventsTable.trigger("resize");
});
