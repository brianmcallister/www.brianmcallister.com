/*

    Author: Brian McAllister

*/
$( function() {
  
  var random = function(min, max) {
    var adjustedMax = (parseFloat(max) - parseFloat(min)) + 1;
    return Math.floor( Math.random() * adjustedMax ) + parseFloat( min );
  };
  
  var windowHeight  = $(window).height(),
      $body         = $('body'),
      
      // Four parallax effect blocks
      $blocks       = $('.blocks'),
      $block1       = $('#block0'),
      $block2       = $('#block1'),
      $block3       = $('#block2'),
      $block4       = $('#block3'),
      blockOffset   = [],
      blockFactor   = [],
      move;
      

  $(window).load( function() {
    
    var docHeight     = $(document).height(),
        blockRange    = parseInt(docHeight / 4, 10),
        currentRange  = 0,
        updateTop;
    
    $blocks.each( function( index, el ) {
      
      var top     = random(currentRange, currentRange + blockRange),
          height  = random(1000, docHeight),
          color   = '0.0' + random(10, 50).toPrecision(2),
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
        
        console.log($(el).data('factor'))
      });
      
      move = this.pageYOffset;
      
    });
    
    
  });
    
  // $(window).scroll( function() {
  //   
  //   $blocks.each( function( index, el ) {
  //     
  //     if ( window.pageYOffset < move ) {
  //       top = blockOffset[index] + $(el).data('factor');
  //     } else {
  //       top = blockOffset[index] - $(el).data('factor');
  //     }
  //     
  //     $(el).offset({ top: top, left: 0 })
  //     blockOffset[index] = $(el).offset().top;
  //     
  //   });
  //   
  //   move = this.pageYOffset;
  //   
  // });
  
  
  
      
  // 
  // 
  // 
  // 
  // 
  // 
  //     
  //     
  //     
  //     
  // 
  // // Only set up the blocks once the page is fully loaded.    
  // $(window).load( function() {
  //   
  //   $body.height( $(document).height() );
  //   
  //   var randPos         = random(1, windowHeight),
  //       randHeight      = random(500, 1000),
  //       randColor       = '0.0' + random(50, 80).toPrecision(2),
  //       randFactor      = random(15, 25),
  //       
  //       blockTemplate   = $('#block-template').html(),
  //       // $block          = $(blockTemplate).appendTo( $body ),
  //       
  //       $project        = $('article').first(),
  //       $projectPos     = $project.offset(),
  //       
  //       currentOffset, previousOffset, top;
  //   
  //   // $block.css({
  //   //   'top'               : randPos,
  //   //   'height'            : randHeight,
  //   //   'background-color'  : 'rgba(0, 0, 0, ' + randColor + ')'
  //   // }).fadeIn();
  //   
  //   for ( var i = 0; i < 3; i++ ) {
  //     
  //     var name    = 'block' + i,
  //         pos     = random(1, windowHeight),
  //         height  = random(500, 1000),
  //         color   = '0.0' + random(50, 80).toPrecision(2),
  //         factor  = random(15, 25);
  //         
  //     $body.append( 
  //       
  //       $(blockTemplate).addClass(name).css({
  //         'top'     : pos,
  //         'height'  : height,
  //         'background-color'  : 'rgba(0, 0, 0, ' + color + ')'
  //       });
  //     
  //     );
  //     
  //     
  //   }
  //     
  //     
  //     
  //   });
  //   
  //   
  //   $(window).scroll( function( event ) {
  // 
  //     currentOffset = $block.offset();
  //     
  //     this.pageYOffset > previousOffset ? top = currentOffset.top - randFactor : top = currentOffset.top + randFactor;
  //   
  //     $block.offset({'top' : top, 'left' : 0});
  // 
  //     
  //     // if ( $projectPos.top < previousOffset ) {
  //     //   console.log('adfasfasdf');
  //     // }
  // 
  //     previousOffset = this.pageYOffset;
  // 
  //   });
  //   
  // });
  
 
});




// 
// $( function() {
//   
//   window.portfolioItems = [
//     
//     {  
//       'title': 'Project 1',
//       'description': 'blah blha blah',
//       'link': 'http://example.com',
//       'type': ['dev', 'design'],
//       'images': ['image1.jpg', 'image2.jpg'] 
//     },
//     
//     {  
//       'title': 'Project 2',
//       'description': 'blah blha blah',
//       'link': 'http://example.com',
//       'type': ['dev'],
//       'images': ['image1.jpg', 'image2.jpg'] 
//     },
//     
//     {  
//       'title': 'Project 3',
//       'description': 'blah blha blah',
//       'link': 'http://example.com',
//       'type': ['design'],
//       'images': ['image1.jpg', 'image2.jpg'] 
//     }
//     
//   ];
//   
//   window.Project = Backbone.Model.extend({});
//   
//   _.each( portfolioItems, function(project) {
//     console.log(project);
//     window.projects = new Project(project);
//   });
//   
//   
//   
//   // window.project = new Project;
//   
//   // window.project.set({
//   //   title: 'Project 1',
//   //   description: 'blabhablhba balhba',
//   //   link: 'http://example.com',
//   //   type: ['dev', 'design'],
//   //   images: ['image1.jpg', 'image2.jpg']
//   // });
//     
// });