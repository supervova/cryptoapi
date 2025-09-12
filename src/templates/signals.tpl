<style>
input, label {
	display:inline-block;
	white-space: nowrap;
}
.btn-cancel {
	margin-top:10px;
}
.signals {
	width:100%;
	height:50vh;
	border:1px #999 solid;
	background-color: #716b85;
	color:#ccc;
	border-radius:5px;
	padding:10px;
	font-size:10pt;
	font-family:"Verdana";
	overflow-y:scroll;
	overflow-x:scroll;
}
.stngs {
	display:none;
	width:100%;
}
.loading {
	margin-top:100px;
	text-align: center;
	display:block;
}
.signalmsg {
	display:block;
}
.alertmsg {
	color:#ffcabd;
}
.signaldt {
	display:inline-block;
	width:90px;
	text-align: right;
	overflow:hidden;
}
.signalcurr {
	display:inline-block;
	text-align: center;
	width:50px;
	overflow:hidden;
	font-weight:600;
	color:#fff;
}
.signalmsgtext {
	display:inline-block;
	text-align: left;
	max-width:500px;
	overflow:hidden;
	white-space:nowrap;
}
/* Общий контейнер выбора */
.select2-container--default .select2-selection--multiple {
  background-color: #1e1e1e !important;  /* тёмный фон */
  color: #fff !important;
  border: 1px solid #444;
}

/* Выбранные "чипы" (теги) */
.select2-container--default .select2-selection--multiple .select2-selection__choice {
  background-color: #333 !important;
  color: #fff !important;
  border: 1px solid #555;
}

/* Крестик в "чипе" */
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
  color: #ccc !important;
}

/* Выпадающее меню */
.select2-container--default .select2-results__option {
  background-color: #1e1e1e;
  color: #fff;
}

.select2-container--default .select2-results__option--highlighted[aria-selected] {
  background-color: #4a76ff !important;
  color: #fff !important;
}

/* Контейнер меню */
.select2-dropdown {
  background-color: #1e1e1e !important;
  border: 1px solid #333;
}

/* Поисковая строка внутри Select2 */
.select2-search--dropdown .select2-search__field {
  background-color: #1e1e1e;
  color: #fff;
  border: 1px solid #444;
}
.select2-selection__choice__remove {
  transform: translateY(-15px); /* точечная коррекция */
  background-color: inherit !important;
}
/* Цвет текста при наведении (hover / highlighted) */
.select2-container--default .select2-results__option--highlighted[aria-selected] {
  background-color: #4a76ff !important; /* яркий синий фон */
  color: #ffffff !important;           /* белый текст */
}

/* Цвет текста у уже выбранных пунктов в выпадающем списке */
.select2-container--default .select2-results__option[aria-selected=true] {
  background-color: #474747 !important; /* тёмный фон */
  color: #cccccc !important;            /* светло-серый текст, чтобы был читаем */
}
.select2 {
	margin-top:-10px;
	padding-bottom:10px;
}
</style>
<link href="/css/select2.min.css" rel="stylesheet" />
<script src="/js/select2.min.js"></script>
<script>
function convertUTCPlus1ToLocal(mysqlDateTimeStr) {
  // 1. Добавляем +01:00 к строке, чтобы указать, что это UTC+1
  const dateWithTZ = mysqlDateTimeStr.replace(' ', 'T') + '+02:00';

  // 2. Создаем объект Date
  const date = new Date(dateWithTZ);

  // 3. Проверка на валидность даты
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  // 4. Возвращаем локальное представление даты
  return date.toLocaleTimeString();
}
function cryptosignals() {
	if (activesignals === 0) {
		signaltimer = setTimeout(cryptosignals, 1000);
		return;
	}
	activesignals = 0;
	$.ajax({
		url: './cryptosignals.php',
		type: 'POST',
		async: true,
		data: { signalid: signalid },
		success: function (response) {
			activesignals = 1;
			const relultarr = $.parseJSON(response);

			if (relultarr[0] === 'unlogged') {
				location.href = '/{$user_lng}/auth';
				return;
			}

			if (relultarr[0] !== 'OK') {
				$('.loading').remove();
				if (lastalert !== relultarr[0]) {
					$('#signals').prepend('<span class="signalmsg alertmsg blink">' + relultarr[0] + '</span>');
					lastalert = relultarr[0];
				}
				signaltimer = setTimeout(cryptosignals, 1000);
				return;
			}

			lastalert = '';
			$('.loading').remove();
			$('.alertmsg').remove();

			const msgsingals = relultarr[1];
			const todayStr = new Date().toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});

			for (let i = 0; i < msgsingals.length; i++) {
				const element = msgsingals[i];
				signalid = element['id'];

				const dateObj = new Date(element['datetime'].replace(' ', 'T') + '+02:00');
				const localDateStr = dateObj.toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
				const localTimeStr = convertUTCPlus1ToLocal(element['datetime']);

				let currelem = '';
				if (element['curr']) {
					currelem = '<span class="signalcurr">' + element['curr'] + '</span>';
				}

				let blinked = '';
				if (i + 1 === msgsingals.length) {
					blinked = ' blink';
				}

				const signalHtml =
					'<span class="signalmsg type' + element['signaltype'] + blinked + '">' +
					'<span class="signaldt">' + localTimeStr + '</span>' +
					currelem +
					' <span class="signalmsgtext">' + element['msg'] + '</span>' +
					'</span>';

				const groupSelector = '.signalgroup[data-date="' + localDateStr + '"]';
				let group = $(groupSelector);

				if (group.length === 0) {
					let groupHtml = '<div class="signalgroup" data-date="' + localDateStr + '">';
					if (localDateStr !== todayStr) {
						groupHtml += '<div class="signaldate" style="font-weight:bold;margin-top:10px;margin-bottom:5px;color:#ffc;">' + localDateStr + '</div>';
					}
					groupHtml += '</div>';

					const groupElem = $(groupHtml);
					$('#signals').prepend(groupElem);
					group = groupElem;
				}

				// Добавляем сигнал после заголовка даты (если он есть)
				const dateHeader = group.find('.signaldate');
				if (dateHeader.length > 0) {
					dateHeader.after(signalHtml);
				} else {
					group.prepend(signalHtml);
				}
			}
			if (msgsingals.length > 0 && !audioPlaying) {
				audioPlaying = true;
				audioSignal.play().catch(() => {
					audioPlaying = false;
				});
			}
			signaltimer = setTimeout(cryptosignals, 1000);
		},
		error: function (jqXHR, exception) {
			var msg = '';
			if (jqXHR.status === 0) {
				msg = 'Not connect. Verify Network.';
			} else if (jqXHR.status == 404) {
				msg = 'Requested page not found. [404]';
			} else if (jqXHR.status == 413) {
				msg = 'File is too big!';
			} else if (jqXHR.status == 500) {
				msg = 'Internal Server Error [500].';
			} else if (exception === 'parsererror') {
				msg = 'Requested JSON parse failed.';
			} else if (exception === 'timeout') {
				msg = 'Time out error.';
			} else if (exception === 'abort') {
				msg = 'Ajax request aborted.';
			} else {
				msg = jqXHR.responseText;
			}
			activesignals = 1;
			$('.loading').remove();
			if (lastalert != msg)
			{
				$('#signals').prepend('<span class="signalmsg alertmsg blink">' + msg + '</span>');
				lastalert = msg;
			}
			signaltimer = setTimeout(cryptosignals, 1000);
		}
	});
}
function showsettings(drct)
{
	if (drct == 1)
	{
		activesignals = 0;
		$('#signals').hide();
		$('#sbtn').hide();
		$('#stngs').show();
	}
	else
	{
		activesignals = 1;
		$('#stngs').hide();
		$('#signals').show();
		$('#sbtn').show();
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		afterscroll = setTimeout(function(){
			adjustSignalsHeight();
		}, 1000);
	}
}
function adjustSignalsHeight() {
	const signals = document.getElementById('signals');
	const rect = signals.getBoundingClientRect();
	const distanceFromTop = rect.top;

	const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	// Определяем отступ снизу в зависимости от ширины экрана
	let bottomOffset = 50; // по умолчанию
	if (window.innerWidth < 768) {
		bottomOffset = 120; // 110px меню + 10px отступ
	}

	let desiredHeight = windowHeight - distanceFromTop - bottomOffset;

	// Минимальная высота
	if (desiredHeight < 200) {
		desiredHeight = 200;
	}

	signals.style.height = desiredHeight + 'px';
}
function getsettings()
{
	$.ajax({
		url: './signals_settings_get.php',
		type: 'POST',
		async: true,
		success: function(response) {
			relultarr = $.parseJSON(response);
			if (relultarr[0] == 'unlogged') {
				location.href = '/{$user_lng}/auth';
			} else if (relultarr[0] == 'OK') {
				isUpdatingSettings = true; // Блокируем автосохранение
				setarr = relultarr[1];
				// Устанавливаем значение webhook URL
				if (setarr.hasOwnProperty('webhookurl')) {
				  $('#fsettings input[name="webhookurl"]').val(setarr['webhookurl']);
				}
				// Устанавливаем состояния чекбоксов
				$('#fsettings input[type="checkbox"]').each(function () {
					const name = $(this).attr('name');
					if (setarr.hasOwnProperty(name)) {
						$(this).prop('checked', setarr[name] === "1");
					}
				});
				// Устанавливаем выбранное значение радиокнопок
				if (setarr.hasOwnProperty('fassets')) {
					$('#fsettings input[name="fassets"][value="' + setarr['fassets'] + '"]').prop('checked', true);
				}
				// Устанавливаем значения для select2 exclude-assets
				if (setarr.hasOwnProperty('exclude-assets')) {
					$('#exclude-assets').val(setarr['exclude-assets'] || []).trigger('change');
				}
				// Устанавливаем значения для select2 include-assets
				if (setarr.hasOwnProperty('include-assets')) {
					$('#include-assets').val(setarr['include-assets'] || []).trigger('change');
				}
				showfassets();
				// Даем Select2 и DOM отработать — потом разблокируем
				setTimeout(() => {
					isUpdatingSettings = false;
				}, 300);
			} else {
				alert(relultarr[0]);
			}
		},
		error: function(response) {
			gettimer = setTimeout(function(){
				getsettings();
			}, 1000);
		}
	});
}
function savesettings()
{
	const formData = $('#fsettings').serialize();
	$.ajax({
	url: './signals_settings_save.php',
	type: 'POST',
	data: formData,
	async: true,
	success: function(response) {
		relultarr = $.parseJSON(response);
		if (relultarr[0] == 'unlogged')
		{
			location.href = '/{$user_lng}/auth';
		}
		else if (relultarr[0] == 'OK')
		{
			$('#signals').html('<span class="blink loading">Loading...</span>');
			signalid = 0;
			lastalert = '';
			clearTimeout(signaltimer);
			$('#signals').html('<span class="blink loading">Loading...</span>');
			signalid = 0;
			lastalert = '';
			signaltimer = setTimeout(function(){
				cryptosignals();
			}, 1000);
		}
		else
		{
			alert(relultarr[0]);
		}
	},
	error: function(response) {
		savetimer = setTimeout(function(){
			savesettings();
		}, 1000);
	}
	});
}
function showfassets() {
	const selected = $('input[name="fassets"]:checked').val();

	if (selected === "0") {
		$('#exclude-block').hide();
		$('#include-block').hide();
	} else if (selected === "1") {
		$('#exclude-block').show();
		$('#include-block').hide();
	} else if (selected === "2") {
		$('#exclude-block').hide();
		$('#include-block').show();
	}
}
window.addEventListener('load', adjustSignalsHeight);
window.addEventListener('resize', adjustSignalsHeight);

$(document).ready(function() {
	signalid = 0;
	lastalert = '';
	activesignals = 1;
	audioSignal = new Audio('/mp3/signal.mp3');
	audioPlaying = false;
	audioSignal.addEventListener('ended', () => {
		audioPlaying = false;
	});

	$('#fsettings input[name="fassets"]').on('change', function () {
		showfassets();
	});
	getsettings();
	cryptosignals();

    const cryptoassets = {$cryptoassetsstr};

    // Преобразование массива в формат, подходящий для Select2
    const data = cryptoassets.map(asset => ({ id: asset, text: asset }));

    // Инициализация Select2 для обоих списков
    $('#exclude-assets').select2({
      data: data,
      placeholder: "Select assets to exclude",
      allowClear: true
    });

    $('#include-assets').select2({
      data: data,
      placeholder: "Select assets to include",
      allowClear: true
    });

	let saveTimeout;
	isUpdatingSettings = false;
	$('#fsettings').on('change', 'input, select, textarea', function () {
		if (isUpdatingSettings) return;
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(function () {
			savesettings();
		}, 1000);
	});
});
</script>
<!-- <h1 style="margin-top:-75px;margin-bottom:0;">Signals</h1> //-->
<div id="apidoc" style="text-align:left;padding:5px;border-radius:5px;margin-top:-75px;">
<div id="stngs" class="stngs">
<h2>Signals settings:</h2>
<h4>Bitcoin (BTC):</h4>
<form id="fsettings">
<label><input type="checkbox" name="palertbtc"> Price alert signals for BTC</label>
<label><input type="checkbox" name="abnormalbtc"> Signals of abnormal changes for BTC</label>
<label><input type="checkbox" name="buysellbtc"> Buy and Sell Recommendations for BTC</label>
<h4>Other assets:</h4>
<label><input type="checkbox" name="palert"> Price alert signals</label>
<label><input type="checkbox" name="abnormal"> Signals of abnormal changes</label>
<label><input type="checkbox" name="buysell"> Buy and Sell Recommendations</label>
<h4>Collection of assets:</h4>
<label><input type="radio" name="fassets" value="0"> All assets</label>
<label><input type="radio" name="fassets" value="1"> All except:</label>
<div class="select2" id="exclude-block">
  <select name="exclude-assets[]" id="exclude-assets" multiple="multiple" style="width: 100%"></select>
</div>
<label><input type="radio" name="fassets" value="2"> List only:</label>
<div class="select2" id="include-block">
  <select name="include-assets[]" id="include-assets" multiple="multiple" style="width: 100%"></select>
</div>
<h4>General signals:</h4>
<label><input type="checkbox" name="general"> Dangerous Selling Pressure</label>
<h4>Integration:</h4>
<input type="url" name="webhookurl" placeholder="https://example.com/webhook" style="width:100%">
<small style="display:block; color:#aaa; margin-top:5px;">
  All signals will be posted as JSON to the webhook URL you specify — perfect for automated integrations.
</small>
</form>
<button class="btn btn-cancel" onclick="showsettings(0)">Go to signals</button>
</div>
<div id="signals" class="signals">
<span class="blink loading">Loading...</span>
</div>
<a id="sbtn" href="javascript:void(0)" onclick="showsettings(1)">Settings</a>
</div>

<div class="trnsltphrss">
<span>Error</span>
<span>Loading...</span>
<span>Select assets to exclude</span>
<span>Select assets to include</span>
</div>
