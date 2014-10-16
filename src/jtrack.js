/*
* jTrack plugin
*
* A jQuery plugin that makes it easier to implement Google Analytics tracking,
* including event and link tracking.
*
* Adds the following methods to jQuery:
* jQuery.jtrack.defaults.debug.run = true;
* jQuery.jtrack.defaults.debug.v_console = false;
* jQuery.jtrack.defaults.debug.console = true;
* jQuery.jtrack({ load_analytics: { account: GAcode }, trackevents: data });
*
* Or
* jQuery.trackPage() - Adds Google Analytics tracking on the page from which
*     it's called.
* jQuery.trackPageview() - Tracks a pageview using the given uri. Can be used for tracking Ajax requests: http://www.google.com/support/analytics/bin/answer.py?hl=en&answer=55519
* jQuery.trackEvent() - Tracks an event using the given parameters.
* jQuery('a').track() - Adds event tracking to element(s).
* jQuery.timePageLoad() - Measures the time it takes  an event using the given parameters.
*
* Copyright (c) 2011-12 Jeremy Bass
*
* Version 1.0.0
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Credits: This new version is a fully new version and credits it's self, past versions are crediting in there notes
*/
var jtrackOp=[];
(function(jQuery) {
	function _def(n){ return typeof n!=="undefined"; }
	function _eval(ele, obj) {
		if(typeof obj === 'function') {
			//alert('is function');
			obj = obj(ele);
		}else{
			try{
				//alert('thinking it may be a function still');
				/* jshint ignore:start */
				obj = eval("("+obj+"(ele));"); 
				/* jshint ignore:end */
				//obj = (obj)(ele);
			}catch(err){
				//Handle errors here
				//alert('not function');
			}
		}
		if(obj!==false){ return obj; }
	}
	function debug(n){
		return _def(window.console) && _def(window.console.debug) && window.console.debug(n);
	}
	// @if DEBUG
	/* for debug only. remove when done */
	/*jshint unused: false */
	function dump(arr,limit,level) {
		var dumped_text, level_padding, j, item, value;
		dumped_text = "";
		if(!limit){
			limit=3;
		}
		if(!level){
			level = 0;
		}

		//The padding given at the beginning of the line.
		level_padding = "";
		for(j=0;j<level+1;j++){
			level_padding += "	";
		}

		if(typeof(arr) === "object") { //Array/Hashes/Objects
			if(level<=limit){
				for(item in arr) {
					value = arr[item];

					if(typeof(value) === "object") { //If it is an array,
						dumped_text += level_padding + "'" + item + "' ...\n";
						dumped_text += dump(value,limit,level+1);
					} else {
						dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
					}
				}
			}
		} else { //Stings/Chars/Numbers etc.
			dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
		}
		return dumped_text;
	}

	// @endif

	/**
	* Add jTrack to handle all things GA related
	*
	* Usage:
	*<script type="text/javascript">
	*	jQuery.jtrack({ load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}} });
	*
	*
	*	jQuery.jtrack({
	*		load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}},
	*		trackevents:{[
	*			element:'a'
	*			options:{
	*				category		: function(element) { return (element[0].hostname === location.hostname) ? 'internal':'external'; },
	*				action			: function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):null; },
	*				label			: function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):null; },
	*				value			: function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():null; },
	*				eventTracked	: 'click',
	*				skip_internal	: false,
	*				overwrites		: false,
	*				debug			: false
	*			}
	*		]}
	*	});
	*
	*
	*
	*</script>
	**/
	jQuery.jtrack =	function ini(options){
		var jOps={},s,domain;
		if(!jQuery.isPlainObject(options)){
			jOps=jtrackOp[options];
			(jOps.ele).triggerHandler(jOps.tasactedEvent);
		}else{
			s = jQuery.extend({}, {
							debug : false, //bool
							clearCampaignUrls:true, //bool
							domainName : window.location.host
						}, options);

			domain = s.domainName;

			if(_def(s.analytics)){
				jQuery.jtrack.defaultsettings = jQuery.extend({}, jQuery.jtrack.defaultsettings, s.analytics.defaults);
				jQuery.jtrack.accounts = s.analytics.accounts;
				
				jQuery.fn.trackPage(function(events,ns){
					if(events!=="undefined"){
						if(!jQuery.isPlainObject(events)){
							jQuery.ajax({
							  dataType: "jsonp",
							  url: events,
							  success: function(data){
									jQuery.each(data, function(i, v) { 
										_d('appling: '+v.element+' for scope '+ns);
										var selector = v.element.replace("**SELF_DOMAIN**",domain);
										jQuery(selector).jtrack(_def(v.options)?v.options:null,ns);
									});
								}
							});
						}else{
							jQuery.each(events, function(i, v) { 
								_d('appling: '+v.element+' for scope '+ns);
								var selector = v.element.replace("**SELF_DOMAIN**",domain);
								jQuery(selector).jtrack(_def(v.options)?v.options:null,ns);
							});
						}
					}
				});
			}else{
				if(_def(s.events)){
					jQuery.each(s.events, function(i, v) { 
						//_d('<h4>appling: '+value.element+'</h4>');
						var selector = v.element.replace("**SELF_DOMAIN**",domain);
						jQuery(selector).jtrack(_def(v.options)?v.options:null);
					});
				}	
			}
			
			if(s.clearCampaignUrls){
				jQuery.jtrack.clearCampaignUrl();
			}
		}
	};
	jQuery.jtrack.defaults = {
		debug : false
	};
	jQuery.jtrack.eventdefaults = {
		mode			: "event", // this is a CSV str ie: "event,_link"
		category		: function(ele) { return (ele[0].hostname === location.hostname) ? 'internal':'external'; },
		action			: function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):''; },
		label			: function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):''; },
		value			: function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():''; },
		eventTracked	: 'click',
		skip_internal	: false,
		overwrites		: true,
		skip_campaign	: false,
		alias			: null,
		nonInteraction	: null,
		callback		: function(){}
	};
	jQuery.jtrack.accounts={};
	jQuery.jtrack.settings={};
	jQuery.jtrack.defaultsettings={
		namedSpace		: false,// String
		
		cookieName		: false,// String
		cookieDomain	: window.location.host,// String
		cookieExpires	: false,// String
		cookiePath		: '/',// String
		
		autoLink		: true,// Bool
		autoLinkDomains	: [],// Array(String)
		
		dimension		: [],// Array(Objects) {'name':'foo','val':'bar'}
		metrics			: [],// Array(Objects) {'name':'foo','val':'bar'}
		
		location		: null,// String
		hostname		: null,// String
		
		experimentID	: null,// String
		expVar			: null,// Int
		
		sampleRate		: false,// Int
		displayfeatures	: false,// Bool
		ecommerce		: false,// Bool
		linkid			: true,// Bool
		
		events			: false,// Bool
	};
	
	jQuery.jtrack.init_analytics = function(callback) {
		_d('Google Analytics loaded');
		
		jQuery.each(jQuery.jtrack.accounts,function(idx,acc){
			var setting,namedSpace,ns,cookiePath,cookieDomain,autoLink,sampleRate,opt,_addEvent;
			jQuery.jtrack.settings = jQuery.extend( {}, jQuery.jtrack.defaultsettings, acc.settings );
			setting = jQuery.jtrack.settings; // we are doing this to decrease the download size.  balance
			
			
			namedSpace		= setting.namedSpace ? {'name': setting.namedSpace} : {};
			ns				= jQuery.isPlainObject(namedSpace) ? namedSpace.name + '.' : '';
			
			cookiePath		= setting.cookiePath ? {'cookiePath' : setting.cookiePath} : {};
			cookieDomain	= setting.cookieDomain ? {'cookieDomain' : setting.cookieDomain} : {};
			autoLink		= setting.autoLink ? {'allowLinker' : true} : {};
			sampleRate		= setting.sampleRate ? {'sampleRate': setting.sampleRate} : {};
			
			opt=$.extend({},namedSpace,cookieDomain,cookiePath,autoLink,sampleRate);

			ga('create', acc.id, opt=={}?'auto':opt);
			
			if(setting.location!==null){
				ga(ns+'set', 'location', setting.location);
			}
			if(setting.hostname!==null){
				ga(ns+'set', 'hostname', setting.hostname);
			}
			
			if(setting.experimentID!==null){
				ga(ns+'set', 'expId', setting.experimentID);
				ga(ns+'set', 'expVar', setting.expVar);
			}

			if(setting.dimension.length>0){
				jQuery.each(setting.dimension,function(idx,obj){
					ga(ns+'set', obj.name, obj.val);
				});
				
			}
			if(setting.metrics.length>0){
				jQuery.each(setting.metrics,function(idx,obj){
					ga(ns+'set', obj.name, obj.val);
				});
				
			}
			
			if(autoLink!={}){
				ga(ns+'require', 'linker');
				if(setting.autoLinkDomains.length>0){
					ga(ns+'linker:autoLink', setting.autoLinkDomains);
				}
			}
			
			if(setting.linkid){
				ga(ns+'require', 'linkid', 'linkid.js');
			}
			
			if(setting.displayfeatures){
				ga(ns+'require', 'displayfeatures');
			}
			
			ga(ns+'send', 'pageview');
			
			if(setting.ecommerce){
				ga(ns+'require', 'ecommerce');
			}
			
			if(jQuery.isFunction(callback) && setting.events!==false){
				ga(function(){
					callback(setting.events,ns)
				});
			}
		});
	};
	jQuery.jtrack.load_script = function(callback) {
	  	//for now just use the default
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
		jQuery.jtrack.init_analytics(callback);
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		
	};
	/**
	* Enables Google Analytics tracking on the page from which it's called. 
	*
	*/
	jQuery.fn.trackPage = function(callback) {
		var script;
		if ( typeof(ga)!=='undefined' && ga.length>0) {
			_d('!!!!!! Google Analytics loaded previously !!!!!!!');
		}else{
			// Enable tracking when called or on page load?
			if(jQuery.jtrack.settings.onload === true || jQuery.jtrack.settings.onload === null) {
				jQuery(document).ready(function(){jQuery.jtrack.load_script(callback);});
			} else {
				jQuery.jtrack.load_script(callback);
			}
		}
	};

	/**
	* Tracks an event using the given parameters. 
	*
	* The trackEvent method takes four arguments:
	*
	* ele      - Object  :: jQuery target object
	* ns       - String  :: the name space of the ga tracker
	* category - String  :: Specifies the event category. Must not be empty.
	* action   - String  :: Specifies the event action. Must not be empty.
	* label    - String  :: Optional / Specifies the event label.
	* value    - Integer :: Optional / Specifies the event value. Values must be non-negative.
	* callback - Function:: Optional 
	*
	*/
	jQuery.jtrack.trackEvent = function(ele,ns,category, action, label, value, callback) {
		if(!_def(ga)) {
			_d('FATAL: ga is not defined'); // blocked by whatever
		} else {
			var cat,act,lab,val;
			
			cat = category!==null ? {'eventCategory': category} : {};
			act = action!==null ? {'eventAction': action} : {};
			lab = label!==null ? {'eventLabel': label} : {};
			val = value!==null ? {'eventValue': value} : {};

			ga(ns+'send', 'event', jQuery.extend({},cat,act,lab,val));
			if(typeof(callback)!=="undefined"){
				if(jQuery.isFunction(callback)){
					callback(ele);
				}else{
					_eval(ele,callback);
				}
			}
			_d('Fired '+ns+'send for Tracking');
		}
	};

	/**
	* Tracks socialnetworks using the given parameters. 
	*
	* The trackSocial method takes four arguments:
	* ele     - Object  :: jQuery target object
	* ns      - String  :: the name space of the ga tracker
	* network - String  :: Specifies the social network, for example `facebook`, `google plus`, or `twitter`
	* action  - String  :: Specifies the social interaction action. For example on Google Plus when a user clicks the +1 button, the social action is `plus`.
	* target  - String  :: Specifies the target of a social interaction. This value is typically a URL but can be any text.
	*
	*/
	jQuery.jtrack.trackSocial = function(ele, ns, network, action, target) {
		if(!_def(ga)) {
			_d('FATAL: ga is not defined'); // blocked by whatever
		} else {
			var net,act,tar;
			
			net = network!==null ? {'socialNetwork': network} : {};
			act = action!==null ? {'socialAction': action} : {};
			tar = target!==null ? {'socialTarget': target} : {};
			ga(ns+'send', 'social', jQuery.extend({},net,act,tar) );
		
			_d('Fired '+ns+'send for Social Tracking');	
		}
	};

	/**
	* Tracks a pageview using the given uri.
	*
	*/
	jQuery.jtrack.trackPageview = function(pageTracker,uri) {
		if(!_def(pageTracker)) {
			_d('FATAL: pageTracker is not defined');
		} else {
			pageTracker._trackPageview(uri);
			_d('Fired event for _trackPageview for '+uri+'');
		}
	};

	/**
	* Tracks a pageview using the given uri.
	*
	*/
	jQuery.jtrack.hit = function(ele, ns, hitType, hitPage) {
		if(!_def(ga)) {
			_d('FATAL: ga is not defined');
		} else {
			var type,page;
			
			type = hitType!==null ? {'hitType': hitType} : {};
			page = hitPage!==null ? {'page': hitPage} : {};
			ga(ns+'send', jQuery.extend({},type,page) );
	
			_d('Fired '+ns+'send for hitType Tracking');	
		}
	};




	jQuery.jtrack.make_campaign_str = function(callback){
		function readCookie(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)===' '){ c = c.substring(1,c.length);}
				if (c.indexOf(nameEQ) === 0){
					return c.substring(nameEQ.length,c.length);
				}
			}
			return null;
		}

		function parseAnalyticsCookie() {
			// inspiration from http://stackoverflow.com/questions/1688657/how-do-i-extract-google-analytics-campaign-data-from-their-cookie-with-javascript
			// readCookie is from // http://www.quirksmode.org/js/cookies.html
			// utmcsr = utm_source
			// utmccn = utm_campaign
			// utmcmd = utm_medium
			// utmctr = utm_term
			// utmcct = utm_content
			var values = {};
			var cookie = readCookie("__utmz");
			if (cookie) {
				var z = cookie.split('.'); 
				if (z.length >= 4) {
					var y = z[4].split('|');
					var i=0;
					for (i=0; i<y.length; i++) {
						var pair = y[i].split("=");
						values[pair[0]] = pair[1];
					}
				}
			}
			return values;
		}
		var cookie = parseAnalyticsCookie();
		var campaign=null;
		var str = "";
		if(
			cookie.length !== 0 && cookie['utmccn']!=="undefined" && cookie['utmccn']!=="(direct)" && cookie['utmccn']!=="(referral)" && cookie['utmcsr']!=="undefined" && cookie['utmcsr']!=="(direct)" && cookie['utmcsr']!=="(referral)"
		){
				if(cookie['utmcsr']!=="undefined"){
					str +="utm_source="+cookie['utmcsr'];
				}
				if(cookie['utmcmd']!=="undefined"){
					str +="&utm_medium="+cookie['utmcmd'];
				}
				if(cookie['utmccn']!=="undefined"){
					str +="&utm_campaign="+cookie['utmccn'];
				}
				if(cookie['utmctr']!=="undefined"){
					str +="&utm_term="+cookie['utmctr'];
				}
				if(cookie['utmccn']!=="undefined"){
					str +="&utm_content="+cookie['utmccn'];
				}
		}else{
			campaign=(cookie['utmcsr']!=="undefined")?cookie['utmcsr']:"";
			str +="utm_source="+window.location.host.split('.').join('-')+"&utm_medium=online&utm_campaign="+window.location.host.split('.').join('-')+"-"+campaign+"&utm_term=&utm_content=";
		}

		if(str==="utm_source=undefined&utm_medium=undefined&utm_campaign=undefined&utm_term=undefined&utm_content=undefined"){
			
			campaign=(cookie['utmcsr']!=="undefined")?cookie['utmcsr']:"";
			str ="utm_source="+window.location.host.split('.').join('-')+"&utm_medium=online&utm_campaign="+window.location.host.split('.').join('-')+"-"+campaign+"&utm_term=&utm_content=";	
		}


		if(jQuery.isFunction(callback)){
			callback(str);
			return false;
		}
		return str;
	};

	jQuery.jtrack.make_forced_camp=function(ele,mode){
		if(mode.indexOf("_link")>-1 && ele.data('tracker') !== 'added'){
			var camphref = ele.attr('href');
			//alert(camphref);
			var camp = jQuery.jtrack.make_campaign_str();
			//alert(camp);

			_d(camp+' of campaign');
			//ok this check sucks it.. fix later
			if(camp!=="" && window.location.toString().indexOf("inquiry?")===-1 && camphref.indexOf("utm_campaign")===-1){//&& window.location.toString().indexOf("education.wsu.edu/directory")==-1){
				ele.attr('href',camphref + ((camphref.indexOf('?')>-1)?'&':'?') + camp);
				_d(ele.attr('href')+' of camp');
				ele.data('tracker','added');
			}
		}
	};
	/**
	* If truned on then this will clear any url params 
	*/
	jQuery.jtrack.clearCampaignUrl = function() {
		var currentHref = window.location.href;
		if(currentHref.indexOf('utm_source=')>-1){
			var currentUrl = currentHref.split(window.location.host)[1];
			currentUrl = currentHref.split('?')[0];
			window.history.pushState(null, jQuery(document).find("title").text(), currentUrl);
		}
	};

	/**
	* Adds click tracking to elements. Usage:
	*
	*  jQuery('a').jtrack.track()
	*
	*/
	jQuery.fn.jtrack = function(options,ns) {
		// Add event handler to all matching elements
		return jQuery.each(jQuery(this),function() {
			var ele,settings,overwrites,mode,alias,category,action,eventTracked,label,value,skip_internal,
			skip_campaign,_link,nonInteraction,callback,tasactedEvent,skip,marker,network,socialAction;
			
			
			ele			= jQuery(this);
			settings	= jQuery.extend({}, jQuery.jtrack.eventdefaults, options);
			overwrites	= _eval(ele, settings.overwrites); // this will let one element over any from before
				overwrites	= (overwrites === 'undefined') ? 'true' : overwrites;

			// Prevent an element from being tracked multiple times.
			if (ele.is('.tracked') && overwrites === 'false') {
				return false;
			} else {
				ele.addClass('tracked');

				mode			= settings.mode;
				alias			= _eval(ele, settings.alias);
				category		= _eval(ele, settings.category);
				action			= _eval(ele, settings.action);
				eventTracked	= _eval(ele, settings.eventTracked);
					action			= action===''?eventTracked:action;
				label			= _eval(ele, settings.label);
				value			= _eval(ele, settings.value);
					value			= isNaN(value)?1:value;
				skip_internal	= _eval(ele, settings.skip_internal);
				skip_campaign	= _eval(ele, settings.skip_campaign);
				_link			= settings._link;
				nonInteraction	= settings.nonInteraction;
				callback		= settings.callback;

				ele.attr( 'role' , eventTracked+'_'+action+'_'+category); 
				tasactedEvent = eventTracked + '.' + (alias==="undefined" || alias===null ? 'jtrack': alias);
				
				skip = skip_internal && (ele[0].hostname === location.hostname);
				_d(skip?'Skipping ':'Tracking ');

				marker = (alias==="undefined" || alias===null)?eventTracked:alias;
				jtrackOp[marker]=[];
				jtrackOp[marker]["ele"]=ele;
				jtrackOp[marker]["tasactedEvent"]=tasactedEvent;

				if(overwrites==='true'){
					ele.off(tasactedEvent);
					ele.unbind(tasactedEvent);
					_d('overwriting '+tasactedEvent);
				}
				_d('setting event '+tasactedEvent);
				ele.on(tasactedEvent, function(e) {
					
					if(nonInteraction!==null){
						ga('set', 'nonInteraction', nonInteraction);
					}
					
					_d('doing event '+tasactedEvent);
					if(mode.indexOf("_link")>-1){
						e.preventDefault(); e.stopPropagation(); 
						if(!skip_campaign){
							jQuery.jtrack.make_forced_camp(ele,mode);
						}
					}
					if(!skip && mode.indexOf("event")>-1 ){
						jQuery.jtrack.trackEvent(ele,ns,category, action, label, value,callback);
					}
					if(mode.indexOf("_social")>-1 ){
						network      = _eval(ele, settings.network);
						socialAction = _eval(ele, settings.socialAction);
						jQuery.jtrack.trackSocial(ele,ns,network,socialAction);
					}
					if(mode.indexOf("_link")>-1){
						_d('Fired _link for Tracking for _link');
						_d(ele.attr('href'));
						/*_gaq.push(['_link', ele.attr('href')]); 
						_gaq.push(function () {
							var pageTracker = _gat._getTrackerByName(); // Gets the default tracker.
							var linkerUrl = pageTracker._getLinkerUrl(window.location.toString()); //set to this page
							if( ele.attr('target')!=="" && ele.attr('target')!=="_self" ){
								window.open(
									ele.attr('href'),
									ele.attr('target') // <- This is what makes it open in a new window/tab.
								);
							}else{
								window.location.href = ele.attr('href');
							}
						});
						return false;
						*/
					}
					return true;
				});

			}
		});
	};
}(jQuery));
