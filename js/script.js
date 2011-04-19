/* Author: 

*/

$(document).ready(function(){
	
	// change the prev/next buttons on the portfolio page to fixed when you
	// scroll down the page
	var $buttonWrap = $('.button-wrap'),
		currentPos = 'relative',
		is_portfolio = $('body').hasClass('portfolio');
	
	$(this).scroll( function() {
		
		var pageDistance = $(this).scrollTop();

		if (currentPos == 'relative') {
			if (pageDistance > 135) {
				$buttonWrap.css({'position' : 'fixed', 'top' : '10px'});
				currentPos = 'fixed';
			}
		} else {
			if (pageDistance < 135) {
				$buttonWrap.css({'position' : 'relative', 'top' : '0'});
				currentPos = 'relative';
			}
		}
	
	}); // end change to fixed while scrolling
	
	
	// get ready to fix emails
	$('.email').each(function(){		

		// get the original link text now, so we can use it later
		// also get the title attribute of the .email element
		var linkText = $(this).html();
		var protectedEmail = $(this).attr("title");

		// prepare the mailto: link
		// replace [dot], [at] and [sub=*] with the correct symbols,
		// no matter how many spaces have been typed in "title"
		protectedEmail = protectedEmail.replace(/\s*\[at\]\s*/gi,"@");
		protectedEmail = protectedEmail.replace(/\s*\[dot\]\s*/gi,".");
		protectedEmail = protectedEmail.replace(/\s*\[sub=(.*)\]/, "?subject=$1");

		// prepare the title attribute for the new link
		// remove the ?subject from the old title attribute if there is one
		if (protectedEmail.indexOf("?") != -1) {
			emailTitle = protectedEmail.substr(0, protectedEmail.indexOf("?"));
		} else {
			emailTitle = protectedEmail
		}

		// replace .email with a mailto: link and put the persons email address in the title
		$(this).html(protectedEmail).replaceWith("<a id=\"email\" href=\"mailto:"+protectedEmail+"\" title=\"Email Address: "+emailTitle+"\">"+linkText+"</a>");

	});

	

	
	// featured project summaries
	var $featured_project_info_slider = $('#featured-project-info-slider');
	$featured_project_info_slider.scrollable({ circular : false,
	  												keyboard : false,
													next	 : null,
													prev     : null });
	
	var ftd_proj_info_slider = $featured_project_info_slider.data('scrollable');
	
	// Featured project slider counter
	var going_next = '',
		sliding = false;
	
	$('.next, .prev').click(function() {
		going_next = $(this).hasClass('next');
	});
	
	$(".scrollable").scrollable({ circular : true, keyboard : true });
	
	var api 		   = $(".scrollable").data("scrollable"),
			$one_slide = $('#counter .one_slide');

	var animate = function(next_page) {
		
		var span = $('<span/>').attr('id', 'page-' + next_page)
							   .addClass('flipper one')
							   .text(next_page);
		
		if( going_next ) {
			
			// animate the summary
			if( ftd_proj_info_slider != undefined ) {
				
				if( next_page == 3 )
					ftd_proj_info_slider.next();
				else if( next_page == 1 )
					ftd_proj_info_slider.prev();
			
			} // !undefined
			
			span.appendTo( $one_slide );
			
			sliding = true;
			
			$one_slide.animate({ top : '-=18px' }, 
									{ easing   : 'easeInQuad', 
									  duration : 300, 
									  queue    : true, 
									  complete : function() {
										$one_slide.find('span:not(#page-' + next_page + ')').remove();
										$(this).css({ top : 0 });
										sliding = false;
									  } // end complete callback
									});
		} // endif going next
		else {
			
			// going previous
			
			// animate the summary on the home page
			if( ftd_proj_info_slider != undefined ) {
				
				if( next_page == 2 )
					ftd_proj_info_slider.prev();
				else if( next_page == 5 )
					ftd_proj_info_slider.next();
			
			} // !undefined
			
			span.prependTo( $one_slide );
			
			sliding = true;
			
			$one_slide.css({ top : "-18px" })
						   .animate({ top : "0" }, 
									{ easing   : 'easeOutQuad', 
									  duration : 300, 
									  queue    : true, 
									  complete : function() {
										$one_slide.find('span:not(#page-' + next_page + ')').remove();
										sliding = false;
									  } // end complete callback
							});
			
		} // end going previous
		
		
		
	}; // animate()
	
	var border_value = false;
	
	api.onBeforeSeek(function(e, next) {
		
		if( sliding && !border_value )
			return false;
		
		var current 	= parseInt($one_slide.find('.one').text()),
				next_page = null;
		
		if( is_portfolio ) {
			var $secret_navigation = $('#secret-navigation');
		}
		
		if(next === -1) {
			border_value = true;
			next_page = api.getSize();
			
			if( is_portfolio ) {
				// go to the next project
				var next_url = $secret_navigation.find('.current').prev().attr('href');
				if( typeof( next_url ) == 'undefined' ) {
					next_url = $secret_navigation.find('a:last').attr('href');
				}
				window.location = next_url;
				
				return false;
			}
			
			animate(next_page);
		} else if (next === api.getSize()) {
			border_value = true;
			next_page = '1';
			
			if( is_portfolio ) {
				
				// go to the next project
				var next_url = $secret_navigation.find('.current').next().attr('href');
				if( typeof( next_url ) == 'undefined' ) {
					next_url = $secret_navigation.find('a:first').attr('href');
				}
				window.location = next_url;
				
				return false;
			}
			
			animate(next_page);
		} else if( border_value == false ) {
			next_page = next+1;
			animate(next_page);
		} else if( border_value == true ) {
			border_value = false;
		}
		
		var slideHeight = $($('.items img')[next_page]).attr('height');
		
		if (!slideHeight == 0) {
			api.getRoot().animate({'height' : slideHeight}, 400);
		}
		
		
	});


});