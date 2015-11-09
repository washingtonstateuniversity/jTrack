/*
* WSU TRACKING BOOTSCRIPT
* Version 0.1
* Copyright (c) 2011-12 Jeremy Bass
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*/

function async_load_js(url){
	var headID = document.getElementsByTagName("head")[0];
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.async = true;
	s.src = url;
	var x = document.getElementsByTagName('script')[0];
	headID.appendChild(s);
}
function param( name , process_url ){
	if(typeof(process_url) === 'undefined'){
		process_url=window.location.href;
	}
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( process_url );
	if( results === null ){
		return false;
	}else{
		return results[1];
	}
}

var url = document.getElementById('tracker_agent').src; 
var _jquery_version =(param( 'jquery' , url ) !== false?param( 'jquery' , url ):'1.7.2');

if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/'+_jquery_version+'/jquery.min.js');
}

function load_base(url) {
	setTimeout(function(){
		if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery !== _jquery_version || jQuery.fn.jquery !== _jquery_version) ){
			load_base(url);
		}else{
			(function($) {
				var scriptArray = [ // this is where we'd load the scriptArray list dynamicly.  Right now it's hard coded
					{
						src:"https://repo.wsu.edu/jtrack/1/jtrack.min.js",
						exc:function(){
							// Fire tracking on all merged accounts and events with jTrack.
							jQuery.jtrack({
								analytics:{
									ga_name:"_wsuGA",
									accounts: window.rendered_accounts
								}
							});
						}
					}
				];
				$.each(scriptArray, function(i,v){
					$.ajax({
						type:"GET",dataType:"script",cache:true,url:v.src,
						success: function() {v.exc();}
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
						{'name':'dimension1','val': window.location.protocol },//protocol <string> (http: / https:)
						{'name':'dimension2','val': analytics.wsuglobal.campus },//campus <string>
						{'name':'dimension3','val': analytics.wsuglobal.college },//college <string>
						{'name':'dimension4','val': analytics.wsuglobal.unit },//unit <string>
						{'name':'dimension5','val': analytics.wsuglobal.subunit },//subunit <string>
						{'name':'dimension6','val': ""+analytics.app.is_editor },//editor <bool>(as string)
						{'name':'dimension7','val': window.location.hostname },//base site url <string>(as string)
						{'name':'dimension8','val': analytics.wsuglobal.unit_type }//unit type <string>
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
	if(analytics.app.page_view_type==="Front End" || analytics.app.page_view_type==="unknown"){
		if(analytics.site.ga_code!==false){
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
	load_base(url);
})(jQuery, window, window.wsu_analytics);


