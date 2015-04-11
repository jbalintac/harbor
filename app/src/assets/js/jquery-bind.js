(function (){
	$(document).ready(function() {
	    $('#main').fullpage({
	    	anchors: ['home', 'services', /*'about',*/ 'portfolio', 'contact'],
    		menu: '#navbar',
			navigation: true,
			navigationPosition: 'right',
			navigationTooltips: ['Home', 'Services', /*'About Us',*/ 'Portfolio','Contact Us'],
			afterRender: function(){

				$('#main').toggle();
			}
	    });
	});
})();