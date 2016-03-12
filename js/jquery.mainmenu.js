$(document).ready(function() 
{
	var $button 		= $("#idBtnHideShowLeftPanel");
	var $leftpanel 		= $("#idDivLeftPanel");
	var $leftpanelCont 	= $("#idDivLeftPanelContent");
	var $rightpanel 	= $("#idDivRightPanel");
	var $resizer 		= $("#idDivResizer");
	var $viewer 		= $("#idDivViewer");
	var $divmore 		= $("#idDivMore");
	
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
});