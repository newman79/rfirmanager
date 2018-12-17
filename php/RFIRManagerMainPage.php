<?
	session_start();

	$expire = 365*24*3600;
	setcookie("nickname","xeros",time()+$expire);	setcookie("nom","monNom",time()+$expire);	setcookie("prenom","monPrenom",time()+$expire);

	$userlogin = $_SESSION['userlogin'];	
	
	if (isSet($_SESSION['SessionStartedAt'])){					
		if((mktime() - $_SESSION['SessionStartedAt'] - 15*30) > 0){
			unset($_SESSION['SessionStartedAt']);
			header("Location:../php/RFIRManagerLogin.php"); 
		} 
		else {
			$_SESSION['SessionStartedAt'] = mktime();
		}
	}
	else {header("Location:../php/RFIRManagerLogin.php");}	// Sinon, il faut mettre à jour la session
?>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>RBPI : Domotic managment, RF/IR commands and signal events</title>
		
        <link rel="stylesheet" href="../css/jquery.iviewer.css" />
        <link rel="stylesheet" href="../css/jquery.mainmenu.css" />
        <link rel="stylesheet" href="../../xms_common/js/jquery-ui-1.11.4/jquery-ui.css" />
		<link rel="stylesheet" href="../../xms_common/js/jquery-ui-1.11.4.custom/jquery-ui.css" />		
        <link rel="stylesheet" href="../../xms_common/js/jqGrid_JS_5_0_2/css/ui.jqgrid.css" />
		
		<script type="text/javascript" src="../../xms_common/js/jqGrid_JS_5_0_2/js/jquery-1.11.0.min.js">			</script>		
        <script type="text/javascript" src="../../xms_common/js/jquery-ui-1.11.4/jquery-ui.js">						</script>								
        <script type="text/javascript" src="../../xms_common/js/jquery-mousewheel-3.1.13/jquery.mousewheel.js">		</script>
        <script type="text/javascript" src="../js/rfir.model.js">													</script>
        <script type="text/javascript" src="../js/jquery.iviewer.js">												</script>
        <script type="text/javascript" src="../js/jquery.mainmenu.js">												</script>
		<script type="text/javascript" src="../../xms_common/js/jqGrid_JS_5_0_2/js/i18n/grid.locale-fr.js">			</script>
		<script type="text/javascript" src="../../xms_common/js/jqGrid_JS_5_0_2/js/jquery.jqGrid.min.js">			</script>							 
        <script type="text/javascript" src="../js/jquery.applievents.js">											</script>

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

				$("#chimg").click(function() { $("#idDivViewer").iviewer('loadImage', "../img/test_image2.jpg"); return false; });

				$(window).resize(function() { $().resizeAlljqGrids(); }); // Redimensionner le widgets jqgrid de l'onglet events
			});
        </script>
    </head>
    <body>
		<!-- **** Title **** -->
		<div style="position: absolute; top:0px; height:40px;  left:0px; right:0px; text-align:center; font-size:20px; border-radius:10px;	border: 3px ridge #4d91b7; background:#d4ddd3;">
			<b style="color:#3d81a7;">RBPI : Domotic managment, RF/IR commands and signal events</b>			
			<div style="float:right; width:100px;font-size:13px;"> <?echo $userlogin; ?> <br /> <a href="../php/RFIRManagerLogin.php">log out</a></div>
		</div>
		<!-- **** Main content **** -->
		<div id="idDivContent" style="position: absolute; top:45px; bottom:10px; width:100%;">
			<!-- **** Left panel **** -->
			<div id="idDivLeftPanel" class="cDivLeftPanel" maxWidth="360" minWidth="20">
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
								<label>position.x</label>					<input id="idInputPosx"				type="text" 	name="Posx"  style="width:40px; text-align:center;"		value="NA"  /> % <input id="idInputRangePosx" type="range"  min="0" max="100" /><br />
								<label>position.y</label>					<input id="idInputPosy"				type="text" 	name="Posy"  style="width:40px; text-align:center;"		value="NA"  /> % <input id="idInputRangePosy" type="range"  min="0" max="100" /><br />
								<label>State</label>						<input id="idInputState"			type="text" 	name="State" style="width:40px;background-color:#DDDDDD; text-align:center;"		value="NA" readonly /> <br />
								<label>Description</label>					<textarea  id="idInputDesc"	readonly		type="text"  	name="Desc"	 style="font-size: 10px; resize: none; width:190px;height:50px"		value="NA" rows="5"></textarea> <br />
							</fieldset>
							<fieldset class="cFieldsetObjectProperties">
								<legend>Specific attributes</legend>
								<label style="height:50px;top:-30px;line-height: 50px;">Device type</label>								
																			<select id="idSelectDevType" style="width:200px;outline: none;" size="4">
																				<option value="IR commanded device" selected>IR commanded device</option> 
																				<option value="433 RF commanded device">433 RF commanded device</option>
																				<option value="433 RF Sensor">433 RF Sensor</option>
																				<option value="Tous">Tous</option>
																			</select>								
								<br />	
								
								<label style="height:50px;top:-60px;line-height: 50px;">DeviceName</label>					
																			<select id="idSelectDeviceName"  size="6"	style="width:200px;"></select> <br />
								
								<label style="height:50px;top:-30px;line-height: 50px;">Signals</label>						
																			<select id="idSelectCommandedWith" size="8" 	style="width:200px;"></select> <br />
								<input id="idBtnSendSignal" type="button" style="position:relative; margin-left:150px; margin-top:5px; bottom:-3px; display:none; width:60px; height:40px;  border: 1px solid #4fb8ef; border-radius:6px; background:url(../img/ButtonSend.gif) center center no-repeat; background-size:100% 100%;" 
								onmouseover="this.style.border='4px solid #4fb8ef';" onmouseout="this.style.border='1px solid #4fb8ef';"></input> <br />&nbsp;
								
							</fieldset>
						</div>
						<div id="tab-3" class="tab-content">
							<table 	id="idTableEvents" style="width: 100% !important; font-size:8px;" width="100%"></table>
							<div 	id="idTableEventsPager"></div>
						</div>
						<div id="tab-4" class="tab-content">
							Définition des stratégies d'activations/désactivation des éléments
						</div>
					</div>
			</div>		
						
			<!-- **** Right panel **** ;  a wrapper div is needed for opera because it shows scroll bars for reason -->
			<div id="idDivRightPanel" class="cDivRightPanel">
				<div id="idDivViewer" class="cIviewer"></div> <!-- The viewer div, with iviewer jquery ui plugin to see and manage background image and RF/IR elements -->
				
				<div id="idDivStatus" style="display:block; height:10%;"> <!-- Fenetre des événements -->
					<textarea  id="idInputStatus"	readonly		type="text"  	name="Status"	 style="font-size: 10px; resize: none; display:block; width: 100%; -webkit-box-sizing: border-box;  -moz-box-sizing: border-box;  box-sizing: border-box; top:0px; bottom:0px; background:#EEEEEE; height:95%"	rows="3"></textarea>
				</div>
			</div>
		</div>
		<!-- **** Le menu contextuel click droit **** -->
		<ul id="idUlContextMenu" class="cCustomMenu">
		  <div id="idLiContextMenuLibelle" style="border-bottom :1px solid #313030; height:20px; margin-bottom:5px; background:#b3e4ff; text-align:center">Menu</div>
		  <li id="idLiContextMenuCustom1" data-action="callActivateSelectedObject">Send signal ON</li>
		  <li id="idLiContextMenuCustom2" data-action="callDesactivateSelectedObject">Send signal OFF</li>
		  <div id="idDivContextMenuFirstSeparator" style="border-bottom :1px solid #313030; height:5px; margin-bottom:5px;"></div>
		  <li id="idLiContextMenuEdit" data-action="callEditSelectedObject">Editer</li>
		  <div style="border-bottom :1px solid #313030; height:5px; margin-bottom:5px;"></div>
		  <li id="idLiContextMenuCancel" data-action="callCancel">Annuler</li>
		</ul>				
		
    </body>
</html>