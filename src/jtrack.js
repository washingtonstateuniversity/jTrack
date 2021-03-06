/*
* jTrack plugin
*
* A jQuery plugin that makes it easier to implement Google Analytics tracking,
* including event and link tracking.
*
* Adds the following methods to jQuery:
* $.jtrack.defaults.debug = true;
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
* Copyright (c) 2011-2017 Jeremy Bass
*               2014-2017 Washington State University
*
* Version 1.6.0
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Credits: This new version is a fully new version and credits it's self, past versions are crediting in there notes
*/
var jtrackOp=[];
//var ga;
(function($) {
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
    function _d(n){
        return ($.jtrack.defaults.debug===true) && _def(window.console) && _def(window.console.debug) && window.console.debug(n);
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
    *	$.jtrack({ load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}} });
    *
    *
    *	$.jtrack({
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
    $.jtrack =	function ini(options){
        var jOps={},s,domain;
        if(!$.isPlainObject(options)){
            jOps=jtrackOp[options];
            (jOps.ele).triggerHandler(jOps.tasactedEvent);
        }else{
            s = $.extend({}, {
                            debug : false, //bool
                            clearCampaignUrls:true, //bool
                            domainName : window.location.host
                        }, options);

            domain = s.domainName;

            if(_def(s.analytics)){
                $.jtrack.defaultsettings = $.extend({}, $.jtrack.defaultsettings, s.analytics.defaults);
                $.jtrack.accounts = s.analytics.accounts;
                var ga_name = s.analytics.ga_name||"ga";
                window[ga_name]=undefined;
                $.fn.trackPage(ga_name,function(events,ns){
                    if(events!=="undefined"){
                        if(!$.isArray(events) && !$.isPlainObject(events)){
                            $.ajax({
                              dataType: "jsonp",
                              url: events,
                              success: function(data){
                                    $.each(data, function(i, v) {
                                        _d('appling: '+v.element+' for scope '+ns);
                                        var selector = v.element.replace("**SELF_DOMAIN**",domain);
                                        $(selector).jtrack(_def(v.options)?v.options:null,ga_name,ns);
                                    });
                                }
                            });
                        }else{
                            $.each(events, function(i, v) {
                                _d('appling: '+v.element+' for scope '+ns);
                                var selector = v.element.replace("**SELF_DOMAIN**",domain);
                                $(selector).jtrack(_def(v.options)?v.options:null,ga_name,ns);
                            });
                        }
                    }
                });
            }else{
                if(_def(s.events)){
                    $.each(s.events, function(i, v) {
                        //_d('<h4>appling: '+value.element+'</h4>');
                        var selector = v.element.replace("**SELF_DOMAIN**",domain);
                        $(selector).jtrack(_def(v.options)?v.options:null);
                    });
                }
            }
        }
    };
    $.jtrack.defaults = {
        debug : false
    };
    $.jtrack.eventdefaults = {
        mode            : "event", // this is a CSV str ie: "event,_link"
        category        : function(ele) { return (ele[0].hostname === location.hostname) ? 'internal':'external'; },
        action          : function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):''; },
        label           : function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):''; },
        value           : function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():0; },
        eventTracked    : 'click',
        skip_internal   : false,
        overwrites      : true,
        set_role        : false,

        alias           : null,
        nonInteraction  : null,
        callback        : function(){},
        ec              : false
    };
    $.jtrack.accounts={};
    $.jtrack.settings={};
    $.jtrack.defaultsettings={
        ga_name         : 'ga',
        namedSpace      : false,// String

        cookieName      : false,// String
        cookieDomain    : window.location.host,// String
        cookieExpires   : false,// String
        cookiePath      : '/',// String

        autoLink        : true,// Bool
        autoLinkDomains : [],// Array(String)

        dimension       : [],// Array(Objects) {'name':'foo','val':'bar'}
        metrics         : [],// Array(Objects) {'name':'foo','val':'bar'}

        location        : null,// String
        hostname        : null,// String

        experimentID    : null,// String
        expVar          : null,// Int

        sampleRate      : false,// Int
        displayfeatures : false,// Bool
        ec              : false,// Bool
        ecommerce       : false,// Bool
        linkid          : true,// Bool

        userId          : false,// Bool
        events          : false,// Bool
        force_campaign  : false
    };

    $.jtrack.init_analytics = function(ga_name,callback) {
        _d('Google Analytics loaded');
        var jga = window[ga_name];
        var accounts_total = $.jtrack.accounts.length;
        $.each($.jtrack.accounts,function(idx,acc){
            var setting,namedSpace,ns,cookiePath,cookieDomain,autoLink,sampleRate,opt,_addEvent;
            $.jtrack.settings = $.extend( {}, $.jtrack.defaultsettings, acc.settings );
            setting = $.jtrack.settings; // we are doing this to decrease the download size.  balance

            namedSpace		= setting.namedSpace ? {'name': setting.namedSpace} : {};
            ns				= $.isPlainObject(namedSpace) && typeof namedSpace.name !== "undefined" ? namedSpace.name + '.' : '';

            cookiePath		= setting.cookiePath ? {'cookiePath' : setting.cookiePath} : {};
            cookieDomain	= setting.cookieDomain ? {'cookieDomain' : setting.cookieDomain} : {};
            autoLink		= setting.autoLink ? {'allowLinker' : true} : {};
            sampleRate		= setting.sampleRate ? {'sampleRate': setting.sampleRate} : {};

            var clientId=false;
            var ga_cid_hash=false;
            // Let's check if LocalStorage is available
            if(typeof(Storage) !== "undefined") {
                // We only want to read the CID from the localStorage if the _ga cookie is not present
                // If _ga is not present, we will want to check if it's saved in our localStorage
                if(!document.cookie.match(new RegExp('_ga=([^;]+)'))){
                    ga_cid_hash = localStorage.getItem('ua_cid');
                }else{
                    ga_cid_hash=(location.search.split('_ga=')[1]||'').split('&')[0];
                    localStorage.setItem('ua_cid',clientId);
                }
            }

            if(ga_cid_hash!==false){
                clientId = ga_cid_hash;
            }else{
                jga(function(tracker) {
                    var _tracker=false;
                    if( ns!=="" && _tracker!==false ){
                        _tracker = jga.get(ns);
                        _d(_tracker);
                    }
                    if( ns!=="" && typeof(_tracker)=== "undefined" ){
                        _tracker = jga.getAll()[idx];
                        _d(_tracker);
                    }
                    if( _tracker!==false ){
                        tracker=_tracker;
                    }
                    clientId = typeof(tracker) !== "undefined" ? tracker.get('clientId') : false;
                });
            }

            if(clientId!==false){
                jga('set', 'clientId', clientId);
            }

            opt=$.extend({},namedSpace,cookieDomain,cookiePath,autoLink,sampleRate);


            jga('create', acc.id, opt==={}?'auto':opt);



            if(typeof(Storage) !== "undefined") {
                jga(function(tracker) {
                    var _tracker=false;
                    if( ns!=="" && _tracker!==false ){
                        _tracker = jga.get(ns);
                        _d(_tracker);
                    }
                    if( ns!=="" && typeof(_tracker)=== "undefined" ){
                        _tracker = jga.getAll()[idx];
                        _d(_tracker);
                    }
                    if( _tracker!==false ){
                        tracker=_tracker;
                    }
                    // This will be ran right after GA has been loaded,
                    // We'll check for a saved clientId in our localStorage, if not present, we will grab
                    // the current GA clientID and we will save it
                    if(!localStorage.getItem('ua_cid')) {
                        var clientId = tracker.get('clientId');
                        localStorage.setItem('ua_cid',clientId);
                    }
                });
            }


            if(setting.location!==null){
                jga(ns+'set', 'location', setting.location);
            }
            if(setting.hostname!==null){
                jga(ns+'set', 'hostname', setting.hostname);
            }

            if(setting.experimentID!==null){
                jga(ns+'set', 'expId', setting.experimentID);
                jga(ns+'set', 'expVar', setting.expVar);
            }

            if(setting.dimension.length>0){
                $.each(setting.dimension,function(idx,obj){
                    jga(ns+'set', obj.name, obj.val);
                });
            }

            if(setting.metrics.length>0){
                $.each(setting.metrics,function(idx,obj){
                    jga(ns+'set', obj.name, obj.val);
                });
            }

            if(autoLink!=={}){
                jga(ns+'require', 'linker');
                if(setting.autoLinkDomains.length>0){
                    jga(ns+'linker:autoLink', setting.autoLinkDomains);
                }
            }

            if(setting.linkid){
                jga(ns+'require', 'linkid', 'linkid.js');
            }

            if(setting.displayfeatures){
                jga(ns+'require', 'displayfeatures');
            }

            if(setting.force_campaign!==false){
                if($.isPlainObject(setting.force_campaign)){
                    //replace with loop later
                    if(setting.force_campaign.campaignName){
                        jga('set', 'campaignName', setting.force_campaign.campaignName);
                    }
                    if(setting.force_campaign.campaignSource){
                        jga('set', 'campaignSource', setting.force_campaign.campaignSource);
                    }
                    if(setting.force_campaign.campaignMedium){
                        jga('set', 'campaignMedium', setting.force_campaign.campaignMedium);
                    }
                    if(setting.force_campaign.campaignKeyword){
                        jga('set', 'campaignKeyword', setting.force_campaign.campaignKeyword);
                    }
                    if(setting.force_campaign.campaignContent){
                        jga('set', 'campaignContent', setting.force_campaign.campaignContent);
                    }
                }
            }

            if( false !== setting.ec ){
                jga(ns+'require', 'ec');
            }

            if( "object" === typeof(setting.ec) ){
                $.jtrack.setEC(null, ga_name, ns, setting.ec);
            }

            jga(ns+'send', 'pageview',{
                'hitCallback': function() {
                //if(setting.clearCampaignUrls){
                if( accounts_total === (idx+1) ){
                    $.jtrack.clearCampaignUrl();
                }
              }
            });


            if(setting.ecommerce){
                jga(ns+'require', 'ecommerce');
            }

            if($.isFunction(callback) && setting.events!==false){
                jga(function(){
                    callback(setting.events,ns);
                });
            }
        });
    };
    $.jtrack.load_script = function(ga_name,callback) {
        /* jshint ignore:start */ //Googles code doesn't lint
        //for now just use the default
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
            $.jtrack.init_analytics(ga_name,callback);
        })(window,document,'script','https://www.google-analytics.com/analytics.js',ga_name||"ga");
        /* jshint ignore:end */
    };
    /**
    * Enables Google Analytics tracking on the page from which it's called.
    *
    */
    $.fn.trackPage = function(ga_name,callback) {
        var script;
        var jga = window[ga_name];
        if ( typeof(jga)!=='undefined' && jga.length>0) {
            _d('!!!!!! Google Analytics loaded previously !!!!!!!');
        }else{
            // Enable tracking when called or on page load?
            if($.jtrack.settings.onload === true || $.jtrack.settings.onload === null) {
                $(document).ready(function(){$.jtrack.load_script(ga_name,callback);});
            } else {
                $.jtrack.load_script(ga_name,callback);
            }
        }
    };

    /**
    * Tracks an event using the given parameters.
    *
    * The trackEvent method takes four arguments:
    *

    * category - String  :: Specifies the event category. Must not be empty.
    * action   - String  :: Specifies the event action. Must not be empty.
    * label    - String  :: Optional / Specifies the event label.
    * value    - Integer :: Optional / Specifies the event value. Values must be non-negative.
    * ga_name  - String  :: the name space of the ga object
    * ns       - String  :: the name space of the ga tracker
    * callback - Function:: Optional
    *
    */
    $.fn.trackEvent = function(category, action, label, value,ga_name,ns, callback) {
        if (arguments.length<5){
            ga_name = "ga";
        }
        if (arguments.length<6){
            ns = "";
        }
        if (arguments.length<7){
            callback = "";
        }
        var ele = typeof(this.selector)!=="undefined" ? $(this.selector) : null;
        $.jtrack.trackEvent(ele,ga_name,ns,category, action, label, value, callback);
    };

    $.jtrack.trackEvent = function(ele,ga_name,ns,category, action, label, value, callback) {
        var jga = window[ga_name];
        if(!_def(jga)) {
            _d('FATAL: ga is not defined'); // blocked by whatever
        } else {
            var cat,act,lab,val;

            cat = category!==null ? {'eventCategory': category} : {};
            act = action!==null ? {'eventAction': action} : {};
            lab = label!==null ? {'eventLabel': label} : {};
            val = { 'eventValue': ! isNaN(value) ? 0  : value };
            if(ns.length>1 && ns.indexOf('.')<0){
                ns+='.';
            }
            jga(ns+'send', 'event', $.extend({},cat,act,lab,val));
            if(typeof(callback)!=="undefined"){
                if($.isFunction(callback)){
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
    $.jtrack.trackSocial = function(ele,ga_name,ns, network, action, target) {
        var jga = window[ga_name];
        if(!_def(jga)) {
            _d('FATAL: ga is not defined'); // blocked by whatever
        } else {
            var net, act, tar;

            net = network!==null ? {'socialNetwork': network} : {};
            act = action!==null ? {'socialAction': action} : {};
            tar = target!==null ? {'socialTarget': target} : {};
            jga(ns+'send', 'social', $.extend({},net,act,tar) );

            _d('Fired '+ns+'send for Social Tracking');
        }
    };

    /**
    * Tracks userId.
    *
    * The trackSocial method takes four arguments:
    * ele     - Object  :: jQuery target object
    * ga_name - String  :: name of the ga object
    * ns      - String  :: the name space of the ga tracker
    * userId  - String  :: the user id if provided
    */
    $.jtrack.setUserId = function(ele, ga_name, ns, userId) {
        var jga = window[ga_name];
        if(!_def(jga)) {
            _d('FATAL: ga is not defined'); // blocked by whatever
        } else {
            userId = null !== userId && "" !== userId ? userId : false;
            if(false !== userId){
                jga(ns+'set', 'userId', userId );
                _d('Fired '+ns+'send for Social Tracking');
            }
        }
    };


    /**
    * Tracks userId.
    *
    * The trackSocial method takes four arguments:
    * ele       - Object  :: jQuery target object
    * ga_name   - String  :: name of the ga object
    * ns        - String  :: the name space of the ga tracker
    * ec_object - Object  :: object with all parameters in tow
    */
    $.jtrack.setEC = function(ele, ga_name, ns, ec_object) {
        var jga = window[ga_name];
        if(!_def(jga)) {
            _d('FATAL: ga is not defined'); // blocked by whatever
        } else {
            /* {
                data : {
                    type: "addProduct"// per https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce
                    data:{
                        id:''
                        ETC...
                    }
                },
                action:{
                    type: 'click', //detail / add /etc per https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#action-types
                    data:{
                        id:''
                        ETC... per https://developers.google.com/analytics/devguides/collection/analyticsjs/enhanced-ecommerce#action-data
                    }
                }
            }*/

            if( ""!== ec_object.data.type && false !== ec_object.data.type){
                if(typeof(ec_object.data.data)==="object"){
                    $.each(ec_object.data.data,function(key,val){
                        ec_object.data.data[key]=_eval(ele, val);
                    });
                }
                jga(ns+'ec:'+ec_object.data.type, ec_object.data.data);
            }

            if( ""!== ec_object.action.type && false !== ec_object.action.type){
                ec_object.action.data = ec_object.action.data || {};
                if(typeof(ec_object.action.data)==="object"){
                    $.each(ec_object.action.data,function(key,val){
                        ec_object.action.data[key]=_eval(ele, val);
                    });
                }
                jga(ns+'ec:setAction', ec_object.action.type, ec_object.action.data);
            }

            _d('Fired '+ns+'send for Social Tracking');
        }
    };



    /**
    * Tracks a pageview using the given uri.
    *
    */
    $.jtrack.trackPageview = function(pageTracker,uri) {
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
    $.jtrack.hit = function(ele, ga_name, ns, hitType, hitPage) {
        var jga = window[ga_name];
        if(!_def(jga)) {
            _d('FATAL: ga is not defined');
        } else {
            var type,page;

            type = hitType!==null ? {'hitType': hitType} : {};
            page = hitPage!==null ? {'page': hitPage} : {};
            jga(ns+'send', $.extend({},type,page) );

            _d('Fired '+ns+'send for hitType Tracking');
        }
    };
    /* NOTE NEEDS AN ECOM HERE TOO */


    /**
    * If truned on then this will clear any url params
    */
    $.jtrack.clearCampaignUrl = function() {
        var currentHref = window.location.href;
        var GAQueries = [ 'utm_source','utm_medium','utm_term','utm_content','utm_campaign','_ga' ];
        if(currentHref.indexOf('utm_source=')>-1 || currentHref.indexOf('_ga=')>-1){
            var currentUrl = currentHref.split(window.location.host)[1];
            var queries = currentHref.split('?')[1];
            currentUrl = currentHref.split('?')[0];
            if(queries!==""){
                var queryArray = queries.split('&');
                var newQueries = [];
                $.each(queryArray,function(idx,block){
                    var queryPart = block.split('=');
                    if($.inArray(queryPart[0],GAQueries)===-1){
                        newQueries.push(block);
                    }
                });
                if( newQueries.length>0 ){
                    var query = newQueries.join('&');
                    currentUrl=currentUrl+"?"+query;
                }
            }
            window.history.replaceState(null, $(document).find("title").text(), currentUrl);
        }
    };

    /**
    * Adds click tracking to elements. Usage:
    *
    *  $('a').jtrack.track()
    *
    */
    $.fn.jtrack = function(options,ga_name,ns) {
        // Add event handler to all matching elements
        return $.each($(this),function() {
            var jga = window[ga_name];
            var ele, settings, overwrites, mode, alias,
                category, action, eventTracked, label,
                value, skip_internal, _link, nonInteraction,
                callback, tasactedEvent, skip, marker,
                network, socialAction, ec;

            ele			= $(this);
            settings	= $.extend({}, $.jtrack.eventdefaults, options);
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
                //label			= _eval(ele, settings.label);
                //value			= _eval(ele, settings.value);
                //value			= isNaN(value)?1:value;
                skip_internal	= _eval(ele, settings.skip_internal);
                _link			= settings._link;
                nonInteraction	= settings.nonInteraction;
                callback		= settings.callback;
                ec              = settings.ec;

                if( false !== settings.set_role ){
                    ele.attr( 'role' , eventTracked+'_'+action+'_'+category);
                }

                tasactedEvent = eventTracked + '.' + (alias==="undefined" || alias===null ? 'jtrack': alias);

                skip = skip_internal && (ele[0].hostname === location.hostname);

                marker = (alias==="undefined" || alias===null)?eventTracked:alias;
                jtrackOp[marker]=[];
                jtrackOp[marker]["ele"]=ele;

                jtrackOp[marker]["tasactedEvent"]=tasactedEvent;

                if(overwrites==='true'){
                    ele.off(tasactedEvent);
                    ele.unbind(tasactedEvent);
                    _d('overwriting '+tasactedEvent);
                }
                _d(skip?'Skipping ':'Tracking '+' event '+tasactedEvent);
                ele.on(tasactedEvent, function(e) {

                    if(nonInteraction!==null){
                        jga('set', 'nonInteraction', nonInteraction);
                    }

                    _d('doing event '+tasactedEvent);


                    if(false !== $.jtrack.settings.userId){
                        $.jtrack.setUserId(ele, ga_name, ns, $.jtrack.settings.userId);
                    }

                    if( false !== settings.ec && ! $.isEmptyObject(settings.ec) ){
                        $.jtrack.setEC(ele, ga_name, ns, settings.ec);
                    }

                    if(!skip && mode.indexOf("event")>-1 ){
                        //rechecking the vales here as it's on `click` not on inital setup
                        action			= _eval(ele, settings.action);
                        label			= _eval(ele, settings.label);
                        category		= _eval(ele, settings.category);
                        value			= _eval(ele, settings.value);
                        value			= isNaN(value)?0:value;
                        $.jtrack.trackEvent(ele,ga_name,ns,category, action, label, value,callback);
                    }
                    if(mode.indexOf("_social")>-1 ){
                        network      = _eval(ele, settings.network);
                        socialAction = _eval(ele, settings.socialAction);
                        $.jtrack.trackSocial(ele,ga_name,ns,network,socialAction);
                    }
                    if(mode.indexOf("_link")>-1){
                        _d('Fired _link for Tracking for _link from mode: '+mode);
                       // Cross browser hoops.
                        var target = e.target || e.srcElement;

                        if (target && target.href) {
                            jga(ns+'linker:decorate', target);
                        }
                    }
                    return true;
                });

            }
        });
    };
}(jQuery));
