
(function($, window, analytics){

	window.wsu_analytics.wsuglobal.events = [
		{
			element:"#wsu-actions-tabs button",
			options:{
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
					return ( ($(ele).attr('title') !== '' && typeof($(ele).attr('title')) !== 'undefined' ) ? $(ele).attr('title') : $(ele).attr('href') );
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
					return ( ($(ele).attr('title') !== '' && typeof($(ele).attr('title')) !== 'undefined' ) ? $(ele).attr('title') : $(ele).attr('href') );
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
/*
* WSU TRACKING BOOTSCRIPT
* Version 0.1
* Copyright (c) 2011-12 Jeremy Bass
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*/

function async_load_js(url){
	var headID, s, x;
	headID = document.getElementsByTagName("head")[0];
	s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = url;
	x = document.getElementsByTagName('script')[0];
	headID.appendChild(s);
}
function param( name , process_url ){
	var regexS, regex, results;
	if(typeof(process_url) === 'undefined'){
		process_url=window.location.href;
	}
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	regexS = "[\\?&]"+name+"=([^&#]*)";
	regex = new RegExp( regexS );
	results = regex.exec( process_url );
	if( results === null ){
		return false;
	}else{
		return results[1];
	}
}

var url = document.getElementById('tracker_agent').src; 
var _jquery_version =(param('jquery' , url) !== false ? param('jquery' , url) : '1.10.2');

if((typeof(jQuery) === 'undefined' || typeof($) === 'undefined') ){// || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/'+_jquery_version+'/jquery.min.js');
}
var loading = null;
function load_base(rendered_accounts) {
	loading = setTimeout(function(){
		if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
			window.clearTimeout(loading);
			loading = null;
			load_base(rendered_accounts);
		}else{
			(function($) {
				var scriptArray = [ // this is where we'd load the scriptArray list dynamicly.  Right now it's hard coded
					{
						src:"https://repo.wsu.edu/jtrack/develop/jtrack.min.js",
						exc:function(){
							// Fire tracking on all merged accounts and events with jTrack.
							jQuery.jtrack({
								analytics:{
									ga_name:"_wsuGA",
									accounts: rendered_accounts
								}
							});
						}
					}
				];
				$.each(scriptArray, function(idx,script){
					$.ajax({
						type:"GET",
						dataType:"script",
						cache:true,
						url:script.src,
						success: function() {
							window.clearTimeout(loading);
							loading = null;
							script.exc();
						}
					});
				});
			}(jQuery));
		}
	},50);
}

(function($, window, analytics){
	var rendered_accounts = [];
	
	// Track WSU global analytics for front end requests only.
	if(analytics.app.page_view_type === "Front End" || analytics.app.page_view_type === "unknown"){
		if(analytics.wsuglobal.ga_code !== false){
			rendered_accounts = jQuery.merge( rendered_accounts , [{
				id:analytics.wsuglobal.ga_code,
				settings:{
					namedSpace:'WSUGlobal',
					cookieDomain:".wsu.edu",
					dimension:[
						{'name':'dimension1','val': window.location.protocol },		//protocol <string> (http: / https:)
						{'name':'dimension2','val': analytics.wsuglobal.campus },	//campus <string>
						{'name':'dimension3','val': analytics.wsuglobal.college },	//college <string>
						{'name':'dimension4','val': analytics.wsuglobal.unit },		//unit <string>
						{'name':'dimension5','val': analytics.wsuglobal.subunit },	//subunit <string>
						{'name':'dimension6','val': ""+analytics.app.is_editor },	//editor <bool>(as string)
						{'name':'dimension7','val': window.location.hostname },		//base site url <string>(as string)
						{'name':'dimension8','val': analytics.wsuglobal.unit_type }	//unit type <string>
					],
					events: analytics.wsuglobal.events
				}
			}] );
		}
	}

	// Track app level analytics for front end and admin requests.
	if(analytics.app.ga_code !== false){
		rendered_accounts = jQuery.merge( rendered_accounts , [{
			id: analytics.app.ga_code,
			settings:{
				namedSpace:'appScope',
				cookieDomain:".wsu.edu",
				dimension:[
					{'name':'dimension1','val': analytics.app.page_view_type },     // Front end or admin page view type
					{'name':'dimension2','val': analytics.app.authenticated_user }, // Authenticated or non-authenticated user
					{'name':'dimension3','val': window.location.protocol },         // HTTP or HTTPS
					{'name':'dimension4','val': analytics.app.wsuwp_network },      // The WSUWP Platform network <string>
					{'name':'dimension5','val': analytics.app.spine_grid },         // The Spine grid layout from Customizer
					{'name':'dimension6','val': analytics.app.spine_color }         // The color of the Spine from Customizer
				],
				events: analytics.app.events
			}
		}] );
	}

	// Track site level analytics for front end requests only.
	if(analytics.app.page_view_type === "Front End" || analytics.app.page_view_type === "unknown"){
		if(analytics.site.ga_code !== false){
			rendered_accounts = jQuery.merge( rendered_accounts , [{
				id: analytics.site.ga_code,
				settings:{
					namedSpace:'siteScope',
					cookieDomain:".wsu.edu",
					dimension:[
						{'name':'dimension1','val': ""+analytics.app.is_editor }//editor <bool>(as string)
					],
					events: analytics.site.events
				}
			}] );
		}
	}
	load_base(rendered_accounts);
})(jQuery, window, window.wsu_analytics|| { wsuglobal:{}, app:{}, site:{} } );