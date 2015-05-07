/*

 ractive-transitions-slidehorizontal
 =======================================================

 Version 1.0.0.

 A horizontal slide transition seems as useful as a vertical one...

 ==========================

 Troubleshooting: If you're using a module system in your app (AMD or
 something more nodey) then you may need to change the paths below,
 where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

 ==========================

 Usage: Include this file on your page below Ractive, e.g:

 <script src='lib/ractive.js'></script>
 <script src='lib/ractive-transitions-slidehorizontal.js'></script>

 Or, if you're using a module loader, require this module:

 // requiring the plugin will 'activate' it - no need to use
 // the return value
 require( 'ractive-transitions-slidehorizontal' );

 */

(function ( global, factory ) {

	'use strict';

	// AMD environment
	if ( typeof define === 'function' && define.amd ) {
		define([ 'ractive-isomorphic', 'ramjet' ], function(ri, ramjet){return factory(ri.Ractive, ramjet);} );
	}

	// Common JS (i.e. node/browserify)
	else if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'ractive-isomorphic').Ractive, require('ramjet') );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive, global.ramjet );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the ractive-transitions-slidehorizontal plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function (Ractive, ramjet) {
	'use strict';

	var defaults = {
		duration: 600,
		//easing: 'easeInOut', ***
		el_id: ''
	};

	Ractive.transitions.ramjet = function ( t, params ) {
		params = t.processParams(params, defaults );
		var parent = window.document.getElementById(params.el_id);
		var child = t.node;
		if (t.isIntro) {
			var display = t.getStyle('display');
			params.done = function(){
				t.setStyle('display', display);
				t.complete();
			};
			ramjet.transform(parent, child, params);
		} else {
			params.done = t.complete;
			ramjet.transform(child, parent, params);
		}
		t.setStyle('display', 'none');
	};
}));
