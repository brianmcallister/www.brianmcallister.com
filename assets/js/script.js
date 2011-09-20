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

    
  });
  
  window.ProjectList = Backbone.Collection.exten({
    
    model: Project
    
  });
  
  window.Projects = new ProjectList;
  
  window.ProjectView = Backbone.View.extend({
    
    tag: 'article',
    
    template: _.template( $('#project-template').html() ),
    
    
    
  });
  
  
  
});























