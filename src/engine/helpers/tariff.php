<?php

/**
 * Helper: сбор данных о текущем тарифе пользователя для шаблонов.
 * Возвращает массив curr_plan без разметки и без PHP-переводов — тексты переводятся в Twig через |trans.
 */

if (!function_exists('build_curr_plan')) {
    function build_curr_plan($db, $user_id, $thisprojectid, $user_lng)
    {
        // Достаём актуальный тариф
        $tariff = $db->super_query(
            "select * from tariffs where user_id=" . (int)$user_id .
            " and projectid=" . (int)$thisprojectid .
            " and startdate<=date(NOW()) and lastdate>=date(NOW()) order by id desc limit 0,1"
        );

        $curr_lang = $user_lng ?: 'en';

        // Формат чисел с учётом языка
        $format_num = function ($n) use ($curr_lang) {
            return $curr_lang === 'ru' ? number_format($n, 0, ',', ' ') : number_format($n);
        };

        $tariff_level_current = isset($tariff['tariff_level']) ? (int)$tariff['tariff_level'] : 0;
        $lastdate = isset($tariff['lastdate']) ? $tariff['lastdate'] : '';
        $tarrif_enddate = $lastdate ?: '';

        // База — FREE
        $curr_plan = [
            'level' => 0,
            'title' => 'FREE',
            'icon' => 'gift',
            'expires' => $tarrif_enddate,
            'signal_delay' => '15 seconds',
            'binance_api' => 'integration available',
            'fee' => '30%',
            'requests' => $format_num(1000),
            'strategy' => 'unavailable',
            'support' => 'standard support',
        ];

        if ($tariff_level_current === 1) {
            $curr_plan = array_merge($curr_plan, [
                'level' => 1,
                'title' => 'TRADER',
                'icon' => 'user',
                'expires' => $tarrif_enddate,
                'signal_delay' => 'without delays',
                'fee' => '20%',
                'requests' => $format_num(10000),
                'strategy' => 'balanced strategy',
            ]);
        }
        if ($tariff_level_current === 2) {
            $curr_plan = array_merge($curr_plan, [
                'level' => 2,
                'title' => 'EXPERT',
                'icon' => 'star',
                'expires' => $tarrif_enddate,
                'signal_delay' => 'without delays',
                'fee' => '10%',
                'requests' => $format_num(50000),
                'strategy' => 'any strategy',
            ]);
        }
        if ($tariff_level_current === 3) {
            $curr_plan = array_merge($curr_plan, [
                'level' => 3,
                'title' => 'PREMIUM',
                'icon' => 'crown',
                'expires' => $tarrif_enddate,
                'signal_delay' => 'without delays',
                'fee' => '5%',
                'requests' => 'unlimited',
                'strategy' => 'any strategy',
                'support' => 'VIP support',
            ]);
        }

        return $curr_plan;
    }
}
