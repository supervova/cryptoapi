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
$cryptoassets = $db->super_query(
    "SELECT curr
     FROM cryptoassets
     WHERE curr <> 'BTC'
       AND curr NOT LIKE '%USD%'
       AND curr NOT LIKE '%EUR%'",
    true
);
foreach ($cryptoassets as $cryptoasset) {
    $cryptoassetsstr .= ', "' . $cryptoasset['curr'] . '"';
}
$cryptoassetsstr .= ']';

include_once(ROOTDIR . "projects/" . $config['project_path'] . "/engine/cleanpage.class.php");

$tpl = [
  '{$page_content_html}' => $page_content_html,
];

$data_objects['page']['type'] = 'website';
$data_objects['page']['app'] = true;

$final_html = get_template("signals.twig");

$final_html = strtr($final_html, $tpl);
