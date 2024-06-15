<?php
header("Content-Type: image/bitmap");
$im = @imagecreate(400, 300)
or die("Cannot Initialize new GD image stream");
$background_color = imagecolorallocate($im, 255, 255, 255);
$text_color = imagecolorallocate($im, 0, 0, 0);

$weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

$datestring = $weekdays[date("N")-1].", ".date("d.m.Y");
$timestring = date("H:i");

$tempstring;


imagestring($im, 10, 10, 10, $datestring, $text_color);
imagestring($im, 128, 190, 120, $timestring, $text_color);
imagebmp($im);
imagedestroy($im);
?>
