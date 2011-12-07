/*

    Author: Brian McAllister

*/$(function(){var a=function(a,b){var c=parseFloat(b)-parseFloat(a)+1;return Math.floor(Math.random()*c)+parseFloat(a)},b=$(window),c=b.height(),d=$("body"),e=$(".blocks"),f=[];$("#link-client-list").bind("click",function(a){$.scrollTo($("footer"),{duration:200})});b.load(function(){$("#logo").css("opacity",1);var c=$(document).height(),d=parseInt(c/e.size(),10),g=0,h,i;_.each(e,function(b,e){var f=a(g,g+d),h=a(1e3,c),i="0.0"+a(10,50).toPrecision(2),j=a(5,20);$(b).css({top:f,height:h,"background-color":"rgba(0, 0, 0, "+i+")"}).data("factor",j).fadeIn();g+=d});b.scroll(function(){_.each(e,function(a,b){var c=$(a);window.pageYOffset<i?h=f[b]+c.data("factor"):h=f[b]-c.data("factor");c.offset({top:h,left:0});f[b]=c.offset().top});i=this.pageYOffset})})});