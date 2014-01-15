jTrack
======

jQuery plugin for Google Tracking.  For a complete list of options and examples see the [wiki](https://github.com/jeremyBass/jTrack/wiki/options)

##BOOTSTRAP setups
 
The default set up is as simple as just adding
 
<script id="tracker_agent" src="http://images.wsu.edu/javascripts/tracking/bootstrap.js?gacode=UA-XXXXXXXX-X" type="text/javascript"></script>
 
In the page you need to track.  The gacode needs to be adjusted as per account.  This will pull in a default set of rules.  The rules are a json string feed from a .txt file located in some folder.  For example if you are a dev at WSU it's http://images.wsu.edu/javascripts/tracking/configs/.  Use the bootstrap url if you don’t want to create or copy your own local to the site, though since it’s served off a different subdomain and is suggested.  That boot file loads the rules from this url : http://images.wsu.edu/javascripts/tracking/configs/pick.asp?loading=test which would be the .txt that it picks for the rules to obey.  If you use the bootstrap all you have to do to use your own set of rules that may or may not be domain specific, is to use to put the new .txt file in that configs folder and add a query param to the url.

```html
<script id="tracker_agent" src=" http://images.wsu.edu/javascripts/tracking/bootstrap.js?gacode=UA-XXXXXXXX-X&loading=test" type="text/javascript"></script>
```

That is all the easy load stuff.  To call the jquery plugin and use your own custom.
 
##Controller file implementation
 
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
It should be noted that you are able to apply a function as a value.  You will be limited by the quotes as you would normally be assigning the anonymous function to the object property directly.  In other words if you find that you must have complex logic, don't put it in the json file. 

 
 
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
