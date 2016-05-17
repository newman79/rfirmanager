/*
 * iviewer Widget for jQuery UI
 * https://github.com/can3p/iviewer
 *
 * Copyright (c) 2009 - 2012 Dmitry Petrov
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Author: Dmitry Petrov
 * Version: 0.7.7
 */

// ici $ correspond à jQuery. C'est un appel de fonction anonyme. Ca isole les variables du reste des scripts extérieur ==> pas de risque de collision avec d'autres variables globales déclarées ailleurs
( function( $, undefined ) {

	//this code was taken from the https://github.com/furf/jquery-ui-touch-punch
	var mouseEvents = {
			touchstart: 'mousedown',
			touchmove: 'mousemove',
			touchend: 'mouseup'
		},
		gesturesSupport = 'ongesturestart' in document.createElement('div'); // Pattern "propriété in Objet" : récupère la valeur de la propriété ongesturestart de la div créée et la met dans gesturesSupport


	/**
	 * Convert a touch event to a mouse-like
	 * Pour comprendre un peu mieux, voir par exemple : https://developer.mozilla.org/en-US/docs/Web/API/Touch_events?redirectlocale=en-US&redirectslug=Web%2FGuide%2FTouch_events
	 *
	 * event.originalEvent est habituellement event d'origine qui a généré l'évenément event, qui est plus rafiné visiblement.
	 * Si le navigateur est compatible, et si l'événement était un événement Touch (tactile), alors then that API will be exposed through event.originalEvent
	 */
	function makeMouseEvent(event) 
	{
		var touch = event.originalEvent.changedTouches[0];  // changedTouches correspond à tous les Touch, i.e tous les points appuyés en même temps sur une écran tactile

		// Tout ce qui suit = propriété d'un événement de type mouse
		// pageX, pageY, screenX, screenY, clientX and clientY returns a number which indicates the number of physical "css pixels" a point is from the reference point. The event point is where the user clicked, the reference point is a point in the upper left. These properties return the horizontal and vertical distance from that reference point.
		// pageX and pageY		: Relative to the top left of the fully rendered content area in the browser. This reference point is below the url bar and back button in the upper left. This point could be anywhere in the browser window and can actually change location if there are embedded scrollable pages embedded within pages and the user moves a scrollbar.
		// screenX and screenY	: Relative to the top left of the physical screen/monitor, this reference point only moves if you increase or decrease the number of monitors or the monitor resolution.
		// clientX and clientY	: Relative to the upper left edge of the content area (the viewport) of the browser window. This point does not move even if the user moves a scrollbar from within the browser.
		
		return $.extend(event, {				// extend permet de merger dans event les propriétés de event et celles de tous les objets passés dans les paramètres suivants de la fonction
												// en l'occurence une map des propriétés typique des événements de type "mouse"
			type:    mouseEvents[event.type],	// mousedown, mousemove, mouseup
			which:   1,
			pageX:   touch.pageX,
			pageY:   touch.pageY,
			screenX: touch.screenX,
			screenY: touch.screenY,
			clientX: touch.clientX,
			clientY: touch.clientY,
			isTouchEvent: true
		});
	};

	var mouseProto = $.ui.mouse.prototype,				// retourne l'objet de base (dont les propriétés sont héritées) de jQuery.ui.mouse
		_mouseInit = $.ui.mouse.prototype._mouseInit;	// retourne la propriété _mouseInit de l'objet de base de jQuery.ui.mouse

	// affecte un code appelable à la fonction ._mouseInit. Du coup, on pourra faire mouseProto._mouseInit();
	
	//--------------------------------------- Ajoute la gestion des événements tactiles sur les écrans tactiles ------------------------------//
	mouseProto._mouseInit = function() {  							// equivalent à mouseProto._mouseInit = new function() { ...      Le new est implicite
		console.log("mouseProto._mouseInit() called by widget", this.widgetName); // appelé 2 fois : 1 par le iviewer, 1 par le draggable
		var self = this; // this correspondra à un widget créé dans ce fichier
		self._touchActive = false;

		// these delegates are required to keep context
		this._mouseDownDelegate = function(event) {	// bind attache un événement
			$statusConsole = $("#idInputStatus");	$statusConsole.val($statusConsole.val() + "\n iviewer._mouseDownDelegate()  e=" + e);
			if (gesturesSupport && event.originalEvent.touches.length > 1) 									{ return; }
			self._touchActive = true;
			return self._mouseDown(makeMouseEvent(event)); 	// _mouseDown() est par exemple définie dans le widget IViewer ==> elle sera appelée par le code self._mouseDown(makeMouseEvent(event));
		};
		
		this._mouseMoveDelegate = function(event) {
			if (gesturesSupport && event.originalEvent.touches && event.originalEvent.touches.length > 1) 	{ return; }
			if (self._touchActive) 																			{ return self._mouseMove(makeMouseEvent(event)); }
		};
		this._mouseUpDelegate = function(event) {
			$statusConsole = $("#idInputStatus");	$statusConsole.val($statusConsole.val() + "\n iviewer._mouseUpDelegate()  e=" + e);
			if (self._touchActive) 																			{ self._touchActive = false;		return self._mouseUp(makeMouseEvent(event)); }
		}; 													// _mouseUp() est par exemple définie dans le widget IViewer ==> elle sera appelée par le code self._mouseDown(makeMouseEvent(event));

		this.element.bind('touchstart.' + this.widgetName	, this._mouseDownDelegate);
		$(document).bind('touchmove.'+ this.widgetName		, this._mouseMoveDelegate);
		$(document).bind('touchend.' + this.widgetName		, this._mouseUpDelegate);
		
		_mouseInit.apply(this);
	}

	/**
	 * Simple implementation of jQuery like getters/setters
	 * var val = something();
	 * something(val);
	 */
	var setter = function(setter, getter) {
		return function(val) {
			if (arguments.length === 0) {
				return getter.apply(this);
			} else {
				setter.apply(this, arguments);
			}
		}
	};

	/**
	 * Internet explorer rotates image relative left top corner, so we should
	 * shift image when it's rotated.
	 */
	var ieTransforms = {
			'0': {
				marginLeft: 0,
				marginTop: 0,
				filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, SizingMethod="auto expand")'
			},

			'90': {
				marginLeft: -1,
				marginTop: 1,
				filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=0, M12=-1, M21=1, M22=0, SizingMethod="auto expand")'
			},

			'180': {
				marginLeft: 0,
				marginTop: 0,
				filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=-1, M12=0, M21=0, M22=-1, SizingMethod="auto expand")'
			},

			'270': {
				marginLeft: -1,
				marginTop: 1,
				filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=0, M12=1, M21=-1, M22=0, SizingMethod="auto expand")'
			}
		},
		// this test is the inversion of the css filters test from the modernizr project
		useIeTransforms = function() {
			var el = document.createElement('div');
			el.style.cssText = ['-ms-','' ,''].join('filter:blur(2px); ');
			return !!el.style.cssText && document.documentMode < 9;
		}();

	/**************************************************************************************************************************************************************************  */
	/************************************** Déclaration du widget iviewer *************************************************************  */
	var iviewerMouseDownIsClick = false;
	
	$.widget( "ui.iviewer", $.ui.mouse, {
		widgetEventPrefix: "iviewer",
		// Ce sont les options par défaut, elles doivent être surchargées si besoin lors de l'appel du constructeur du iviewer (voir le javascript dans la page php. On surcharge notamment current_plan)
		options : {
			/**
			* start zoom value for image, not used now
			* may be equal to "fit" to fit image into container or scale in %
			**/
			zoom: "fit",
			zoom_base: 100, /** base value to scale image **/
			zoom_max: 1800,	/** maximum zoom **/			
			zoom_min: 20, 	/** minimum zoom **/
			/**
			* base of rate multiplier.
			* zoom is calculated by formula: zoom_base * zoom_delta^rate
			**/
			zoom_delta: 1.4,
			zoom_animation: true,	/** whether the zoom should be animated. */
			ui_disabled: false, 	/** if true plugin doesn't add its own controls	**/			
			mousewheel: true,		/** If false mousewheel will be disabled */
			update_on_resize: true, /** if false, plugin doesn't bind resize event on window and this must be handled manually **/
			current_planName : "", /** current loaded plan */
			current_plan : jQuery.noop, /** current loaded plan */
			current_background : jQuery.noop, /** current loaded background image name in the current_plan */
			/**
			* event is triggered when zoom value is changed
			* @param int new zoom value
			* @return boolean if false zoom action is aborted
			**/
			onZoom: jQuery.noop,
			/**
			* event is triggered when zoom value is changed after image is set to the new dimensions
			* @param int new zoom value
			* @return boolean if false zoom action is aborted
			**/
			onAfterZoom: jQuery.noop,
			/**
			* event is fired on drag begin
			* @param object coords mouse coordinates on the image
			* @return boolean if false is returned, drag action is aborted
			**/
			onStartDrag: jQuery.noop,
			/**
			* event is fired on drag action
			* @param object coords mouse coordinates on the image
			**/
			onDrag: jQuery.noop,
			/**
			* event is fired on drag stop
			* @param object coords mouse coordinates on the image
			**/
			onStopDrag: jQuery.noop,
			/**
			* event is fired when mouse moves over image
			* @param object coords mouse coordinates on the image
			**/
			onMouseMove: jQuery.noop,
			/**
			* mouse click event
			* @param object coords mouse coordinates on the image
			**/
			onClick: jQuery.noop		/*function(evt, coords) {this.processOnClick(evt)}*/,
			onStartLoad: jQuery.noop, 	/** event is fired when image starts to load */			
			onFinishLoad: null, 		/** event is fired, when image is loaded and initially positioned */			
			onErrorLoad: null 			/** event is fired when image load error occurs	*/
		},

		_create: function() {
			var me = this;

			//drag variables
			this.dx = 0;
			this.dy = 0;

			/* object containing actual information about image
			*   @img_object.object - jquery img object
			*   @img_object.orig_{width|height} - original dimensions
			*   @img_object.display_{width|height} - actual dimensions
			*/
			this.img_object = {};

			this.zoom_object = {}; //object to show zoom status

			this._angle = 0;

			this.current_zoom = this.options.zoom;

			// if(this.options.src === null){return;} // Je l'ai retiré : ça me parait bizarre de s'arreter à initialiser le reste s'il n'y a pas d'image
			
			// this.element     est l'élément sur lequel on a appelé la fonction iviewer().  Lors de l'instanciation du widget :	 var iv2 = $("#idDivViewer").iviewer(...);
			// Il se trouve donc que c'est donc l'objet jquery $(#idDivViewer). Donc this = l'object plugin iviewer, et this.element=$(#idDivViewer)
			this.container = this.element; 
			
			this._updateContainerInfo();

			//init container
			this.container.css("overflow","hidden");

			if (this.options.update_on_resize == true) 
				$(window).resize(function() {me.update();});			

			this.img_object = new $.ui.iviewer.ImageObject(this.options.zoom_animation, this);
			this.img_object.setViewer(this);

			if (this.options.mousewheel) {
				this.container.bind('mousewheel.iviewer', function(ev, delta) {
						//this event is there instead of containing div, because at opera it triggers many times on div
						var zoom = (delta > 0) ? 1 : -1,
							container_offset = me.container.offset(),	// coordonnées de la div de iviewer dans le document entier
							mouse_pos = {	// coordonnées de l'événement dans la div ; (pageX,pageY) = coordonnées événements dans document entier
								x: ev.pageX - container_offset.left,
								y: ev.pageY - container_offset.top
							};
						me.zoom_by(zoom, mouse_pos);
						return false;
				});

				if (gesturesSupport) {
					var gestureThrottle = +new Date();
					var originalScale, originalCenter;
					this.img_object.object()
						// .bind('gesturestart', function(ev) {
						.bind('touchstart', function(ev) {
							originalScale = me.current_zoom;
							var touches = ev.originalEvent.touches,
								container_offset;
							if (touches.length == 2) {
								container_offset = me.container.offset();
								originalCenter = {
									x: (touches[0].pageX + touches[1].pageX) / 2  - container_offset.left,
									y: (touches[0].pageY + touches[1].pageY) / 2 - container_offset.top
								};
							} else {
								originalCenter = null;
							}
						}).bind('gesturechange', function(ev) {
							//do not want to import throttle function from underscore
							var d = +new Date();
							if ((d - gestureThrottle) < 50) { return; }
							gestureThrottle = d;
							var zoom = originalScale * ev.originalEvent.scale;
							me.set_zoom(zoom, originalCenter);
							ev.preventDefault(); // preventDefault is used to prevent default action for the target on which event occurs
						}).bind('gestureend', function(ev) {
							originalCenter = null;
						});
				}
			}

			//init object
			this.img_object.object()
				//bind mouse events
				.click(function(e){/*console.log("handled_ me(img_object)._click(e);");*/ return me._click(e)})
					.prependTo(this.container);

			this.container.bind('mousemove', function(ev) { me._handleMouseMove(ev); });

			if(!this.options.ui_disabled) {this.createui();}

			this.loadPlan(this.options.current_planName);
			
			this._mouseInit(); // appel de l'initialisation : _mouseinit() est une méthode de jQuery.ui.mouse, mais elle a été surchargée plus haut 
			
			this.container.bind("contextmenu", function (event) {
				
				event.preventDefault();	// Avoid the real one
				if (event.target.id != undefined && event.target.id.indexOf("idDevice") != -1)
					$("#idUlContextMenu").finish().css("display","inline").css("top",event.pageY+"px").css("left",event.pageX+"px"); // Show contextmenu at mouse event coordinates in document
			});
			
			this._on({"click": function(evt, coords) {/*console.log("handled_on('click')");*/ me.processOnClick(evt);} /*, "mouseout": function(evt, coords) {console.log("mouseout",evt, coords);}*/	});			
		} /************** end of _create override ***********/,

		destroy: function() {
			$.Widget.prototype.destroy.call(this);
			this._mouseDestroy();
			this.img_object.object().remove();
			this.container.off('.iviewer');
			this.container.css('overflow', ''); //cleanup styles on destroy
		},

		_updateContainerInfo: function()
		{
			this.options.height = this.container.height();
			this.options.width = this.container.width();
		},

		update: function()
		{
			this._updateContainerInfo()
			this.setCoords(this.img_object.x(), this.img_object.y());
		},
		
		/** process OnClick */
		processOnClick : function(evt)
		{	
			/*console.log("handled_processOnClick()");*/
			targetName = evt.target.nodeName;
			if (targetName == "DIV" || targetName == "Div" || targetName == "div")	{console.log("processOnClick not in image ==> Not processed");return;}
			if (evt.eventPhase == 3) return; // en fait la fonction est appelée 2 fois : evt.eventPhase == 2 ==> btn down ? evt.eventPhase == 3 ==> btn up ?
			
			clickcoordsInImageX = evt.originalEvent.offsetX;
			clickcoordsInDivX = clickcoordsInImageX + this.img_object.x();
			clickcoordsInImageY = evt.originalEvent.offsetY;
			clickcoordsInDivY = clickcoordsInImageY + this.img_object.y();						
			distanceMin = 999999;
			var $selectedObject = undefined;			
			for (var key in this.allDivObjects) 
			{
				var $jobjet = this.allDivObjects[key];
				var distanceX = clickcoordsInDivX - $jobjet.css("left").replace('px','') - $jobjet.css("width").replace('px','')/2;
				var distanceY = clickcoordsInDivY - $jobjet.css("top").replace('px','') - $jobjet.css("height").replace('px','')/2;
				var distance = distanceX * distanceX + distanceY * distanceY;
				if (distance < distanceMin)	{$selectedObject = $jobjet;		distanceMin = distance;	}
			}
			selectDeviceOnViewer($selectedObject);
			
			if ($("#idDivSelectAnchor").attr('anchor').replace('px','')==1) { // tente de positionner l'image pour que l'object sélectionné soie au centre de la div iviewer
				this.dragInOrderToCenter($selectedObject.css("left").replace('px','') + Math.floor($selectedObject.css("width").replace('px','')/2),$selectedObject.css("top").replace('px','') + Math.floor($selectedObject.css("height").replace('px','')/2));
			}	
		},	
		
		/** Going to ith background image : delta = 1 ou -1 */
		changeBackground : function(delta)
		{
			var bgNames = Object.keys(this.options.current_plan["Backgrounds"]);
			var i=0; for(i=0 ; i < bgNames.length ; i++) if (bgNames[i] == this.options.current_background)	{break;} // find index of current background name
			var newIdx = i + delta;
			if (newIdx > bgNames.length-1 || newIdx < 0)	return;
			this.setBackground(bgNames[newIdx]);
		},
		/** previous loadImage function : now is a function to loadImage in a plan */
		setBackground: function( backgroundName )
		{
			if (backgroundName == undefined) return;
			this.options.current_background = backgroundName;
			var urlsrc 			= "../img/" + this.options.current_plan["Backgrounds"][backgroundName].src;	// charge la 1er image de fond définie dans ce plan
			this.options.current_background_width 	= this.options.current_plan["Backgrounds"][backgroundName].width;
			this.options.current_background_height 	= this.options.current_plan["Backgrounds"][backgroundName].height;
			$("#idDivSelectedBg").text("<" + this.options.current_background + ">");
			
			//this.current_zoom = this.options.zoom;
			var me = this;
			this._trigger('onStartLoad', 0, urlsrc);
			this.container.addClass("iviewer_loading");
			this.img_object.load(urlsrc, function() {me._imageLoaded(urlsrc);}, function() {me._trigger("onErrorLoad", 0, urlsrc);});
			
		},
		
		_imageLoaded: function(src) {
			this.container.removeClass("iviewer_loading");
			this.container.addClass("iviewer_cursor");
			if(this.options.zoom == "fit"){this.fit(true);}
			else {this.set_zoom(this.options.zoom, true);}
			this._trigger('onFinishLoad', 0, src);
		},
		
		/** load a whole plan */
		loadPlan: function(planName)
		{
			if (this.options.current_plan == undefined) return;			
			//--------- load image ----------//
			this.options.current_plan		= LoadFile('../data/' + planName);
			this.options.current_background	= Object.keys(this.options.current_plan["Backgrounds"])[0]; 	// récupère la clé du 1er élément de la hashmap $.rfirobjects["Backgrounds"]
			this.setBackground(this.options.current_background);
			//--------- load objects --------//			
			//this.container.find($("div[id*='id_elecobject_']"));
			for (var it in this.allDivObjects)
				this.allDivObjects[it].remove();
			
			for (var objName in this.options.current_plan["Objects"])
			{
				newObject = this.options.current_plan["Objects"][objName];
				if (newObject["position"].x != 0 && newObject["position"].y !=0)
					this.addDivObject(objName ,newObject["position"].x, newObject["position"].y, 2, 2, newObject["type"], 0, newObject["imageOn"], newObject["imageOff"], {remote:newObject["remote"]});				
			}
			
		},		
		getPlan: function()	{return this.options.current_plan;},

		/**
		* fits image in the container
		* @param {boolean} skip_animation
		**/
		fit: function(skip_animation)
		{
			var aspect_ratio = this.img_object.orig_width() / this.img_object.orig_height();
			var window_ratio = this.options.width /  this.options.height;
			var choose_left = (aspect_ratio > window_ratio);
			var new_zoom = 0;
			// choose_left = mécanisme pour que l'image ne dépasse pas la div en hauteur ou en largeur
			if(choose_left)		new_zoom = this.options.width / this.img_object.orig_width() * 100; 	
			else 				new_zoom = this.options.height / this.img_object.orig_height() * 100;
			
			// au final, new_zoom correspond au zoom qu'il faut faire de l'image d'origine pour remplir complètement la largeur ou la hauteur du viewer
		  this.set_zoom(new_zoom, skip_animation);
		},

		/** center image in container : divWidth/2 = centreDiv ==> divWidth/2 - imgWith/2 = coin gauche de l'image pour qu'elle soient centrée par rapport à centreDiv ; idem pour height **/
		center: function()
		{
			this.setCoords(Math.round((this.options.width - this.img_object.display_width())/2),Math.round((this.options.height - this.img_object.display_height())/2));
		},

		/**
		*   move(drag) the image in order to make the given argument selected point in image become the center of display area (div iviewer)
		*   @param x a point in container
		*   @param y a point in container
		*   Faire un dessin pour comprendre : très simple : pour aller du centre au click, il faut se déplacer de dx puis dy (calculé ci-dessous)
		*	==> pour que le click se retrouve au centre, il translater l'image de -dx et -dy
		**/
		dragInOrderToCenter: function(x, y)
		{
			var dx = x - Math.round(this.options.width/2);
			var dy = y - Math.round(this.options.height/2);

			var new_x = this.img_object.x() - dx;
			var new_y = this.img_object.y() - dy;

			this.setCoords(new_x, new_y);
		},

		/**
		 * Get container offset object.
		 */
		getContainerOffset: function() {return jQuery.extend({}, this.container.offset());},

		/**
		* set coordinates of upper left corner of image object
		**/
		setCoords: function(x,y)
		{
			//do nothing while image is being loaded
			if(!this.img_object.loaded()) { return; }

			var coords = this._correctCoords(x,y);
			this.img_object.x(coords.x);
			this.img_object.y(coords.y);
		},

		_correctCoords: function( x, y )
		{
			x = parseInt(x, 10);
			y = parseInt(y, 10);
			//check new coordinates to be correct (to be in rect)
			if( y > 0 ) {y = 0;}
			if( x > 0 ) {x = 0;}
			if(y + this.img_object.display_height() < this.options.height)	{y = this.options.height - this.img_object.display_height();}
			if(x + this.img_object.display_width() < this.options.width)	{x = this.options.width - this.img_object.display_width();}
			if(this.img_object.display_width() <= this.options.width)		{x = (this.options.width - this.img_object.display_width())/2;}
			if(this.img_object.display_height() <= this.options.height)		{y = (this.options.height-this.img_object.display_height())/2;}
			return { x : x, y : y };
		},

		/**
		* convert coordinates on the container to the coordinates on the image (in original size)
		* @return object with fields x,y according to coordinates or false
		* if initial coords are not inside image
		**/
		containerToImage : function (x,y)
		{
			var coords = { x : x - this.img_object.x(),	 y :  y - this.img_object.y()	};
			coords = this.img_object.toOriginalCoords(coords); 	// convertit (par rotation) les coordonnées coords pour les avoir dans l'image d'origine.
			return { x :  util.descaleValue(coords.x, this.current_zoom), y :  util.descaleValue(coords.y, this.current_zoom)}; // divise par le zoom courant pour avoir les coordonnées d'origine.
		},

		/**
		* convert coordinates on the image (in original size, and zero angle) to the coordinates on the container
		* @return object with fields x,y according to coordinates
		**/
		imageToContainer : function (x,y)
		{
			var coords = {x : util.scaleValue(x, this.current_zoom),y : util.scaleValue(y, this.current_zoom)};
			return this.img_object.toRealCoords(coords);
		},

		/**
		* get mouse coordinates on the image
		* @param e - object containing pageX and pageY fields, e.g. mouse event object
		*
		* @return object with fields x,y according to coordinates or false
		* if initial coords are not inside image
		**/
		_getMouseCoordsInImg : function(e)
		{
			var containerOffset = this.container.offset(); // position de la div du iviewer dans le document entier
			coords = this.containerToImage(e.pageX - containerOffset.left, e.pageY - containerOffset.top);	// coords = coordonnées de l'événement dans l'image
			return coords;
		},

		/**
		* Set image scale to the new_zoom
		* @param {number} new_zoom image scale in %
		* @param {boolean} skip_animation
		* @param {x: number, y: number} Coordinates of point the should not be moved on zoom. The default is the center of image.
		**/
		set_zoom: function(new_zoom, skip_animation, zoom_center)
		{
			if (this._trigger('onZoom', 0, new_zoom) == false) {return;}
			
			var bgsize = Math.floor(25 * new_zoom / 100);
			this.container.css("background-size",bgsize+"px " + bgsize+"px"); // modify checkerboard's tile size

			//do nothing while image is being loaded
			if(!this.img_object.loaded()) { return; }

			// si pas positionné, fixer zoom_center au centre du viewer
			zoom_center = zoom_center 	||		 { x: Math.round(this.options.width/2), 	y: Math.round(this.options.height/2) };

			/* console.log("new_zoom=",new_zoom); */
			
			// empecher le zoom de sortir des limites de zoom
			if(new_zoom <  this.options.zoom_min)		{new_zoom = this.options.zoom_min;}
			else if(new_zoom > this.options.zoom_max)	{new_zoom = this.options.zoom_max;}

			/* we fake these values to make fit zoom properly work */
			if(this.current_zoom == "fit")
			{
				var old_x = zoom_center.x + Math.round(this.img_object.orig_width()/2);
				var old_y = zoom_center.y + Math.round(this.img_object.orig_height()/2);
				this.current_zoom = 100;
			}
			else {
				var old_x = -this.img_object.x() + zoom_center.x; // old_x = au zoom courant, la distance en pixels en abscisse entre le coté gauche de l'image et zoom_center 
				var old_y = -this.img_object.y() + zoom_center.y; // old_y = au zoom courant, la distance en pixels en ordonnée entre le coté haut de l'image et zoom_center 
			}

			var new_width = util.scaleValue(this.img_object.orig_width(), new_zoom);  	// new_width = la largeur en pixel que l'image occupera avec le nouveau zoom
			var new_height = util.scaleValue(this.img_object.orig_height(), new_zoom);	// new_height = la hauteur en pixel que l'image occupera avec le nouveau zoom
			var new_x = util.scaleValue( util.descaleValue(old_x, this.current_zoom), new_zoom);  // descale permet de renormaliser oldx avec la taille d'origine de l'image, puis scale calcul oldx dans avec le nouveau zoom
			var new_y = util.scaleValue( util.descaleValue(old_y, this.current_zoom), new_zoom);

			new_x = zoom_center.x - new_x;  // il n'y a plus qu'à retrancher new_x a zoom_center.x  pour définir quel est la nouvelle abscisse en pixel du coté gauche de l'image
			new_y = zoom_center.y - new_y;

			new_width = Math.floor(new_width);    	// rendre les valeurs entières
			new_height = Math.floor(new_height);	// idem
			new_x = Math.floor(new_x);				// idem
			new_y = Math.floor(new_y);				// idem

			this.img_object.display_width(new_width);
			this.img_object.display_height(new_height);

			var coords = this._correctCoords(new_x, new_y);
			self = this;
			this.img_object.setImageProps(new_width, new_height, coords.x, coords.y, skip_animation, function() {self._trigger('onAfterZoom', 0, new_zoom );});
			this.current_zoom = new_zoom;
			this.update_scaleAndZoomLabel();
		},

		/**
		* changes zoom scale by delta
		* zoom is calculated by formula: zoom_base * zoom_delta^rate
		* @param Integer delta number to add to the current multiplier rate number
		* @param {x: number, y: number=} Coordinates of point the should not be moved on zoom.
		**/
		zoom_by: function(delta, zoom_center)
		{
			var closest_rate = this.find_closest_zoom_rate(this.current_zoom);

			var next_rate = closest_rate + delta;
			var next_zoom = this.options.zoom_base * Math.pow(this.options.zoom_delta, next_rate)
			
			if(delta > 0 && next_zoom < this.current_zoom)
			{
				next_zoom *= this.options.zoom_delta;
			}
			if(delta < 0 && next_zoom > this.current_zoom) // la 2e comparaison sert à ? : peut etre vérifier que next_zoom != current_zoom
			{
				next_zoom /= this.options.zoom_delta;
			}

			this.set_zoom(next_zoom, undefined, zoom_center);
		},

		/**
		* Rotate image
		* @param {num} deg Degrees amount to rotate. Positive values rotate image clockwise.
		*     Currently 0, 90, 180, 270 and -90, -180, -270 values are supported
		*
		* @param {boolean} abs If the flag is true if, the deg parameter will be considered as
		*     a absolute value and relative otherwise.
		* @return {num|null} Method will return current image angle if called without any arguments.
		**/
		angle: function(deg, abs) {
			if (arguments.length === 0) { return this.img_object.angle(); }

			if (deg < -270 || deg > 270 || deg % 90 !== 0) { return; }
			if (!abs) { deg += this.img_object.angle(); }
			if (deg < 0) { deg += 360; }
			if (deg >= 360) { deg -= 360; }

			if (deg === this.img_object.angle()) { return; }

			this.img_object.angle(deg);
			//the rotate behavior is different in all editors. For now we  just center the
			//image. However, it will be better to try to keep the position.
			this.center();
			this._trigger('angle', 0, { angle: this.img_object.angle() });
		},

		/**
		* finds closest multiplier rate for value
		* basing on zoom_base and zoom_delta values from settings
		* @param Number value zoom value to examine
		**/
		find_closest_zoom_rate: function(value)
		{
			if(value == this.options.zoom_base)	{return 0;}

			function div(val1,val2) { return val1 / val2 };
			function mul(val1,val2) { return val1 * val2 };

			var func = (value > this.options.zoom_base)?mul:div;
			var sgn = (value > this.options.zoom_base)?1:-1;

			var mltplr = this.options.zoom_delta;
			var rate = 1;

			while(Math.abs(func(this.options.zoom_base, Math.pow(mltplr,rate)) - value) >
				  Math.abs(func(this.options.zoom_base, Math.pow(mltplr,rate+1)) - value))
			{
				rate++;
			}

			return sgn * rate;
		},

		/* update scale info in the container */
		update_scaleAndZoomLabel: function()
		{
			if(!this.options.ui_disabled)
			{
				var percent = Math.round(100*this.img_object.display_height()/this.img_object.orig_height());
				if(percent) {this.zoom_object.html(percent + "%");} // affichage du zoom
				
				// mise à jour de l'échelle
				var distanceXinDiv = this.options.current_background_width * (this.options.width / this.img_object.display_width()); 	// calcul de la distance en mètres de l'emprise (div iviewer) ; current_background_width contient la distance en metre de toute l'image
				var distanceXofScaleXBar = (scaleXBarWidth / this.options.width) * distanceXinDiv;										// calcul de la distance en mètres des scaleXBarWidth pixels représentés
				distanceXofScaleXBar = Math.floor(distanceXofScaleXBar * 100) / 100; // pour tronquer à 2 caractères après la virgule
				$('#idDivScaleVal').html(distanceXofScaleXBar + "m").val(distanceXofScaleXBar + "m");	// affichage de l'échelle en X
			}
		},

		/**
		 * Get some information about the image.
		 *     Currently orig_(width|height), display_(width|height), angle, zoom and src params are supported.
		 *
		 *  @param {string} parameter to check
		 *  @param {boolean} withoutRotation if param is orig_width or orig_height and this flag is set to true,
		 *      method will return original image width without considering rotation.
		 *
		 */
		info: function(param, withoutRotation) {
			if (!param) { return; }

			switch (param) {
				case 'orig_width':
				case 'orig_height':
					if (withoutRotation) {
						return (this.img_object.angle() % 180 === 0 ? this.img_object[param]() :
								param === 'orig_width' ? this.img_object.orig_height() : 
															this.img_object.orig_width());
					} else {
						return this.img_object[param]();
					}
				case 'display_width':
				case 'display_height':
				case 'angle':
					return this.img_object[param]();
				case 'zoom':
					return this.current_zoom;
				case 'src':
					return this.img_object.object().attr('src');
				case 'coords':
					return {
						x: this.img_object.x(),
						y: this.img_object.y()
					};
			}
		},

		//---- Les fonctions ci-dessous commencent par des '_' ==> ce sont des fonctions privées ; en l'occurrence, elles surchargent les méthodes privées du widget mouse ----//
		
		/**  callback for handling mousdown event to start dragging image **/
		_mouseStart: function( e )
		{
			if (this._trigger('onStartDrag', 0, this._getMouseCoordsInImg(e)) === false) {return false;}
			$.ui.mouse.prototype._mouseStart.call(this, e);
			/* start drag event*/
			this.container.addClass("iviewer_drag_cursor");
			this._dragInitialized = !(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length==1); //un seul point de touche
			this.dx = e.pageX - this.img_object.x();	// dx = distance en pixel entre le click.x et le coin gauche de l'image
			this.dy = e.pageY - this.img_object.y();	// dy = idem avec y
			return true;
		},

		_mouseCapture: function( e ) {return true;},
				
		_mouseDown: function(e) {  // Cette fonction est appelée par des handlers des évnéments tactiles. Ils ont été définis plus haut dans la fonction mouseproto._mouseinit()
			console.log("iviewer._mouseDown()",e);
			$.ui.mouse.prototype._mouseDown.call(this,e); 	// appel de la methode _mouseDown de la classe mère
			if (!iviewerMouseDownIsClick) { iviewerMouseDownIsClick = true;	setTimeout(function(){ iviewerMouseDownIsClick = false; }, 300); }
			return true;
		},    
		
		_mouseUp: function(e) { 	// Cette fonction est appelée par des handlers des évnéments tactiles. Ils ont été définis plus haut dans la fonction mouseproto._mouseinit()
			console.log("iviewer._mouseUp()",e);
			if (iviewerMouseDownIsClick)  {iviewerMouseDownIsClick = false; this.processOnClick(e);}			
			$.ui.mouse.prototype._mouseUp.call(this,e); 	// appel de la methode _mouseUp de la classe mère
		},
		
		/**
		 * Handle mouse move if needed. User can avoid using this callback, because he can get the same information through public methods.
		 *  @param {jQuery.Event} e
		 */
		_handleMouseMove: function(e) {this._trigger('onMouseMove', e, this._getMouseCoordsInImg(e));}, // onMouseMove est définie dans les options du widget. _trigger ne fait que l'appeler

		/** callback for handling mousemove event to drag image	**/
		_mouseDrag: function(e)
		{
			this._trigger('onDrag', e, this._getMouseCoordsInImg(e));	// La méthode onDrag est définie dans les options lors de la construction du widget iviewer (voir au dessus). _trigger ne fait que l'appeler
			$.ui.mouse.prototype._mouseDrag.call(this, e);
			//#10: imitate mouseStart, because we can get here without it on iPad for some reason
			if (!this._dragInitialized) {
				this.dx = e.pageX - this.img_object.x(); 	// dx = distance en pixel entre le click.x et le coin gauche de l'image
				this.dy = e.pageY - this.img_object.y();	// dy = idem avec y
				this._dragInitialized = true;
			}

			// Pendant le drag, dx et dy restent constant ==> on obtient les nouvelles coordonnées de l'image en retranchant aux nouvelles coordonnées du click (dx ou dy)
			var lleft = e.pageX - this.dx;
			var ltop =  e.pageY - this.dy;

			this.setCoords(lleft, ltop);
			return false;
		},

		/** callback for handling stop drag	**/
		_mouseStop: function(e)
		{
			this._trigger('onStopDrag', 0, this._getMouseCoordsInImg(e)); // La méthode onStopDrag est définie dans les options lors de la construction du widget iviewer (voir au dessus). _trigger ne fait que l'appeler
			$.ui.mouse.prototype._mouseStop.call(this, e);
			this.container.removeClass("iviewer_drag_cursor");
		},

		_click: function(e) // function handler initiated on image
		{	
			this._trigger('onClick', e);   // La méthode onClick est définie dans les options lors de la construction du widget iviewer (voir au dessus). _trigger ne fait que l'appeler
			this.processOnClick(e);
		},

		refreshViewer: function()
		{
			this.options.width = this.container.css("width").replace('px','');
			zoom_center = {x: Math.round(this.options.width/2),	y: Math.round(this.options.height/2)};
			this.set_zoom(this.current_zoom,false,zoom_center);
		},
		
		allDivObjects:{},
		
		getAllDivObjects: function () {return allDivObjects;},
		
		/* objectType : 433RF Device (commanded emitter or receiver), 433RF Sensor (automatic emitter), IR Device (commanded emitter or receiver), IR Sensor (automatic emitter) */
		addDivObject: function (objectId ,xPer, yPer, widthPer, heigthPer, objectType, state, imageOnFilePath,imageOffFilePath, properties)
		{
			var $devDiv = $('<div />').appendTo(this.container);
			$devDiv.attr('xPercent',xPer);
			$devDiv.attr('yPercent',yPer);
			$devDiv.attr('widthPercent',widthPer);
			$devDiv.attr('heigthPercent',heigthPer);
			$devDiv.attr('type', objectType).css({ position: "absolute", width:"20px",height:"20px"});
			$devDiv.attr('deviceName', objectId);
			$devDiv.attr('id', objectId);
			$devDiv.attr('state', state);
			$devDiv.attr('imageOn', imageOnFilePath);
			$devDiv.attr('imageOff', imageOffFilePath);			
			$devDiv.click(function(e){selectDeviceOnViewer($(this));});			
			
			// absolute : par rapport au parent mais sans considérer les collisions avec les autres fils du parent ==> si on ne change pas top et left et qu'on ajoute des div, elles seront l'une au dessus de l'autre
			// relative : par rapport au parent mais en évitant d'empiéter sur les autres fils du parent  ==> si on ne change pas top et left et qu'on ajoute des div, elles seront toutes visibles !!
			// console.log($devDiv[0]); // retourne l'élement HTML
			var htmlId = 'idDevice_' + objectId;
			$devDiv.attr('id', htmlId);
			
			var $devCan = $('<canvas>').appendTo(this.container);
			$devCan.attr('id','idCvs_' + htmlId);
						
			this.allDivObjects[htmlId] = $devDiv;
			if (properties !== undefined) {for (var key in properties) {$devDiv.attr(key,properties[key]);}}
			this.updateDivObject($devDiv);
		},
		
		updateDivObject: function ($divObject, thestate,xPer, yPer)
		{
			if (thestate != undefined)					$divObject.attr('state',thestate);			
			if (xPer != undefined && yPer != undefined)	$divObject.attr('xPercent',xPer).attr('yPercent',yPer);

			// calcul de la position du device dans la div
			var widthPercent 	= $divObject.attr('widthPercent');
			var xPercent	 	= $divObject.attr('xPercent');
			var objectWidth 	= Math.floor(this.img_object.display_width() * widthPercent / 100);
			if (objectWidth < 35)	objectWidth = 35;
			var divX 			= this.img_object.x() + (xPercent * this.img_object.display_width() / 100) - objectWidth/2
			
			var heigthPercent 	= $divObject.attr('heigthPercent');
			var yPercent 		= $divObject.attr('yPercent');
			var objectHeight 	= Math.floor(this.img_object.display_height() * heigthPercent / 100);
			if (objectHeight < 35)	objectHeight = 35;
			var divY 			= this.img_object.y() + (yPercent * this.img_object.display_height() / 100) - objectHeight/2;
			
			$divObject.css({left:divX+'px', top:divY+'px', width:objectWidth+'px', height:objectHeight+'px'});

			if ($divObject.attr("isSelected") == 0 || $divObject.attr("isSelected") == undefined)	{$divObject.css("border","none").css("border-radius","10px");;}
			else $divObject.css("border","1px solid green").css("border-radius","10px");

			if ($divObject.attr("isSelected") == 0 || $divObject.attr("isSelected") == undefined) 
			{
				if ($divObject.attr('state') == 1)		bgCol = 'rgba(210,255,123,0.4)';		else		bgCol = 'rgba(253,191,167,0.3)';					
			}
			else
			{
				if ($divObject.attr('state') == 1) 		bgCol = "#d2ff7b";						else		bgCol = "#fdbfa7";						
			}
			
				
			imageUrl = 'url(../img/';
			if ($divObject.attr('state') == 0) imageUrl += $divObject.attr('imageOff'); else imageUrl += $divObject.attr('imageOn');
			imageUrl += ')';
			$divObject.css({background: bgCol + " " + imageUrl,'background-size': '100% 100%'});
									
			$canvasObject = $('#idCvs_'+$divObject.attr('id'));			
			$canvasObject.css("position","absolute").css("border","1px solid #888888").css({left:(divX+6)+'px', top:(divY+1+objectHeight)+'px', width:(objectWidth-15)+'px', height:'4px'});
			$canvasObject.attr("width",objectWidth-15).attr("height","4");						

			if ($divObject.attr("LastStateUpdate") != undefined && isNaN($divObject.attr("LastStateUpdate")) == 0 )	timeoutProgressPct = $divObject.attr("LastStateUpdate") / 60;			
			else																									timeoutProgressPct = 1;
			
			if (timeoutProgressPct > 0.98)
			{
				$canvasObject.css("display","none");
			}
			else
			{
				$canvasObject.css("display","visible");
				try
				{
					var ctx = $canvasObject[0].getContext("2d");
					if ($canvasObject[0] != undefined)
					{
						// calcul de degradé du vert au rouge en fonction du pourcentage
						red 	= Math.floor( (255-0) * timeoutProgressPct );  		// pour la couche rouge
						green 	= Math.floor( 255 + (0-255) * timeoutProgressPct ); 	// pour la couche verte
						blue 	= 0;									// il n'y a pas de 
						
						ctx.fillStyle = "rgba(" + red + "," + green + "," + blue + ",0.6)";			
						ctx.fillRect (1, 1, timeoutProgressPct * (objectWidth-17), 2);							
					}
				}
				catch(e) {/*console.log("Exception with device", $divObject, e); TODO : à corriger, on ne devrait pas arriver là */	}
			}
		},
		
		/**
		*   create zoom buttons info box
		**/
		createui: function()
		{
			var me=this;

			$("<div>", { 'class': "iviewer_zoom_in iviewer_common iviewer_button"}).bind('mousedown touchstart',function(){me.zoom_by(1); return false;}).appendTo(this.container);

			$("<div>", { 'class': "iviewer_zoom_out iviewer_common iviewer_button"}).bind('mousedown touchstart',function(){me.zoom_by(-1); return false;}).appendTo(this.container);

			$("<div>", { 'class': "iviewer_zoom_zero iviewer_common iviewer_button"}).bind('mousedown touchstart',function(){me.set_zoom(100); return false;}).appendTo(this.container);

			$("<div>", { 'class': "iviewer_zoom_fit iviewer_common iviewer_button"}).bind('mousedown touchstart',function(){me.fit(this); return false;}).appendTo(this.container);

			this.zoom_object = $("<div>").addClass("iviewer_zoom_status iviewer_common").appendTo(this.container);

			$("<div>", { 'class': "iviewer_SelectAnchor iviewer_common iviewer_button", 'id':'idDivSelectAnchor'}).attr('anchor',1).bind('mousedown touchstart',function(e){
				console.log("border",$(this).css('border'));
				//me._tryToDraw(); return false;
				newAnchorValue = 3 - $(this).attr('anchor').replace('px','');
				console.log('newAnchorValue',newAnchorValue);
				if (newAnchorValue === 2) {$(this).css('backgroundColor','#999999');} else $(this).css('backgroundColor','#eeeeee');
				$(this).css('border-width',newAnchorValue+'px');
				$(this).attr('anchor', newAnchorValue);
				
			}).appendTo(this.container);

			// Composants graphiques de changement de l'étage dans le plan
			$divImgBackground = $("<div>", {class: "iviewer_divImgbackground iviewer_common"}	).appendTo(this.container);
			$("<button>",	{id:'idBtnPrevUp',	text:"", class:"iviewer_divChangeBgImgUp"}		).appendTo($divImgBackground);
			$("<div>",		{id:'idDivSelectedBg', class:"iviewer_divSelectedBg"}				).appendTo($divImgBackground);
			$("<button>",	{id:'idBtnPrevDown',text:"", class:"iviewer_divChangeBgImgDown"}	).appendTo($divImgBackground);

			$("#idBtnPrevUp").bind('mousedown touchstart',function(){me.changeBackground(-1); return false;})						
			$("#idBtnPrevDown").bind('mousedown touchstart',function(){me.changeBackground(1); return false;})						
			
			// Composants graphiques d'indicateur de l'échelle
			$canvasScale = $("<canvas>",		{id:'idCanvasScale', class:"iviewer_CanvasScale"}				).appendTo(this.container);
			$canvasScale.attr("width","80").attr("height","20");
			var ctx = $canvasScale[0].getContext("2d");			
			ctx.fillStyle = "rgb(0,0,0)";
			scaleXBarWidth = 77;
			ctx.fillRect (0, 10, scaleXBarWidth, 2);		ctx.fillRect (0, 0, 2, 20);			ctx.fillRect (scaleXBarWidth - 2, 0, 2, 20);			
			$("<div>",		{id:'idDivScaleVal', class:"iviewer_DivScaleVal"}				).appendTo(this.container);

			// Composants graphiques d'affichage des devices nomade
			$nomadDevicesList = $("<div>",		{id:'idDivNomadsList', class:"flex"}).appendTo(this.container);
			$nomadDevicesList.css("bottom","190px").css("right","10px").css("z-index","11000").css("font-size","12px").css("background","rgba(180,180,255,0.7)").css("overflow","hidden");
			$nomadDevicesList.css("display","none");
			 
			$nomadDevices = $("<div>",			{id:'idDivNomadsBox', class:"iviewer_divImgbackground iviewer_common"}).appendTo(this.container);
			$nomadDevices.css("bottom","120px").css("height","60px").css("text-align","center").css("vertical-align","middle");
			$nomadDevices.mouseover(function () {$nomadDevicesList.css("display","flex");});
			$nomadDevices.mouseout(function () {$nomadDevicesList.css("display","none");});
				$nomadDevicesUpDiv 		= $("<div>",		{id:'idDivUpBox'}).appendTo($nomadDevices);
				$nomadDevicesUpDiv.mouseover(function () {});
				$nomadDevicesMiddleDiv 		= $("<div>",		{id:'idDivMiddleBox'}).appendTo($nomadDevices);
				$nomadDevicesMiddleDiv.html("All devices");
				$nomadDevicesDownDiv 	= $("<div>",		{id:'idDivDownBox'}).appendTo($nomadDevices);
				$nomadDevicesDownDiv.mouseover(function () {});
				$nomadDevicesUpDiv.css('top','0px').css("width","100%").css("height","20px")/*.css("background","#eeeeee url(../img/up-icon.png) center center no-repeat")*/;
				$nomadDevicesDownDiv.css('bottom','0px').css("width","100%").css("height","20px")/*.css("background","#aaaaaa url(../img/down-icon.png) center center no-repeat")*/;

			this.update_scaleAndZoomLabel(); //initial status update
		}
	} );

	/** ****************************************************************************************************************************************************************************************************
	/** ****************************************************************************************************************************************************************************************************
	/** ****************************************************************************************************************************************************************************************************
	/** ****************************************************************************************************************************************************************************************************
	 * @class $.ui.iviewer.ImageObject Class represents image and provides public api without
	 *     extending image prototype.
	 * @constructor
	 * @param {boolean} do_anim Do we want to animate image on dimension changes?
	 */
	$.ui.iviewer.ImageObject = function(do_anim, myview) {
		this._img = $("<img>")
				//this is needed, because chromium sets them auto otherwise
				.css({ position: "absolute", top :"0px", left: "0px"});

		this._loaded = false;
		this._swapDimensions = false;
		this._do_anim = do_anim || false;
		this.x(0, true);
		this.y(0, true);
		this.angle(0);
		this.myViewer = myview;
	};

	/** @lends $.ui.iviewer.ImageObject.prototype */
	(function() {
		
		this.getViewer 			= function() {return this.myViewer;};
		
		this.setViewer 			= function(v) {this.myViewer = v;};
		
		/** To replace objects in image */
		this.replaceDivObjects 	= function() {if (this.getViewer() != undefined) for (var key in this.getViewer().allDivObjects) {this.getViewer().updateDivObject(this.getViewer().allDivObjects[key]);} };
		
		/**
		 * Restore initial object state.
		 * @param {number} w Image width.
		 * @param {number} h Image height.
		 */
		this._reset = function(w, h) {
			this._angle = 0;
			this._swapDimensions = false;
			this.x(0);
			this.y(0);
			this.orig_width(w);
			this.orig_height(h);
			this.display_width(w);
			this.display_height(h);
			this.replaceDivObjects();
		};

		/**
		 * Check if image is loaded.
		 * @return {boolean}
		 */
		this.loaded = function() { return this._loaded; };

		/**
		 * Load image.
		 *
		 * @param {string} src Image url.
		 * @param {Function=} loaded and error functions will be called on image load.
		 */
		this.load = function(src, loaded, error) {
			var self = this;

			loaded = loaded || jQuery.noop;
			this._loaded = false;

			// If we assign new image url to the this._img IE9 fires onload event and image width and height are set to zero. 
			// So, we create another image object and load image through it.
			// var img = new Image();
			
			this._img[0].onload = function() {
				self._loaded = true;
				self._reset(this.naturalWidth, this.naturalHeight);

				self._img.removeAttr("width").removeAttr("height").removeAttr("style")
					//max-width is reset, because plugin breaks in the twitter bootstrap otherwise
					.css({ position: "absolute", top :"0px", left: "0px", maxWidth: "none"})					
					
				loaded(); // call loaded callback when image is loaded
			};

			this._img[0].onerror = error;

			//we need this because sometimes internet explorer 8 fires onload event right after assignment (synchronously)
			setTimeout(function() {self._img[0].src = src;	/* img.src = src; */}, 0);
			this.angle(0);
		};

		// définit la fonction _dimension comme une fonction de 2 arguments : préfix et name
		// 	  définit 2 fonctions anonymes (le setter function(val) et le getter function()) de la propriété this.'_'<prefix>'_'<name>
		//    appelle la fonction 'setter' avec ces 2 fonctions anonymes. 'setter' va alors construire et retourner une fonction anonyme () de paramètre 'val' ou rien (wrapper), qui appellera
		// 	  une de ces 2 fonctions anonymes en fonction de si l'argument val est setté
		// 	  L'appel de _dimension permettra (voir en dessous) de créer les setter et getter de display_width, display_height, display_diff, orig_width et orig_height
		this._dimension = function(prefix, name) {
			var horiz = '_' + prefix + '_' + name,
				vert = '_' + prefix + '_' + (name === 'height' ? 'width' : 'height');
			return setter(
				function(val) {
					this[this._swapDimensions ? vert:horiz] = val;
				},
				function() {
					return this[this._swapDimensions ? vert:horiz];
				});
		};

		/**
		 * Getters and setter for common image dimensions.
		 *    display_ means real image tag dimensions
		 *    orig_ means physical image dimensions.
		 *  Note, that dimensions are swapped if image is rotated. It necessary,
		 *  because as little as possible code should know about rotation.
		 */
		this.display_width = this._dimension('display', 'width'),
		this.display_height = this._dimension('display', 'height'),
		this.display_diff = function() { return Math.floor( this.display_width() - this.display_height() ) };
		this.orig_width = this._dimension('orig', 'width'),
		this.orig_height = this._dimension('orig', 'height'),

		/**
		 * Setter for  X coordinate. If image is rotated we need to additionaly shift an
		 *     image to map image coordinate to the visual position.
		 *
		 * @param {number} val Coordinate value.
		 * @param {boolean} skipCss If true, we only set the value and do not touch the dom.
		 */
		this.x = 
			// setter
			setter(function(val, skipCss) { 				
				this._x = val;
				if (!skipCss) {
					this._finishAnimation();
					this._img.css("left",this._x + (this._swapDimensions ? this.display_diff() / 2 : 0) + "px");
				}
				this.replaceDivObjects();  // replace all the div objects
			},
			// getter
			function() {
				return this._x;
			});

			
		/**
		 * Setter for  Y coordinate. If image is rotated we need to additionaly shift an
		 *     image to map image coordinate to the visual position.
		 *
		 * @param {number} val Coordinate value.
		 * @param {boolean} skipCss If true, we only set the value and do not touch the dom.
		 */
		this.y = setter(function(val, skipCss) {
				this._y = val;
				if (!skipCss) {
					this._finishAnimation();
					this._img.css("top",this._y - (this._swapDimensions ? this.display_diff() / 2 : 0) + "px");
				}
				this.replaceDivObjects();				
			},
		   function() {
				return this._y;
		   });

		/**
		 * Perform image rotation.
		 *
		 * @param {number} deg Absolute image angle. The method will work with values 0, 90, 180, 270 degrees.
		 */
		this.angle = setter(function(deg) {
				var prevSwap = this._swapDimensions;

				this._angle = deg;
				this._swapDimensions = deg % 180 !== 0;

				if (prevSwap !== this._swapDimensions) {
					var verticalMod = this._swapDimensions ? -1 : 1;  /* on passe d'un mode swappé à pas swappé ou inversement */
					this.x(this.x() - verticalMod * this.display_diff() / 2, true);
					this.y(this.y() + verticalMod * this.display_diff() / 2, true);
				};

				var cssVal = 'rotate(' + deg + 'deg)',
					img = this._img;

				jQuery.each(['', '-webkit-', '-moz-', '-o-', '-ms-'], function(i, prefix) {
					img.css(prefix + 'transform', cssVal);
				});

				if (useIeTransforms) {
					jQuery.each(['-ms-', ''], function(i, prefix) {
						img.css(prefix + 'filter', ieTransforms[deg].filter);
					});

					img.css({
						marginLeft: ieTransforms[deg].marginLeft * this.display_diff() / 2,
						marginTop: ieTransforms[deg].marginTop * this.display_diff() / 2
					});
				}
			},
		   function() { return this._angle; });

		/**
		 * Map point in the container coordinates to the point in image coordinates.
		 *     You will get coordinates of point on image with respect to rotation,  but will be set as if image was not rotated.
		 *     So, if image was rotated 90 degrees, it's (0,0) point will be on the top right corner.
		 *
		 * @param {{x: number, y: number}} point Point in container coordinates.
		 * @return  {{x: number, y: number}}
		 */
		this.toOriginalCoords = function(point) {
			switch (this.angle()) {
				case 0: return { x: point.x, y: point.y }
				case 90: return { x: point.y, y: this.display_width() - point.x }
				case 180: return { x: this.display_width() - point.x, y: this.display_height() - point.y }
				case 270: return { x: this.display_height() - point.y, y: point.x }
			}
		};

		/**
		 * Map point in the image coordinates to the point in container coordinates.
		 *     You will get coordinates of point on container with respect to rotation.
		 *     Note, if image was rotated 90 degrees, it's (0,0) point will be on the
		 *     top right corner.
		 *
		 * @param {{x: number, y: number}} point Point in container coordinates.
		 * @return  {{x: number, y: number}}
		 */
		this.toRealCoords = function(point) {
			switch (this.angle()) {
				case 0: return { x: this.x() + point.x, y: this.y() + point.y }
				case 90: return { x: this.x() + this.display_width() - point.y, y: this.y() + point.x}
				case 180: return { x: this.x() + this.display_width() - point.x, y: this.y() + this.display_height() - point.y}
				case 270: return { x: this.x() + point.y, y: this.y() + this.display_height() - point.x}
			}
		};

		/**
		 * @return {jQuery} Return image node. this is needed to add event handlers.
		 */
		this.object = setter(jQuery.noop,   function() { return this._img; });

		/**
		 * Change image properties.
		 *
		 * @param {number} disp_w Display width;
		 * @param {number} disp_h Display height;
		 * @param {number} x
		 * @param {number} y
		 * @param {boolean} skip_animation If true, the animation will be skiped despite the value set in constructor.
		 * @param {Function=} complete Call back will be fired when zoom will be complete.
		 */
		this.setImageProps = function(disp_w, disp_h, x, y, skip_animation, complete) {
			complete = complete || jQuery.noop;

			this.display_width(disp_w);
			this.display_height(disp_h);
			this.x(x, true);
			this.y(y, true);

			var w = this._swapDimensions ? disp_h : disp_w;
			var h = this._swapDimensions ? disp_w : disp_h;

			var params = {
				width: w,
				height: h,
				top: y - (this._swapDimensions ? this.display_diff() / 2 : 0) + "px",
				left: x + (this._swapDimensions ? this.display_diff() / 2 : 0) + "px" 
			};

			if (useIeTransforms) {
				jQuery.extend(params, {
					marginLeft: ieTransforms[this.angle()].marginLeft * this.display_diff() / 2,
					marginTop: ieTransforms[this.angle()].marginTop * this.display_diff() / 2
				});
			}

			var swapDims = this._swapDimensions,
				img = this._img;

			//here we come: another IE oddness. If image is rotated 90 degrees with a filter, than
			//width and height getters return real width and height of rotated image. The bad news
			//is that to set height you need to set a width and vice versa. Fuck IE.
			//So, in this case we have to animate width and height manually.
			if(useIeTransforms && swapDims) {
				var ieh = this._img.width(),
					iew = this._img.height(),
					iedh = params.height - ieh;
					iedw = params.width - iew;

				delete params.width;
				delete params.height;
			}

			if (this._do_anim && !skip_animation) {
				this._img.stop(true)
					.animate(params, {
						duration: 200, 
						complete: complete,
						step: function(now, fx) {
							if(useIeTransforms && swapDims && (fx.prop === 'top')) {
								var percent = (now - fx.start) / (fx.end - fx.start);

								img.height(ieh + iedh * percent);
								img.width(iew + iedw * percent);
								img.css('top', now);
							}
						}
					});
			} else {
				this._img.css(params);
				setTimeout(complete, 0); //both if branches should behave equally.
			}
			this.replaceDivObjects();			
		};

		//if we set image coordinates we need to be sure that no animation is active atm
		this._finishAnimation = function() { this._img.stop(true, true); }
		
	}).apply($.ui.iviewer.ImageObject.prototype);

	/**************************************************************************** Mini API ***************************************************************************************************/
	var util = {
		scaleValue: function(value, toZoom)			{	return value * toZoom / 100; },
		descaleValue: function(value, fromZoom)		{	return value * 100 / fromZoom; }
	};

 } )( jQuery, undefined );
