/*
* WSU TRACKING BOOTSCRIPT
* Version 0.1
* Copyright (c) 2011-12 Jeremy Bass
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*/
function async_load_js(url){var headID = document.getElementsByTagName("head")[0];var s = document.createElement('script');s.type = 'text/javascript';s.async = true;s.src = url;var x = document.getElementsByTagName('script')[0];headID.appendChild(s);}
function param( name , process_url ){if(typeof(process_url)==='undefined'){process_url=window.location.href;}name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS = "[\\?&]"+name+"=([^&#]*)";var regex = new RegExp( regexS );var results = regex.exec( process_url );if( results == null ){ return false;}else{return results[1];}}

url = document.getElementById('tracker_agent').src; 
ver_jquery=(param( 'jquery' , url )!=false?param( 'jquery' , url ):'1.7.2');

if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery!=ver_jquery || jQuery.fn.jquery!=ver_jquery) ){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/'+ver_jquery+'/jquery.min.js');
}	
load_base(url);
function load_base(url) {		
	setTimeout(function(){		   
		if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery!=ver_jquery || jQuery.fn.jquery!=ver_jquery) ){
			load_base(url);
		}else{
			(function($) {
				scriptArray = [ // this is where we'd load the scriptArray list dynamicly.  Right now it's hard coded
					{
						src:"http://images.wsu.edu/javascripts/jquery.jtrack.js",
						exc:function(){
							var GAcode = param("gacode", document.getElementById('tracker_agent').src );
							var _load  = param("loading", document.getElementById('tracker_agent').src );
							var url='http://images.wsu.edu/javascripts/tracking/configs/pick.asp';
							$.getJSON(url+'?callback=?'+(_load!=false?'&loading='+_load:''), function(data){
								$.jtrack.defaults.debug.run = true;
								$.jtrack.defaults.debug.v_console = false;
								$.jtrack.defaults.debug.console = true;
								$.jtrack({ load_analytics:{account:GAcode}, trackevents:data });
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