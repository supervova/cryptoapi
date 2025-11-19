function timestamp2date(timestamp) {
  var theDate = new Date(timestamp * 1000);
  return theDate.toLocaleString();
}
function SetCookieQwerty(name, value) {
  var argv = SetCookieQwerty.arguments;
  var argc = SetCookieQwerty.arguments.length;
  var expires = argc > 2 ? argv[2] : null;
  var path = argc > 3 ? argv[3] : null;
  var domain = argc > 4 ? argv[4] : null;
  var secure = argc > 5 ? argv[5] : false;
  document.cookie =
    name +
    '=' +
    escape(value) +
    (expires == null ? '' : '; expires=' + expires.toGMTString()) +
    (path == null ? '' : '; path=' + path) +
    (domain == null ? '' : '; domain=' + domain) +
    (secure == true ? '; secure' : '');
}
function GetCookieQwertyVal(offset) {
  var endstr = document.cookie.indexOf(';', offset);
  if (endstr == -1) endstr = document.cookie.length;
  return unescape(document.cookie.substring(offset, endstr));
}
function GetCookieQwerty(name) {
  var arg = name + '=';
  var alen = arg.length;
  var clen = document.cookie.length;
  var i = 0;
  while (i < clen) {
    var j = i + alen;
    if (document.cookie.substring(i, j) == arg) return GetCookieQwertyVal(j);
    i = document.cookie.indexOf(' ', i) + 1;
    if (i == 0) break;
  }
  return null;
}
function elementInViewport(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top < window.pageYOffset + window.innerHeight &&
    left < window.pageXOffset + window.innerWidth &&
    top + height > window.pageYOffset &&
    left + width > window.pageXOffset
  );
}
g2fascss = 0;
function procg2fa(act2fa) {
  g2fascss = 0;
  var g2facode = '';
  if (document.getElementById('g2facode')) {
    document.getElementById('g2famsg').style.display = 'none';
    var g2facode = document.getElementById('g2facode').value;
  }
  $.ajax({
    url: './procg2fa.php',
    type: 'POST',
    data: { act2fa: act2fa, g2facode: g2facode },
    async: false,
    success: function (response) {
      response = $.parseJSON(response);
      if (response[0] == 'shw2fa') {
        if (!document.getElementById('wing2fa')) {
          var wing2fa = document.createElement('div');
          wing2fa.setAttribute('id', 'wing2fa');
          wing2fa.classList.add('modal');
          wing2fa.classList.add('fade');
          document.body.appendChild(wing2fa);
          $('#wing2fa').html(response[1]);
          $('#g2facode').keypress(function (e) {
            if (e.keyCode == 13) {
              procg2fa(act2fa);
            }
          });
        } else {
          document.getElementById('g2facode').value = '';
        }
        $('#wing2fa').appendTo('body').modal('show');
      } else if (response[0] == 'notlogged') {
        location.href = '/auth';
        return;
      } else if (response[0] == 'inv2fa') {
        document.getElementById('g2famsg').style.display = 'block';
      } else if (response[0] == 'OK') {
        g2fascss = 1;
        document.getElementById('g2facode').value = '';
        if (act2fa == 1 || act2fa == 2) {
          location.reload();
        } else {
          doact2fa(1);
        }
      } else {
        alert(response[0]);
      }
    },
  });
}
