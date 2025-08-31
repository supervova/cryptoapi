<?php
/**
 * Контроллер страницы тарифных планов
 *
 * Подготавливает данные и рендерит шаблон plans.twig с карточками тарифных планов.
 */

if (!empty($thispath['2']))
{
	if (!$islogged)
	{
		memcache_close($memcache_obj);
		if ($db) $db->close();
		header('Location: https://'.$authhost.'/auth?returl='.$thispagesimpleurl);
		die();
	}
	// Тариф:
	if ($thispath['2'] == 'free')
	{
		$tariff_level = 0;
	}
	elseif ($thispath['2'] == 'trader')
	{
		$tariff_level = 1;
	}
	elseif ($thispath['2'] == 'expert')
	{
		$tariff_level = 2;
	}
	elseif ($thispath['2'] == 'premium')
	{
		$tariff_level = 3;
	}
	else
	{
		die("Incorrect parameters!");
	}
	// Период:
	if ($thispath['3'] == 'monthly' || $thispath['3'] == 'annual')
	{
		$tariff_interval = $thispath['3'];
	}
	else
	{
		die("Incorrect parameters!");
	}

	$price = $config['tarrif'][$thispath['2']]['price'][$thispath['3']];
	if (empty($price))
	{
		die("Incorrect parameters!");
	}
	$post = array('checkID' => $startruntime-5, 'payobject' => 'tariff|'.$price.'|'.$thispath['2'].'|'.$thispath['3'].'|'.$tariff_level, 'udata' => $user_id.'|'.$user_country);
	$uagent = "Cron";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_USERAGENT, $uagent);
	curl_setopt($ch, CURLOPT_URL, "https://".$thisdomain."/createbill.php");
	curl_setopt($ch, CURLOPT_POST, True);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER ,True);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
	curl_setopt($ch, CURLOPT_COOKIESESSION, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 3);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
	$billid = curl_exec ($ch);
	$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close ($ch);
	//die($billid." *** ".$status_code);
	$billid = $billid * 1;
	if (empty($billid))
	{
		die("Error creating invoice!");
	}
	memcache_close($memcache_obj);
	if ($db) $db->close();
	header('Location: /'.$user_lng.'/bill/'.$billid);
	die();
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Подготовка массива данных
$page_meta = [
  'classes' => 'is-pricing',
  'desc' => 'Explore our Free, Trader, Expert, and Premium plans for AI-powered crypto trading. ' .
            'Unlock real-time trading signals, advanced analytics, personalized insights, ' .
            'and automation tools to elevate your strategy.',
  'styles' => 'pricing.css',
  'title' => 'Pricing Plans for Crypto Traders | CryptoAPI.ai - AI-Powered Crypto Trading',
];

$tariff = $db->super_query("select * from tariffs where user_id=".$user_id." and projectid=".$thisprojectid." and startdate<=date(NOW()) and lastdate>=date(NOW()) order by id desc limit 0,1");

$tarrif_binance_api = getphrase("integration available");
$tarrif_binance_api = str_replace(getphrase("integration"), "", $tarrif_binance_api);
$tarrif_binance_api = trim($tarrif_binance_api);

$phrase['Your tariff:'] = getphrase("Your tariff:");
$phrase['Available benefits'] = getphrase("Available benefits");
$phrase['Tariff end date:'] = getphrase("Tariff end date:");
$phrase['Signal delay:'] = getphrase("Signal delay:");
$phrase['Trading fee:'] = getphrase("Trading fee:");
$phrase['Integration with the exchange:'] = getphrase("Integration with the exchange:");
$phrase['API Limitations:'] = getphrase("API Limitations:");
$phrase['Selecting trading strategies:'] = getphrase("Selecting trading strategies:");
$phrase['Support type:'] = getphrase("Support type:");

$tarrif_support = getphrase("standard support");
if (empty($tariff['tariff_level']))
{
	$tarrif_name = getphrase("FREE TARIFF");
	$phrase['Tariff end date:'] = "";
	$tarrif_name = str_replace(getphrase("TARIFF"), "", $tarrif_name);
	$tarrif_name = str_replace("ТАРИФ", "", $tarrif_name);
	$tarrif_name = trim($tarrif_name);
	$tarrif_enddate = "";
	$tarrif_apirequests = number_format(1000)." ". getphrase("requests per day");
	$tarrif_signal_delay = 15;
	$tarrif_strategies = getphrase("unavailable");
	$tarrif_fee = "30%";
}
else
{
	$tempdate = date_create_from_format('Y-m-d', $tariff['lastdate']);
	$tarrif_enddate = date_format($tempdate, $format_date_php);
	$tarrif_signal_delay = getphrase("without delays");
}
if ($tariff['tariff_level'] == 1)
{
	$tarrif_name = getphrase("TRADER");
	$tarrif_apirequests = number_format(10000)." ". getphrase("requests per day");
	$tarrif_strategies = getphrase("balanced strategy");
	$tarrif_fee = "20%";
}
if ($tariff['tariff_level'] == 2)
{
	$tarrif_name = getphrase("EXPERT");
	$tarrif_apirequests = number_format(50000)." ". getphrase("requests per day");
	$tarrif_strategies = getphrase("any strategy");
	$tarrif_fee = "10%";
}
if ($tariff['tariff_level'] == 3)
{
	$tarrif_name = getphrase("PREMIUM");
	$tarrif_apirequests = getphrase("unlimited");
	$tarrif_strategies = getphrase("any strategy");
	$tarrif_support = getphrase("VIP support");
	$tarrif_fee = "5%";
}

//$current_tarrif = 

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

$tariffbenefits = <<<HTML
<div style="width:100%;margin-bottom:10px;text-align:left;">
<span style="white-space:nowrap">{$phrase['Your tariff:']} <strong>{$tarrif_name}</strong></span>
<span style="white-space:nowrap">{$phrase['Tariff end date:']} <strong>{$tarrif_enddate}</strong></span>
<h3 style="margin-top:15px;margin-bottom:10px;">{$phrase['Available benefits']}</h3>
{$phrase['Signal delay:']} <strong>{$tarrif_signal_delay}</strong><br>
{$phrase['Integration with the exchange:']} <strong>{$tarrif_binance_api}</strong><br>
{$phrase['Trading fee:']} <strong>{$tarrif_fee}</strong><br>
{$phrase['API Limitations:']} <strong>{$tarrif_apirequests}</strong><br>
{$phrase['Selecting trading strategies:']} <strong>{$tarrif_strategies}</strong><br>
{$phrase['Support type:']} <strong>{$tarrif_support}</strong>
</div>
HTML;
// Получение и отображение шаблона
$final_html = get_template("pricing.twig");
