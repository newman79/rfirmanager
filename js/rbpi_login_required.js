var xhr;

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function getProgress() {
	$.get( "managedata/get_progress.php", function(data) {
		try {
			var result = JSON.parse(data);
			if(typeof result.logout !== "undefined")
				window.location.href = "connect.php?deconnexion";
			if(result.current && result.goal)
				eventTrigger({
					type: "dialog:progress",
					current: result.current,
					goal: result.goal
				});
		} catch (e) {
			eventTrigger({
				type: "dialog",
				verbose: VERBOSE_ERROR,
				message: data
			});
		}
	});
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function eventTrigger(e) {
	$.event.trigger($.extend(e, { time: new Date() }));
	//console.log("Event triggered : " + e.type);
	//console.log(JSON.stringify(e));
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function userAborted(xhr) {return !xhr.getAllResponseHeaders();}


/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function getFloatValue(param) {
	if(typeof param === "string") {
		var parameter = parseFloat(param.replace(",", "."));
		return !isNaN(parameter)?parameter:null;
	}
	else if(!isNaN(param)) {
		return param;
	}
	else
		return null;
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function geocodeNominatim(address, callback) {
	address = address.replace(/\s/g, "+");
	var pos = null;
	
	$.getJSON("http://nominatim.openstreetmap.org/search?q="+address+"&format=json", function(data) {
		var posArr = [];
		for(var k in data) {
			var place = data[k];
			if(place)
				posArr.push({lat:place.lat, lng:place.lon});
		}
		if(callback)
			callback.apply(null, [posArr]);
	}).fail(function() {
		eventTrigger({
			type: "dialog",
			verbose: VERBOSE_WARNING,
			message: "Vérifiez votre connectivité à internet"
		});
	});
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function selectElementContents(element) {
	var range = document.createRange();
	range.selectNodeContents(element);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function KeysToUpperCase(obj) {
	if(obj instanceof Object)
		for(var k in obj)
			if(obj.hasOwnProperty(k)) {
				var key = k.toUpperCase().replace(/ /g, '_');
				if(k != key) {
					obj[k.toUpperCase().replace(/ /g, '_')] = KeysToUpperCase(obj[k]);
					delete obj[k];
				}
			}
	return obj;
};

/*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
function b64Encode(str) {
	var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var out = "", i = 0, len = str.length, c1, c2, c3;
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
			out += CHARS.charAt((c2 & 0xF) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += CHARS.charAt(c1 >> 2);
		out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += CHARS.charAt(c3 & 0x3F);
	}
	return out;
};

/* * * * * * * * * * Point & Polyline * * * * * * * * * * */

function sqr(x) {return x * x;};

function dist2(v, w) {return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);};

function distToSegmentSquared(p, v, w) {
	var l2 = dist2(v, w);

	if (l2 == 0) return dist2(p, v);

	var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;

	if (t < 0) return dist2(p, v);
	if (t > 1) return dist2(p, w);

	return dist2(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
};

function findIdOfVertexAt(p, l) {
	var bestDist = -1;
	var bestId = -1;
	for(var i=0; i<l.length; i++) {
		if(distGPS(p, l[i]) < 0.5)
			return i;
	}
	for(var i=0; i<(l.length - 1); i++) {
		var d = distToSegmentSquared(p, l[i], l[i+1])
		if(d < bestDist || bestDist < 0){
			bestDist = d;
			bestId = i;
		}
	}
	return bestId + 1;
};

/* * * * * * * * * * GPS * * * * * * * * * * */

function distGPS(v, w) {
	var R = 6371000;
	var dLat = toRad(w[0]-v[0]);
	var dLon = toRad(w[1]-v[1]);
	var lat1 = toRad(v[0]);
	var lat2 = toRad(w[0]);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
};

function toRad(num) {return num * (Math.PI / 180);};
