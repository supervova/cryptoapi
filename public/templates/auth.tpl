<!DOCTYPE html>
<html lang="{$lng_html}" prefix="og: http://ogp.me/ns#">
<head>
<title></title>
<script src="/js/jquery-2.1.3.min.js"></script>
<script src="/js/bootstrap.min.js"></script>
<script src="/js/jquery.toast.min.js"></script>
<script src="/js/bootpopup.js"></script>
<script src="/js/qwerty.js"></script>
<script src="/js/md5.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js"></script>
<script>
function js_translate(str) {
if (str == '{$phraseclose}') { str = '{$btn_close}'; } if (str == 'Close') { str = '{$btn_close}'; }
if (str == '{$phraseok}') { str = '{$btn_ok}'; }
if (str == '{$phrasecancel}') { str = '{$btn_cancel}'; }
if (str == '{$phraseyes}') { str = '{$btn_yes}'; }
if (str == '{$phraseno}') { str = '{$btn_no}'; }
return str;
}
</script>
</head>
<body>
  <script>
  function docancel() {
    location.href='{$returl}';
  }
  function donext() {
    if ($("#signin").hasClass('active'))
    {
      nextscript = 'dologinlf();';
    }
    if ($("#signup").hasClass('active'))
    {
      nextscript = 'complitereglf();';
    }
    if ($("#resetpwd").hasClass('active'))
    {
      nextscript = 'dorememberf();';
    }
    checkagreement(nextscript);
  }
  function checkagreement(nextscript) {
    if (document.getElementById('useragreement').checked)
    {
      eval(nextscript);
    }
    else
    {
      bootpopup({
        title: 'Please pay attention!',
        content: [
        'Do you agree with the terms of this document: <a href="https://{$this_http_host}/useragreement" target="_blank">User Agreement</a>?'
          ],
        cancel: function(data, array, event) { return false; },
        ok: function(data, array, event) {
          document.getElementById('useragreement').checked = true;
          eval(nextscript);
        }
      });
    }
  }
  function showoath() {
    if ($("#signin").hasClass('active'))
    {
      $("#oauthdiv").show();
    }
    if ($("#signup").hasClass('active'))
    {
      $("#oauthdiv").show();
    }
    if ($("#resetpwd").hasClass('active'))
    {
      $("#oauthdiv").hide();
    }
  }

  function dologinlf() {
	var loginemail = document.getElementById('loginemaillf').value;
	var loginpassword = document.getElementById('loginpasswordlf').value;
	if (loginemail != '' && loginpassword != '')
	{
		loginpassword = str_rot13(loginpassword);
		$('#p_prldr').show();
		$.post( "register.php", { thisprojectid: {$thisprojectid}, loginemail: loginemail, loginpassword: loginpassword, lng: "{$user_lng}", checkID: {$startruntime}, userUTC: ClientTimeZoneOffset })
		  .done(function( data ) {
			if (data == '' || data == 'OK')
			{
				location.href='{$returl}';
			}
			else
			{
				$('#p_prldr').delay(100).fadeOut('slow');
				document.getElementById("messagelogin").innerHTML='<font color="red">' + data + '</font>';
			}
		  });
	}
}

  function quickreg() {
    document.getElementById("messagereg").innerHTML='';
    gotab('signup');
  }
  function loginform() {
    gotab('signin');
  }
  function forgotform() {
    gotab('resetpwd');
  }
  function generatepasswordlf() {
      $.post( "index.php", { genpwd: 10 })
        .done(function( data ) {
          document.getElementById('showpasswordlf').checked = true;
          document.getElementById('passwordlf').type = 'text';
          document.getElementById('passwordlf').value = data;
        });
  }
  function dorememberf() {
    mailfunc = 'dorememberf()';
    $('#resend').hide();
    mailretry = mailretry + 1;
    var rememberemail = document.getElementById('rememberemailf').value;
    if (rememberemail != '')
    {
      $('#p_prldr').show();
      $.post( "register.php", { thisprojectid: {$thisprojectid}, this_http_host: '{$this_http_host}', rememberemail: rememberemail, lng: "{$user_lng}", checkID: {$startruntime}, userUTC: ClientTimeZoneOffset })
        .done(function( data ) {
        if (data == '') location.href='/';
        $('#p_prldr').delay(100).fadeOut('slow');
        if (data == 'OK')
        {
          $('#lostpwd').modal('hide');
          mailmsg(mailretry);
        }
        else
        {
          document.getElementById("messagelost").innerHTML='<font color="red">' + data + '</font>';
        }
        });
    }
  }
  function complitereglf() {
    mailfunc = 'complitereglf()';
    $('#resend').hide();
    mailretry = mailretry + 1;
    var email = document.getElementById('emaillf').value;
    var password = document.getElementById('passwordlf').value;
    var yourname = document.getElementById('yournamelf').value;
    var surname = document.getElementById('surnamelf').value;
    var birthdate = document.getElementById('birthdate').value;
    clienttime = new Date();
    ClientTimeZoneOffset = -clienttime.getTimezoneOffset()/60;
    if (email != '')
    {
      $('#p_prldr').show();
      $.post( "register.php", { thisprojectid: {$thisprojectid}, this_http_host: '{$this_http_host}', blogname: 'registrationonly', lng: "{$user_lng}", email: email, mailretry: mailretry, password: password, yourname: yourname, surname: surname, birthdate: birthdate, checkID: {$startruntime}, userUTC: ClientTimeZoneOffset, returnurl: '{$returl}' })
        .done(function( data ) {
        $('#p_prldr').delay(100).fadeOut('slow');
        if (data == 'OK')
        {
          $('#regform').modal('hide');
          mailmsg(mailretry);
        }
        else
        {
          document.getElementById("messagereg").innerHTML='<font color="red">' + data + '</font>';
        }
        });
    }
  }
  function mailcountdown(stopsec)
  {
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
      location.href = '{$returl}';
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
  function gotab(tab) {
    $("#signin").removeClass("active");
    $("#signintab").removeClass("active");
    $("#signup").removeClass("active");
    $("#signuptab").removeClass("active");
    $("#resetpwd").removeClass("active");
    $("#resetpwdtab").removeClass("active");
    $("#"+tab).addClass("active");
    $("#"+tab+"tab").addClass("active");
    showoath();
    window.scrollTo(0, 0);
  }
  function cancelauth() {
    $.ajax({
      url: './initmsgreg.php',
      type: 'POST',
      data: { cancelinit: msgcode, thisprojectid: {$thisprojectid} },
      async: true,
      success: function(response) {
        msgcode=0;
        $('#loginmsgwin').hide()
      }
    });
  }
  checkmsgcode = {
    func: function() {
      if (msgcode > 0)
      {
        msgsec = msgsec - 1;
        $('#msgsec').html(msgsec);
        if (msgsec < 1)
        {
          bootpopup.alert('Time is over. Try to request the code again!','Error');
          $('#loginmsgwin').hide();
        }
        else
        {
          if (checkworking == 0 && (msgsec % 2 === 0 || msgsec < 5))
          {
            checkworking = 1;
            $.ajax({
              url: './initmsgreg.php',
              type: 'POST',
              data: { checkinit: msgcode, thisprojectid: {$thisprojectid} },
              async: true,
              success: function(response) {
                response = $.parseJSON(response);
                if (response[0] == 'LOG')
                {
                  location.href = '{$returl}';
                }
                else if (response[0] != 'OK')
                {
                  bootpopup.alert(response[0],'Error');
                }
                else
                {
                  checkworking = 0;
                  setTimeout( function() { checkmsgcode.func() } , 1000);
                }
              }
            });
          }
          else
          {
            setTimeout( function() { checkmsgcode.func() } , 1000);
          }
        }
      }
    }
  }
  function yandexoauth() {
      nextscript = "location.href = '{$yandexurl}|'+ClientTimeZoneOffset;";
    checkagreement(nextscript);
  }
  function googleoauth() {
    nextscript = "location.href = '{$googleurl}|'+ClientTimeZoneOffset;";
    checkagreement(nextscript);
  }
  function facebookoauth() {
    nextscript = "location.href = '{$fb_redirect_uri}?state={$state}';";
    checkagreement(nextscript);
  }
  function preloginmsg(msgname) {
    nextscript = 'loginmsg(\''+ msgname +'\');';
    checkagreement(nextscript);
  }
  function loginmsg(msgname) {
    $('#viberdiv').hide();
    $('#telegramdiv').hide();
    $('#facebookdiv').hide();
    $.ajax({
      url: './initmsgreg.php',
      type: 'POST',
      data: { initsec: '{$hello_cookie}{$unloggedid}', thisprojectid: {$thisprojectid} },
      async: false,
      success: function(response) {
        response = $.parseJSON(response);
        if (response[0] == 'LOG')
        {
          location.reload();
        }
        else if (response[0] == 'OK')
        {
          msgsec = 300;
          msgcode = response[1]*1;
          $('#msgcode').html('A'+msgcode);
          $('#msgsec').html(msgsec);
          $('#'+msgname+'div').show();
          $('#loginmsgwin').show();
          checkworking = 0;
          setTimeout( function() { checkmsgcode.func() } , 1000);
        }
        else
        {
          bootpopup.alert(response[0],'Error');
        }
      }
    });
  }
  jQuery(document).ready(function() {
  if ({$thisprojectid} == 0)
  {
    $("#newblogger").show();
  }
  $("#loginemaillf").keypress(function(e){
  document.getElementById("messagelogin").innerHTML='';
  if(e.keyCode==13){
    document.getElementById("loginpasswordlf").focus();
  }
  });
  $("#loginpasswordlf").keypress(function(e){
  document.getElementById("messagelogin").innerHTML='';
  if(e.keyCode==13){
    dologinlf();
  }
  });
  mailretry = 0;
  clienttime = new Date();
  ClientTimeZoneOffset = -clienttime.getTimezoneOffset()/60;
  $(".yandexoauth").html('<'+'a hr'+'ef="javascript:void(0)" onclick="yandexoauth()"><img class="exticons" src="/images/yandex.png" alt="Login with Yandex"></a>');
  $(".googleoauth").html('<'+'a hr'+'ef="javascript:void(0)" onclick="googleoauth()"><img class="exticons" src="/images/oauthgoogle.png" alt="Login with Google"></a>');
  if (document.location.href.indexOf('regform') != -1)
  {
    quickreg();
  }
  else if (document.location.href.indexOf('reset') != -1)
  {
    forgotform();
  }
  else
  {
    loginform();
  }
  });
  </script>
  <div class="tabs">
    <h4 style="margin:0;text-align:right;line-height:18px;margin-bottom:10px;color:#333333;">Secure Authorization Center</h4>
    <ul class="nav nav-tabs">
    <li id="signintab" class="active" style="margin-left:20px;"><a href="javascript:void(0)" onclick="loginform()">Sign In</a></li>
    <li id="signuptab"><a href="javascript:void(0)" onclick="quickreg()">Sign Up</a></li>
    <li id="resetpwdtab"><a href="javascript:void(0)" onclick="forgotform()">Reset the password</a></li>
    </ul>
    <div class="tab-content">
    <div class="tab-pane" id="signup">


      <div class="formcontent" id="regform">
        <div class="loginlinks"><a href="javascript:void(0)" class="qwerty" onclick="loginform()">I have an account</a></div>
          <div class="input-group">
            <span class="input-group-addon"><!--nottranslate--><span class="nottranslate">E-Mail:</span><!--nottranslate--></span>
            <input type="email" class="form-control" name="emaillf" id="emaillf">
          </div>
          <div class="input-group" style="margin-top: 15px;">
            <span class="input-group-addon">Password:</span>
            <input type="password" class="form-control" name="passwordlf" id="passwordlf">
          </div>
          <div class="input-group">
      <input type="checkbox" id="showpasswordlf" name="showpasswordlf" style="margin-bottom: 10px;" onclick="javascript:if (document.getElementById('showpasswordlf').checked) { document.getElementById('passwordlf').type='text'; } else { document.getElementById('passwordlf').type='password'; }"> &nbsp;<label for="showpasswordlf">Show</label> &nbsp; <a href="javascript:void(0);" onclick="generatepasswordlf();">Generate password</a>
          </div>
          <div style="padding:5px;text-align:left;"><small>The password must be at least 8 characters long and contain at least one number and one capital letter!</small></div>
          <div class="input-group" style="margin-top: 15px;">
            <span class="input-group-addon">Your Name:</span>
            <input type="text" class="form-control" name="yournamelf" id="yournamelf">
          </div>
          <div class="input-group" style="margin-top: 15px;">
            <span class="input-group-addon">Surname:</span>
            <input type="text" class="form-control" name="surnamelf" id="surnamelf">
          </div>
          <div class="input-group" style="margin-top: 15px;">
            <span class="input-group-addon">Birthdate:</span>
            <input type="date" class="form-control" name="birthdate" id="birthdate">
          </div>
          <div style="text-align: center;"><span id="messagereg"></span></div>
      </div>

    </div>

    <div class="tab-pane" id="signin">

      <div class="formcontent" id="loginform">
        <div class="loginlinks"><a href="javascript:void(0)" onclick="quickreg()">Quick registration</a><div style="margin-top:10px;"><a href="javascript:void(0)" onclick="forgotform()">Forgot password?</a></div></div>
          <div class="input-group">
            <span class="input-group-addon"><!--nottranslate--><span class="nottranslate">E-Mail:</span><!--nottranslate--></span>
            <input type="email" class="form-control" name="loginemaillf" value="{$setemail}" id="loginemaillf">
          </div>
          <div class="input-group" style="margin-top: 15px;">
            <span class="input-group-addon">Password:</span>
            <input type="password" class="form-control" name="loginpasswordlf" id="loginpasswordlf">
          </div>
          <div style="text-align: center;"><span id="messagelogin"></span></div>
      </div>

    </div>

    <div class="tab-pane" id="resetpwd">

      <div class="formcontent" id="lostpwd">
        <div class="loginlinks"><a href="javascript:void(0)" onclick="quickreg()">Quick registration</a><div style="margin-top:10px;"><a href="javascript:void(0)" onclick="loginform()">I remember the password</a></div></div>
        <div class="input-group">
          <span class="input-group-addon"><!--nottranslate--><span class="nottranslate">E-Mail:</span><!--nottranslate--></span>
          <input type="email" class="form-control" name="rememberemailf" value="{$setemail}" id="rememberemailf">
        </div>
        <div style="text-align: center;"><span id="messagelost"></span></div>
      </div>


    </div>
    <div style="white-space: nowrap;width:100%;padding:0 30px 30px;">
      <div style="white-space: normal;text-align:left;font-size:10px;">
        <label><input type="checkbox" id="useragreement"> By using our services, you confirm that you have read and fully agree with this document: <a href="https://{$this_http_host}/useragreement" target="_blank">User Agreement</a></label>
      </div>
      <div style="white-space: nowrap;text-align:right;" class="loginbuttons">
        <button type="button" class="btn btn-default" id="cancellogin" onclick="docancel();">Cancel</button>
        <button type="button" class="btn btn-primary" id="loginbutton" onclick="donext();">Next</button>
      </div>
      <div id="oauthdiv">
        <div style="margin-top: 15px;text-align:left;">
        <span>Login through third-party services:</span><br>
        <!-- <a href="javascript:void(0)" onclick="facebookoauth()"><img class="exticons" src="/images/oauthfacebook.png" alt="Login with Facebook"></a> /--><span class="googleoauth"></span> &nbsp; <span class="yandexoauth"></span>
        </div>
        <div style="margin-top: 15px;text-align:left;">
        <span>Log in using the messengers:</span><br>
        <a href="javascript:void(0)" onclick="preloginmsg('viber')"><img src="/images/viber.png" style="border:none;width:50px;height:auto;" alt="Viber" title="Viber"></a> <a href="javascript:void(0)" onclick="preloginmsg('telegram')"><img src="/images/telegram.png" style="border:none;width:50px;height:auto;" alt="Telegram" title="Telegram"></a>
        </div>
      </div>
      <a href="https://{$lngdot}qwerty.blog" style="float: right;display:none;" target="_blank" id="newblogger">Become a blogger</a>
    </div>
    </div>
    <div class="sslinfo">
      <img src="/images/sslsecure.png" style="max-height:25px;margin: 0 10px 0 0; float: left;"> <span>Form data will be pre-encrypted and transmitted using a secure SSL connection. We do not store your passwords, but only their hash keys (SHA512/256), and we do not transfer any data to third parties.</span>
    </div>
    <div style="margin-top: 20px;text-align:center;width:100%;overflow:hidden;">
    <small>{$langabout}</small>
    </div>
  </div>

  <div class="dm-overlay" id="loginmsgwin">
    <div class="dm-table">
      <div class="dm-cell">
        <div class="dm-modal" style="overflow:hidden;text-align:center;">
          <a href="javascript:void(0)" class="dm-close" onclick="cancelauth()"></a>
  <div id="viberdiv">
    <h3>Login via Viber</h3>
      <img src="/images/viber.png" style="width:50px;height:auto;float:left;margin-right:5px;">
      <span>You should connect to the bot using this link:</span> <a href="/l/QwertyAI" target="_blank">qwertyai</a>
  </div>
  <div id="telegramdiv">
    <h3>Login via Telegram</h3>
      <img src="/images/telegram.png" style="width:50px;height:auto;float:left;margin-right:5px;">
      <span>You should connect to the bot using this link:</span> <a href="https://t.me/{$config[TelegramBot]}" target="_blank">@QwertyAIbot</a>
  </div>
  <div id="facebookdiv">
    <h3>Login via Facebook Messenger</h3>
    <img src="/images/facebook.png" style="width:50px;height:auto;float:left;margin-right:5px;">
    <a href="https://www.facebook.com/lubovnici/" target="_blank"><span>You must go to this page on Facebook</span></a>
  </div>
  <span>And send a message</span> <span style="font-size:20pt;font-weight:600;" id="msgcode">A</span>&nbsp; <span style="white-space:nowrap;">The code is valid</span> <span style="font-size:20pt;font-weight:600;" id="msgsec">300</span> <span>seconds</span>
  <div style="margin-top:10px;"><button class="btn btn-default" onclick="cancelauth()">* Cancel *</button></div>
        </div>
      </div>
    </div>
  </div>

  <div class="dm-overlay" id="sended">
    <div class="dm-table">
      <div class="dm-cell">
        <div class="dm-modal" style="max-width: 800px !important;">
          <h3>Please pay attention!</h3>
          <div class="alert alert-success" style="text-align:center;"><span>We sent you a link to verify your email address.</span> <span>Don't forget to check your Spam folder. If the email ends up in this folder, click "This is not spam."</span></div>
          <p><span>If you do not receive an email with a link to activation within the next minute, click here:</span>
          <div id="waitsend" style="text-align: center;"><h4 style="color: #666666;"><span>Please, wait</span> <span id="waitsec"></span> <span>sec.</span></h4></div>
          <div class="alert alert-info" style="text-align:center;" id="difemail"><span>If this attempt also fails, we recommend using a different email address for registration.</span></div>
          <div id="resend" style="text-align: center;"><button class="btn btn-info" onclick="eval(mailfunc);">Send via another server</button> <button class="btn btn-default" onclick="mailmsg(0)">Close.</button></div>
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
