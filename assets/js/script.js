/* Author: Brian McAllister

*/

$( function() {
  
  window.projects = {
    
    project: {
      
      'title': 'Project 1',
      'link': 'http://example.com',
      'type': ['dev', 'design'],
      'images': ['image1.jpg', 'image2.jpg']
      
    },
    
    project: {
      
      'title': 'Project 2',
      'link': 'http://example.com',
      'type': ['dev'],
      'images': ['image3.jpg', 'image4.jpg']
      
    },
    
    project: {
      
      'title': 'Project 3',
      'link': 'http://example.com',
      'type': ['design'],
      'images': ['image5.jpg', 'image6.jpg']
      
    }
    
  }; // projects
  
  
  
  
  
  
  
  
  
  
  window.Project = Backbone.Model.extend({
    
    title: 'Title',
    
    link: 'http://example.com',
    
    featured: false,
    
    type: ['dev', 'design'],
    
    images: [
      '/img/image.jpg',
      '/img/image2.jpg'
    ]
    
  });
  
  
  
});























