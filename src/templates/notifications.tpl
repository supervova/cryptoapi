<h1>Notifications</h1>
<p class="text-2ry">
  Click on the notification to mark it as read.
  <a href="javascript:void(0)" onclick="readnotify(-1)">Mark all as read</a>
</p>
<div class="e-filter is-row" id="typesdiv">
  <label><input type="radio" name="notify_type" value="0" id="notifytype0" onchange="changetype()" checked> All notifications</label>
  <label><input type="radio" name="notify_type" value="1" id="notifytype1" onchange="changetype()"> Only unread</label>
  <label><input type="radio" name="notify_type" value="2" id="notifytype2" onchange="changetype()"> Ordinary notifications</label>
  <label><input type="radio" name="notify_type" value="3" id="notifytype3" onchange="changetype()"> Warnings</label>
  <label><input type="radio" name="notify_type" value="4" id="notifytype4" onchange="changetype()"> Information notifications</label>
  <label><input type="radio" name="notify_type" value="5" id="notifytype5" onchange="changetype()"> Positive notifications</label>
</div>
<span class="endblock"></span>
<div id="datablock"></div>
<div class="e-loader" id="loadingdata" style="display: none">
  Loading...<br />
  <a href="{$thispageurl}">Click here if loading is not performed</a>
</div>

<script>
  function getblock() {
    if (loadingdata == 0) {
      loadingdata = 1;
      document.getElementById('loadingdata').style.display = 'block';
      $('.endblock').removeClass('endblock');
      $.ajax({
        url: './getnotifications.php',
        type: 'GET',
        async: true,
        data: { lasteventtime: lasteventtime, notifytype: notifytype },
        success: function (response) {
          response = $.parseJSON(response);
          if (lasteventtime == 0) {
            $('#datablock').html(response[1]);
          } else {
            $('#datablock').append(response[1]);
          }
          loadingdata = 0;
          document.getElementById('loadingdata').style.display = 'none';
          showblock();
        },
        error: function (response) {
          loadingdata = 0;
          getcommunities();
        },
      });
    }
  }
  function showblock() {
    if (loadingdata == 0) {
      for (var i = 0; i < $('.endblock').get().length; i++) {
        var item = document.getElementsByClassName('endblock');
        var itemFirst = item[i];
        if (elementInViewport(itemFirst) || publishtime == 0) {
          getblock();
        }
      }
    }
  }
  function readnotify(nid) {
    $.ajax({
      url: 'readnotify.php',
      type: 'POST',
      data: { nid: nid },
      async: true,
      success: function (response) {
        response = $.parseJSON(response);
        if (response[0] == 'OK') {
          if (nid > 0) {
            $('#notify' + nid).removeClass('notifymsg-bold');
          } else {
            location.reload();
          }
          document.getElementById('notreadnotify').innerHTML = response[1];
        } else {
          alert(response[0]);
          location.reload();
        }
      },
    });
  }
  function changetype() {
    if (document.getElementById('notifytype1').checked) {
      notifytype = 1;
    } else if (document.getElementById('notifytype2').checked) {
      notifytype = 2;
    } else if (document.getElementById('notifytype3').checked) {
      notifytype = 3;
    } else if (document.getElementById('notifytype4').checked) {
      notifytype = 4;
    } else if (document.getElementById('notifytype5').checked) {
      notifytype = 5;
    } else {
      notifytype = 0;
    }
    loadingdata = 0;
    lasteventtime = 0;
    getblock();
  }
  notifytype = 0;
  loadingdata = 0;
  lasteventtime = 0;
  window.onscroll = showblock;
  showblock();
</script>
