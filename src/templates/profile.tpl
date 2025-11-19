<script type="text/javascript" src="/js/jquery.typeahead.min.js" charset="UTF-8"></script>
<link href="/css/jquery.typeahead.css" rel="stylesheet" type="text/css">
<script>
$(document).ready(function(){
	userphone='{$userdata[phone]}';
	if (document.location.href.indexOf('wmprofile.com') != -1)
	{
		document.getElementById('notwmprofile').style.display = 'none';
		document.getElementById('myblogstab').style.display = 'none';
	}
	else
	{
		document.getElementById('notwmprofile').style.display = 'block';
	}
	if (document.location.href.indexOf('visitorsale.com') != -1)
	{
		document.getElementById('notvs').style.display = 'none';
		document.getElementById('notificationstab').style.display = 'none';
		document.getElementById('myblogstab').style.display = 'none';
	}
	else
	{
		document.getElementById('notvs').style.display = 'block';
	}
	if (document.location.href.indexOf('hightech.edu.eu') != -1 || document.location.href.indexOf('ratex.me') != -1 || document.location.href.indexOf('icg') != -1 || document.location.href.indexOf('p2payer') != -1)
	{
		document.getElementById('myblogstab').style.display = 'none';
		document.getElementById('sitestab').style.display = 'none';
	}
	if (document.location.href.indexOf('cryptoapi') != -1)
	{
		document.getElementById('myblogstab').style.display = 'none';
		document.getElementById('myblogstab').style.display = 'none';
		document.getElementById('sitestab').style.display = 'none';
	}
	if (document.location.href.indexOf('worldvet') != -1)
	{
		document.getElementById('myblogstab').style.display = 'none';
		document.getElementById('sitestab').style.display = 'none';
		document.getElementById('wmworkerletters').style.display = 'none';
	}
	document.getElementById("gender").options[{$userdata[gender]}].selected=true;
	document.getElementById('checkip').checked={$checkip_logic};
	document.getElementById('birthdateshow').checked={$birthdateshow_logic};
	document.getElementById('hidelocation').checked={$hidelocation_logic};
	document.getElementById('notify1').checked={$notify1_logic};
	document.getElementById('notify2').checked={$notify2_logic};
	document.getElementById('notify3').checked={$notify3_logic};
	document.getElementById('notify4').checked={$notify4_logic};
	document.getElementById('notify5').checked={$notify5_logic};
	document.getElementById('notify6').checked={$notify6_logic};
	clienttime = new Date();
	ClientTimeZoneOffset = -clienttime.getTimezoneOffset()/60;
	tinymce.remove();
	tinymce.init({
		selector: '#aboutme',
		toolbar: 'undo redo | emoticons | link image media | ltr rtl',
		plugins: "advlist autolink image link imagetools media visualblocks visualchars emoticons directionality",
		menubar:false,
		statusbar: false,
		image_advtab: false,
		force_p_newlines: false,
		invalid_styles: 'color font-size',
		remove_trailing_brs: false,
		forced_root_block: false,
		keep_styles: false,
		{$tinymcelng}
		invalid_elements: 'style,p,span,lang,strong,b'
	});
	searchcities('{$user_country}');
	$('#cclist').change(function(){
		var usercountry = document.getElementById('cclist').value;
		if (usercountry != '{$user_country}')
		{
			document.getElementById('user_region').value = '';
			document.getElementById('user_region_lng').value = '';
		}
		else
		{
			document.getElementById('user_region').value = '{$user_region}';
			document.getElementById('user_region_lng').value = '{$user_region_lng}';
		}
		searchcities(usercountry);
	});
	mailretry = 0;
});
function searchcities(country_code) {
	$('.typeahead__result').remove();
	$('#user_region_lng').typeahead({
	minLength: 1,
	order: "asc",
	cache: false,
	maxItem: false,
	offset: true,
	source: {
		ajax: {
			type: "POST",
			url: "/json.php",
			data: {
				country_code: country_code, user_lng: '{$user_lng}'
			}
		}
	},
	callback: {
		onClick: function (node, a, item, event) {
			$('#user_region_lng').val(item.display);
			checkregion();
		}
	}
	});
}
function resizeFile(file, profilephoto, b64field) {
	$('#p_prldr').show();
	var reader = new FileReader();
    reader.onloadend = function () {
        var tempImg = new Image();
        tempImg.src = reader.result;
        tempImg.onload = function () {
            var tempW = tempImg.width;
            var tempH = tempImg.height;
            imgcrop(this, tempW, tempH, 300, 300, b64field);
            $(profilephoto).attr('src', $(b64field).val());
            $(profilephotosmall).attr('src', $(b64field).val());
			$('#p_prldr').delay(100).fadeOut('slow');
        }
    }
    reader.readAsDataURL(file);
}
function imgcrop(image, tempW, tempH, maxW, maxH, elem) {
	var sourceX = 0;
	var sourceY = 0;
	var destWidth = tempW;
	var destHeight = tempH;
	if (tempW > maxW)
	{
		var destWidth = maxW;
		var destHeight = destHeight * (maxW/tempW);
	}
	if (destHeight > maxH)
	{
		var destWidth = tempW;
		var destHeight = tempH;
		var destHeight = maxH;
		var destWidth = destWidth * (maxH/tempH);
	}
	var destX = 0;
	var destY = 0;

	var canvas = document.createElement('canvas');
	canvas.width = destWidth;
	canvas.height = destHeight;

	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, destWidth, destHeight);
	ctx.drawImage(image, sourceX, sourceY, tempW, tempH, destX, destY, destWidth, destHeight);
	var dataURL = canvas.toDataURL("image/jpeg");
	$(elem).val(dataURL);
}
function showprofilephoto() {
	var image = $("#PhotoFile");
	if (image[0].files && image[0].files[0]) {
		resizeFile(image[0].files[0], $('#profilephoto'), $('#photo_b64'))
	}
}
function deletephoto() {
	document.getElementById('profilephoto').src = '{$defaultavatar}';
	document.getElementById('profilephotosmall').src = '{$defaultavatar}';
	document.getElementById('photo_b64').value = 'delete';
	document.getElementById('PhotoFile').value = '';
}
function changemail() {
	document.getElementById('email').disabled=false;
	document.getElementById('email').focus();
	document.getElementById('changemaillink').style.display="none";
	document.getElementById('savemaillink').style.display="inline-block";
}
function changephone() {
	document.getElementById('smscode').value='';
	document.getElementById('phone').disabled=false;
	document.getElementById('phone').focus();
	document.getElementById('changephonelink').style.display="none";
	document.getElementById('savephonelink').style.display="inline-block";
	document.getElementById('phonetext').style.display="block";
}
function cancelsavemail() {
	document.getElementById('email').value="{$userdata[email]}";
	document.getElementById('email').disabled=true;
	document.getElementById('changemaillink').style.display="inline-block";
	document.getElementById('savemaillink').style.display="none";
}
function cancelsavephone() {
	document.getElementById('phone').value=userphone;
	document.getElementById('smscode').value='';
	document.getElementById('phone').disabled=true;
	document.getElementById('changephonelink').style.display="inline-block";
	document.getElementById('savephonelink').style.display="none";
	document.getElementById('phonetext').style.display="none";
	document.getElementById('enterconfirmcode').style.display="none";
}
function savemail() {
	mailfunc = 'savemail()';
	mailretry = mailretry + 1;
	var newmail = document.getElementById('email').value;
	if (newmail != "{$userdata[email]}" && newmail != '')
	{
		document.getElementById('email').disabled=true;
		document.getElementById('changemaillink').style.display="none";
		document.getElementById('savemaillink').style.display="none";
		$.post( "./savesettings.php", { email: newmail, lng: "{$user_lng}", mailretry: mailretry, checkID: {$startruntime} })
		  .done(function( data ) {
			if (data != 'OK')
			{
				document.getElementById('email').value="{$userdata[email]}";
				bootpopup.alert(data,'Error');
			}
			else
			{
				mailmsg(mailretry);
			}
			document.getElementById('email').disabled=true;
			document.getElementById('changemaillink').style.display="inline-block";
			document.getElementById('savemaillink').style.display="none";
		});
	}
	else
	{
		document.getElementById('email').disabled=true;
		document.getElementById('changemaillink').style.display="inline-block";
		document.getElementById('savemaillink').style.display="none";
	}
}
function savephone() {
	var newphone = document.getElementById('phone').value;
	var smscode = document.getElementById('smscode').value;
	document.getElementById('smscode').value = '';
	if (newphone != userphone && newphone != '')
	{
		document.getElementById('phone').disabled=true;
		document.getElementById('changephonelink').style.display="none";
		document.getElementById('savephonelink').style.display="none";
		document.getElementById('enterconfirmcode').style.display="none";
		$.post( "./confirmphone.php", { phone: newphone, smscode: smscode, lng: "{$user_lng}", checkID: {$startruntime} })
		  .done(function( data ) {
			if (data != 'OK')
			{
				bootpopup.alert(data,'Error');
				if (smscode == '')
				{
					document.getElementById('phone').value=userphone;
					document.getElementById('enterconfirmcode').style.display="none";
				}
				else
				{
					document.getElementById('enterconfirmcode').style.display="block";
				}
			}
			else
			{
				if (smscode == '')
				{
					bootpopup.alert('The SMS message with a confirmation code will be sent to your phone number.','Please pay attention!');
					document.getElementById('enterconfirmcode').style.display="block";
				}
				else
				{
					userphone = newphone;
					bootpopup.alert('New phone number saved successfully','Please pay attention!');
				}
			}
			document.getElementById('phone').disabled=true;
			document.getElementById('changephonelink').style.display="inline-block";
			document.getElementById('savephonelink').style.display="none";
			document.getElementById('phonetext').style.display="none";
		});
	}
	else
	{
		document.getElementById('phone').disabled=true;
		document.getElementById('changephonelink').style.display="inline-block";
		document.getElementById('savephonelink').style.display="none";
		document.getElementById('enterconfirmcode').style.display="none";
		document.getElementById('phonetext').style.display="none";
	}
}
function savesettings() {
	tinymce.get('aboutme').save();
	$('#' + 'aboutme').html( tinymce.get('aboutme').getContent() );
	var aboutmehtml = $('#aboutme').val();
	if (aboutmehtml.length > 60000)
	{
		bootpopup.alert('The length of the text "About me" should be no more than 60000 symbols! The current text length - ' + aboutmehtml.length,'Please pay attention!');
		return;
	}
	var photo_b64 = document.getElementById('photo_b64').value;
	var firstname = document.getElementById('firstname').value;
	var surname = document.getElementById('surname').value;
	var patronymic = document.getElementById('patronymic').value;
	var nickname = document.getElementById('nickname').value;
	var birthdate = document.getElementById('birthdate').value;
	var gender = document.getElementById('gender').value;
	var userUTC = document.getElementById('userUTC').value;
	var usercountry = document.getElementById('cclist').value;
	var user_region = document.getElementById('user_region').value;
	var user_region_lng = document.getElementById('user_region_lng').value;
	var oldpwd = document.getElementById('oldpwd').value;
	var newpwd1 = document.getElementById('newpwd1').value;
	var newpwd2 = document.getElementById('newpwd2').value;
	var checkip = document.getElementById('checkip').checked;
	var birthdateshow = document.getElementById('birthdateshow').checked;
	var hidelocation = document.getElementById('hidelocation').checked;
	var notify1 = document.getElementById('notify1').checked;
	var notify2 = document.getElementById('notify2').checked;
	var notify3 = document.getElementById('notify3').checked;
	var notify4 = document.getElementById('notify4').checked;
	var notify5 = document.getElementById('notify5').checked;
	var notify6 = document.getElementById('notify6').checked;
	$('#p_prldr').show();
	$.post( "./savesettings.php", { photo_b64: photo_b64, firstname: firstname, surname: surname, patronymic: patronymic, nickname: nickname, gender: gender, birthdate: birthdate, userUTC: userUTC, usercountry: usercountry, user_region: user_region, user_region_lng: user_region_lng, oldpwd: oldpwd, newpwd1: newpwd1, newpwd2: newpwd2, checkip: checkip, birthdateshow: birthdateshow, hidelocation: hidelocation, aboutmehtml: aboutmehtml, notify1: notify1, notify2: notify2, notify3: notify3, notify4: notify4, notify5: notify5, notify6: notify6, lng: "{$user_lng}", checkID: {$startruntime} })
	  .done(function( data ) {
		$('#p_prldr').delay(100).fadeOut('slow');
		if (data != 'OK')
		{
			bootpopup.alert(data,'Error');
		}
		else
		{
			window.scrollTo(0, 0);
			$.toast({
				text: 'Saved successfully!',
				textAlign: 'center',
				position: 'mid-center',
				icon: 'success',
				showHideTransition: 'fade',
				hideAfter: 3000,
				loader: true,
				stack: 5
			});
		}
	});
}
function addblog() {
	$('#addblogform').modal('show');
}
function showaddress(LastKeyCode) {
	if (LastKeyCode != 13)
	{
		var newblog = document.getElementById('blogname').value;
		document.getElementById("message").innerHTML='';
		if (newblog != '')
		{
			fontpt = 20;
			if (newblog.length>5) fontpt = 16;
			if (newblog.length>10) fontpt = 14;
			if (newblog.length>13) fontpt = 12;
			if (newblog.length>17) fontpt = 10;
			if (newblog.length>24) fontpt = 8;
			document.getElementById('newaddress').innerHTML = '<font style="font-family: Courier; font-size: '+fontpt+'pt; color: #000000;">'+newblog+'.qwerty.blog</font>';
		}
		else
		{
			document.getElementById('newaddress').innerHTML = '';
		}
	}
}
function regblog() {
	var newblog = document.getElementById('blogname').value;
	if (newblog != '')
	{
		$('#p_prldr').show();
		$.post( "register.php", { blogname: newblog, lng: "{$user_lng}", checkID: {$startruntime}, userUTC: ClientTimeZoneOffset })
		  .done(function( data ) {
			if (data.indexOf(newblog) + 1)
			{
				location.href=data;
			}
			else
			{
				$('#p_prldr').delay(100).fadeOut('slow');
				document.getElementById("message").innerHTML='<font color="red">' + data + '</font>';
				document.getElementById('newaddress').innerHTML = '';
			}
		  });
	}
}
function checkregion() {
	var usercountry = document.getElementById('cclist').value;
	var user_region_lng = document.getElementById('user_region_lng').value;
	if (user_region_lng != '')
	{
		if (user_region_lng != '{$user_region_lng}')
		{
			$.ajax({
				url: './regionlng.php',
				type: 'POST',
				data: { region_lng: user_region_lng, usercountry: usercountry },
				async: false,
				success: function(response) {
					response = $.parseJSON(response);
					if (response[0] == 'OK')
					{
						document.getElementById('user_region').value = response[1];
						document.getElementById('user_region_lng').value = response[2];
					}
				}
			});
		}
		else
		{
			document.getElementById('user_region').value = '{$user_region}';
			document.getElementById('user_region_lng').value = '{$user_region_lng}';
		}
	}
	else
	{
		document.getElementById('user_region').value = '';
		document.getElementById('user_region_lng').value = '';
	}
}
function mailcountdown(stopsec) {
    var seconds = parseInt(new Date().getTime()/1000);
	showsec = stopsec - seconds;
	if (showsec <= 0 || stopsend == 1)
	{
		$('#waitsend').hide();
		if (mailretry > 1)
		{
			$('#difemail').show();
		}
		if (mailretry > 2)
		{
			$('#resend').hide();
		}
		else
		{
			$('#resend').show();
		}
		return;
	}
	$('#waitsec').html(showsec);
 	timer = setTimeout(function(){
		mailcountdown(stopsec);
	}, 1000);
}
function mailmsg(argretry) {
	if (argretry == 0)
	{
		mailretry = argretry;
		stopsend = 1;
		$('#sended').hide();
	}
	else
	{
		$('#difemail').hide();
		stopsend = 0;
		showsec = 60;
		$('#waitsec').html(showsec);
		$('#resend').hide();
		$('#waitsend').show();
		$('#sended').show();
		var seconds = parseInt(new Date().getTime()/1000) + showsec;
		mailcountdown(seconds);
	}
}
</script>
<div style="text-align:right;font-size:12px;"><a href="/g2fa">{$g2faphrase}</a></div>
{$profile_links}
<div class="tabs" style="margin-top: 10px;">
  <ul class="nav nav-tabs smile-tabs">
	<li class="active"><a href="#Generalsettings" data-toggle="tab">Personal settings</a></li>
	<li id="myblogstab"><a href="#myblogs" data-toggle="tab">My blogs</a></li>
	<li id="sitestab"><a href="#mysites" data-toggle="tab">My sites</a></li>
	<li><a href="#accesslog" data-toggle="tab">Access log</a></li>
	<li id="notificationstab"><a href="#notifications" data-toggle="tab">Notifications</a></li>
  </ul>
  <div class="tab-content">
	<div class="tab-pane active" id="Generalsettings">
		<form class="form-inline" action="javascript:void(0);">
		<h3>Profile photo (avatar):</h3>
		<div class="file-field">
			<div style="display: inline-block; vertical-align: middle; margin: 2px; white-space: nowrap;"><img id="profilephoto" src="{$userdata[avatar]}" style="max-height: 130px; max-width: 130px;"></div><div style="display: inline-block; vertical-align: middle; margin: 2px; white-space: nowrap;" class="header_photo"><img id="profilephotosmall" src="{$userdata[avatarbox]}"></div>
			<br />
			<div id="selectfile">
			<button onclick="$('#PhotoFile').click()" class="btn btn-default btn-xs">Change photo</button><br />
			<input type="file" id="PhotoFile" name="PhotoFile" onchange="showprofilephoto();" style="display:none;">
				<input class="form-control" type="hidden" id="photo_b64" name="photo_b64">
				<a href="javascript:void(0)" onclick="deletephoto();">Remove profile photo</a>
			</div>
		</div>{$alertprofile}
		<h3>General settings:</h3>
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Your Name:</span>
			<input type="text" class="form-control" name="firstname" id="firstname" value="{$userdata[name]}" placeholder="Obligatory field">
		</div>
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Surname:</span>
			<input type="text" class="form-control" name="surname" id="surname" value="{$userdata[surname]}" placeholder="Obligatory field">
		</div>
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Patronymic:</span>
			<input type="text" class="form-control" name="patronymic" id="patronymic" value="{$userdata[patronymic]}" placeholder="(if present)">
		</div>
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Gender:</span>
			<select id="gender" name="gender" class="form-control">
			<option value="m">male</option>
			<option value="f">female</option>
			<option value="n">not chosen</option>
			</select>
		</div>
		<div style="white-space: nowrap; vertical-align: middle;">
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Pseudonym:</span>
			<input type="text" class="form-control" name="nickname" id="nickname" value="{$userdata[nickname]}">
		</div>
		<cite style="white-space: pre-wrap;">If the pseudonym is not specified, then all your posts will be signed by your name.</cite>
		</div>
		<div class="input-group" style="margin-top: 10px;">
			<span class="input-group-addon">Birthdate:</span>
			<input type="date" id="birthdate" name="birthdate" value="{$userdata[birthdate]}" class="form-control"> 		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="birthdateshow" id="birthdateshow"> <span>Hide my birth date</span>
		</label>
		</div>
		<div class="input-group" style="margin-top: 10px;">
		<span class="input-group-addon">Timezone:</span>
		{$utc_html}
		</div>
		<div class="input-group" style="margin-top: 10px;">
		<span class="input-group-addon">Country:</span>
		{$cc_html}
		</div>
		<div class="input-group" style="margin-top: 10px;">
		<span class="input-group-addon">City:</span>
			<div class="typeahead__container" style="font-size: 12pt;">
				<div class="typeahead__field" style="font-size: 12pt;">
					<span class="typeahead__query" style="font-size: 12pt;">
						<input type="text" class="form-control" name="user_region_lng" id="user_region_lng" value="{$user_region_lng}" placeholder="City search..." autocomplete="off" onchange="checkregion()">
					</span>
				</div>
			</div>
			<input type="hidden" name="user_region" id="user_region" value="{$user_region}">
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="hidelocation" id="hidelocation"> <span>Hide location</span>
		</label>
		</div>
		<div id="notvs" style="display: none;">
		<h3>A few words about you:</h3><small>This unit will be published on Your public page:</small>
		<textarea id="aboutme">{$aboutmehtml}</textarea>
		</div>
		<h3>Security settings:</h3>
		<div style="white-space: nowrap; vertical-align: middle;">
		<div class="input-group">
			<span class="input-group-addon"><!--nottranslate--><span class="nottranslate">E-Mail:</span><!--nottranslate--></span>
			<input type="text" class="form-control" name="email" id="email" value="{$userdata[email]}" disabled>
		</div>
		<div id="changemaillink" style="display: inline-block;"><a href="javascript:void(0);" onclick="changemail();" class="btn btn-default">Change</a>
		</div>{$enteremailhtml}
		<div id="savemaillink" style="display: none;"><a href="javascript:void(0);" onclick="savemail();" class="btn btn-default">Save changes</a> <a href="javascript:void(0);" onclick="cancelsavemail();" class="btn btn-default">Cancel changes</a>
		</div>
		</div>
		<div style="margin-top: 10px;">
		<div id="phonetext" style="display: none;"><font color="green">Enter the mobile phone number in the international format (starting with the "+")</font></div>
		<div class="input-group">
			<span class="input-group-addon">Phone number:</span>
			<input type="text" class="form-control" name="phone" id="phone" value="{$userdata[phone]}" disabled>
		</div>
		<div id="changephonelink" style="display: inline-block;"><a href="javascript:void(0);" onclick="changephone();" class="btn btn-default">Change</a>
		</div>
		<div id="savephonelink" style="display: none;">
		<a href="javascript:void(0);" onclick="savephone();" class="btn btn-default">Send SMS</a> <a href="javascript:void(0);" onclick="cancelsavephone();" class="btn btn-default">Cancel changes</a>
		</div>
		<div id="enterconfirmcode" style="display: none; margin-top: 10px;">
			<div class="input-group">
				<span class="input-group-addon">SMS code:</span>
				<input type="text" class="form-control" name="smscode" id="smscode" value="">
			</div>
			<div id="changephonelink" style="display: inline-block;"><a href="javascript:void(0);" onclick="savephone();" class="btn btn-default">Check and save</a> <a href="javascript:void(0);" onclick="cancelsavephone();" class="btn btn-default">Cancel changes</a>
			</div>
		</div>
		<div style="margin-top:10px;padding:5px;background-color:#e2f7df;overflow:hidden;background-image:url(/images/qwertyaigreen.png);background-repeat:no-repeat;background-position:right bottom;background-size: 25% auto;">
		{$linktomsg} <span>Receive important notifications via instant messenger - it's convenient! To link your account with Telegram, send the following code from your messenger:</span>
		<h2 style="margin:0;font-weight:600;text-align:center;overflow:hidden;width:100%;">CODE{$messengers_code}</h2>
		To the following bots:
		<!--nottranslate--><span class="nottranslate">
		<div>Telegram - <a href="https://t.me/{$config[TelegramBot]}" target="_blank">https://t.me/{$config[TelegramBot]}</a> (@{$config[TelegramBot]})</div>
		</span><!--nottranslate-->
		<small>* <span>the link must be opened in the browser of your mobile device</span></small><br />
		<small>** <span>you can connect one or several instant messengers.</span></small>
		</div>
		</div>
		<h3>Change Password:</h3>
		{$oldpassworddiv}
		<div style="white-space: nowrap;">
		<div class="input-group" style="margin-top: 10px;">
		<span class="input-group-addon">New password:</span>
		<input type="password" class="form-control" name="newpwd1" id="newpwd1" value="">
		</div>
		<div class="input-group" style="margin-top: 10px;">
		<span class="input-group-addon">Repeat password:</span>
		<input type="password" class="form-control" name="newpwd2" id="newpwd2" value="">
		</div>
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="checkip" id="checkip"> <span>To require password when changing the</span> <!--nottranslate--><span class="nottranslate">IP</span><!--nottranslate-->
		</label>
		</div>
		<!-- New line --><div></div><!-- End: New line -->
		</form>
	</div>
	<div class="tab-pane" id="myblogs">
		<h3 style="display: inline-block;">List of my blogs:</h3> <div style="display: inline-block; float: right;"><a href="javascript:void(0)" onclick="addblog()">Add new blog</a></div>
		<table class="table table-striped">
		<thead>
			<tr>
			<td>
			<strong>Blog address</strong>
			</td>
			<td>
			<strong>Blog title</strong>
			</td>
			<td>
			<strong>Status</strong>
			</td>
			<td>
			<strong>Action</strong>
			</td>
			</tr>
		</thead>
		<tbody>
		{$myblogs}
		</tbody>
		</table>
<div class="modal fade" id="addblogform" tabindex="-1" role="dialog" aria-labelledby="addblogformLabel">
<div class="modal-dialog" role="document">
<div class="modal-content">
<div class="modal-header">
<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><!--nottranslate--><span class="nottranslate">&times;</span><!--nottranslate--></span></button>
<h4 class="modal-title qwerty" id="addblogformLabel">New blog</h4>
</div>
<div class="modal-body">
<div class="input-group" style="margin-top: 15px;">
<span>Enter a unique address for your new blog (no spaces, allowed characters of the Latin alphabet, digits, signs [-] and [.]):</span>
<input type="text" class="form-control" name="blogname" id="blogname" onkeyup="showaddress(event.keyCode);"><br />
<span id="message"></span>
<span id="newaddress"></span>
</div>
</div>
<div class="modal-footer" style="white-space: nowrap;">
<div style="white-space: nowrap; display: inline-block; float: right;" class="loginbuttons">
<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
<button type="button" class="btn btn-primary" onclick="regblog();">Next</button>
</div>
</div>
</div>
</div>
</div>

	</div>
	<div class="tab-pane" id="mysites">
		<h3 style="display: inline-block;">My sites:</h3> <div style="display: inline-block; float: right;"><a href="https://wmprofile.com/editsite" target="_blank">Add new site</a></div>
		<table class="table table-striped">
		<thead>
			<tr>
			<td>
			<strong>Website</strong>
			</td>
			<td>
			<strong>Title</strong>
			</td>
			</tr>
		</thead>
		<tbody>
		{$mysites}
		</tbody>
		</table>
		<div id="notwmprofile" style="display: none;"><span>If you have interesting sites, we recommend that you register them in the directory</span> <!--nottranslate--><span class="nottranslate">WMProfile.com (</span><!--nottranslate--><span>Social network for site owners</span><!--nottranslate--><span class="nottranslate">).</span><!--nottranslate--></div>
	</div>
	<div class="tab-pane" id="accesslog">
		<h3>Access log:</h3>
		<table class="table table-striped">
		<thead>
			<tr>
			<td>
			<strong>Last access</strong>
			</td>
			<td>
			<strong>First access</strong>
			</td>
			<td>
			<strong>IP</strong>
			</td>
			<td>
			<strong>Country</strong>
			</td>
			<td>
			<strong>Region</strong>
			</td>
			<td>
			<strong>Browser (OS)</strong>
			</td>
			</tr>
		</thead>
		<tbody>
		{$accesslog}
		</tbody>
		</table>
	</div>
	<div class="tab-pane" id="notifications">
		<h3>Notifications settings:</h3>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify1" id="notify1"> <span>System notifications</span>
		</label>
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify2" id="notify2"> <span>Notify about new comments to my posts</span>
		</label>
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify3" id="notify3"> <span>Notify about new replies to my comments</span>
		</label>
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify4" id="notify4"> <span>Notify about new private message</span>
		</label>
		</div>
		<div id="wmworkerletters" class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify5" id="notify5"> <span>I agree to receive letters for which I am paid</span> <span style="white-space: nowrap;"><!--nottranslate--><span class="nottranslate">(wmworker.com - 0,03 WMC / 1 email)</span><!--nottranslate--></span>
		</label>
		</div>
		<div class="checkbox" style="margin-top: 10px;">
		<label>
		  <input type="checkbox" name="notify6" id="notify6"> <span>Important critical notifications</span>
		</label>
		</div>
	</div>
  </div>
</div>
<button type="button" id="savebutton" class="btn btn-primary" style="margin-top: 10px;" onclick="savesettings();">Save settings</button>

<div class="dm-overlay" id="sended">
	<div class="dm-table">
		<div class="dm-cell">
			<div class="dm-modal" style="max-width: 800px !important;">
				<h3>Please pay attention!</h3>
				<div class="alert alert-success" align="center"><span>We sent you a link to verify your email address.</span> <span>Don't forget to check your Spam folder. If the email ends up in this folder, click "This is not spam."</span></div>
				<p><span>If you do not receive an email with a link to activation within the next minute, click here:</span>
				<div align="center" id="waitsend"><h4 style="color: #666666;"><span>Please, wait</span> <span id="waitsec"></span> <span>sec.</span></h4></div>
				<div class="alert alert-info" align="center" id="difemail"><span>If this attempt also fails, we recommend using a different email address for registration.</span></div>
				<div align="center" id="resend"><button class="btn btn-info" onclick="eval(mailfunc);">Send via another server</button> <button class="btn btn-default" onclick="mailmsg(0)">Close.</button></div>
				</p>
			</div>
		</div>
	</div>
</div>

<!--noindex-->
<span class="trnsltphrss">Error</span>
<span class="trnsltphrss">(if present)</span>
<span class="trnsltphrss">Saved successfully!</span>
<span class="trnsltphrss">City search...</span>
<span class="trnsltphrss">The confirmation</span>
<span class="trnsltphrss">Are you sure you want to delete this file?</span>
<span class="trnsltphrss">Please pay attention!</span>
<span class="trnsltphrss">Obligatory field</span>
<span class="trnsltphrss">You must select a file and enter its description!</span>
<span class="trnsltphrss">The length of the text "About me" should be no more than 60000 symbols! The current text length - </span>
<span class="trnsltphrss">The SMS message with a confirmation code will be sent to your phone number.</span>
<span class="trnsltphrss">New phone number saved successfully</span>
<!--/noindex-->
