/* global $, bootpopup */

const TAB_TITLES = {
  Generalsettings: 'Profile. <span class="text-02">Settings</span>',
  accesslog: 'Session <span class="text-02">History</span>',
  notifications: 'Notofications. <span class="text-02">Settings</span>',
};

const DEFAULT_TAB = 'Generalsettings';
const COPY_RESET_DELAY = 6000;
const COPY_SUCCESS_HTML = '<span class="text-cussess">✅ Copied!</span>';
const DEFAULT_COPY_LABEL = 'Copy';
const NAV_SELECTOR = '[role="tablist"], .nav-tabs, .e-tabs-nav';
const TAB_CONTAINER_SELECTOR = '.tabs';
const TAB_PANE_SELECTOR = '.tab-pane';
const ACTIVE_CLASS = 'active';
const LINK_ACTIVE_CLASS = 'is-active';
const PROFILE_TEMPLATE_KEY = 'profileTemplateVars';

if (typeof window !== 'undefined' && typeof window.js_translate !== 'function') {
  const runtimeTranslator =
    typeof window.t === 'function' ? window.t.bind(window) : null;
  window.js_translate = (str) =>
    runtimeTranslator ? runtimeTranslator(str) : str;
}

const normalizeTemplateValue = (value) =>
  `${value == null ? '' : value}`.trim();

const parseTemplateNumber = (value) => {
  const parsed = parseInt(normalizeTemplateValue(value), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parseTemplateBoolean = (value) => {
  const normalized = normalizeTemplateValue(value).toLowerCase();
  return normalized === '1' || normalized === 'true';
};

const getTemplateVars = () => {
  if (typeof window === 'undefined') return null;
  const vars = window[PROFILE_TEMPLATE_KEY];
  if (!vars || typeof vars !== 'object') return null;
  return vars;
};

const buildLogicConfig = (logic = {}) => ({
  checkIp: parseTemplateBoolean(logic.checkIp),
  birthdate: parseTemplateBoolean(logic.birthdate),
  hideLocation: parseTemplateBoolean(logic.hideLocation),
  notify1: parseTemplateBoolean(logic.notify1),
  notify2: parseTemplateBoolean(logic.notify2),
  notify3: parseTemplateBoolean(logic.notify3),
  notify4: parseTemplateBoolean(logic.notify4),
  notify5: parseTemplateBoolean(logic.notify5),
  notify6: parseTemplateBoolean(logic.notify6),
});

const createProfileConfig = (templateVars) => ({
  avatarPlaceholder: templateVars.avatarPlaceholder || '',
  userPhone: templateVars.userPhone || '',
  userEmail: templateVars.userEmail || '',
  genderIndex: parseTemplateNumber(templateVars.userGenderIndex),
  userCountry: templateVars.userCountry || '',
  userRegion: templateVars.userRegion || '',
  userRegionLng: templateVars.userRegionLng || '',
  userLang: templateVars.userLang || '',
  startRuntime: parseTemplateNumber(templateVars.startRuntime),
  logic: buildLogicConfig(templateVars.logic || {}),
});

const getTabId = (link) => {
  if (!link) return DEFAULT_TAB;
  const raw =
    link.getAttribute('href') ||
    link.getAttribute('data-target') ||
    link.dataset.target ||
    '';
  const id = raw.startsWith('#') ? raw.slice(1) : raw;
  return id || DEFAULT_TAB;
};

const applyTitle = (target, tabId) => {
  if (!target) return;
  const title = TAB_TITLES[tabId] || TAB_TITLES[DEFAULT_TAB];
  target.innerHTML = title;
};

const initProfileTabs = (root = document) => {
  const container = root.querySelector(TAB_CONTAINER_SELECTOR);
  if (!container) return;

  const header = container.querySelector('[data-tabs-headline] h1');
  const tabsNav = container.querySelector(NAV_SELECTOR);
  const tabPanes = container.querySelectorAll(TAB_PANE_SELECTOR);
  if (!tabsNav || !tabPanes.length) return;

  const activate = (tabId) => {
    const nextId =
      tabId && Array.from(tabPanes).some((pane) => pane.id === tabId)
        ? tabId
        : tabPanes[0].id;

    tabsNav.querySelectorAll('[role="tab"]').forEach((link) => {
      const targetId = getTabId(link);
      const isActive = targetId === nextId;
      link.classList.toggle(LINK_ACTIVE_CLASS, isActive);
      link.setAttribute('aria-selected', isActive ? 'true' : 'false');
      const parent = link.closest('li');
      if (parent) parent.classList.toggle(ACTIVE_CLASS, isActive);
    });

    tabPanes.forEach((pane) => {
      pane.classList.toggle(ACTIVE_CLASS, pane.id === nextId);
    });

    applyTitle(header, nextId);
  };

  tabsNav.addEventListener('click', (event) => {
    const link = event.target.closest('[role="tab"]');
    if (!link || !tabsNav.contains(link)) return;
    event.preventDefault();
    activate(getTabId(link));
  });

  const initialLink =
    tabsNav.querySelector('[role="tab"].is-active') ||
    tabsNav.querySelector('li.active [role="tab"]') ||
    tabsNav.querySelector('[role="tab"]');
  activate(getTabId(initialLink));
};

export const initDetailsCodeCopy = (root = document) => {
  const button = root.querySelector('[data-role="copy-code"]');
  const source = root.querySelector('#details-code');
  if (!button || !source) return;

  const doc = root.ownerDocument || document;
  const defaultLabel = button.dataset.copyLabel || DEFAULT_COPY_LABEL;
  let timer = 0;

  const resetLabel = () => {
    button.innerHTML = defaultLabel;
    timer = 0;
  };

  const copyFallback = (text) => {
    const helper = doc.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    doc.body.appendChild(helper);
    helper.select();
    doc.execCommand('copy');
    helper.remove();
  };

  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const text = source.textContent ? source.textContent.trim() : '';
    if (!text) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyFallback(text);
      }
      button.innerHTML = COPY_SUCCESS_HTML;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(resetLabel, COPY_RESET_DELAY);
    } catch {
      resetLabel();
    }
  });
};

const attachProfileFormLogic = (profileConfig, root = document) => {
  if (!profileConfig) return;
  if (typeof $ === 'undefined') return;

  const doc = root;
  const byId = (id) => doc.getElementById(id);
  const setDisplay = (id, value) => {
    const el = byId(id);
    if (el) {
      el.style.display = value;
    }
  };
  const setDisabled = (id, state) => {
    const el = byId(id);
    if (el) {
      el.disabled = state;
    }
  };
  const setChecked = (id, state) => {
    const el = byId(id);
    if (el) {
      el.checked = state;
    }
  };
  const setValue = (id, value) => {
    const el = byId(id);
    if (el) {
      el.value = value;
    }
  };
  const getValue = (id) => {
    const el = byId(id);
    return el ? el.value : '';
  };
  const getChecked = (id) => {
    const el = byId(id);
    return el ? !!el.checked : false;
  };
  const focusElement = (id) => {
    const el = byId(id);
    if (el) {
      el.focus();
    }
  };
  const setSrc = (id, src) => {
    const el = byId(id);
    if (el) {
      el.src = src;
    }
  };
  const setHtml = (id, html) => {
    const el = byId(id);
    if (el) {
      el.innerHTML = html;
    }
  };
  const addListener = (id, eventName, handler) => {
    const el = byId(id);
    if (el) {
      el.addEventListener(eventName, handler);
    }
  };
  const addClickListener = (id, handler) => {
    addListener(id, 'click', handler);
  };

  let userphone = profileConfig.userPhone;
  let ClientTimeZoneOffset = 0;
  let clienttime;
  let mailretry = 0;
  let stopsend = 0;
  let showsec = 0;
  let mailfunc = null;
  // eslint-disable-next-line no-unused-vars
  let timer = 0;
  const notifySuccess = (message) => {
    if ($.toast && typeof $.toast === 'function') {
      $.toast({
        text: message,
        textAlign: 'center',
        position: 'mid-center',
        icon: 'success',
        showHideTransition: 'fade',
        hideAfter: 3000,
        loader: true,
        stack: 5,
      });
      return;
    }
    bootpopup.alert(message, js_translate('Please pay attention!'));
  };

  const mailcountdown = (stopsec) => {
    const seconds = parseInt(new Date().getTime() / 1000, 10);
    showsec = stopsec - seconds;
    if (showsec <= 0 || stopsend === 1) {
      $('#waitsend').hide();
      if (mailretry > 1) {
        $('#difemail').show();
      }
      if (mailretry > 2) {
        $('#resend').hide();
      } else {
        $('#resend').show();
      }
      return;
    }
    $('#waitsec').html(showsec);
    timer = window.setTimeout(() => {
      mailcountdown(stopsec);
    }, 1000);
  };

  const mailmsg = (argretry) => {
    if (argretry === 0) {
      mailretry = argretry;
      stopsend = 1;
      $('#sended').hide();
    } else {
      $('#difemail').hide();
      stopsend = 0;
      showsec = 60;
      $('#waitsec').html(showsec);
      $('#resend').hide();
      $('#waitsend').show();
      $('#sended').show();
      const seconds = parseInt(new Date().getTime() / 1000, 10) + showsec;
      mailcountdown(seconds);
    }
  };

  const imgcrop = (image, tempW, tempH, maxW, maxH, elem) => {
    const sourceX = 0;
    const sourceY = 0;
    let destWidth = tempW;
    let destHeight = tempH;
    if (tempW > maxW) {
      const ratio = maxW / tempW;
      destWidth = maxW;
      destHeight = destHeight * ratio;
    }
    if (destHeight > maxH) {
      const ratio = maxH / destHeight;
      destHeight = maxH;
      destWidth = destWidth * ratio;
    }
    const destX = 0;
    const destY = 0;

    const canvas = document.createElement('canvas');
    canvas.width = destWidth;
    canvas.height = destHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, destWidth, destHeight);
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      tempW,
      tempH,
      destX,
      destY,
      destWidth,
      destHeight
    );
    const dataURL = canvas.toDataURL('image/jpeg');
    $(elem).val(dataURL);
  };

  const resizeFile = (file, profilephoto, b64field) => {
    $('#p_prldr').show();
    const reader = new FileReader();
    reader.onloadend = () => {
      const tempImg = new Image();
      tempImg.src = reader.result;
      tempImg.onload = function onTempImgLoad() {
        const tempW = tempImg.width;
        const tempH = tempImg.height;
        imgcrop(this, tempW, tempH, 300, 300, b64field);
        $(profilephoto).attr('src', $(b64field).val());
        $('#p_prldr').delay(100).fadeOut('slow');
      };
    };
    reader.readAsDataURL(file);
  };

  const showprofilephoto = () => {
    const image = $('#PhotoFile');
    if (image[0].files && image[0].files[0]) {
      resizeFile(image[0].files[0], $('#profilephoto'), $('#photo_b64'));
    }
  };

  const deletephoto = () => {
    setSrc('profilephoto', profileConfig.avatarPlaceholder);
    setSrc('profilephotosmall', profileConfig.avatarPlaceholder);
    setValue('photo_b64', 'delete');
    setValue('PhotoFile', '');
  };

  const changemail = () => {
    setDisabled('email', false);
    focusElement('email');
    setDisplay('change-email-button', 'none');
    setDisplay('savemaillink', 'inline-block');
  };

  const changephone = () => {
    setValue('smscode', '');
    setDisabled('phone', false);
    focusElement('phone');
    setDisplay('changephonelink', 'none');
    setDisplay('savephonelink', 'inline-block');
    setDisplay('phonetext', 'block');
  };

  const cancelsavemail = () => {
    setValue('email', profileConfig.userEmail);
    setDisabled('email', true);
    setDisplay('change-email-button', 'inline-block');
    setDisplay('savemaillink', 'none');
  };

  const cancelsavephone = () => {
    setValue('phone', userphone);
    setValue('smscode', '');
    setDisabled('phone', true);
    setDisplay('changephonelink', 'inline-block');
    setDisplay('savephonelink', 'none');
    setDisplay('phonetext', 'none');
    setDisplay('enterconfirmcode', 'none');
  };

  const savemail = () => {
    mailfunc = savemail;
    mailretry += 1;
    const emailInput = byId('email');
    const newmail = emailInput ? emailInput.value : '';
    if (newmail !== profileConfig.userEmail && newmail !== '') {
      setDisabled('email', true);
      setDisplay('change-email-button', 'none');
      setDisplay('savemaillink', 'none');
      $.post('./savesettings.php', {
        email: newmail,
        lng: profileConfig.userLang,
        mailretry: mailretry,
        checkID: profileConfig.startRuntime,
      }).done((data) => {
        if (data !== 'OK') {
          setValue('email', profileConfig.userEmail);
          bootpopup.alert(data, 'Error');
        } else {
          mailmsg(mailretry);
        }
        setDisabled('email', true);
        setDisplay('change-email-button', 'inline-block');
        setDisplay('savemaillink', 'none');
      });
    } else {
      setDisabled('email', true);
      setDisplay('change-email-button', 'inline-block');
      setDisplay('savemaillink', 'none');
    }
  };

  const savephone = () => {
    const phoneInput = byId('phone');
    const smsInput = byId('smscode');
    const newphone = phoneInput ? phoneInput.value : '';
    const smscode = smsInput ? smsInput.value : '';
    setValue('smscode', '');
    if (newphone !== userphone && newphone !== '') {
      setDisabled('phone', true);
      setDisplay('changephonelink', 'none');
      setDisplay('savephonelink', 'none');
      setDisplay('enterconfirmcode', 'none');
      $.post('./confirmphone.php', {
        phone: newphone,
        smscode: smscode,
        lng: profileConfig.userLang,
        checkID: profileConfig.startRuntime,
      }).done((data) => {
        if (data !== 'OK') {
          bootpopup.alert(data, 'Error');
          if (smscode === '') {
            setValue('phone', userphone);
            setDisplay('enterconfirmcode', 'none');
          } else {
            setDisplay('enterconfirmcode', 'block');
          }
        } else if (smscode === '') {
          bootpopup.alert(
            'The SMS message with a confirmation code will be sent to your phone number.',
            'Please pay attention!'
          );
          setDisplay('enterconfirmcode', 'block');
        } else {
          userphone = newphone;
          bootpopup.alert(
            'New phone number saved successfully',
            'Please pay attention!'
          );
        }
        setDisabled('phone', true);
        setDisplay('changephonelink', 'inline-block');
        setDisplay('savephonelink', 'none');
        setDisplay('phonetext', 'none');
      });
    } else {
      setDisabled('phone', true);
      setDisplay('changephonelink', 'inline-block');
      setDisplay('savephonelink', 'none');
      setDisplay('enterconfirmcode', 'none');
      setDisplay('phonetext', 'none');
    }
  };

  const savesettings = () => {
    const photo_b64 = getValue('photo_b64');
    const firstname = getValue('firstname');
    const surname = getValue('surname');
    const patronymic = getValue('patronymic');
    const nickname = getValue('nickname');
    const birthdate = getValue('birthdate');
    const gender = getValue('gender');
    const userUTC = getValue('userUTC');
    const usercountry = getValue('cclist');
    const user_region = getValue('user_region');
    const user_region_lng = getValue('user_region_lng');
    const oldpwd = getValue('oldpwd');
    const newpwd1 = getValue('newpwd1');
    const newpwd2 = getValue('newpwd2');
    const checkip = getChecked('checkip');
    const birthdateshow = getChecked('birthdateshow');
    const hidelocation = getChecked('hidelocation');
    const notify1 = getChecked('notify1');
    const notify2 = getChecked('notify2');
    const notify3 = getChecked('notify3');
    const notify4 = getChecked('notify4');
    const notify5 = getChecked('notify5');
    const notify6 = getChecked('notify6');
    $('#p_prldr').show();
    $.post('./savesettings.php', {
      photo_b64: photo_b64,
      firstname: firstname,
      surname: surname,
      patronymic: patronymic,
      nickname: nickname,
      gender: gender,
      birthdate: birthdate,
      userUTC: userUTC,
      usercountry: usercountry,
      user_region: user_region,
      user_region_lng: user_region_lng,
      oldpwd: oldpwd,
      newpwd1: newpwd1,
      newpwd2: newpwd2,
      checkip: checkip,
      birthdateshow: birthdateshow,
      hidelocation: hidelocation,
      notify1: notify1,
      notify2: notify2,
      notify3: notify3,
      notify4: notify4,
      notify5: notify5,
      notify6: notify6,
      lng: profileConfig.userLang,
      checkID: profileConfig.startRuntime,
    }).done((data) => {
      $('#p_prldr').delay(100).fadeOut('slow');
      if (data !== 'OK') {
        bootpopup.alert(data, 'Error');
      } else {
        window.scrollTo(0, 0);
        notifySuccess('Saved successfully!');
      }
    });
  };

  const addblog = () => {
    $('#addblogform').modal('show');
  };

  const showaddress = (LastKeyCode) => {
    if (LastKeyCode === 13) return;
    const blogInput = byId('blogname');
    const newblog = blogInput ? blogInput.value : '';
    setHtml('message', '');
    if (newblog !== '') {
      let fontpt = 20;
      if (newblog.length > 5) fontpt = 16;
      if (newblog.length > 10) fontpt = 14;
      if (newblog.length > 13) fontpt = 12;
      if (newblog.length > 17) fontpt = 10;
      if (newblog.length > 24) fontpt = 8;
      setHtml(
        'newaddress',
        `<font style="font-family: Courier; font-size: ${fontpt}pt; color: #000000;">${newblog}.qwerty.blog</font>`
      );
    } else {
      setHtml('newaddress', '');
    }
  };

  const regblog = () => {
    const blogInput = byId('blogname');
    const newblog = blogInput ? blogInput.value : '';
    if (newblog !== '') {
      $('#p_prldr').show();
      $.post('register.php', {
        blogname: newblog,
        lng: profileConfig.userLang,
        checkID: profileConfig.startRuntime,
        userUTC: ClientTimeZoneOffset,
      }).done((data) => {
        if (data.indexOf(newblog) + 1) {
          window.location.href = data;
        } else {
          $('#p_prldr').delay(100).fadeOut('slow');
          setHtml('message', `<font color="red">${data}</font>`);
          setHtml('newaddress', '');
        }
      });
    }
  };

  const checkregion = () => {
    const usercountry = getValue('cclist');
    const user_region_lng = getValue('user_region_lng');
    if (user_region_lng !== '') {
      if (user_region_lng !== profileConfig.userRegionLng) {
        $.ajax({
          url: './regionlng.php',
          type: 'POST',
          data: { region_lng: user_region_lng, usercountry: usercountry },
          async: false,
          success: (response) => {
            const payload = $.parseJSON(response);
            if (payload[0] === 'OK') {
              setValue('user_region', payload[1]);
              setValue('user_region_lng', payload[2]);
            }
          },
        });
      } else {
        setValue('user_region', profileConfig.userRegion);
        setValue('user_region_lng', profileConfig.userRegionLng);
      }
    } else {
      setValue('user_region', '');
      setValue('user_region_lng', '');
    }
  };

  const searchcities = (country_code) => {
    $('.typeahead__result').remove();
    $('#user_region_lng').typeahead({
      minLength: 1,
      order: 'asc',
      cache: false,
      maxItem: false,
      offset: true,
      source: {
        ajax: {
          type: 'POST',
          url: '/json.php',
          data: {
            country_code: country_code,
            user_lng: profileConfig.userLang,
          },
        },
      },
      callback: {
        onClick: function onClick(node, a, item) {
          $('#user_region_lng').val(item.display);
          checkregion();
        },
      },
    });
  };

  const wireEvents = () => {
    addClickListener('change-photo-button', () => {
      const fileInput = byId('PhotoFile');
      if (fileInput) {
        fileInput.click();
      }
    });
    addListener('PhotoFile', 'change', showprofilephoto);
    addClickListener('delete-photo-button', deletephoto);
    addListener('user_region_lng', 'change', checkregion);
    addClickListener('change-email-button', changemail);
    addClickListener('save-email-button', savemail);
    addClickListener('cancel-email-button', cancelsavemail);
    addClickListener('changephonelink', changephone);
    addClickListener('send-sms-button', savephone);
    addClickListener('cancel-phone-button', cancelsavephone);
    addClickListener('confirm-phone-button', savephone);
    addClickListener('cancel-phone-confirm-button', cancelsavephone);
    addClickListener('savebutton', savesettings);
    addClickListener('resend-mail-button', () => {
      if (typeof mailfunc === 'function') {
        mailfunc();
      }
    });
    addClickListener('close-mail-status', () => {
      mailmsg(0);
    });
  };

  const exposeLegacyApi = () => {
    if (typeof window === 'undefined') return;
    Object.assign(window, {
      searchcities,
      resizeFile,
      imgcrop,
      showprofilephoto,
      deletephoto,
      changemail,
      changephone,
      cancelsavemail,
      cancelsavephone,
      savemail,
      savephone,
      savesettings,
      addblog,
      showaddress,
      regblog,
      checkregion,
      mailmsg,
    });
  };

  const init = () => {
    userphone = profileConfig.userPhone;
    const locationHref = window.location.href;
    if (locationHref.indexOf('wmprofile.com') !== -1) {
      setDisplay('notwmprofile', 'none');
      setDisplay('myblogstab', 'none');
    } else {
      setDisplay('notwmprofile', 'block');
    }
    if (locationHref.indexOf('visitorsale.com') !== -1) {
      setDisplay('notvs', 'none');
      setDisplay('notificationstab', 'none');
      setDisplay('myblogstab', 'none');
    } else {
      setDisplay('notvs', 'block');
    }
    if (
      locationHref.indexOf('hightech.edu.eu') !== -1 ||
      locationHref.indexOf('ratex.me') !== -1 ||
      locationHref.indexOf('icg') !== -1 ||
      locationHref.indexOf('p2payer') !== -1
    ) {
      setDisplay('myblogstab', 'none');
      setDisplay('sitestab', 'none');
    }
    if (locationHref.indexOf('cryptoapi') !== -1) {
      setDisplay('myblogstab', 'none');
      setDisplay('sitestab', 'none');
    }
    if (locationHref.indexOf('worldvet') !== -1) {
      setDisplay('myblogstab', 'none');
      setDisplay('sitestab', 'none');
      setDisplay('wmworkerletters', 'none');
    }
    const genderSelect = byId('gender');
    if (
      genderSelect &&
      genderSelect.options &&
      genderSelect.options[profileConfig.genderIndex]
    ) {
      genderSelect.options[profileConfig.genderIndex].selected = true;
    }
    setChecked('checkip', profileConfig.logic.checkIp);
    setChecked('birthdateshow', profileConfig.logic.birthdate);
    setChecked('hidelocation', profileConfig.logic.hideLocation);
    setChecked('notify1', profileConfig.logic.notify1);
    setChecked('notify2', profileConfig.logic.notify2);
    setChecked('notify3', profileConfig.logic.notify3);
    setChecked('notify4', profileConfig.logic.notify4);
    setChecked('notify5', profileConfig.logic.notify5);
    setChecked('notify6', profileConfig.logic.notify6);
    clienttime = new Date();
    ClientTimeZoneOffset = -clienttime.getTimezoneOffset() / 60;

    searchcities(profileConfig.userCountry);
    $('#cclist').change(() => {
      const countrySelect = byId('cclist');
      const usercountry = countrySelect ? countrySelect.value : '';
      if (usercountry !== profileConfig.userCountry) {
        setValue('user_region', '');
        setValue('user_region_lng', '');
      } else {
        setValue('user_region', profileConfig.userRegion);
        setValue('user_region_lng', profileConfig.userRegionLng);
      }
      searchcities(usercountry);
    });
    mailretry = 0;
    wireEvents();
    exposeLegacyApi();
  };

  init();
};

const initProfilePage = (root = document) => {
  initProfileTabs(root);
  initDetailsCodeCopy(root);
  const templateVars = getTemplateVars();
  if (!templateVars) return;
  const profileConfig = createProfileConfig(templateVars);
  attachProfileFormLogic(profileConfig, root);
};

export default initProfilePage;
