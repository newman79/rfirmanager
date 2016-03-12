<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>RBPI : Domotic managment, RF/IR commands and signal events</title>
        <link rel="stylesheet" href="../css/jquery.iviewer.css" />
        <link rel="stylesheet" href="../css/jquery.mainmenu.css" />
        <link rel="stylesheet" href="../jquery-ui-1.11.4/jquery-ui.css" />
		<link rel="stylesheet" href="../jquery-ui-1.11.4.custom/jquery-ui.css" />
		
        <link rel="stylesheet" href="../jqGrid_JS_5_0_2/css/ui.jqgrid.css" />
		
        <!-- <script type="text/javascript" src="jquery-1.12.0.js">									</script> -->		
		<script type="text/javascript" src="../jqGrid_JS_5_0_2/js/jquery-1.11.0.min.js">			</script>
		
        <script type="text/javascript" src="../jquery-ui-1.11.4/jquery-ui.js">						</script>								
        <script type="text/javascript" src="../jquery-mousewheel-3.1.13/jquery.mousewheel.js">		</script>
        <script type="text/javascript" src="../js/rfir.model.js">										</script>
        <script type="text/javascript" src="../js/jquery.iviewer.js">									</script>
        <script type="text/javascript" src="../js/jquery.mainmenu.js">									</script>

		<script type="text/javascript" src="../jqGrid_JS_5_0_2/js/i18n/grid.locale-fr.js">			</script>
		<script type="text/javascript" src="../jqGrid_JS_5_0_2/js/jquery.jqGrid.min.js">			</script>							 
        <script type="text/javascript" src="../js/jquery.applievents.js">								</script>

        <script type="text/javascript">
            var $ = jQuery;
            $(document).ready(function(){
				/*
                  var iv1 = $("#viewer").iviewer({
                       src: "test_image.jpg", 
                       update_on_resize: false,
                       onStartDrag: function(ev, coords) { return false; }, //this image will not be dragged
                       onDrag: function(ev, coords) { }
                  });
				*/
				var mainViewer = $("#idDivViewer").iviewer({current_planName: "Plan1_RFIRObjects.json"});

				$("#chimg").click(function()
				{
					$("#idDivViewer").iviewer('loadImage', "../img/test_image2.jpg");
					return false;
				});
				
				$(".cCustomMenu li").click(function()
				{
					var itemStr = $(this).attr("data-action");
					console.log("data-action" + itemStr);
				
					// This is the triggered action name
					switch(itemStr) 
					{
						// A case for each action. Your actions here
						//case "first": alert("first"); break;
						//case "second": alert("second"); break;
					}
					$("#idUlContextMenu").hide(100); // Hide it AFTER the action was triggered
				  });
				});
				
				$(window).resize(function() {
					$().resizeAlljqGrids();
				});
				
        </script>
    </head>
    <body>
		<!-- **** Title **** -->
		<div style="position: absolute; top:0px; height:40px; line-height:40px; left:0px; right:0px; text-align:center; font-size:20px; border-radius:10px;	border: 3px ridge #4d91b7; background:#d4ddd3;">
			<b style="color:#3d81a7;">RBPI : Domotic managment, RF/IR commands and signal events</b>
		</div>
		<!-- **** Main content **** -->
		<div id="idDivContent" style="position: absolute; top:45px; bottom:10px; width:100%;">
			<!-- **** Left panel **** -->
			<div id="idDivLeftPanel" class="cDivLeftPanel" maxWidth="420" minWidth="20">
					<div id="idDivTabs" style=" padding:0px;margin:0px; position:absolute; top:0px; right:0px; left:0px; height:30px;">
						<ul class="tabs-menu">
							<li id="command-tab-1" class="current" title="Pour charger un plan, donc un fichier json sur le disque. ==> jfilechooser + propriété du plan chargé + plans récemment chargés + enregistrer le plan"><a href="#tab-1">Plan</a></li>
							<li id="command-tab-2" title="Editer les propriétés d'un objet RF/IR"><a href="#tab-2">Properties</a></li>
							<li id="command-tab-3" title="Consulter tous les événements : signaux recu"><a href="#tab-3">Events</a></li>
							<li id="command-tab-4" title="Définition des stratégies d'activations/désactivation des éléments"><a href="#tab-4">Strategies</a></li>
						</ul>
						<button id="idBtnHideShowLeftPanel" class="cBtnHideShowLeftPanel" type="button" style="position:absolute; top:0px;right:0px;">&lt;&lt;</button> 
						<div id="idDivMore" class="cDivMore"><b>...</b></div> 
					</div>

					<div id="idDivResizer" class="cDivResizer"> </div>
					
					<div id="idDivLeftPanelContent" class="menuItemContainer">					
						<div id="tab-1" class="tab-content">
							<fieldset class="cFieldsetObjectProperties">
								<legend>Avalaible plans</legend>
								<select size="6" id="idInputLoadPlan" name="idInputLoadPlan" style="width:100%" />
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Import a plan</legend>
								<label>Plan to import</label>					<input id="idInputImpPlan" 		type="file" 	name="idInputImpPlan" 		value="NA"  /><br />
								<label>Name of plan</label>						<input id="idInputNameOfPlan" 	type="text" 	name="idInputNameOfPlan" 	value="NA"  /><br />
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Export a plan</legend>
								<label>Plan to export</label>					<input id="idInputExpPlan"		type="text" 	name="idInputExpPlan" 	value="NA"  /><br />
								<label>Save in</label>							<input id="idInputExpPlan"		type="file" 	name="idInputExpPlan" 	value="NA"  /><br />
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Save the plan</legend>
								<label>Click to save</label>					<button id="idBtnSavePlan" 		type="button" style="font-size: 10px; position:relative; margin-top:5px; bottom:-2px;  height:20px;  border: 1px solid black;">Save</button>
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Save the plan as</legend>
								<label>Save as</label>							<input id="idInputSaveasPlan"	type="text" 	name="idInputSaveasPlan" 	value="NA"  /><br />
							</fieldset>
						
							<!--Pour charger/enregistrer un plan, donc un fichier json sur le disque. <br/>==> jfilechooser + propriété du plan chargé + plans récemment chargés + enregistrer le plan-->
							<br/> 
						</div>
						<div id="tab-2" class="tab-content">
							<fieldset class="cFieldsetObjectProperties">
								<legend>Common attributes</legend>
								<label>position.x</label>					<input id="idInputPosx"	type="text" 	name="propX" 	value="NA"  /> 	<input type="range"  min="0" max="100" /><br />
								<label>position.y</label>					<input id="idInputPosy"	type="text" 	name="propY" 	value="NA"  />  <input type="range"  min="0" max="100" /><br />								
								<label>Description</label>					<input id="idInputDesc"	type="text" 	name="propDesc"	value="NA"  /><br />								
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Specific attributes</legend>
								<label>Device type</label>								
																			<select name="select">
																				<option value="value1">Infrared device</option> 
																				<option value="value2" selected>433 RF device</option>
																				<option value="value3">433 RF Sensor</option>
																			</select>								
								<br />	
								
								<label>Commanded by</label>					<input type="text" 	name="propX" 	value="NA"  /> <button id="idPickRemote" type="button" style="position:relative; margin-top:5px; bottom:-2px;  height:20px;  border: 1px solid black;">...</button><br />
								<label>Remote signals</label>				<input type="text" 	name="propX" 	value="NA"  /><br />
								
							</fieldset>
							
							<button id="idBtnAddOrModify" class="cBtnAddOrModify" type="button" style="position:absolute; bottom:10px;right:10px;">Add or modify</button> 
							
						</div>
						<div id="tab-3" class="tab-content">
							<table 	id="idTableEvents" style="width: 100% !important;" width="100%"></table>
							<div 	id="idTableEventsPager"></div>
						</div>
						<div id="tab-4" class="tab-content">
							Définition des stratégies d'activations/désactivation des éléments
						</div>
					</div>
			</div>		
			
			
			<!-- **** Right panel **** ;  a wrapper div is needed for opera because it shows scroll bars for reason -->
			<div id="idDivRightPanel" class="cDivRightPanel">
				<!--
				<div style="display:block;">
					<span>
						<a id="in" href="#">+</a>
						<a id="orig" href="#">orig</a>
					</span>
				</div>
				-->
				
				<div id="idDivViewer" class="cIviewer"></div> <!-- The viewer div, with iviewer jquery ui plugin to see and manage background image and RF/IR elements -->
				
				<div id="idDivStatus" style="display:block;">
					<a href="#" id="chimg" style="display:block;">Change Image</a>
				</div>
			
				
			</div>
		</div>
		<!-- **** Le menu contextuel click droit **** -->
		<ul id="idUlContextMenu" class="cCustomMenu">
		  <div style="border-bottom :1px solid #313030; height:20px; margin-bottom:5px; background:#b3e4ff; text-align:center">Menu</div>
		  <li id="idLiContextMenu1" data-action="callActivateSelectedObject">Activer</li>
		  <li id="idLiContextMenu2" data-action="callDesactivateSelectedObject">Désactiver</li>
		  <div style="border-bottom :1px solid #313030; height:5px; margin-bottom:5px;"></div>
		  <li id="idLiContextMenu3" data-action="callMoveSelectedObject">Déplacer</li>
		  <li id="idLiContextMenu4" data-action="callEditSelectedObject">Editer</li>
		  <div style="border-bottom :1px solid #313030; height:5px; margin-bottom:5px;"></div>
		  <li id="idLiContextMenu5" data-action="callCancel">Annuler</li>
		</ul>				
		
    </body>
</html>
