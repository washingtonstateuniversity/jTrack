(function($, window, analytics){
	var rendered_accounts = [];
	
	// Track WSU global analytics for front end requests only.
	if(analytics.app.page_view_type==="Front End" || analytics.app.page_view_type==="unknown"){
		if(analytics.wsuglobal.ga_code!==false){
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
	if(analytics.app.ga_code!==false){
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

	// Fire tracking on all merged accounts and events with jTrack.
	jQuery.jtrack({
		analytics:{
			ga_name:"_wsuGA",
			accounts: rendered_accounts
		}
	});
})(jQuery, window, window.wsu_analytics);
