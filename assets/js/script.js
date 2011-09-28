/*

    Author: Brian McAllister

*/
$( function() {
  
  // Generate a random number between min and max.
  var random = function(min, max) {
    var adjustedMax = (parseFloat(max) - parseFloat(min)) + 1;
    return Math.floor( Math.random() * adjustedMax ) + parseFloat( min );
  };
  
  var windowHeight  = $(window).height(),
      $body         = $('body'),
      
      // Parallax effect blocks.
      $blocks       = $('.blocks'),
      
      // Keep track of each blocks offset.
      blockOffset   = [];
      
  // Set up the parallax blocks after everything is loaded.
  // The position of each block is based on the height of
  // the document with all elements loaded.
  $(window).load( function() {
    
    $('#logo').css('opacity', 1);
    
    var docHeight     = $(document).height(),
    
        // Position each block within an evenly divided range,
        // based on the height of the document.
        blockRange    = parseInt(docHeight / $blocks.size(), 10),
        currentRange  = 0,
        updateTop, move;
    
    $blocks.each( function( index, el ) {
          
          // Place each block in a random spot within each range.
      var top     = random(currentRange, currentRange + blockRange),
          height  = random(1000, docHeight),
          color   = '0.0' + random(8, 50).toPrecision(2),
          
          // factor determines how fast the blocks move while scrolling.
          factor  = random(5, 20);

      $(el).css({
        'top'     : top,
        'height'  : height,
        'background-color'  : 'rgba(0, 0, 0, ' + color + ')'
      }).data('factor', factor).fadeIn();
      
      currentRange += blockRange;
      
    }); // each
    
    $(this).scroll( function() {
      
      $blocks.each( function( index, el ) {
        
        if ( window.pageYOffset < move ) {
          updateTop = blockOffset[index] + $(el).data('factor');
        } else {
          updateTop = blockOffset[index] - $(el).data('factor');
        }
        
        $(el).offset({ top: updateTop, left: 0 });
        blockOffset[index] = $(el).offset().top;
        
      });
      
      move = this.pageYOffset;
      
    }); // window.scroll
    
    
  }); // window.load
    
  
  
  
  

  var $email      = $('#link-email'),
      $clientlist = $('#link-client-list'),
      $worksheet  = $('#link-client-worksheet'),
      $links      = $('#logo-links'),
      $logo       = $('#logo'),
      $header     = $('#contain > header');
      
  $email.click( function( event ) {
    
    $links.css('opacity', 0);
    $logo.css('opacity', 0);
      
    $header.append('<section id="contact">adsfasdf</section>');
    
    $contact = $('#contact');
    
    
    
    event.preventDefault;
    
  });
  
  $('article').click( function() {

    $('.shutter').animate({
      'top'     : -400
    }, 600, 'easeInchQuint');
    
    
  })
  

  
  
  $links.mouseleave( function() {
    $(this).removeAttr('style');
  });

  
  
  
});