<?php
require '../util.php';
$config = (require '../../config.php');
$info = fetch_getinfo($config['api']);
$supported_height= $info['supported_height'];
print_r($supported_height);
?>