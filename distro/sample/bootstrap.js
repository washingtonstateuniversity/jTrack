// JavaScript Document
if(typeof(loading)==='undefined'){var loading='';}
var vbtimer;
function async_load_js(url){var headID = document.getElementsByTagName("head")[0];var s = document.createElement('script');s.type = 'text/javascript';s.async = true;s.src = url;var x = document.getElementsByTagName('script')[0];headID.appendChild(s);}
var timers_arr = new Array(),c=0,t,timer_is_on=0;
function clearCount(timer){clearTimeout(timers_arr[timer]);timers_arr[''+timer+'']=0;delete timers_arr[''+timer+''];}
function setCount(timer,time,func){clearCount(timer);if(timers_arr[timer]==0||typeof(timers_arr[timer]) === 'undefined'){timers_arr[timer]=setTimeout(function(){func();},time);}}
function param( name , url ){if(typeof(url)==='undefined')url=window.location.href;name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS = "[\\?&]"+name+"=([^&#]*)";var regex = new RegExp( regexS );var results = regex.exec( url );if( results == null ) return false; else return results[1];}


if((loading.indexOf('jQuery') == -1)&&(typeof(jQuery) === 'undefined'||typeof($) === 'undefined')){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
	loading='jQuery';
}	
load_ViewBook_base();
function load_ViewBook_base() {
	vbtimer=setCount('vbtimer_jqueryCheck',50,function(){				   
		if(typeof(jQuery) === 'undefined'||typeof($) === 'undefined'){
			load_ViewBook_base();
		}else{
			if(typeof($.jtrack ) === 'undefined' && typeof($.fn.track) === 'undefined' && loading.indexOf('jtrack') == -1){
				async_load_js('http://images.wsu.edu/javascripts/jquery.jtrack.js');
				loading=loading+',jtrack';
				load_ViewBook_base();
			}else{
				clearCount('vbtimer_jqueryCheck');	
				
				var url = document.getElementById('tracker_agent').src; 
				var GAcode = param( 'gacode' , url );
				$.jtrack.defaults.debug = true;
				$.ajaxSetup ({cache: false}); 
				$.getJSON('track/default.txt' , function(data){
					$.jtrack({
						load_analytics:{account:GAcode},
						trackevents:data // this can be hard codded here or set do be feed in like so
					});
				});
			}
		}
	});
}