(function($, window, analytics){
	//Would have some jquery ui rules to add in
	window.wsu_analytics.wsuglobal.events = jQuery.merge( window.wsu_analytics.wsuglobal.events , [] );
	window.wsu_analytics.app.events    = jQuery.merge( window.wsu_analytics.app.events , [] );
	window.wsu_analytics.site.events   = jQuery.merge( window.wsu_analytics.site.events , [
		{
			element:"a.modal",
			options:{
				category:"modal",
				skip_internal:true,
				mode:"event",
				overwrites:true
			}
		}
	] );
})(jQuery, window, window.wsu_analytics);