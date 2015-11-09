(function($, window, analytics){

	window.wsu_analytics.wsuglobal.events = [
		{
			element:"#wsu-actions-tabs button",
			options:{
				action:" closed",
				action:function(ele){
					return "Action tab "+ (ele.closest('li').is(".opened") ?"opening":"closing");
				},
				category:"Spine Framework interactions",
				label:function(ele){
					return " "+$(ele).text();
				},
				overwrites:"true"
			}
		},
		{
			element:"#wsu-actions a",
			options:{
				action:"Action tab Content Click",
				category:"Spine Framework interactions",
				label:function(ele){
					return $(ele).text()+ " - "+ $(ele).attr("href");
				},
				overwrites:"true"
			}
		},
		{
			element:"#spine nav li.parent > a",
			options:{
				action:function(ele){
					return "Couplets "+ (ele.closest('.parent').is(".opened") ?"opening":"closing");
				},
				eventTracked:"click",
				category:"Spine Framework interactions",
				label:function(ele){
					return " "+$(ele).text();
				},
				overwrites:"true"
			}
		},
		{
			element:"#wsu-search input[type=text]",
			options:{
				action:"searching",
				eventTracked:"autocompletesearch",
				category:"Spine Framework interactions",
				label:function(ele){
					return ""+$(ele).val();
				},
				overwrites:"true"
			}
		},
		{
			element:"#wsu-social-channels a",
			options:{
				action:"social channel visited",
				category:"Spine Framework interactions",
				label:function(ele){
					return ""+$(ele).text();
				},
				overwrites:"true"
			}
		},
		{
			element:"#wsu-global-links a",
			options:{
				action:"WSU global link visited",
				category:"Spine Framework interactions",
				label:function(ele){
					return ""+$(ele).text()+" - "+ $(ele).attr("href");
				},
				overwrites:"true"
			}
		},
		{
			element:"#wsu-signature",
			options:{
				action:"WSU global logo clicked",
				category:"Spine Framework interactions",
				label:function(ele){
					return $(ele).attr("href");
				},
				overwrites:"true"
			}
		},
		{
			element:"#shelve",
			options:{
				action:"mobile menu icon clicked",
				category:"Spine Framework interactions",
				label:function(ele){
					return $("#spine").is(".shelved") ? "closed" : "opened" ;
				},
				overwrites:"true"
			}
		},
	];

	window.wsu_analytics.app.events    = [];

	window.wsu_analytics.site.events   = [
		{
			element:"a[href^='http']:not([href*='wsu.edu']), .track.outbound",
			options:{
				mode:"event",
				category:"outbound",
				action:"click"
			}
		},
		{
			element:"a[href*='wsu.edu']:not([href*='**SELF_DOMAIN**']), .track.internal",
			options:{
				skip_internal:"true",
				mode:"event",
				category:"internal",
				action:"click"
			}
		},
		{
			element:"a[href*='zzusis.wsu.edu'],\
					 a[href*='portal.wsu.edu'],\
					 a[href*='applyweb.com/public/inquiry'],\
					 a[href*='www.mme.wsu.edu/people/faculty/faculty.html'],\
					 a[href*='puyallup.wsu.edu'],\
					 .track.internal.query_intolerant",
			options:{
				skip_internal:"true",
				overwrites:"true",
				mode:"event",
				category:"internal-query-intolerant",
				action:"click"

			}
		},
		// Externals that are known to be url query intolerant.
		{
			element:"a[href*='tinyurl.com'],\
					 a[href*='ptwc.weather.gov'],\
					 a[href*='www.atmos.washington.edu'],\
					 .track.outbound.query_intolerant",
			options:{
				skip_internal:"true",
				overwrites:"true",
				mode:"event",
				category:"outbound-query-intolerant",
				action:"click"

			}
		},
		{
			element:".youtube,.youtube2",
			options:{
				action:"youtube",
				category:"videos",
				label:function(ele){
					return ( ($(ele).attr('title')!='' && typeof($(ele).attr('title')) !=='undefined' ) ? $(ele).attr('title') : $(ele).attr('href') );
				},
				overwrites:"true"
			}
		},
		{
			element:"a[href*='.jpg'], a[href*='.zip'], a[href*='.tiff'], a[href*='.tif'],\
					 a[href*='.bin'], a[href*='.Bin'], a[href*='.eps'], a[href*='.gif'],\
					 a[href*='.png'], a[href*='.ppt'], a[href*='.pdf'], a[href*='.doc'],\
					 a[href*='.docx'],\
					 .track.jpg, .track.zip, .track.tiff, .track.tif,\
					 .track.bin, .track.Bin, .track.eps, .track.gif,\
					 .track.png, .track.ppt, .track.pdf, .track.doc,\
					 .track.docx\
					",
			options:{
				action:function(ele){
					var href_parts =$(ele).attr('href').split('.');
					return href_parts[href_parts.length-1];
				},
				category:"download",
				label:function(ele){
					return ( ($(ele).attr('title')!='' && typeof($(ele).attr('title')) !=='undefined' ) ? $(ele).attr('title') : $(ele).attr('href') );
				},
				overwrites:"true"
			}
		},
		//this should be built on which are loading in the customizer
		{
			element:"a[href*='facebook.com']",
			options:{
				category:"Social",
				action:"Facebook",
				overwrites:"true"
			}
		},
		{
			element:"a[href*='.rss'],.track.rss",
			options:{
				category:"Feed",
				action:"RSS",
				overwrites:"true"
			}
		},
		{
			element:"a[href*='mailto:'],.track.email",
			options:{
				category:"email",
				overwrites:"true"
			}
		},
	];


})(jQuery, window, window.wsu_analytics);