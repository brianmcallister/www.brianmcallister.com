<!doctype html>

<html lang="en" class="no-js">

<head>
	<title>Brian McAllister</title>
	<!--[if IE]><![endif]-->
	
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="description" content="Brian McAllister is a web designer in New York City.">
	<meta name="author" content="Brian McAllister">
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
	
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" media="handheld" href="/css/handheld.css">
	
	<script src="js/libs/modernizr-1.7.min.js"></script>
</head>

<!--[if lt IE 7 ]> <body class="<?= $_GET['portfolio'] ? 'portfolio' : ''; ?> ie ie6"> <![endif]-->
<!--[if IE 7 ]>    <body class="<?= $_GET['portfolio'] ? 'portfolio' : ''; ?> ie ie7"> <![endif]-->
<!--[if IE 8 ]>    <body class="<?= $_GET['portfolio'] ? 'portfolio' : ''; ?> ie ie8"> <![endif]-->
<!--[if IE 9 ]>    <body class="<?= $_GET['portfolio'] ? 'portfolio' : ''; ?> ie ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> 
<body class="<?= $_GET['portfolio'] ? 'portfolio' : ''; ?> ">
<!--<![endif]-->

<?php
 if( $_GET['portfolio']):
?>
<header>
	<div id="portfolio_wrap">
		<h1 class="ir smalllogo">Brian W. McAllister</h1>
		
		<div id="navigate">
			<aside>hey guess what, you're now viewing:</aside>
			
			<div class="switcher">
				<h1>The Full Portfolio</h1>
				
				<div>
					<h3>Web Design</h3>
					<aside>projects designed by me</aside>
					<br /><br />
					<ul>
						<li><a>Jackie Balzer</a></li>
						<li><a>Fanagram</a></li>
						<li><a>Insomniacs</a></li>
						<li><a>Margali &amp; Flynn</a></li>
						<li><a>eTail Landing Page</a></li>
						<li><a>Northern Public Adjusters</a></li>
					</ul>
					
					<h3>Logos &amp; Icons</h3>
					<aside>some logos, some icons, all beautiful</aside>
					<br /><br />
					<ul>
						<li><a>Playful Art logo</a></li>
						<li><a>Moonstruck logo</a></li>
						<li><a>Suffolk Bull Moose logo</a></li>
						<li><a>Octopus Ink logo</a></li>
						<li><a>Prowl icon concept</a></li>
						<li><a>Google Notifier icons</a></li>
					</ul>
					
					<h3>Print</h3>
					<aside>all kinds of things on the printed page</aside>
					<br /><br />
					<ul>
						<li><a>ABI Forums MDE poster</a></li>
						<li><a>ABI Forums 4G poster</a></li>
						<li><a>The Shade Guy</a></li>
						<li><a>South Beach Plaza</a></li>
					</ul>
				</div>
			</div><!-- end #switcher -->
			
		</div><!-- end #navigate -->
	</div><!-- end #portfolio_wrap -->
	
	<div id="bluebar"></div>
</header>
<?php endif; ?>