/*!
 * Basic postMessage Support
 *
 * Copyright (c) 2013-2014 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Handles the postMessage stuff in the pattern, view-all, and style guide templates.
 *
 */

// alert the iframe parent that the pattern has loaded assuming this view was loaded in an iframe
if (self != top) {
	
	// handle the options that could be sent to the parent window
	//   - all get path
	//   - pattern & view all get a pattern partial, styleguide gets all
	//   - pattern shares lineage
	var path = window.location.toString();
	var parts = path.split("?");
	var options = { "event": "patternLab.pageLoad", "path": parts[0] };
	
	options.patternpartial = (patternData.patternPartial !== "") ? patternData.patternPartial : "all";
	if (patternData.lineage !== "") {
		options.lineage = patternData.lineage;
	}
	
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	parent.postMessage(options, targetOrigin);
	
	// find all links and add an onclick handler for replacing the iframe address so the history works
	var aTags = document.getElementsByTagName('a');
	for (var i = 0; i < aTags.length; i++) {
		aTags[i].onclick = function(e) {
			var href   = this.getAttribute("href");
			var target = this.getAttribute("target");
			if ((target != undefined) && ((target == "_parent") || (target == "_blank"))) {
				// just do normal stuff
			} else if (href && href !== "#") {
				e.preventDefault();
				window.location.replace(href);
			} else {
				e.preventDefault();
				return false;
			}
		};
	}
	
	// bind the keyboard shortcuts for various viewport resizings + pattern search
	var keys = [ "s", "m", "l", "d", "h", "f" ];
	for (var i = 0; i < keys.length; i++) {
		jwerty.key('ctrl+shift+'+keys[i],  function (k,t) {
			return function(e) {
				var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "ctrl+shift+"+k });
				parent.postMessage(obj,t);
				return false;
			}
		}(keys[i],targetOrigin));
	}
	
	// bind the keyboard shortcuts for mqs
	var i = 0;
	while (i < 10) {
		jwerty.key('ctrl+shift+'+i, function (k,t) {
			return function(e) {
				var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
				var obj = JSON.stringify({ "event": "patternLab.keyPress", "keyPress": "ctrl+shift+"+k });
				parent.postMessage(obj,t);
				return false;
			}
		}(i,targetOrigin));
		i++;
	}
	
}

// if there are clicks on the iframe make sure the nav in the iframe parent closes
var body = document.getElementsByTagName('body');
body[0].onclick = function() {
	var targetOrigin = (window.location.protocol == "file:") ? "*" : window.location.protocol+"//"+window.location.host;
	var obj = JSON.stringify({ "event": "patternLab.bodyClick", "bodyclick": "bodyclick" });
	parent.postMessage(obj,targetOrigin);
};

// watch the iframe source so that it can be sent back to everyone else.
function receiveIframeMessage(event) {
	
	var path;
	var data = (typeof event.data !== "string") ? event.data : JSON.parse(event.data);
	
	// does the origin sending the message match the current host? if not dev/null the request
	if ((window.location.protocol != "file:") && (event.origin !== window.location.protocol+"//"+window.location.host)) {
		return;
	}
	
	// see if it got a path to replace
	if (data.event == "patternLab.updatePath") {
		
		if (patternData.patternPartial !== "") {
			
			// handle patterns and the view all page
			var re = /(patterns|snapshots)\/(.*)$/;
			path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace(re,'')+data.path+'?'+Date.now();
			window.location.replace(path);
			
		} else {
			
			// handle the style guide
			path = window.location.protocol+"//"+window.location.host+window.location.pathname.replace("styleguide\/html\/styleguide.html","")+data.path+'?'+Date.now();
			window.location.replace(path);
			
		}
		
	} else if (data.event == "patternLab.reload") {
		
		// reload the location if there was a message to do so
		window.location.reload();
		
	}
	
}
window.addEventListener("message", receiveIframeMessage, false);
