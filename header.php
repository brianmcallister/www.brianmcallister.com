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
	
  	<link rel="shortcut icon" href="/website/favicon.png">
	<link rel="author" href="humans.txt" />
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" media="handheld" href="/css/handheld.css">
	
	<script src="/js/libs/modernizr-1.7.min.js"></script>
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

$portfolio = array();

$portfolio['web'] = array( 'jackiebalzer'		=> 'Jackie Balzer',
						   'fanagram'			=> 'Fanagram',
						   'insomniacs'			=> 'Insomniacs',
						   'northern'			=> 'Northern Public Adjusters',
						   'etail'				=> 'Etail Landing Page',
						   'margaliandflynn'	=> 'Margali and Flynn' );
													
$portfolio['logos'] = array( 'downloadcenter'	=> 'WBR Download Center Icons',
							 'octopusink'		=> 'Octopus Ink',
							 'playfulart'		=> 'Playful Art',
							 'moonstruck'		=> 'Moonstruck' );
															
// $portfolio['print'] = array( 'abi-mde'				=> 'ABI Forums MDE poster',
// 							 'abi-4g'				=> 'ABI Forums 4G poster',
// 							 'the-shade-guy'		=> 'The Shade Guy',
// 							 'south-beach-plaza'	=> 'South Beach Plaza' );
?>
<header>
	<div id="portfolio_wrap">
		<a href="/" class="ir smalllogo">Brian W. McAllister</a>
		
		<div id="navigate">
			<aside>hey guess what, you're now viewing:</aside>
			
			<div class="switcher">
				<h1>The Full Portfolio</h1>
				
				<div>
					<h3>Web Design</h3>
					<aside>projects designed by me</aside>
					<br /><br />
					<ul>
						<?php foreach( $portfolio['web'] as $key => $title ):?>
						<li class="<?= $_GET['portfolio'] == $key ? 'current' : ''; ?>"><a href="/portfolio-<?= $key; ?>"><?= $title; ?></a></li>
						<?php endforeach; ?>
					</ul>
					
					<h3>Logos &amp; Icons</h3>
					<aside>some logos, some icons, all beautiful</aside>
					<br /><br />
					<ul>
						<?php foreach( $portfolio['logos'] as $key => $title ):?>
						<li class="<?= $_GET['portfolio'] == $key ? 'current' : ''; ?>"><a href="/portfolio-<?= $key; ?>"><?= $title; ?></a></li>
						<?php endforeach; ?>
					</ul>
					
					<!--
					<h3>Print</h3>
					<aside>all kinds of things on the printed page</aside>
					<br /><br />
					<ul>
						
						<?php foreach( $portfolio['print'] as $key => $title ):?>
						<li class="<?= $_GET['portfolio'] == $key ? 'current' : ''; ?>"><a href="/portfolio-<?= $key; ?>"><?= $title; ?></a></li>
						<?php endforeach; ?>
						-->
					</ul>
				</div>
			</div><!-- end #switcher -->
			
		</div><!-- end #navigate -->
	</div><!-- end #portfolio_wrap -->
	
	<div id="bluebar"></div>
</header>

<?php

// secret navigation!
?>
<div id="secret-navigation" style="display: none;">
<?php
foreach( $portfolio as $group ):
	foreach( $group as $key => $title ): ?>
		<a class="<?= $_GET['portfolio'] == $key ? 'current' : ''; ?>" href="/portfolio-<?= $key; ?>"><?= $title; ?></a>
	<?php endforeach;
endforeach;?>
</div> <!--secret-navigation-->
<?php endif; ?>