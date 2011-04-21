<?php
	if( !$_GET['portfolio'] ): ?>
	<footer class="home_footer">
		<h1>Odds and Ends: </h1>
		<p>This section is great if you want to <em class="email" title="brian [at] brianmcallister [dot] com">email me</em>, or follow me on <a id="twitter" rel="external" href="http://twitter.com/freebowlofsoup">Twitter</a>.</p>
		<!-- <aside>it might also be great if you were hoping for pictures of cats</aside> -->

		<div id="dark_footerbar">
				<p><span>.........</span>COPYRIGHT<span>.........</span></p>
				<a href="#fans"><img alt="Brian W. McAllister" src="/img/signature_small.png" /></a>
				<p><span>..............</span><?=date("Y", time())?><span>..............</span></p>
		</div>
	</footer>
<?php else: ?>
	<footer>
		<a href="/" class="button pill">head home</a>
	</footer>
	
	<?php endif;?>

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
	<script>!window.jQuery && document.write('<script src="js/jquery-1.4.2.min.js"><\/script>')</script>
	
	<script src="http://cdn.jquerytools.org/1.2.5/all/jquery.tools.min.js"></script>
	
	<script src="/js/mylibs/jquery.color.js"></script>
	<script src="/js/mylibs/jquery.easing.1.3.js"></script>
	<script src="/js/mylibs/jquery.localscroll-1.2.7-min.js"></script>
	<script src="/js/mylibs/jquery.scrollTo-1.4.2-min.js"></script>
	
	<script src="/js/script.js"></script>

	<!-- <script>
	 var _gaq = [['_setAccount', 'UA-XXXXX-X'], ['_trackPageview']];
	 (function(d, t) {
	  var g = d.createElement(t),
	      s = d.getElementsByTagName(t)[0];
	  g.async = true;
	  g.src = '//www.google-analytics.com/ga.js';
	  s.parentNode.insertBefore(g, s);
	 })(document, 'script');
	</script> -->
  
</body>
</html>