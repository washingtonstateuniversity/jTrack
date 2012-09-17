/*
* jTrack plugin
*
* A jQuery plugin that makes it easier to implement Google Analytics tracking,
* including event and link tracking.
*
* Adds the following methods to jQuery:
* $.jtrack.defaults.debug.run = true;
* $.jtrack.defaults.debug.v_console = false;
* $.jtrack.defaults.debug.console = true;
* $.jtrack({ load_analytics: { account: GAcode }, trackevents: data });
*
* Or
* $.trackPage() - Adds Google Analytics tracking on the page from which
*     it's called.
* $.trackPageview() - Tracks a pageview using the given uri. Can be used for tracking Ajax requests: http://www.google.com/support/analytics/bin/answer.py?hl=en&answer=55519
* $.trackEvent() - Tracks an event using the given parameters.
* $('a').track() - Adds event tracking to element(s).
* $.timePageLoad() - Measures the time it takes  an event using the given parameters.
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
var jtrackedOptions=[];
(function($) {
	
	function defined(obj){return typeof(obj)!=='undefined';}
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
	function debug(message) {
		if (defined($.jtrack) && $.jtrack.defaults.debug.run && $.jtrack.defaults.debug.v_console) {
			if(jQuery('#vConsole').length<=0){
				var content = jQuery('body').html();
				var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
				jQuery('body').html('<div style="margin-right:380px;">'+content.replace(rscript, "")+'</div>');
				jQuery('body').prepend('<div id="vConsole" style="float:right;border:1px solid #333; position:fixed; top: 0px; right:0px; width:350px; height:100%;padding: 0 15px;overflow-y: scroll; background: none repeat scroll 0% 0% #fff" >'+
								'<h1>vConsole</h1></div>');
			}
			jQuery('#vConsole').append(message);
		}
		if (defined($.jtrack) && $.jtrack.defaults.debug.run && $.jtrack.defaults.debug.console && defined(console) && defined(console.debug)) {
		  console.debug(message);
		}
	}
	function dump(arr,level) {
		var dumped_text = "";
		if(!level) level = 0;
		
		//The padding given at the beginning of the line.
		var level_padding = "";
		for(var j=0;j<level+1;j++) level_padding += " ";
		
		if(typeof(arr) == 'object') { //Array/Hashes/Objects
			for(var item in arr) {
				var value = arr[item];
				
				if(typeof(value) == 'object') { //If it is an array,
					dumped_text += level_padding + "'" + item + "' ...\n";
					dumped_text += dump(value,level+1);
				} else {
					dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
				}
			}
		} else { //Stings/Chars/Numbers etc.
			dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
		}
		return dumped_text;
	}

  /**
   * Add jTrack to handle all things GA related
   *
   * Usage:
   *  <script type="text/javascript">
   *    $.jtrack({ load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}} });
   *
   *
   *    $.jtrack({ 
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
	$.jtrack =	function ini(options){
		if(!$.isPlainObject(options)){
			jOps=jtrackedOptions[options];
			(jOps.ele).triggerHandler(jOps.tasactedEvent);
		}else{
			var settings = $.extend({}, {}, options);
			if(defined(settings.load_analytics))
				$.fn.trackPage(settings.load_analytics.account, defined(settings.load_analytics.options)?settings.load_analytics.options:null);
			if(defined(settings.trackevents)){
					$.each(settings.trackevents, function(index, value) { 
						//debug('<h4>appling: '+value.element+'</h4>');
						$(value.element).track(defined(value.options)?value.options:null);
					});
				
			}	
		}
	};
	$.jtrack.defaults = {
		category      : function(ele) { return (ele[0].hostname === location.hostname) ? 'internal':'external'; },
		action        : function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):''; },
		label         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):''; },
		value         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():''; },
		eventTracked  : 'click',
		noninteraction: false,
		skip_internal : false,
		overwrites	  : true,
		alias         : null,
		debug         : {run : false , v_console : true}
	};
  /**
   * Enables Google Analytics tracking on the page from which it's called. 
   *
   * Usage:
   *  <script type="text/javascript">
   *    $.fn.trackPage('UA-xxx-xxx', options);
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
  $.fn.trackPage = function(account_id, options) {
    var host = (("https:" === document.location.protocol) ? "https://ssl" : "http://www");
    var script;

    // Use default options, if necessary
    var settings = $.extend({}, {onload: true, status_code: 200}, options);
    var src  = host + '.google-analytics.com/ga.js';

    function init_analytics(account_id) {
       // debug('<hr/><h2>Google Analytics loaded</h2><hr/>');
		pageTracker = _gat._createTracker(account_id);
		pageTracker._initData();
		if(settings.status_code === null || settings.status_code === 200) {
			pageTracker._trackPageview();
		} else {
			//debug('Tracking error ' + settings.status_code);
			pageTracker._trackPageview("/" + settings.status_code + ".html?page=" + document.location.pathname + document.location.search + "&from=" + document.referrer);
		}
		if($.isFunction(settings.callback)){
			 settings.callback(pageTracker);
		}
    }
	if ( typeof(_gat)!=='undefined' && _gaq.length>0) {
		//debug('<hr/><h2>!!!!!! Google Analytics loaded previously !!!!!!! </h2><hr/>');
	}else{
		load_script = function() {
		  $.ajax({
			type: "GET",
			url: src,
			success: function() {  
                if (!defined(_gat)) {
					debug('<hr/><h2>!!!!!! _gat has NOT been defined !!!!!!! </h2><hr/>');
                    throw "_gat has not been defined";
                }  else {
					debug('<hr/><h2>!!!!!! loaded the GA code !!!!!!! </h2><hr/>');
			  		init_analytics(account_id); 
				}
			},
			dataType: "script",
			cache: true // We want the cached version
		  });
		};  
	}
    // Enable tracking when called or on page load?
    if(settings.onload === true || settings.onload === null) {
		$(document).ready(function(){load_script();});
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
  $.jtrack.trackEvent = function(pageTracker,category, action, label, value, noninteraction) {
    if(!defined(pageTracker)) {
		//debug('<h1>FATAL: pageTracker is not defined</h1>'); // blocked by whatever
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
  $.fn.trackSocial = function(network, socialAction, opt_target, opt_pagePath) {
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
  $.fn.trackPageview = function(uri) {
    if(!defined(pageTracker)) {
      //debug('<h1>FATAL: pageTracker is not defined</h1>');
    } else {
      pageTracker._trackPageview(uri);
    }
  };

  /**
   * Adds click tracking to elements. Usage:
   *
   *  $('a').jtrack.track()
   *
   */
  $.fn.track = function(options) {
    // Add event handler to all matching elements
    return this.each(function() {
		var ele = $(this);
		var settings = $.extend({}, $.jtrack.defaults, options);
		var overwrites    = evaluate(ele, settings.overwrites); // this will let one element over any from before
			overwrites = (overwrites == 'undefined') ? 'true' : overwrites;	
			
		// Prevent an element from being tracked multiple times.
		if (ele.is('.tracked') && overwrites==='false') {
			return false;
		} else {
			var alias = evaluate(ele, settings.alias);
			var category = evaluate(ele, settings.category);
			var action   = evaluate(ele, settings.action);
			var eventTracked    = evaluate(ele, settings.eventTracked);
				action   = action==''?eventTracked:action;
			var label    = evaluate(ele, settings.label);
			var value    = evaluate(ele, settings.value);
				value    = isNaN(value)?1:value;
			var skip_internal    = evaluate(ele, settings.skip_internal);
			var noninteraction = evaluate(ele, settings.noninteraction);
				noninteraction = (noninteraction == 'undefined') ? 'false' : noninteraction;

			ele.addClass('tracked');	
			ele.attr( 'role' , eventTracked+'_'+action+'_'+category); 
			var tasactedEvent = eventTracked + '.' + (alias=="undefined" ? 'track': alias);
			var message = "user '" + tasactedEvent + "'(eventTracked)\r\t can overwrite '" + overwrites + (alias==null?"":"'\r\t under alias:'"+alias) + "'\r\t under Category:'" + category + "'\r\t with Action:'" + action + "'\r\t for Label:'" + label + "'\r\t having Value:'" + value + "'\r\t obeying Noninteraction:'" + noninteraction + "'";
			var skip = skip_internal && (ele[0].hostname === location.hostname);
			//debug('<pre>&#149;&nbsp; '+ (skip?'Skipping ':'Tracking ') + message+'</pre>');
			
			var marker = alias=="undefined"?eventTracked:alias;
			jtrackedOptions[marker]=[];
			jtrackedOptions[marker]["ele"]=ele;
			jtrackedOptions[marker]["tasactedEvent"]=tasactedEvent;

			
			if( (jQuery().jquery!='1.7.1' || $.fn.jquery!='1.7.1') ){
				if(overwrites==='true'){ele.die(tasactedEvent);ele.unbind(tasactedEvent);}
				ele.live(tasactedEvent, function() {
					if(!skip)$.jtrack.trackEvent(pageTracker,category, action, label, value,noninteraction);
				return true; });
			}else{
				if(overwrites==='true'){ele.off(tasactedEvent);ele.unbind(tasactedEvent);}
				ele.on(tasactedEvent, function() {
					if(!skip)$.jtrack.trackEvent(pageTracker,category, action, label, value,noninteraction);
				return true; });
			}
		}
    });
  };
}(jQuery));
