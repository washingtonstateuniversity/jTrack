jTrack
======

jQuery plugin for Google Tracking.  More coming.. 

Used like
```javascript

alert('foo');

```

##BOOTSTRAP setups
 
The default set up is as simple as just adding
 
<script id="tracker_agent" src="http://images.wsu.edu/javascripts/tracking/ bootstrap.js?gacode=UA-25040747-1" type="text/javascript"></script>
 
In the page you need to track.  The gacode needs to be adjusted as per account.  This will pull in a default set of rules.  The rules are a json string feed from a .txt file located in http://images.wsu.edu/javascripts/tracking/configs/ .  The bootstrap url if you don’t want to create or copy your own local to the site, thou since it’s served off a different subdomain and is suggested.  That boot file loads the rules from this url : http://images.wsu.edu/javascripts/tracking/configs/pick.asp?loading=test which would be the .txt that it picks for the rules to obey.  If you use the bootstrap all you have to do to use your own set of rules that may or may not be domain specific, is to use to put the new .txt file in that configs folder and add a query param to the url.

```html
<script id="tracker_agent" src=" http://images.wsu.edu/javascripts/tracking/bootstrap.js?gacode=UA-25040747-1&loading=test" type="text/javascript"></script>
```

That is all the easy load stuff.  To call the jquery plugin and use your own custom.
 
jTrack.js Controllers
 
###EXAMPLE:
// NOTE: Copy .txt as they are.  It’s json format as the options are to.  These are the simple sets that can be done.  Note all options below:

```javascript
var data = [
       {
           "element": "a",
           "options": {
               "category": "outbound"
           }
       }, {
           "element": "a[href*='wsu.edu']",
           "options": {
               "category": "internal",
               "overwrites": "true"
           }
       }, {
          "element": "a:not([href^='http:'])",
           "options": {
               "category": "internal",
               "overwrites": "true"
           }
       }, {
          "element": "a[href*='mailto:']",
           "options": {
               "category": "email",
               "overwrites": "true"
           }
       }, {
          "element": "a.track.docx",
           "options": {
               "action": "docx",
               "category": "download",
               "label": "function(ele){ return ( ($(ele).attr('title')!='' && typeof($(ele).attr('title')) !=='undefined' ) ? $(ele).attr('title') : $(ele).attr('href') ) }",
               "overwrites": "true"
           }
       }, {
          "element": "a.track.facebook",
           "options": {
               "category": "Social",
               "action": "Facebook",
               "overwrites": "true"
           }
       }
]
$.jtrack.defaults.debug.run = true;
$.jtrack.defaults.debug.v_console = false;
$.jtrack.defaults.debug.console = true;
$.jtrack({ load_analytics: { account: GAcode }, trackevents: data });
```
 
 
###OPTIONS
```javascript
 
  /**
   * Add jTrack to handle all things GA related
   *
   * Usage:
   *  <script type="text/javascript">
   *    $.jtrack({ load_analytics:{account:'UA-xxx-xxx'} }); // min
   *
   *
   *    $.jtrack({ load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}} }); // default usage
   *
   *
   *    $.jtrack({ // Full default usage
   *          load_analytics:{account:'UA-xxx-xxx',options:{onload: true, status_code: 200}},
   *          trackevents:{[
   *                        element:'a'
   *                        options:{
   *                                     // detects host as category if none set
   *                              category      : function(element) { return (element[0].hostname === location.hostname) ? 'internal':'external'; }, 
   *
   *                                     // use alts to add the action
   *                              action        : function(ele) { return typeof(ele.attr('alt'))!=='undefined' ? ele.attr('alt'):null; },
   *
   *                                     // uses href if none set
   *                              label         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.attr('href'):null; },
   *
   *                                     // uses text of element if set (NOTE: text() only get text elements of the dom and no other)
   *                              value         : function(ele) { return typeof(ele.text())!=='undefined' ? ele.text():null; },
   *
   *                                     // Set the action that happened ie: stopped movie
   *                              eventTracked  : 'click',
   *
   *                              skip_internal : false,
   *                              overwrites    : false,
   *                              noninteraction: false,
   *                              debug         : {run : false , v_console : true}
   *                        }
   *          ]}
   *    });
   *  </script>
   **/
```

###NOTES FROM PLUGIN
```javascript
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
  /**
   * Adds click tracking to elements. Usage:
   *
   *  $('a').jtrack.track()
   *
   */
``` 
 
