<?php
require '../util.php';
$config = (require '../../config.php');
$info = fetch_getinfo($config['api']);
$white_peerlist_size= $info['white_peerlist_size'];
print_r($white_peerlist_size);
?>