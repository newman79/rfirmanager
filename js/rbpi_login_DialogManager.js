/* * * * * * * * * * */
/* Gestion du Dialog */
/* * * * * * * * * * */

/* * * DIALOG MANAGER * * */
function DialogManager(selector) {
	var that = this;

	that.obj = $(selector);

	that.progressBar = null;
	that.progressLabel = null;

	$(document).on("dialog", function(e) {
		if(e.lock)
			that.showUnclosable(e);
		else
			that.show(e);
	})
	.on("dialog:close", function(e) {
		that.close();
	})
	.on("dialog:progress", function(e) {
		that.adjustProgressBar(e);
	});

	that.show = function(e) {
		that.obj.html(e.message);
		that.obj.dialog({
			title: (typeof e.titre !== 'undefined' ? e.titre : TITLE_DIALOGBOX[e.verbose]),
			modal: true,
			resizable: false,
			dialogClass: "dialogBox_"+(typeof e.titre !== 'undefined' ? "0" : e.verbose),
			draggable: true,
			closeOnEscape: true,
			close: function() {
				that.progressBar = null;
				that.progressLabel = null;
			}
		});
		
		$(".ui-dialog-titlebar-close").show();

		if(e.progressBar)
			that.setProgressBar();
	}

	that.showUnclosable = function(e) {
		that.obj.html(e.message);
		that.obj.dialog({
			title: TITLE_DIALOGBOX[e.verbose],
			modal: true,
			resizable: false,
			dialogClass: "dialogBox_"+e.verbose,
			draggable: false,
			closeOnEscape: false,
			close: function() {
				that.progressBar = null;
				that.progressLabel = null;
			}
		});

		$(".ui-dialog-titlebar-close").hide();

		if(e.progressBar)
			that.setProgressBar();
	}

	that.close = function() {
		that.obj.dialog("close");
	}

	that.setProgressBar = function() {
		that.obj.append("<div id=\"progressBar\"><div id=\"progressLabel\">Loading...</div></div>");

		that.progressBar = $("#progressBar");
		that.progressLabel = $("#progressLabel");

		that.progressBar.progressbar({
			value: false,
			change: function() {
				that.progressLabel.text(that.progressBar.progressbar("value")+"%");
			},
			complete: function() {
				that.progressLabel.text("Terminé !");
			}
		});
	}

	that.adjustProgressBar = function(e) {
		if(that.progressBar !== null)
			that.progressBar.progressbar("value", e.goal!==null?parseInt(parseInt(e.current)*100/parseInt(e.goal)):0);
	}
}
