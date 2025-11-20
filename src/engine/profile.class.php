<?php

/**
 * Контроллер личного кабинета пользователя
 *
 * Подготавливает данные и рендерит шаблон profile.twig.
 * Использует глобальные переменные из tpl-шаблона:
 * TODO: заменить переменные с разметкой Twig-кодом
 * {$accesslog}
 * {$alertprofile}
 * {$birthdateshow_logic}
 * {$cc_html}
 * {$checkip_logic}
 * {$config[TelegramBot]}
 * {$defaultavatar}
 * {$enteremailhtml}
 * {$hidelocation_logic}
 * {$linktomsg}
 * {$messengers_code}
 * {$notify1_logic}
 * {$notify2_logic}
 * {$notify3_logic}
 * {$notify4_logic}
 * {$notify5_logic}
 * {$notify6_logic}
 * {$oldpassworddiv}
 * {$profile_links}
 * {$user_country}
 * {$user_lng}
 * {$user_region}
 * {$user_region_lng}
 * {$userdata[avatar]}
 * {$userdata[birthdate]}
 * {$userdata[email]}
 * {$userdata[gender]}
 * {$userdata[name]}
 * {$userdata[nickname]}
 * {$userdata[patronymic]}
 * {$userdata[phone]}
 * {$userdata[surname]}
 * {$utc_html}
 *
 * НЕ использует глобальные переменные из tpl-шаблона:
 * {$aboutmehtml}
 * {$g2faphrase}
 * {$myblogs}
 * {$mysites}
 * {$startruntime} → init.class → page.script_start
 * {$tinymcelng}
 * {$userdata[avatarbox]} → init.class → user.avatar
 */

// Проверка авторизации пользователя
// Удалено закрытие Memcache старым методом "на всякий случай".
// Соединение с Memcache закрывается автоматически при завершении скрипта.
if (!$islogged) {
    header('Location: https://' . $authhost . '/auth?returl=' . urlencode($thispagesimpleurl));
    exit;
}

// Получение окружения приложения (development/production) из переменной окружения APP_ENV
$data_objects['ENV'] = getenv('APP_ENV') ?: 'production';

// Данные пользователя
$data_objects['user']['avatar_large'] = $userdata['avatar'] ?? '';
$data_objects['user']['birthdate']    = $userdata['birthdate'] ?? '';
$data_objects['user']['country']      = $user_country ?? '';
$data_objects['user']['email']        = $userdata['email'] ?? '';
$data_objects['user']['first_name']   = $userdata['name'] ?? '';
$data_objects['user']['gender']       = $userdata['gender'] ?? '';
$data_objects['user']['lang']         = $user_lng ?? '';
$data_objects['user']['last_name']    = $userdata['surname'] ?? '';
$data_objects['user']['log']          = $accesslog ?? '<tr><td colspan="6"></td></tr>';
$data_objects['user']['middle_name']  = $userdata['patronymic'] ?? '';
$data_objects['user']['nickname']     = $userdata['nickname'] ?? '';
$data_objects['user']['phone']        = $userdata['phone'] ?? '';
$data_objects['user']['region']       = $user_region ?? '';
$data_objects['user']['region_lng']   = $user_region_lng ?? '';

$data_objects['logic'] = [
  'birthdate' => !empty($birthdateshow_logic),
  'ip'        => !empty($checkip_logic),
  'location'  => !empty($hidelocation_logic),
  'notify1'   => !empty($notify1_logic),
  'notify2'   => !empty($notify2_logic),
  'notify3'   => !empty($notify3_logic),
  'notify4'   => !empty($notify4_logic),
  'notify5'   => !empty($notify5_logic),
  'notify6'   => !empty($notify6_logic),
];

$data_objects['html'] = [
  'alert'        => $alertprofile ?? '',
  'country'      => $cc_html ?? '',
  'email'        => $enteremailhtml ?? '',
  'links'        => $profile_links ?? '',
  'old_password' => $oldpassworddiv ?? '',
  'timezone'     => $utc_html ?? '',
];

$data_objects['helpers'] = [
  'avatar_placeholder' => $defaultavatar ?? './images/profile_nophoto.jpg',
  'messengers_alert'   => $linktomsg ?? '',
  'messengers_code'    => $messengers_code ?? '',
  'telegram'           => $config['TelegramBot'] ?? '',
];

// Подготовка массива данных
$page_meta = [
  'desc'    => 'Manage your personal data, email, password, and notification preferences ' .
               'in your CryptoAPI.ai account.',
  'styles' => 'profile.css',
  'title'  => 'Profile Settings | CryptoAPI.ai - AI-Powered Crypto Trading',
];

$data_objects['page'] = array_merge($data_objects['page'] ?? [], $page_meta);

// Получение и отображение шаблона
$final_html = get_template("profile.twig");
