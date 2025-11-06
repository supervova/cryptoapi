<div id="apidoc">
  <div id="stngs" class="stngs">
    <h2>Signals settings:</h2>
    <h4>Bitcoin (BTC):</h4>
    <form id="fsettings">
      <label
        ><input type="checkbox" name="palertbtc" /> Price alert signals for
        BTC</label
      >
      <label
        ><input type="checkbox" name="abnormalbtc" /> Signals of abnormal
        changes for BTC</label
      >
      <label
        ><input type="checkbox" name="buysellbtc" /> Buy and Sell
        Recommendations for BTC</label
      >
      <h4>Other assets:</h4>
      <label><input type="checkbox" name="palert" /> Price alert signals</label>
      <label
        ><input type="checkbox" name="abnormal" /> Signals of abnormal
        changes</label
      >
      <label
        ><input type="checkbox" name="buysell" /> Buy and Sell
        Recommendations</label
      >
      <h4>Collection of assets:</h4>
      <label><input type="radio" name="fassets" value="0" /> All assets</label>
      <label><input type="radio" name="fassets" value="1" /> All except:</label>
      <div class="select2" id="exclude-block">
        <select
          name="exclude-assets[]"
          id="exclude-assets"
          multiple="multiple"
          style="width: 100%"
        ></select>
      </div>
      <label><input type="radio" name="fassets" value="2" /> List only:</label>
      <div class="select2" id="include-block">
        <select
          name="include-assets[]"
          id="include-assets"
          multiple="multiple"
          style="width: 100%"
        ></select>
      </div>
      <h4>General signals:</h4>
      <label
        ><input type="checkbox" name="general" /> Dangerous Selling
        Pressure</label
      >
      <h4>Integration:</h4>
      <input
        type="url"
        name="webhookurl"
        placeholder="https://example.com/webhook"
        style="width: 100%"
      />
      <small style="display: block; color: #aaa; margin-top: 5px">
        All signals will be posted as JSON to the webhook URL you specify —
        perfect for automated integrations.
      </small>
    </form>
  </div>
  <div id="signals" class="signals">
    <span class="blink loading">Loading...</span>
  </div>
</div>

<div class="trnsltphrss">
  <span>Error</span>
  <span>Loading...</span>
  <span>Select assets to exclude</span>
  <span>Select assets to include</span>
</div>
