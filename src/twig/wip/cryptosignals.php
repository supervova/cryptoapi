<?php
if (!isset($_POST['signalid'])) die();
include ('config.php');
require ROOTDIR.'init.php';
$memcache_obj = memcache_connect('127.0.0.1', 11211);

include_once( "mysql.class.php" );

if (!empty($memcache_obj)) $db = new db($memcache_obj); else $db = new db;
if (empty($db)) die('Database Error');
include_once(ENGINEDIR."geo.class.php");
include_once(ENGINEDIR."lng.class.php");
include_once(ENGINEDIR."login.class.php");

// wlang
if (isset($_POST['wlang']))
{
	$user_lng = dbstr($_POST['wlang']);
	$user_id = 2266376;
}

if (!$islogged && !isset($_POST['wlang']))
{
	$result[0] = "unlogged";
	echo json_encode($result);
	if ($db) $db->close();
	memcache_close($memcache_obj);
	die();
}

$signalid = $_POST['signalid'] * 1;

require_once ROOTDIRSECURE.'config_sbf.php';

$cryptosignals_settings = $db->super_query("select * from cryptosignals_settings where user_id=".$user_id);
if (empty($cryptosignals_settings['user_id']))
{
	$db->query("insert into cryptosignals_settings set user_id=".$user_id.", excludeassets='', includeassets='', webhookurl=''");
	$cryptosignals_settings = $db->super_query_db("select * from cryptosignals_settings where user_id=".$user_id);
}

if (empty($cryptosignals_settings['user_id']))
{
	$result[0] = getphrase("Failed to get settings!");
}
else {
	require(ENGINEDIR."cryptosignalsfilter.class.php");	
	if (empty($signalid))
	{
		$signalid = 0;
		$signals = $db->super_query("select * from cryptosignals where id>".$signalid.$sfilter." order by id desc limit 0,500", true);
		$signals = array_reverse($signals);
	}
	else
	{
		$signals = $db->super_query("select * from cryptosignals where id>".$signalid.$sfilter." order by id", true);
	}
	$newsignals = array();
	foreach ($signals as $signal)
	{
		$signal['msg'] = str_replace('&lt;', '<', $signal['msg']);
		$signal['msg'] = str_replace('&gt;', '>', $signal['msg']);
		$signal['msg'] = str_replace('″', '"', $signal['msg']);
		$signal['msg'] = html_entity_decode($signal['msg']);
		if ($user_lng == 'ru')
		{
			$signal['msg'] = str_replace('Price Alert!', 'Внимание!', $signal['msg']);
			$signal['msg'] = str_replace('Abnormal increase:', 'Аномальный рост:', $signal['msg']);
			$signal['msg'] = str_replace('Abnormal decline:', 'Аномальное снижение:	', $signal['msg']);
			$signal['msg'] = str_replace('Price just shot past', 'Цена только что превысила', $signal['msg']);
			$signal['msg'] = str_replace('Price just dropped below', 'Цена упала ниже', $signal['msg']);
			$signal['msg'] = str_replace('Selling pressure, market at a low point', 'Опасное давление медведей', $signal['msg']);
			$signal['msg'] = str_replace('Time to buy!', 'Покупаем!', $signal['msg']);
			$signal['msg'] = str_replace('Time to sell!', 'Продаем!', $signal['msg']);
			$signal['msg'] = str_replace('Price:', 'Цена:', $signal['msg']);
			$signal['msg'] = str_replace('Profit:', 'Прибыль:', $signal['msg']);
			$signal['msg'] = str_replace('Loss:', 'Убыток:', $signal['msg']);
			$signal['msg'] = str_replace('The [', '[', $signal['msg']);
			$signal['msg'] = str_replace('] strategy', '] - стратегия', $signal['msg']);
		}
		$newsignals[] = $signal;
	}
	$signals = $newsignals;

	$result[0] = "OK";
	$result[1] = $signals;
}

echo json_encode($result);
if ($db) $db->close();
memcache_close($memcache_obj);
