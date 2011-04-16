/* Author: 

*/

$(document).ready(function(){
	
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

	
	// $.localScroll({ duration : 200, easing : 'easeOutQuad' } );
	
	
	// Animation for the Work category selector on the homepage
	$('#work_select section').mouseenter(function() {
		$(this).animate({'backgroundColor' : 'rgba(0, 0, 0, 0.2)'}, 'fast');
	});
	
	$('#work_select section').mouseleave(function() {
		$(this).animate({'backgroundColor' : 'transparent'}, 'fast');
	});
	
	
	// Featured project slider counter
	var going_next = '';
	var sliding = false;
	
	$('.next, .prev').click(function() {
		going_next = $(this).hasClass('next');
	})
	
	$(".scrollable").scrollable({circular : true, keyboard : true});
	var api = $(".scrollable").data("scrollable");

	var animate = function(next_page) {
			
		var span = $('<span/>').attr('id', 'page-' + next_page).addClass('flipper one').text(next_page);
		
		if(going_next) {
			span.appendTo('.one_slide');
			
			sliding = true;
			
			$('.one_slide').animate({ top : '-=18px' }, {easing : 'easeInQuad', duration : 300, queue : true, complete: function() {
					
					$('.one_slide span:not(#page-' + next_page + ')').remove();
					$(this).css({ top : 0 });
					
					sliding = false;
					
				}
			});
		} else {
			
			span.prependTo('.one_slide');
			
			sliding = true;
			
			$('.one_slide').css({ top : "-18px" });
			$('.one_slide').animate({ top : "0" }, {easing : 'easeOutQuad', duration : 300, queue : true, complete: function() {
				
					$('.one_slide span:not(#page-' + next_page + ')').remove();
					
					sliding = false;
					
				}
			});
		}
		
		
		
	}
	
	var border_value = false;
	
	api.onBeforeSeek(function(e, next) {
		
		if( sliding && !border_value )
			return false;
		
		var current = parseInt($('.one').text());
		var next_page = "";

		if(next === -1) {
			border_value = true;
			next_page = api.getSize();
			animate(next_page);
		} else if (next === api.getSize()) {
			border_value = true;
			next_page = '1';
			animate(next_page);
		} else if( border_value == false ) {
			next_page = next+1;
			animate(next_page);
		} else if( border_value == true ) {
			border_value = false;
		}
		
	});




	

});