<link rel="stylesheet" href="/js/highlight/styles/default.min.css">
<script src="/js/highlight/highlight.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el);
  });
});
</script>

<script>
function getapi(arg) {
	if ({$user_id} == 0)
	{
		quickreg();
		return;
	}
	$.ajax({
	  type: 'GET',
	  url: "./userapi/p43/command/"+arg,
	  data: {  },
	  success: function(data){
		apikey = data;
		bootpopup({
			title: "Your API-Key",
			content: [
			apikey,
				],
			ok: function(data, array, event) {
				return false;
			}
		});
	  },
	  error: function(jqXHR, exception){
		var msg = '';
		if (jqXHR.status === 0) {
			msg = 'Not connect.\n Verify Network.';
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
		bootpopup.alert(msg,'Error');
	  }
	});
}
</script>

<h1>API Documentation. <span class="text-02">For power users only</span></h1>

<p class="mb-2lh">☝️🧐 You don’t need to be a developer or connect and use our API to access the service.</p>

<div class="e-buttons">
  <button class="btn btn-info" onclick="getapi('showkey')">Show API Key</button>
  <button class="btn btn-warning" onclick="getapi('resetkey')">Reset API Key</button>
</div>

<div id="apidoc">
  <p><span class="nottranslate">YOUR_API_KEY</span> - this text should be replaced with your API key</p>

  <h2 class="e-h4 mt-2lh">Example 1. Cryptocurrency Asset Rating by TRINDX (Trade Appe Index):</h2>
  <pre><code>curl -X GET "https://cryptoapi.ai/userapi/p43/YOUR_API_KEY/assets/"</code></pre>

  <h2 class="e-h4 mt-2lh">Example 2. Single asset dataset:</h2>
  <pre><code>curl -X GET "https://cryptoapi.ai/userapi/p43/YOUR_API_KEY/assets/BTC"</code></pre>

  <h2 class="e-h4 mt-2lh">Example of returned data in json format:</h2>
  <pre><code class="hljs language-json">
{
"status":"OK",
"assets": {
  "ETH": {
    "rating": 1,
    "price": {
      "current": "1529.93000000",
      "today": {
        "min": 1518.67,
        "max": 1532.52,
        "middle": 1525.8867353951928
      },
      "yesterday": {
        "min": 1474.63,
        "max": 1687.37,
        "middle": 1594.4968714385
      }
    },
    "market": "middle",
    "TRINDX": 12,
    "risk": "low",
    "RSI1000": "14",
    "RSI365": "9",
    "RSI182": "10",
    "RSI91": "13",
    "RSI30": "28",
    "RSI7": "45"
  },
  .....,
  .....,
  .....
  }
}
  </code></pre>

</div>

<div class="trnsltphrss">
<span>Error</span>
<span>Your API-Key</span>
<span>Please note</span>
<span>Text request</span>
<span>Sorry, there was some error with the request. Please refresh the page.</span>
<span>The response returns a JSON array with values ​​status=OK and answer={ JSON with data about the operation }</span>
</div>
