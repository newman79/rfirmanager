$(document).ready(function() 
{
	var $button 		= $("#idBtnHideShowLeftPanel");
	var $leftpanel 		= $("#idDivLeftPanel");
	var $leftpanelCont 	= $("#idDivLeftPanelContent");
	var $rightpanel 	= $("#idDivRightPanel");
	var $resizer 		= $("#idDivResizer");
	var $viewer 		= $("#idDivViewer");
	var $divmore 		= $("#idDivMore");
	var $selectDevType 	= $("#idSelectDevType")
	var $selectDevName 	= $("#idSelectDeviceName");
	var $selectSignal 	= $("#idSelectCommandedWith");
	var $selectSignal 	= $("#idSelectCommandedWith");
	var $idInputDesc 	= $("#idInputDesc");
	
	
	var leftRightInter	= 8;
	var offsetleftWidth	= 3;
	
	/************************ Changement d'onglet en cliquant ************************/
    $(".tabs-menu a").click(function(event) {
        event.preventDefault();
        $(this).parent().addClass("current");
        $(this).parent().siblings().removeClass("current");
        var tab = $(this).attr("href");
		var tabdivIdStr = '#command-' + tab.replace('#','');
        $(".tab-content").not(tab).css("display", "none");		
        $(tab).fadeIn();
		$(tabdivIdStr).css("display", "none");
		$(tabdivIdStr).fadeIn();
    });
	
	/*********************** Fonction pour réduire ou augmenter le volet de gauche ************************/
	var ReduceOrShow = function(mustReduce)
	{
		var resizeWidth = $resizer.css("width").replace('px','')/2
		var minWidth	= Math.floor($leftpanel.attr("minWidth"));
		var maxWidth	= Math.floor($leftpanel.attr("maxWidth")); // actual max width
		var startWidth 	= Math.floor($leftpanel.css("width").replace('px',''));
		var endWidth 	= maxWidth;
	
		if (mustReduce == undefined)	{
			if (startWidth <= minWidth + leftRightInter) 	{endWidth=maxWidth; mustReduce=false;} 
			else											{endWidth=minWidth; mustReduce=true;}
		} 
		else if (mustReduce == false) 
		{ 
			endWidth=$leftpanel.attr("preferedWidth"); $leftpanel.attr("maxWidth",endWidth); 
			$divmore.css("display","none");			
		}	
		else {return;} // on ne prend que cette valeur en compte sinon on ne fait rien
		
		$leftpanel.animate({nowIs:new Date().getTime()},{
			duration: 300, 
			complete: function() { // appelée à la fin de l'animation				
				var buttonMaxHeight = $leftpanel.css("height");
				var todisplay = "none",buttonLabel="";
				var newLeft = endWidth - resizeWidth;
				if (mustReduce) 	{ todisplay = "none"; buttonLabel="&gt;&gt;"; $button.css("height",buttonMaxHeight);}
				else 				{ todisplay = "block"; buttonLabel="&lt;&lt;"; $button.css("height","28px");	newLeft+= leftRightInter;}
				$(".tabs-menu").css("display", todisplay);
				$leftpanelCont.css("display", todisplay);
				 
				$resizer.css("left",(newLeft-offsetleftWidth-2)+"px").css("display", todisplay);
				$button.html(buttonLabel);
				$viewer.iviewer('refreshViewer');								
				$().resizeAlljqGrids();
			},
			step: function(now, fx) { // pas à pas, fx représente le temps de début et de fin de l'animation
				//console.log("step"+now);
				var percent = (now - fx.start) / (fx.end - fx.start);
				var deltaWidth = endWidth - startWidth;				
				var newWidth = Math.floor(startWidth + percent * deltaWidth);
				var newWidthPx = newWidth+'px';
				var newLeft = newWidth + leftRightInter;
				var newLeftPx = newLeft+'px';
				$(this).css("width", newWidthPx);	// $(this)  est $leftpanel
				$rightpanel.css("left", newLeftPx);
				$resizer.css("left",(newWidth-resizeWidth)+"px");
			}
		});		
	}
	
	/************************ Animation pour cacher le panneau de gauche ************************/
	$("#idBtnHideShowLeftPanel").click(function() {ReduceOrShow();});
	
	$divmore.click(function() {ReduceOrShow(false);});
	
	/************************ Handler remplacé par le handler $resizer.draggable() : 
	$resizer.mousemove(function( event ) {		
		//var msg = "Handler for .mousemove() called at "; msg += event.pageX + ", " + event.pageY;
		if (event.buttons == 1) {. ..}
	});
	*/
	
	$leftpanel.attr("preferedWidth",$leftpanel.attr("maxWidth")); // fixe la width préférée. En dessous, il faudra afficher la div "..."
	
	/************************ Permet d'implémenter la fonction déplacable d'un élément DOM, la div idDivResizer; on surcharge drag en repositionnant tout le reste à chaque drag ************************/
	$resizer.draggable({
		drag: function(ev, ui ) {
			ui.position.top = 45* ui.position.height / 100;
			var newWidth 	= ui.position.left + offsetleftWidth;
			var newWidthPx 	= newWidth + "px";
			var newLeft 	= newWidth + leftRightInter;
			var newLeftPx 	= newLeft + "px";
			if (newLeft > 80 && newLeft < 800)
			{
				$leftpanel.css("width",newWidthPx);
				$("#idDivRightPanel").css("left", newLeftPx);
				$leftpanel.attr("maxWidth",newLeft);
				if ($leftpanel.attr("preferedWidth") > $leftpanel.css("width").replace('px','')) 		$divmore.css("display","block");
				else																					$divmore.css("display","none");
				$viewer.iviewer('refreshViewer');
			}
			else	{ev.preventDefault();} // on kill/consume l'événement pour ne pas aller plus loin. C'est pas terrible parce qu'on perd le drag du coup ...
			$().resizeAlljqGrids();
		}
	});

	$.each($.plans, function (i, item) {
		//console.log("Found plan ",item);
		$("#idInputLoadPlan").append($('<option>', {value: item, text : item }));
	});
	
	/************************ Selection d'un plan ************************/
	$("#idInputLoadPlan").change(function(){
		
		var selectedItemStr = $("#idInputLoadPlan option:selected").text();
		$viewer.iviewer('loadPlan',selectedItemStr);
	});
	
	
	//---------------------- called when an item is selected on device type select ----------------------//
	selectDeviceType = function(selected) {
		console.log("   calling selectDeviceType with selected=", selected);
		jsonPlan = $viewer.iviewer('getPlan');
		$selectDevName.find('option').remove();
		$selectSignal.find('option').remove();
		$("#idBtnSend").css("display","none");
		prefix=""
		if (selected === "433 RF commanded device" || selected === "433 RF Sensor") prefix="RF";
		else if (selected === "IR commanded device")								prefix="IR";
			
		for (var devName in jsonPlan["Objects"])	
		{
			if (prefix === "" || devName.startsWith(prefix)) {$selectDevName.append($('<option>', {value: devName, text : devName }));}
		}
		var deviceName = $selectDevName.children("option")[0];
		if (deviceName != undefined)
		{			
			deviceNameStr = deviceName.value;				
			$selectDevName.find('option[value="' + deviceNameStr +'"]').prop('selected',true);   
			$selectDevName.trigger('change'); //trigger a change instead of click			
		}
	};

	$selectDevType.change(function(){selectDeviceType($("#idSelectDevType option:selected").text());});	
	$selectDevName.change(function(){selectDeviceName($("#idSelectDeviceName option:selected").text());});
	$selectSignal.change(function(){$("#idBtnSendSignal").css("display","visible");});	

	//---------------------- called when an item is selected on device name select ----------------------//
	selectDeviceName = function(selected) {
		changeSelectionOnDiv($("#idDevice_"+selected));
		updateDevicePropertyFields($.selectedDevice);
		jsonPlan = $viewer.iviewer('getPlan');
		$selectSignal.find('option').remove();
		for (var signal in jsonPlan["Objects"][selected]["signalsTOstate"])	
		{
			sigArray = signal.split(".");
			signalStr = sigArray[sigArray.length-1];
			$OneOption = $('<option>', {value: signalStr, text : signalStr });			
			if (signalStr.indexOf('ON') > -1)		$OneOption.css('color','green');
			else if (signalStr.indexOf('OFF') > -1)	$OneOption.css('color','red');
			else 									$OneOption.css('color','orange');
			$selectSignal.append($OneOption);
		}
		
		// display or hide signals select
		var displaySignalsSelect = "none";
		if (Object.keys(jsonPlan["Objects"][selected]["signalsTOstate"]).length  != 0) { displaySignalsSelect = "visible"; }
		$selectSignal.css("display",displaySignalsSelect);		
		// hide send button
		$("#idBtnSendSignal").css("display","none");		
	}
	
	//---------------------- called when a div item is selected on div viewer ----------------------//
	selectDeviceOnViewer = function($selectedObject) // $selectedObject : Jquery object wrapping the div Device
	{
		changeSelectionOnDiv($selectedObject);
		$(".tabs-menu a[href='#tab-2']").trigger("click");		
		$selectDevType.find('option[value="Tous"]').prop('selected',true);   
		jsonPlan = $viewer.iviewer('getPlan');
		$selectDevName.find('option').remove();
		for (var devName in jsonPlan["Objects"]) {$selectDevName.append($('<option>', {value: devName, text : devName }));}
		
		deviceName 			= $.selectedDevice.attr("deviceName");
		$selectDevName.find('option[value="' + deviceName +'"]').prop('selected',true);   
		$selectDevName.trigger('change'); //trigger a change instead of click		
	}

	updateDevicePropertyFields = function($device) // $device : Jquery object wrapping the div Device
	{
		//--------- positionner les propriétés dans le tab de gauche ----------//		
		posXPercent = $device.attr('xPercent');
		posYPercent = $device.attr('yPercent');
		$("#idInputPosx").val(posXPercent).attr('value',posXPercent);
		$("#idInputPosy").val(posYPercent).attr('value',posYPercent);
		$("#idInputDesc").val($device.attr('id')).attr('value',$device.attr('id'));
		$("#idInputRangePosx").val(posXPercent);
		$("#idInputRangePosy").val(posYPercent);
		$("#idInputState").val($device.attr('state') != 0 ? 'ON':'OFF');
		$idInputDesc.val($device.attr('id') + "\n ip:" + $device.attr('deviceIp'));

		if ($device.attr('state') == 1) 	bgCol = "#d2ff7b";	else	bgCol = "#fdbfa7";		
		imageUrl = 'url(../img/';
		if ($device.attr('state') == 0) imageUrl += $device.attr('imageOff'); else imageUrl += $device.attr('imageOn');
		imageUrl += ')';
		$("#idInputState").css("background",bgCol);
		$device.css({background: bgCol + imageUrl,'background-size': '100% 100%'});
	}
	
	changeSelectionOnDiv = function($selected) // $selected : Jquery object wrapping the div Device
	{
		if ($.selectedDevice != undefined)	
		{
			$.selectedDevice.attr("isSelected","0");
			$viewer.iviewer('updateDivObject',$.selectedDevice,$.selectedDevice.attr('state'),$.selectedDevice.attr('xPercent'),$.selectedDevice.attr('yPercent'));
		}
		$.selectedDevice = $selected;
		$.selectedDevice.css("border","3px solid green").css("border-radius","10px");
		$.selectedDevice.attr("isSelected","1");
		$viewer.iviewer('updateDivObject',$.selectedDevice,$.selectedDevice.attr('state'),$.selectedDevice.attr('xPercent'),$.selectedDevice.attr('yPercent'));
	}
	
	$("#idInputRangePosx").change( function(){console.log("idInputRangePosx changed"); });	
	$(document).on('input', '#idInputRangePosx', function() { $viewer.iviewer('updateDivObject',$.selectedDevice,$.selectedDevice.attr('state'),$(this).val(),$.selectedDevice.attr('yPercent')); $("#idInputPosx").val($(this).val()); });
	$(document).on('input', '#idInputRangePosy', function() { $viewer.iviewer('updateDivObject',$.selectedDevice,$.selectedDevice.attr('state'),$.selectedDevice.attr('xPercent'),$(this).val()); $("#idInputPosy").val($(this).val()); });
	
	
	$("#idBtnSendSignal").click(function() {
		var result = undefined;
		var xmlhttp = new XMLHttpRequest();
		
		var deviceName = 'idDevice_' + $("#idSelectDeviceName option:selected").text();
		var remoteName = $("#" + deviceName).attr("remote");
		var signal = $("#idSelectCommandedWith option:selected").text();
		signal = signal.replace('_ON',''); signal = signal.replace('_OFF',''); signal = signal.replace('_UK1',''); signal = signal.replace('_UK2','');
		
		var targetSendUrl = "../php/SendCommand.php?remote=" + remoteName + "&signal="  + signal;
		
		xmlhttp.open('GET', targetSendUrl, false);  		// `false` makes the request synchronous
		// xmlhttp.timeout = 1000; 					// in milliseconds
		xmlhttp.send(null);
		console.log("targetSendUrl",targetSendUrl);
		if (xmlhttp.status === 200)  {console.log("Command has been sent");}
	});
	
	
});