<?php

if (!$islogged) {
    memcache_close($memcache_obj);
    if ($db) {
        $db->close();
    }
    header('Location: https://' . $authhost . '/auth?returl=' . $thispagesimpleurl);
    die();
}

$phrase['Signals'] = getphrase("Signals");
$blog_name = $phrase['Signals'];
$blog_description = $phrase['Signals'];
$blogsidebar = get_template("blogsidebar");
$blog_css = get_template("blog-css");

$page_content_html = get_template("signals");

//["BTC", "ETH", "SOL", "ADA", "XRP", "DOT", "AVAX", "DOGE"]
$cryptoassetsstr = '["BTC"';
$cryptoassets = $db->super_query("select curr from cryptoassets where curr<>'BTC' and curr not like '%USD%' and curr not like '%EUR%'", true);
foreach ($cryptoassets as $cryptoasset) {
    $cryptoassetsstr .= ', "' . $cryptoasset['curr'] . '"';
}
$cryptoassetsstr .= ']';

include_once(ROOTDIR . "projects/" . $config['project_path'] . "/engine/cleanpage.class.php");

$final_html = get_template("clean_page.twig");

$tpl = [
  '{$page_content_html}' => $page_content_html,
];

$data_objects['page']['type'] = 'website';
$data_objects['page']['app'] = true;

$final_html = strtr($final_html, $tpl);
