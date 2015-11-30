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

if(  (typeof(jQuery) === 'undefined' || (typeof($) === 'undefined' && typeof(jQuery) === 'undefined') ) ){// || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/'+_jquery_version+'/jquery.min.js');
}
var loading = null;
function load_base(rendered_accounts) {
	loading = setTimeout(function(){
		if( (typeof(jQuery) === 'undefined' || (typeof($) === 'undefined' && typeof(jQuery) === 'undefined') ) ){// || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
			window.clearTimeout(loading);
			loading = null;
			load_base(rendered_accounts);
		}else{
			(function($) {
				var scriptArray = [
					{
						src:"https://repo.wsu.edu/jtrack/1/jtrack.min.js",
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
	// Setting up defaults that will be used in cause of a half done implementation
	var defaults = { 
						wsuglobal:{
							ga_code:"UA-55791317-1",
							campus:"none",
							college:"none",
							unit:"none",
							subunit:"none",
							unit_type:"none",
							events:[]
						},
						app:{
							ga_code:false,
							is_editor:"false",
							events:[]
						},
						site:{
							events:[]
						}
					};
	// merge the default object with the provided object were needed
	analytics = $.extend(true,defaults,analytics);
	
	//setting up a blank array of the accounts we will be rendering out
	var rendered_accounts = [];
	
	// we are ensureing the conversion to a string from a Boolean as google will only take a string value
	var is_editor = "undefined" !== typeof analytics.app.is_editor ? ""+analytics.app.is_editor : "false";
	
	// Track WSU global analytics for front end requests only.
	if( ("undefined" === typeof analytics.app.page_view_type || "Front End" === analytics.app.page_view_type || "unknown" === analytics.app.page_view_type) &&  analytics.wsuglobal.ga_code !== false){
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
					{'name':'dimension6','val': is_editor },	//editor <bool>(as string)
					{'name':'dimension7','val': window.location.hostname },		//base site url <string>(as string)
					{'name':'dimension8','val': analytics.wsuglobal.unit_type }	//unit type <string>
				],
				events: analytics.wsuglobal.events || []
			}
		}] );
	}

	// Track app level analytics for front end and admin requests.
	if( false !== analytics.app.ga_code ){
		rendered_accounts = jQuery.merge( rendered_accounts , [{
			id: analytics.app.ga_code,
			settings:{
				namedSpace:'appScope',
				cookieDomain:".wsu.edu",
				dimension:[
					{'name':'dimension1','val': is_editor }, //editor <bool>(as string)
					{'name':'dimension2','val': window.location.hostname }, //base site url <string>(as string)
					{'name':'dimension3','val': window.location.protocol } // HTTP or HTTPS
				],
				events: analytics.app.events || []
			}
		}] );
	}

	// Track site level analytics for front end requests only.
	if( ("undefined" === typeof analytics.app.page_view_type || "Front End" === analytics.app.page_view_type || "unknown" === analytics.app.page_view_type) &&  analytics.site.ga_code !== false){
		rendered_accounts = jQuery.merge( rendered_accounts , [{
			id: analytics.site.ga_code,
			settings:{
				namedSpace:'siteScope',
				cookieDomain:".wsu.edu",
				dimension:[
					{'name':'dimension1','val': is_editor }//editor <bool>(as string)
				],
				events: analytics.site.events || []
			}
		}] );
	}
	load_base(rendered_accounts);
})(jQuery, window, window.wsu_analytics || {} );