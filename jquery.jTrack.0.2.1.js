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
* Version 0.1
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Credits:
*   - http://google.com/analytics
*   - http://lyncd.com: 
*       Idea for trackPage method came from this blog post: http://lyncd.com/2009/03/better-google-analytics-javascript/
*/
var pageTracker=null;
var _gaq = _gaq || [];
var jtrackedOptions=[];
(function(jQuery) {
	function defined(n){return typeof n!="undefined"}
	function evaluate(ele, obj) {
		if(typeof obj === 'function') {
			//alert('is function');
			obj = obj(ele);
		}else{
			try{
				//alert('thinking it may be a function still');
				obj = eval("("+obj+"(ele));"); 
				//obj = (obj)(ele);
			}catch(err){
				//Handle errors here
				//alert('not function');
			}
		}
		if(obj!==false) return obj;
	}
	function debug(n){if(defined(jQuery.jtrack)&&jQuery.jtrack.defaults.debug.run&&jQuery.jtrack.defaults.debug.v_console){if(jQuery("#vConsole").length<=0){var i=jQuery("body").html(),t=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;jQuery("body").html('<div style="margin-right:380px;">'+i.replace(t,"")+"</div>"),jQuery("body").prepend('<div id="vConsole" style="float:right;border:1px solid #333; position:fixed; top: 0px; right:0px; width:350px; height:100%;padding: 0 15px;overflow-y: scroll; background: none repeat scroll 0% 0% #fff" ><h1>vConsole</h1></div>')}jQuery("#vConsole").append(n)}defined(jQuery.jtrack)&&jQuery.jtrack.defaults.debug.run&&jQuery.jtrack.defaults.debug.console&&defined(console)&&defined(console.debug)&&console.debug(n)}
	function dump(n,t){var i="",f,e,r,u;for(t||(t=0),f="",e=0;e<t+1;e++)f+=" ";if(typeof n=="object")for(r in n)u=n[r],typeof u=="object"?(i+=f+"'"+r+"' ...\n",i+=dump(u,t+1)):i+=f+"'"+r+"' => \""+u+'"\n';else i="===>"+n+"<===("+typeof n+")";return i}
  /**
   * Add jTrack to handle all things GA related
   *
   * Usage:
   *  <script type="text/javascript">
   *    jQuery.jtrack({ load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}} });
   *
   *
   *    jQuery.jtrack({ 
   *    	load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}},
   *    	trackevents:{[
   *   			 element:'a'
   *   			 options:{
   *   			 	category      : function(element) { return (element[0].hostname === location.hostname) ? 'internal':'external'; },
   *   			 	action        : function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):null; },
   *   			 	label         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):null; },
   *   			 	value         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():null; },
   *				eventTracked	  : 'click',
   *   			 	skip_internal : false,
   *				overwrites	  : false,
   *   			 	noninteraction: false,
   *   			 	debug         : {run : false , v_console : true}
   *   			 }
   *		]}
   *    });
   *    
   *    
   *    
   *  </script>
   **/
	jQuery.jtrack =	function ini(options){
		if(!jQuery.isPlainObject(options)){
			jOps=jtrackedOptions[options];
			(jOps.ele).triggerHandler(jOps.tasactedEvent);
		}else{
			var s = jQuery.extend({}, {}, options);
			
			var domain = typeof(s.domainName)!=="undefined" && s.domainName!="" ? s.domainName : window.location.host;
			
			if(defined(s.load_analytics)){
				jQuery.fn.trackPage(s.load_analytics.account, defined( s.load_analytics.options )?s.load_analytics.options:null,function(){
					if(defined(s.trackevents)){
						jQuery.each(s.trackevents, function(i, v) { 
							//debug('<h4>appling: '+value.element+'</h4>');
							var selector = v.element.replace("**SELF_DOMAIN**",domain);
							jQuery(selector).track(defined(v.options)?v.options:null);
						});
					}
				});
			}else{
				if(defined(s.trackevents)){
					jQuery.each(s.trackevents, function(i, v) { 
						//debug('<h4>appling: '+value.element+'</h4>');
						var selector = v.element.replace("**SELF_DOMAIN**",domain);
						jQuery(selector).track(defined(v.options)?v.options:null);
					});
				}	
			}
		}
	};
	jQuery.jtrack.defaults = {
		mode		  : "event", // this is a CSV str ie: "event,_link"
		category      : function(ele) { return (ele[0].hostname === location.hostname) ? 'internal':'external'; },
		action        : function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):''; },
		label         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):''; },
		value         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():''; },
		eventTracked  : 'click',
		noninteraction: false,
		skip_internal : false,
		overwrites	  : true,
		skip_campaign  : false,
		alias         : null,
		callback	  : function(){},
		debug         : {run : false , v_console : true}
	};
  /**
   * Enables Google Analytics tracking on the page from which it's called. 
   *
   * Usage:
   *  <script type="text/javascript">
   *    jQuery.fn.trackPage('UA-xxx-xxx', options);
   *  </script>
   *
   * Parameters:
   *   account_id - Your Google Analytics account ID.
   *   options - An object containing one or more optional parameters:
   *     - onload - boolean - If false, the Google Analytics code is loaded
   *       when this method is called instead of on window.onload.
   *     - status_code - The HTTP status code of the current server response.
   *       If this is set to something other than 200 then the page is tracked
   *       as an error page. For more details: http://www.google.com/support/analytics/bin/answer.py?hl=en&answer=86927
   *     - callback  - function to be executed after the Google Analytics code is laoded and initialized
   *
   */
  jQuery.fn.trackPage = function(account_id, options,callback) {
    var host = (("https:" === document.location.protocol) ? "https://ssl" : "http://www");
    var script;

    // Use default options, if necessary
    var settings = jQuery.extend({}, {onload: true, status_code: 200}, options);
    var src  = host + '.google-analytics.com/ga.js';

    function init_analytics(account_id,callback) {
      	debug('<hr/><h2>Google Analytics loaded</h2><hr/>');
		var pluginUrl =  '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
		_gaq.push(['_require', 'inpage_linkid', pluginUrl]);
		_gaq.push(['_setAccount', account_id]);
		_gaq.push(['_setAllowLinker', true]);
		_gaq.push(['_setDomainName', (typeof(settings.domainName)!="undefined")?settings.domain:window.location.host]);
		
		pageTracker = _gat._createTracker(account_id);
		
		if(
			typeof(settings.domainName)!="undefined"
			&& (
				typeof(settings._addIgnoredRef)=="undefined"
				|| typeof(settings._addIgnoredRef)!="undefined" && settings._addIgnoredRef!=false
				)
			){
			_gaq.push(['_addIgnoredRef', settings.domain]);
		}
		if(typeof(settings.cookiePath)!="undefined"){
			_gaq.push(['_setCookiePath', settings.cookiePath]);
		}

		//pageTracker._initData();//Deprecated executes automatically in the ga.js tracking code.

		if(settings.status_code === null || settings.status_code === 200) {
			//pageTracker._trackPageview();
			_gaq.push(['_trackPageview']);
		} else {
			debug('Tracking error ' + settings.status_code);
			_gaq.push(['_trackPageview',"/" + settings.status_code + ".html?page=" + document.location.pathname + document.location.search + "&from=" + document.referrer]);
			//pageTracker._trackPageview("/" + settings.status_code + ".html?page=" + document.location.pathname + document.location.search + "&from=" + document.referrer);
		}
		if(jQuery.isFunction(callback)){
			callback(pageTracker);
		}
    }
	if ( typeof(_gat)!=='undefined' && _gaq.length>0) {
		debug('<hr/><h2>!!!!!! Google Analytics loaded previously !!!!!!! </h2><hr/>');
	}else{
		load_script = function() {
		  jQuery.ajax({
			type: "GET",
			url: src,
			success: function() {  
                if (!defined(_gat)) {
					debug('<hr/><h2>!!!!!! _gat has NOT been defined !!!!!!! </h2><hr/>');
                    throw "_gat has not been defined";
                }  else {
					debug('<hr/><h2>!!!!!! loaded the GA code !!!!!!! </h2><hr/>');
			  		init_analytics(account_id,callback); 
				}
			},
			dataType: "script",
			cache: true // We want the cached version
		  });
		};  
	}
    // Enable tracking when called or on page load?
    if(settings.onload === true || settings.onload === null) {
		jQuery(document).ready(function(){load_script();});
    } else {
      load_script();
    }
  };

  /**
   * Tracks an event using the given parameters. 
   *
   * The trackEvent method takes four arguments:
   *
   *  category - The name you supply for the group of objects you want to track
   *  action - A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
   *  label - An optional string to provide additional dimensions to the event data
   *  value - An integer that you can use to provide numerical data about the user event.
   *  noninteraction - A boolean that when set to true, indicates that the event hit will not be used in bounce-rate calculation..
   *
   */
  jQuery.jtrack.trackEvent = function(pageTracker,category, action, label, value, noninteraction) {
    if(!defined(pageTracker)) {
		debug('<h1>FATAL: pageTracker is not defined</h1>'); // blocked by whatever
    } else {

		var _event = ['_trackEvent'];
		category!=null ? _event.push(category) : null;
		action!=null ? _event.push(action) : null;
		label!=null ? _event.push(label) : null;
		value!=null ? _event.push(value) : null;
		noninteraction!=null ? _event.push(noninteraction) : null;
	
		pageTracker._trackEvent(category, action, label,value, noninteraction);
		//_gaq.push(_event);
		
		debug('<h4>Fired event for Tracking</h4><h5>for _event</h5>');
		debug('<pre>'+dump(_event)+'</pre>');
    }
  };

  /**
   * Tracks socialnetworks using the given parameters. 
   *
   * The trackSocial method takes four arguments:
   *
   * network      - name of the network, e.g. facebook, tweeter
   * socialAction - action, e.g. like/unlike
   * opt_target   - Optional: A string representing the URL (or resource) which receives the action.
   * opt_pagePath - Optional: A string representing the page by path (including parameters) from which the action occurred.
   *
   */
  jQuery.jtrack.trackSocial = function(network, socialAction, opt_target, opt_pagePath) {
    if(!defined(pageTracker)) {
      debug('<h1>FATAL: pageTracker is not defined</h1>'); // blocked by whatever
    } else {
		var _event = ['_trackSocial'];
		network!=null ? _event.push(network) : null;
		socialAction!=null ? _event.push(socialAction) : null;
		opt_target!=null ? _event.push(opt_target) : null;
		opt_pagePath!=null ? _event.push(opt_pagePath) : null;
		pageTracker._trackSocial(network, socialAction, opt_target, opt_pagePath);
		//pageTracker.push(_event);
		//debug('<h4>Fired event for Social Tracking</h4><h5>for _event</h5>');
		//debug('<pre>'+dump(_event)+'</pre>');	
    }
  };

  /**
   * Tracks a pageview using the given uri.
   *
   */
  jQuery.jtrack.trackPageview = function(pageTracker,uri) {
    if(!defined(pageTracker)) {
      //debug('<h1>FATAL: pageTracker is not defined</h1>');
    } else {
      pageTracker._trackPageview(uri);
		debug('<h4>Fired event for _trackPageview</h4><h5>for '+uri+'</h5>');
    }
  };


  jQuery.jtrack.make_campaign_str = function(callback){
	  
		function readCookie(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
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
					for (i=0; i<y.length; i++) {
						var pair = y[i].split("=");
						values[pair[0]] = pair[1];
					}
				}
			}
			return values;
		}
		var cookie = parseAnalyticsCookie();
		var str = "";
		if(cookie.length !== 0 && cookie['utmccn']!=="undefined" && cookie['utmccn']!="(direct)" && cookie['utmccn']!="(referral)" && cookie['utmcsr']!="undefined" && cookie['utmcsr']!="(direct)" && cookie['utmcsr']!="(referral)"){
			if(cookie['utmcsr']!=="undefined")str +="utm_source="+cookie['utmcsr'];
			if(cookie['utmcmd']!=="undefined")str +="&utm_medium="+cookie['utmcmd'];
			if(cookie['utmccn']!=="undefined")str +="&utm_campaign="+cookie['utmccn'];
			if(cookie['utmctr']!=="undefined")str +="&utm_term="+cookie['utmctr'];
			if(cookie['utmccn']!=="undefined")str +="&utm_content="+cookie['utmccn'];
		}else{
			campaign=(cookie['utmcsr']!=="undefined")?cookie['utmcsr']:"";
			str +="utm_source="+window.location.host.split('.').join('-')+"&utm_medium=online&utm_campaign="+window.location.host.split('.').join('-')+"-"+campaign+"&utm_term=&utm_content=";
		}
		
		if(str=="utm_source=undefined&utm_medium=undefined&utm_campaign=undefined&utm_term=undefined&utm_content=undefined"){
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
		if(mode.indexOf("_link")>-1 && ele.data('tracker') != 'added'){
			var camphref = ele.attr('href');
			//alert(camphref);
			var camp = jQuery.jtrack.make_campaign_str();
			//alert(camp);
			
			debug(camp+' of camp');
			//ok this check sucks it.. fix later
			if(camp!="" && window.location.toString().indexOf("inquiry?")==-1 ){//&& window.location.toString().indexOf("education.wsu.edu/directory")==-1){
				ele.attr('href',camphref + ((camphref.indexOf('?')>-1)?'&':'?') + camp);
				debug(ele.attr('href')+' of camp');
				ele.data('tracker','added');
			}
		}
	}


  /**
   * Adds click tracking to elements. Usage:
   *
   *  jQuery('a').jtrack.track()
   *
   */
  jQuery.fn.track = function(options) {
    // Add event handler to all matching elements
    return jQuery.each(jQuery(this),function() {
		var ele = jQuery(this);
		var settings = jQuery.extend({}, jQuery.jtrack.defaults, options);
		var overwrites    = evaluate(ele, settings.overwrites); // this will let one element over any from before
			overwrites = (overwrites == 'undefined') ? 'true' : overwrites;	
			
		// Prevent an element from being tracked multiple times.
		if (ele.is('.tracked') && overwrites==='false') {
			return false;
		} else {
			var mode = settings.mode;
			var alias = evaluate(ele, settings.alias);
			var category = evaluate(ele, settings.category);
			var action   = evaluate(ele, settings.action);
			var eventTracked    = evaluate(ele, settings.eventTracked);
				action   = action==''?eventTracked:action;
			var label    = evaluate(ele, settings.label);
			var value    = evaluate(ele, settings.value);
				value    = isNaN(value)?1:value;
			var skip_internal    = evaluate(ele, settings.skip_internal);
			var skip_campaign    = evaluate(ele, settings.skip_campaign);
			var noninteraction = evaluate(ele, settings.noninteraction);
				noninteraction = (noninteraction == 'undefined') ? 'false' : noninteraction;
			var _link=settings._link;
			var callback = evaluate(ele, settings.callback);

			ele.addClass('tracked');	
			ele.attr( 'role' , eventTracked+'_'+action+'_'+category); 
			var tasactedEvent = eventTracked + '.' + (alias=="undefined" || alias==null ? 'jtrack': alias);
			var message = "user '" + tasactedEvent + "'(eventTracked)\r\t can overwrite '" + overwrites + (alias==null?"":"'\r\t under alias:'"+alias) + "'\r\t under Category:'" + category + "'\r\t with Action:'" + action + "'\r\t for Label:'" + label + "'\r\t having Value:'" + value + "'\r\t obeying Noninteraction:'" + noninteraction + "'";
			var skip = skip_internal && (ele[0].hostname === location.hostname);
			//debug('<pre>&#149;&nbsp; '+ (skip?'Skipping ':'Tracking ') + message+'</pre>');
			
			var marker = (alias=="undefined" || alias==null)?eventTracked:alias;
			jtrackedOptions[marker]=[];
			jtrackedOptions[marker]["ele"]=ele;
			jtrackedOptions[marker]["tasactedEvent"]=tasactedEvent;

			function check() {
				return window.jQuery && jQuery.fn && /^[1-9]\.[7-9]/.test(jQuery.fn.jquery);
			}

			if( !check() ){
				if(overwrites==='true'){ele.die(tasactedEvent);ele.unbind(tasactedEvent);}
				ele.live(tasactedEvent, function(e) {
					if(mode.indexOf("_link")>-1){
						e.preventDefault(); e.stopPropagation(); 
						if(!skip_campaign)jQuery.jtrack.make_forced_camp(ele,mode);
					}
					if(!skip && mode.indexOf("event")>-1)jQuery.jtrack.trackEvent(pageTracker,category, action, label, value,noninteraction,callback);
					
					if(mode.indexOf("_social")>-1 ){
						var network      = evaluate(ele, settings.network);
						var socialAction = evaluate(ele, settings.socialAction);
						jQuery.jtrack.trackSocial(network, socialAction);
					}
					if(mode.indexOf("_link")>-1){
						debug('<h4>Fired _link for Tracking</h4><h5>for _link</h5>');debug('<pre>'+ele.attr('href')+'</pre>');
						_gaq.push(['_link', ele.attr('href')]); 
						_gaq.push(function () {
							var pageTracker = _gat._getTrackerByName(); // Gets the default tracker.
							var linkerUrl = pageTracker._getLinkerUrl(window.location.toString()); //set to this page
							window.location.href = ele.attr('href');
						});
						return false;
					}
				return true; });
			}else{
				if(overwrites==='true'){ele.off(tasactedEvent);ele.unbind(tasactedEvent);}
				ele.on(tasactedEvent, function(e) {
					if(mode.indexOf("_link")>-1){
						e.preventDefault(); e.stopPropagation(); 
						if(!skip_campaign)jQuery.jtrack.make_forced_camp(ele,mode);
					}
					if(!skip && mode.indexOf("event")>-1 )jQuery.jtrack.trackEvent(pageTracker,category, action, label, value,noninteraction,callback);
					if(mode.indexOf("_social")>-1 ){
						var network      = evaluate(ele, settings.network);
						var socialAction = evaluate(ele, settings.socialAction);
						jQuery.jtrack.trackSocial(network, socialAction);
					}
					if(mode.indexOf("_link")>-1){
						debug('<h4>Fired _link for Tracking</h4><h5>for _link</h5>');debug('<pre>'+ele.attr('href')+'</pre>');
						_gaq.push(['_link', ele.attr('href')]); 
						_gaq.push(function () {
							var pageTracker = _gat._getTrackerByName(); // Gets the default tracker.
							var linkerUrl = pageTracker._getLinkerUrl(window.location.toString()); //set to this page
							window.location.href = ele.attr('href');
						});
						return false;
					}
				return true; });
			}
		}
    });
  };
}(jQuery));
