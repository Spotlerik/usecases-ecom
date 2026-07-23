// uc-mockups.js — use-case illustration Web Component
// Plain JS, no Babel, no React. Load with <script src="uc-mockups.js">.
// Usage in JSX: <uc-mockup uc-id="abandoned-cart" icp="commerce" currency="eur"></uc-mockup>

(function () {
  'use strict';

  var N='#002a4d',C='#23afe6',W='#fff',BG='#f7f9fb',BD='#dde4ea',G='#8fa0b0',CT='#e6f6fc';
  var SYM={eur:'€',gbp:'£',usd:'$'};

  var CP={
    commerce:{url:'yourshop.com',   seg:'Outerwear lovers', n1:'Puffer Jacket',    n2:'Running Shoes',  n3:'Sports Top',   p1:'89', p2:'79', p3:'39', disc:'10%', loyalty:'500 reward points', cta:'Shop now',    ef:'SHOP'},
    travel:  {url:'yourtravel.com', seg:'City breakers',    n1:'Barcelona · 4n',  n2:'Lisbon · 3n',    n3:'City Upgrade', p1:'348',p2:'229',p3:'149',disc:'€50', loyalty:'1 000 bonus miles',  cta:'Book now',    ef:'YourTravel'},
    leisure: {url:'yourtickets.com',seg:'Classical fans',   n1:'Swan Lake',        n2:'Jazz Night',     n3:'Premium seats',p1:'45', p2:'32', p3:'58', disc:'15%', loyalty:'2 free tickets',     cta:'Book tickets',ef:'YourVenue'}
  };

  // ─── helpers ──────────────────────────────────────────────────────────────

  function s(css){ return 'style="'+css+'"'; }

  function wrap(content,bg){
    bg=bg||BG;
    return '<div '+s('font-family:system-ui,sans-serif;font-size:12px;line-height:1.45;background:'+bg+';width:100%;min-height:240px;display:flex;flex-direction:column;')+'>'+content+'</div>';
  }

  function brow(url){
    return '<div '+s('height:26px;background:'+W+';border-bottom:1px solid '+BD+';display:flex;align-items:center;padding:0 10px;gap:5px;flex-shrink:0;')+'>'+
      '<span '+s('width:7px;height:7px;border-radius:50%;background:#ff5f57;')+'></span>'+
      '<span '+s('width:7px;height:7px;border-radius:50%;background:#febc2e;')+'></span>'+
      '<span '+s('width:7px;height:7px;border-radius:50%;background:#28c840;')+'></span>'+
      '<div '+s('flex:1;height:13px;background:'+BG+';border-radius:4px;font-size:10px;color:'+G+';display:flex;align-items:center;padding-left:7px;margin-left:6px;')+'>'+url+'</div>'+
    '</div>';
  }

  function actbar(crumb){
    return '<div '+s('height:30px;background:'+N+';display:flex;align-items:center;padding:0 12px;gap:8px;flex-shrink:0;')+'>'+
      '<span '+s('color:'+C+';font-weight:800;font-size:12px;')+'> Spotler Activate</span>'+
      (crumb?'<span '+s('color:rgba(255,255,255,0.4);font-size:10px;')+'>/&nbsp;'+crumb+'</span>':'')+
    '</div>';
  }

  function cta(label,extra){
    extra=extra||'';
    return '<div '+s('background:'+C+';color:'+W+';border-radius:6px;padding:7px 14px;font-weight:700;font-size:12px;text-align:center;cursor:default;'+extra)+'>'+label+'</div>';
  }

  function pill(text,bg,color){
    bg=bg||CT; color=color||N;
    return '<span '+s('background:'+bg+';color:'+color+';border-radius:100px;padding:2px 8px;font-size:10px;font-weight:700;')+'>'+text+'</span>';
  }

  function prod(name,price,badge,imgC){
    imgC=imgC||'#dde4ea';
    return '<div '+s('border-radius:8px;overflow:hidden;background:'+W+';border:1px solid '+BD+';flex-shrink:0;')+'>'+
      '<div '+s('height:60px;background:'+imgC+';position:relative;')+'>'+
        (badge?'<span '+s('position:absolute;top:4px;right:4px;background:'+C+';color:'+W+';border-radius:4px;padding:1px 5px;font-size:9px;font-weight:700;')+'>'+badge+'</span>':'')+
      '</div>'+
      '<div '+s('padding:5px 7px;')+'>'+
        '<div '+s('font-weight:700;color:'+N+';font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;')+'>'+name+'</div>'+
        '<div '+s('color:'+C+';font-weight:700;font-size:11px;')+'>'+price+'</div>'+
      '</div>'+
    '</div>';
  }

  function pgrid3(c,sym){
    return '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px 14px;')+'>'+
      prod(c.n1,sym+c.p1,'Top pick','#dce8f0')+
      prod(c.n2,sym+c.p2,'','#f0dce8')+
      prod(c.n3,sym+c.p3,'','#dcf0e4')+
    '</div>';
  }

  function emailFrame(from,subject,body){
    return wrap(
      '<div '+s('height:24px;background:#ccd4dc;display:flex;align-items:center;padding:0 10px;gap:5px;')+'>'+
        '<span '+s('width:7px;height:7px;border-radius:50%;background:#ff5f57;')+'></span>'+
        '<span '+s('width:7px;height:7px;border-radius:50%;background:#febc2e;')+'></span>'+
        '<span '+s('width:7px;height:7px;border-radius:50%;background:#28c840;')+'></span>'+
        '<span '+s('color:'+G+';font-size:10px;margin-left:4px;')+'>Mail</span>'+
      '</div>'+
      '<div '+s('padding:6px 12px;background:#edf0f4;border-bottom:1px solid '+BD+';')+'>'+
        '<div '+s('font-size:10px;color:'+G+';')+'> From: <strong '+s('color:'+N+';')+'>'+from+'</strong></div>'+
        '<div '+s('font-weight:700;color:'+N+';font-size:12px;margin-top:1px;')+'>'+subject+'</div>'+
      '</div>'+
      '<div '+s('background:'+W+';margin:8px 12px;border-radius:8px;overflow:hidden;flex:1;')+'>'+body+'</div>',
    '#e8ecf0');
  }

  // ─── 18 mockups ───────────────────────────────────────────────────────────

  function mEmailCapture(sym,c,icp,el){
    var step=el&&el._step||1;
    var clicks=el&&el._clicks||[];
    var tab=el&&el._mobileTab||'storefront';
    var pName='Robin Jansen';
    var pEmail='robin.jansen@example.com';
    var disc=c.disc||'10%';
    var isS3=step===3;
    var isS4=step===4;

    // Injected CSS — animations + responsive toggle
    var css='<style>'+
      '@keyframes uc01fl{0%{background:transparent}50%{background:#fff3b0}100%{background:transparent}}'+
      '@keyframes uc01pu{0%,100%{opacity:1}50%{opacity:0.3}}'+
      '@media(prefers-reduced-motion:reduce){.uc01f,.uc01p{animation:none!important}}'+
      '.uc01f{animation:uc01fl 1s ease}'+
      '.uc01p{animation:uc01pu 1s ease-in-out 3}'+
      '@media(max-width:900px){'+
        '.uc01-tgl{display:flex!important}'+
        '.uc01-act{display:none!important}'+
        '.uc01-sho{display:flex!important}'+
        '.uc01-show-act .uc01-act{display:flex!important}'+
        '.uc01-show-act .uc01-sho{display:none!important}'+
      '}'+
      '.uc01-tgl{display:none;gap:4px;padding:5px 8px;background:#f7f9fb;border-bottom:1px solid #dde4ea;flex-shrink:0}'+
      '.uc01-tgl button{flex:1;padding:4px 6px;border:1px solid #dde4ea;border-radius:100px;font-size:10px;cursor:pointer;background:#fff;color:#8fa0b0;font-weight:600;font-family:system-ui,sans-serif}'+
      '.uc01-on{background:#002a4d!important;color:#fff!important;border-color:#002a4d!important}'+
    '</style>';

    // ── Activate sidebar ──────────────────────────────────────────────────
    var navItems=['Dashboard','Profiles','Audiences','Personalizations','Campaigns','Insights'];
    var sidebar=
      '<div style="width:90px;background:#002a4d;display:flex;flex-direction:column;flex-shrink:0;">'+
        '<div style="padding:9px 8px;border-bottom:1px solid rgba(255,255,255,0.12);">'+
          '<div style="color:#fff;font-weight:800;font-size:11px;letter-spacing:0.04em;">spotler</div>'+
          '<div style="color:#23afe6;font-weight:700;font-size:10px;">activate</div>'+
        '</div>'+
        '<nav style="flex:1;padding:4px 0;">'+
        navItems.map(function(item){
          var isPers=item==='Personalizations';
          var active=isPers&&isS3;
          return '<div class="'+(isPers&&isS3?'uc01p':'')+'" style="padding:5px 8px;font-size:9px;color:'+(active?'#23afe6':'rgba(255,255,255,0.55)')+';font-weight:'+(active?'700':'400')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+item+'</div>';
        }).join('')+
        '</nav>'+
        '<div style="padding:6px 8px;border-top:1px solid rgba(255,255,255,0.1);font-size:8px;color:rgba(255,255,255,0.4);font-weight:600;">Shopler</div>'+
      '</div>';

    // ── Activate main ─────────────────────────────────────────────────────
    var profileCard=
      '<div class="'+(isS4?'uc01f':'')+'" style="background:#fff;border:1px solid #dde4ea;border-radius:8px;padding:8px;display:flex;gap:7px;align-items:center;flex-shrink:0;">'+
        '<div style="width:28px;height:28px;border-radius:50%;background:'+(isS4?'#febc2e':'#e6f6fc')+';display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">&#x1F464;</div>'+
        '<div style="min-width:0;">'+
          '<div style="font-weight:800;color:#002a4d;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(isS4?pName:'Anonymous visitor')+'</div>'+
          (isS4?'<div style="color:#8fa0b0;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+pEmail+'</div>':'')+
        '</div>'+
      '</div>';

    var statChips=
      '<div style="display:flex;gap:3px;flex-wrap:wrap;flex-shrink:0;">'+
      [['Sessions','3'],['PageViews','7'],['Clicks',String(clicks.length)]].map(function(sv){
        return '<div style="background:#fff;border:1px solid #dde4ea;border-radius:6px;padding:3px 7px;font-size:9px;">'+
          '<span style="color:#8fa0b0;">'+sv[0]+'&nbsp;</span>'+
          '<span style="font-weight:700;color:#002a4d;">'+sv[1]+'</span>'+
        '</div>';
      }).join('')+
      '</div>';

    var segTags=['Outerwear lovers','New visitor'];
    if(isS4)segTags.push('Email opt-in');
    var segChips=
      '<div style="display:flex;gap:3px;flex-wrap:wrap;flex-shrink:0;">'+
      segTags.map(function(t,i){
        var fresh=isS4&&i===2;
        return '<span class="'+(fresh?'uc01f':'')+'" style="background:#e6f6fc;color:#002a4d;border-radius:100px;padding:2px 6px;font-size:9px;font-weight:700;display:inline-flex;align-items:center;gap:2px;">'+
          (fresh?'<span style="width:5px;height:5px;background:#2f9e50;border-radius:50%;display:inline-block;flex-shrink:0;"></span>&nbsp;':'')+t+
        '</span>';
      }).join('')+
      '</div>';

    var feedItems=[];
    if(isS4)feedItems.push({text:'&#x2709; EmailOptIn · '+pEmail,fresh:true});
    feedItems.push({text:'Viewed '+c.n1,fresh:false});
    feedItems.push({text:'Viewed '+c.n2,fresh:false});
    feedItems.push({text:'Viewed '+c.n3,fresh:false});

    var feed=
      '<div style="background:#fff;border:1px solid #dde4ea;border-radius:8px;overflow:hidden;flex:1;min-height:0;">'+
        '<div style="padding:4px 9px;border-bottom:1px solid #f0f4f7;font-weight:700;color:#002a4d;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;">Activity</div>'+
        feedItems.map(function(r){
          return '<div class="'+(r.fresh?'uc01f':'')+'" style="padding:4px 9px;border-bottom:1px solid #f7f9fb;font-size:9px;color:'+(r.fresh?'#002a4d':'#8fa0b0')+';font-weight:'+(r.fresh?'700':'400')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+r.text+'</div>';
        }).join('')+
      '</div>';

    var activatePanel=
      '<div style="display:flex;height:100%;">'+
        sidebar+
        '<div style="flex:1;background:#f7f9fb;padding:8px;display:flex;flex-direction:column;gap:6px;overflow:hidden;min-height:0;">'+
          profileCard+statChips+segChips+feed+
        '</div>'+
      '</div>';

    // ── Storefront panel ──────────────────────────────────────────────────
    var storefrontPanel='';

    if(step===1){
      storefrontPanel=
        '<div style="position:relative;flex:1;overflow:hidden;">'+
          '<div style="filter:blur(3px);pointer-events:none;background:#fff;">'+
            brow(c.url)+
            pgrid3(c,sym)+
          '</div>'+
          '<div style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #23afe6;padding:8px 10px;box-shadow:0 -3px 12px rgba(0,42,77,0.1);">'+
            '<div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:6px;">'+
              '<span style="font-size:12px;">&#x1F36A;</span>'+
              '<span style="font-size:10px;color:#8fa0b0;line-height:1.4;">Shopler uses cookies to personalise your experience.</span>'+
            '</div>'+
            '<div style="display:flex;gap:5px;">'+
              '<button onclick="var e=this.closest(\'uc-mockup\');e._step=2;e._rerender();" style="flex:1;background:#23afe6;color:#fff;border:none;border-radius:6px;padding:5px 8px;font-weight:700;font-size:10px;cursor:pointer;font-family:system-ui,sans-serif;">Accept</button>'+
              '<button style="background:none;border:1.5px solid #dde4ea;border-radius:6px;padding:5px 8px;font-size:10px;color:#8fa0b0;cursor:default;font-family:system-ui,sans-serif;">Decline</button>'+
            '</div>'+
          '</div>'+
        '</div>';
    }

    if(step===2){
      var prods=[
        {n:c.n1,p:sym+c.p1,bg:'#dce8f0',i:0},
        {n:c.n2,p:sym+c.p2,bg:'#f0dce8',i:1},
        {n:c.n3,p:sym+c.p3,bg:'#dcf0e4',i:2}
      ];
      var left=Math.max(0,3-clicks.length);
      storefrontPanel=
        '<div style="background:#fff;display:flex;flex-direction:column;">'+
          brow(c.url)+
          '<div style="padding:5px 10px;font-size:10px;color:#8fa0b0;text-align:center;">'+
            (left>0?'Click '+left+' more product'+(left===1?'':'s')+'…':'Opening sign-up…')+
          '</div>'+
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 10px 8px;">'+
          prods.map(function(p){
            var clicked=clicks.indexOf(p.i)!==-1;
            return '<div onclick="var e=this.closest(\'uc-mockup\');if(e._clicks.indexOf('+p.i+')===-1)e._clicks.push('+p.i+');if(e._clicks.length>=3)e._step=3;e._rerender();" style="border-radius:8px;overflow:hidden;background:#fff;border:2px solid '+(clicked?'#23afe6':'#dde4ea')+';cursor:pointer;">'+
              '<div style="height:52px;background:'+p.bg+';position:relative;">'+
                (clicked?'<span style="position:absolute;top:3px;right:3px;background:#23afe6;color:#fff;border-radius:4px;padding:1px 4px;font-size:9px;font-weight:700;">✓</span>':'')+
              '</div>'+
              '<div style="padding:4px 6px;">'+
                '<div style="font-weight:700;color:#002a4d;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.n+'</div>'+
                '<div style="color:#23afe6;font-weight:700;font-size:10px;">'+p.p+'</div>'+
              '</div>'+
            '</div>';
          }).join('')+
          '</div>'+
        '</div>';
    }

    if(step===3){
      storefrontPanel=
        '<div style="position:relative;overflow:hidden;flex:1;">'+
          '<div style="filter:blur(2px);pointer-events:none;background:#fff;">'+
            brow(c.url)+pgrid3(c,sym)+
          '</div>'+
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(247,249,251,0.92);padding:8px;">'+
            '<div style="background:#fff;border-radius:12px;box-shadow:0 8px 28px rgba(0,42,77,0.18);padding:12px 14px;width:100%;max-width:200px;">'+
              '<div style="font-weight:800;color:#002a4d;font-size:12px;margin-bottom:2px;">Get '+disc+' off your first order</div>'+
              '<div style="color:#8fa0b0;font-size:10px;margin-bottom:8px;">Join the Shopler newsletter</div>'+
              '<div style="border:1.5px solid #dde4ea;border-radius:6px;padding:5px 8px;font-size:10px;color:#c0cbd6;margin-bottom:5px;background:#f7f9fb;">First name</div>'+
              '<div style="border:1.5px solid #dde4ea;border-radius:6px;padding:5px 8px;font-size:10px;color:#c0cbd6;margin-bottom:5px;background:#f7f9fb;">Email address</div>'+
              '<label style="display:flex;align-items:center;gap:5px;font-size:9px;color:#8fa0b0;margin-bottom:10px;cursor:default;">'+
                '<span style="width:12px;height:12px;border-radius:3px;background:#23afe6;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:8px;flex-shrink:0;">✓</span>'+
                'Yes, send me offers &amp; news'+
              '</label>'+
              '<button onclick="var e=this.closest(\'uc-mockup\');e._step=4;e._rerender();" style="width:100%;background:#23afe6;color:#fff;border:none;border-radius:6px;padding:7px;font-weight:700;font-size:10px;cursor:pointer;font-family:system-ui,sans-serif;">'+c.cta+' — save '+disc+'</button>'+
            '</div>'+
          '</div>'+
        '</div>';
    }

    if(step===4){
      storefrontPanel=
        '<div style="background:#fff;display:flex;flex-direction:column;flex:1;">'+
          brow(c.url)+
          '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:12px;">'+
            '<div style="background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,42,77,0.1);padding:14px 18px;text-align:center;border:1px solid #dde4ea;">'+
              '<div style="font-size:24px;margin-bottom:5px;">&#x1F389;</div>'+
              '<div style="font-weight:800;color:#002a4d;font-size:12px;margin-bottom:3px;">Welcome, Robin!</div>'+
              '<div style="color:#8fa0b0;font-size:10px;margin-bottom:8px;">Your discount code:</div>'+
              '<div style="background:#f7f9fb;border:2px dashed #23afe6;border-radius:8px;padding:6px 12px;font-weight:800;color:#002a4d;font-size:14px;letter-spacing:0.1em;margin-bottom:8px;">WELCOME10</div>'+
              '<div style="color:#8fa0b0;font-size:9px;">Sent to '+pEmail+'</div>'+
            '</div>'+
          '</div>'+
        '</div>';
    }

    // ── Assemble ──────────────────────────────────────────────────────────
    return css+
      '<div class="'+(tab==='activate'?'uc01-show-act':'')+'" style="display:flex;flex-direction:column;font-family:system-ui,sans-serif;font-size:12px;min-height:260px;height:100%;background:#f7f9fb;">'+
        '<div class="uc01-tgl">'+
          '<button class="'+(tab==='storefront'?'uc01-on':'')+'" onclick="var e=this.closest(\'uc-mockup\');e._mobileTab=\'storefront\';e._rerender();">Shopler</button>'+
          '<button class="'+(tab==='activate'?'uc01-on':'')+'" onclick="var e=this.closest(\'uc-mockup\');e._mobileTab=\'activate\';e._rerender();">Activate 360°</button>'+
        '</div>'+
        '<div style="display:flex;flex:1;overflow:hidden;min-height:0;">'+
          '<div class="uc01-act" style="flex:1;border-right:1px solid #dde4ea;display:flex;flex-direction:column;overflow:hidden;min-height:0;max-width:50%;">'+activatePanel+'</div>'+
          '<div class="uc01-sho" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;">'+storefrontPanel+'</div>'+
        '</div>'+
      '</div>';
  }

  function mProfileEnrichment(sym,c){
    return wrap(
      actbar('Profiles / Sarah K.')+
      '<div '+s('padding:12px 14px;display:flex;flex-direction:column;gap:6px;flex:1;')+'>'+
        '<div '+s('background:'+W+';border:1px solid '+BD+';border-radius:8px;padding:10px;display:flex;gap:8px;align-items:center;')+'>'+
          '<div '+s('width:34px;height:34px;border-radius:50%;background:'+CT+';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;')+'>👤</div>'+
          '<div>'+
            '<div '+s('font-weight:800;color:'+N+';font-size:13px;')+'>Sarah K.</div>'+
            '<div '+s('color:'+G+';font-size:10px;')+'>sarah@example.com · known since Mar 2024</div>'+
          '</div>'+
        '</div>'+
        '<div '+s('display:grid;grid-template-columns:1fr 1fr;gap:6px;')+'>'+
          [['CLV',sym+'1,240'],['Orders','7'],['Segment',c.seg.split(' ')[0]],['Last seen','2 days ago']].map(function(p){
            return '<div '+s('background:'+BG+';border-radius:6px;padding:6px 8px;')+'>'+
              '<div '+s('color:'+G+';font-size:9px;text-transform:uppercase;letter-spacing:0.06em;')+'>'+p[0]+'</div>'+
              '<div '+s('color:'+N+';font-weight:700;font-size:12px;')+'>'+p[1]+'</div>'+
            '</div>';
          }).join('')+
        '</div>'+
        '<div '+s('display:flex;gap:5px;flex-wrap:wrap;')+'>'+
          [c.seg,'High CLV','Repeat buyer'].map(function(t){return pill(t);}).join('')+
        '</div>'+
      '</div>');
  }

  function mEmailRecognition(sym,c){
    return wrap(
      brow(c.url)+
      '<div '+s('height:30px;background:'+N+';display:flex;align-items:center;padding:0 14px;')+'>'+
        '<span '+s('color:'+W+';font-weight:800;font-size:12px;')+'>'+c.ef+'</span>'+
      '</div>'+
      '<div '+s('background:'+CT+';border-bottom:1px solid '+BD+';padding:8px 14px;display:flex;align-items:center;gap:8px;flex-shrink:0;')+'>'+
        '<span '+s('font-size:16px;')+'> 👋</span>'+
        '<div>'+
          '<div '+s('font-weight:700;color:'+N+';font-size:13px;')+'>Welcome back, Sarah!</div>'+
          '<div '+s('color:'+G+';font-size:11px;')+'>We kept your favourites. '+c.n1+' is still available.</div>'+
        '</div>'+
        cta(c.cta,'margin-left:auto;flex-shrink:0;font-size:11px;padding:5px 10px;')+
      '</div>'+
      pgrid3(c,sym));
  }

  function mRtSegmentation(sym,c){
    return wrap(
      actbar('Audiences / New segment')+
      '<div '+s('padding:12px 14px;display:flex;flex-direction:column;gap:8px;flex:1;')+'>'+
        '<div '+s('background:'+W+';border:1px solid '+BD+';border-radius:8px;padding:10px;')+'>'+
          '<div '+s('font-weight:800;color:'+N+';font-size:12px;margin-bottom:6px;')+'>Segment builder</div>'+
          [['Viewed in last 7 days',c.n1],['Session count','≥ 2'],['Has not purchased','this item']].map(function(r){
            return '<div '+s('display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid '+BG+';')+'>'+
              '<span '+s('background:'+CT+';border-radius:4px;padding:2px 6px;font-size:10px;color:'+N+';font-weight:700;flex-shrink:0;')+'>'+r[0]+'</span>'+
              '<span '+s('color:'+N+';font-size:11px;')+'>'+r[1]+'</span>'+
              '<span '+s('margin-left:auto;color:'+G+';font-size:10px;')+'>✕</span>'+
            '</div>';
          }).join('')+
          '<div '+s('margin-top:8px;display:flex;justify-content:space-between;align-items:center;')+'>'+
            pill('+&nbsp;Add filter')+
            '<div '+s('color:'+G+';font-size:11px;')+'>4 821 matches · live</div>'+
          '</div>'+
        '</div>'+
        '<div '+s('background:'+W+';border:1.5px solid '+C+';border-radius:8px;padding:8px 12px;display:flex;align-items:center;gap:8px;')+'>'+
          '<div '+s('width:32px;height:32px;border-radius:50%;background:'+CT+';display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;')+'>👥</div>'+
          '<div>'+
            '<div '+s('font-weight:800;color:'+N+';font-size:12px;')+'>'+c.seg+'</div>'+
            '<div '+s('color:'+G+';font-size:10px;')+'>Real-time · 4 821 contacts</div>'+
          '</div>'+
          cta('Activate','margin-left:auto;font-size:11px;padding:5px 10px;')+
        '</div>'+
      '</div>');
  }

  function mRecOnsite(sym,c,icp){
    var label=icp==='travel'?'Trips picked for you':icp==='leisure'?'Events you\'ll love':'Recommended for you';
    return wrap(
      brow(c.url)+
      '<div '+s('padding:10px 14px;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:13px;margin-bottom:8px;')+'>'+label+'</div>'+
        '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:8px;')+'>'+
          prod(c.n1,sym+c.p1,'Your match','#dce8f0')+
          prod(c.n2,sym+c.p2,'','#f0dce8')+
          prod(c.n3,sym+c.p3,'','#dcf0e4')+
        '</div>'+
        '<div '+s('margin-top:8px;text-align:center;color:'+C+';font-weight:700;font-size:11px;')+'> Based on what you viewed →</div>'+
      '</div>');
  }

  function mRecEmail(sym,c,icp){
    var sub=icp==='travel'?'Trips we picked for you, Sarah':'Picked for you, Sarah';
    var intro=icp==='travel'?'These trips match your travel style:':icp==='leisure'?'Events based on your history:':'Based on your browsing, you\'ll love these:';
    return emailFrame(c.ef,sub,
      '<div '+s('padding:14px 16px;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:14px;margin-bottom:4px;')+'>Hi Sarah,</div>'+
        '<div '+s('color:'+G+';font-size:11px;margin-bottom:10px;')+'>'+intro+'</div>'+
        '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;')+'>'+
          prod(c.n1,sym+c.p1,'','#dce8f0')+prod(c.n2,sym+c.p2,'','#f0dce8')+prod(c.n3,sym+c.p3,'','#dcf0e4')+
        '</div>'+
        cta(c.cta,'width:100%;')+
      '</div>');
  }

  function mRecMatching(sym,c,icp){
    var label=icp==='travel'?'Similar trips':'Similar products';
    return wrap(
      brow(c.url)+
      '<div '+s('padding:10px 14px;')+'>'+
        '<div '+s('display:flex;gap:10px;margin-bottom:8px;')+'>'+
          '<div '+s('width:70px;height:80px;background:#dce8f0;border-radius:8px;flex-shrink:0;')+'></div>'+
          '<div>'+
            '<div '+s('font-weight:800;color:'+N+';font-size:13px;')+'>'+c.n1+'</div>'+
            '<div '+s('color:'+C+';font-weight:700;font-size:13px;')+'>'+sym+c.p1+'</div>'+
            cta(c.cta,'margin-top:6px;font-size:11px;padding:5px 10px;display:inline-block;')+
          '</div>'+
        '</div>'+
        '<div '+s('font-weight:700;color:'+N+';font-size:11px;margin-bottom:6px;')+'>'+label+'</div>'+
        '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;')+'>'+
          prod(c.n2,sym+c.p2,'','#f0dce8')+
          prod(c.n3,sym+c.p3,'','#dcf0e4')+
          prod(c.n1,sym+(parseInt(c.p1)-10),'-10%','#dce8f0')+
        '</div>'+
      '</div>');
  }

  function mAbandonedCart(sym,c,icp){
    var verb=icp==='travel'?'booking':icp==='leisure'?'reservation':'cart';
    return emailFrame(c.ef,'You left something behind, Sarah',
      '<div '+s('padding:14px 16px;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:14px;margin-bottom:4px;')+'>Your '+verb+' is waiting 👀</div>'+
        '<div '+s('color:'+G+';font-size:11px;margin-bottom:10px;')+'>You left these behind. They\'re still available — but not for long.</div>'+
        '<div '+s('display:flex;gap:10px;align-items:center;padding:8px;background:'+BG+';border-radius:8px;margin-bottom:10px;')+'>'+
          '<div '+s('width:52px;height:52px;background:#dce8f0;border-radius:6px;flex-shrink:0;')+'></div>'+
          '<div><div '+s('font-weight:700;color:'+N+';font-size:12px;')+'>'+c.n1+'</div><div '+s('color:'+C+';font-weight:700;')+'>'+sym+c.p1+'</div></div>'+
          '<div '+s('margin-left:auto;font-size:10px;color:#e05050;font-weight:700;')+'>Only 3 left!</div>'+
        '</div>'+
        cta('Complete your '+verb,'width:100%;')+
        '<div '+s('text-align:center;color:'+G+';font-size:10px;margin-top:6px;')+'>Offer expires in 24 hours</div>'+
      '</div>');
  }

  function mBrowseAbandonment(sym,c,icp){
    var q=icp==='travel'?'These trips caught your eye. Ready to book?':icp==='leisure'?'You checked these out. Still interested?':'Take another look — you viewed these recently.';
    return emailFrame(c.ef,'Still thinking about it, Sarah?',
      '<div '+s('padding:14px 16px;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:14px;margin-bottom:4px;')+'>You were looking at these</div>'+
        '<div '+s('color:'+G+';font-size:11px;margin-bottom:10px;')+'>'+q+'</div>'+
        '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;')+'>'+
          prod(c.n1,sym+c.p1,'','#dce8f0')+prod(c.n2,sym+c.p2,'','#f0dce8')+prod(c.n3,sym+c.p3,'','#dcf0e4')+
        '</div>'+
        cta(c.cta,'width:100%;')+
      '</div>');
  }

  function mWebsiteReminder(sym,c){
    return wrap(
      brow(c.url)+
      '<div '+s('background:'+CT+';border-bottom:1px solid '+BD+';padding:7px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0;')+'>'+
        '<div '+s('width:32px;height:32px;background:#dce8f0;border-radius:6px;flex-shrink:0;')+'></div>'+
        '<div>'+
          '<div '+s('font-weight:700;color:'+N+';font-size:12px;')+'>Pick up where you left off</div>'+
          '<div '+s('color:'+G+';font-size:10px;')+'>You were looking at '+c.n1+' on your last visit</div>'+
        '</div>'+
        cta('View','margin-left:auto;font-size:11px;padding:5px 10px;flex-shrink:0;')+
      '</div>'+
      pgrid3(c,sym));
  }

  function mOnlineRetargeting(sym,c){
    return wrap(
      actbar('Audiences / Paid sync')+
      '<div '+s('padding:12px 14px;display:flex;flex-direction:column;gap:8px;flex:1;')+'>'+
        '<div '+s('background:'+W+';border:1px solid '+BD+';border-radius:8px;padding:10px;')+'>'+
          '<div '+s('font-weight:800;color:'+N+';font-size:12px;margin-bottom:6px;')+'>Audience: '+c.seg+'</div>'+
          '<div '+s('display:flex;gap:6px;margin-bottom:8px;')+'>'+
            [['4 821','Active'],['3 720','Google'],['3 680','Meta']].map(function(p){
              return '<div '+s('flex:1;background:'+BG+';border-radius:6px;padding:6px 8px;')+'>'+
                '<div '+s('font-weight:800;color:'+C+';font-size:14px;')+'>'+p[0]+'</div>'+
                '<div '+s('color:'+G+';font-size:9px;')+'>'+p[1]+'</div>'+
              '</div>';
            }).join('')+
          '</div>'+
          '<div '+s('display:flex;gap:8px;')+'>'+
            '<div '+s('flex:1;height:28px;background:#4285f4;border-radius:6px;display:flex;align-items:center;justify-content:center;color:'+W+';font-weight:700;font-size:11px;')+'>G Google Ads</div>'+
            '<div '+s('flex:1;height:28px;background:#1877f2;border-radius:6px;display:flex;align-items:center;justify-content:center;color:'+W+';font-weight:700;font-size:11px;')+'>Meta Ads</div>'+
          '</div>'+
        '</div>'+
        '<div '+s('background:'+BG+';border-radius:8px;padding:7px 10px;display:flex;gap:8px;align-items:center;')+'>'+
          '<span>🔄</span><span '+s('color:'+N+';font-size:11px;font-weight:600;')+'>Syncs every 15 min · suppressions included</span>'+
        '</div>'+
      '</div>');
  }

  function mBackInStock(sym,c){
    return emailFrame(c.ef,c.n1+' is back in stock!',
      '<div '+s('padding:14px 16px;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:14px;margin-bottom:4px;')+'>It\'s back! 🎉</div>'+
        '<div '+s('color:'+G+';font-size:11px;margin-bottom:10px;')+'>You asked us to let you know when '+c.n1+' was back. Here it is.</div>'+
        '<div '+s('display:flex;gap:10px;padding:8px;background:'+BG+';border-radius:8px;margin-bottom:10px;')+'>'+
          '<div '+s('width:60px;height:60px;background:#dcf0e4;border-radius:6px;flex-shrink:0;')+'></div>'+
          '<div>'+
            '<div '+s('font-weight:700;color:'+N+';font-size:12px;')+'>'+c.n1+'</div>'+
            '<div '+s('color:'+C+';font-weight:700;font-size:13px;')+'>'+sym+c.p1+'</div>'+
            '<div '+s('color:#2f9e50;font-size:10px;font-weight:700;margin-top:2px;')+'>✓ Back in stock</div>'+
          '</div>'+
        '</div>'+
        cta(c.cta,'width:100%;')+
        '<div '+s('text-align:center;color:'+G+';font-size:10px;margin-top:6px;')+'>Limited stock — secure yours now</div>'+
      '</div>');
  }

  function mPersHomepage(sym,c,icp){
    var headline=icp==='travel'?'Your next city break — hand-picked for you':icp==='leisure'?'Your favourite events this month':'Your '+c.seg.split(' ')[0].toLowerCase()+' picks — just arrived';
    return wrap(
      brow(c.url)+
      '<div '+s('height:30px;background:'+N+';display:flex;align-items:center;padding:0 14px;')+'>'+
        '<span '+s('color:'+W+';font-weight:800;font-size:12px;')+'>'+c.ef+'</span>'+
      '</div>'+
      '<div '+s('background:'+C+';padding:12px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0;')+'>'+
        '<div '+s('flex:1;')+'>'+
          pill(c.seg,'rgba(255,255,255,0.25)',W)+
          '<div '+s('font-weight:800;color:'+W+';font-size:14px;margin-top:5px;line-height:1.3;')+'>'+headline+'</div>'+
          cta(c.cta,'margin-top:8px;display:inline-block;background:'+W+';color:'+C+';')+
        '</div>'+
        '<div '+s('width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:8px;flex-shrink:0;')+'></div>'+
      '</div>'+
      pgrid3(c,sym));
  }

  function mPersuasivePopups(sym,c,icp){
    var body=icp==='travel'?'Your dream trip is still here. Book today and save '+c.disc+'.':icp==='leisure'?'Last tickets for '+c.n1+'. Use code STAY for '+c.disc+' off.':'Get '+c.disc+' off if you check out in the next 15 min.';
    return wrap(
      brow(c.url)+
      '<div '+s('padding:8px 14px;opacity:0.2;display:flex;gap:8px;flex-shrink:0;')+'>'+
        '<div '+s('flex:2;height:50px;background:'+N+';border-radius:6px;')+'></div>'+
        '<div '+s('flex:1;display:grid;gap:4px;')+'>'+
          [1,2].map(function(){return '<div '+s('height:22px;background:'+BD+';border-radius:4px;')+'></div>';}).join('')+
        '</div>'+
      '</div>'+
      '<div '+s('position:absolute;inset:28px 8% 8px;background:'+W+';border-radius:12px;box-shadow:0 8px 32px rgba(0,42,77,0.22);padding:16px 18px;display:flex;flex-direction:column;gap:8px;align-items:center;')+'>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:15px;text-align:center;')+'>Wait — before you go!</div>'+
        '<div '+s('color:'+G+';font-size:11px;text-align:center;')+'>'+body+'</div>'+
        '<div '+s('font-size:22px;font-weight:800;color:'+C+';')+'>'+c.disc+'</div>'+
        cta('Yes — save '+c.disc+' now','width:100%;')+
        '<div '+s('text-align:center;color:'+G+';font-size:10px;')+'>No thanks, I\'ll pay full price</div>'+
      '</div>',
    BG+'');
  }

  function mPersuasiveProduct(sym,c){
    return wrap(
      brow(c.url)+
      '<div '+s('padding:10px 14px;display:flex;gap:10px;')+'>'+
        '<div '+s('width:80px;height:90px;background:#dce8f0;border-radius:8px;flex-shrink:0;')+'></div>'+
        '<div '+s('flex:1;')+'>'+
          '<div '+s('font-weight:800;color:'+N+';font-size:13px;')+'>'+c.n1+'</div>'+
          '<div '+s('color:'+C+';font-weight:700;font-size:14px;')+'>'+sym+c.p1+'</div>'+
          '<div '+s('display:grid;gap:4px;margin-top:8px;')+'>'+
            '<div '+s('background:#fff3cd;border-radius:5px;padding:4px 8px;font-size:10px;color:#7a5c00;font-weight:700;')+'>🔥 47 people viewing this right now</div>'+
            '<div '+s('background:#fce8e8;border-radius:5px;padding:4px 8px;font-size:10px;color:#c0392b;font-weight:700;')+'>⚠ Only 3 left in stock</div>'+
            '<div '+s('background:#e8f5e9;border-radius:5px;padding:4px 8px;font-size:10px;color:#2e7d32;font-weight:700;')+'>✓ 12 people bought this today</div>'+
          '</div>'+
          cta(c.cta,'margin-top:8px;font-size:11px;padding:6px 10px;display:inline-block;')+
        '</div>'+
      '</div>');
  }

  function mRecCrosssell(sym,c,icp){
    var label=icp==='travel'?'Add to your trip':icp==='leisure'?'You might also enjoy':'Complete your order with';
    return wrap(
      brow(c.url)+
      '<div '+s('padding:8px 14px;')+'>'+
        '<div '+s('background:'+BG+';border-radius:8px;padding:8px 10px;margin-bottom:8px;')+'>'+
          '<div '+s('font-weight:700;color:'+N+';font-size:12px;')+'>'+c.n1+'</div>'+
          '<div '+s('display:flex;justify-content:space-between;align-items:center;')+'>'+
            '<span '+s('color:'+C+';font-weight:700;')+'>'+sym+c.p1+'</span>'+
            '<span '+s('color:#2f9e50;font-size:10px;font-weight:700;')+'>✓ Added</span>'+
          '</div>'+
        '</div>'+
        '<div '+s('font-weight:800;color:'+N+';font-size:12px;margin-bottom:6px;')+'>'+label+'</div>'+
        '<div '+s('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;')+'>'+
          prod(c.n2,sym+c.p2,'','#f0dce8')+prod(c.n3,sym+c.p3,'','#dcf0e4')+prod('Extra',sym+'19','','#f0f0dc')+
        '</div>'+
      '</div>');
  }

  function mFollowupLoyalty(sym,c,icp){
    var head=icp==='travel'?'Booking confirmed!':'Order confirmed!';
    return emailFrame(c.ef,icp==='travel'?'Your trip is confirmed — what\'s next?':'Thank you, Sarah — you\'ve earned it',
      '<div '+s('padding:14px 16px;')+'>'+
        '<div '+s('background:'+CT+';border-radius:8px;padding:10px 12px;margin-bottom:10px;text-align:center;')+'>'+
          '<div '+s('font-size:24px;')+'>🎉</div>'+
          '<div '+s('font-weight:800;color:'+N+';font-size:14px;')+'>'+head+'</div>'+
          '<div '+s('color:'+G+';font-size:11px;')+'>'+c.n1+'</div>'+
        '</div>'+
        '<div '+s('background:'+BG+';border-radius:8px;padding:8px 10px;margin-bottom:8px;')+'>'+
          '<div '+s('font-weight:700;color:'+N+';font-size:12px;')+'>You earned '+c.loyalty+'! 🏆</div>'+
          '<div '+s('color:'+G+';font-size:10px;')+'>Automatically added to your account</div>'+
        '</div>'+
        '<div '+s('display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;')+'>'+
          prod(c.n2,sym+c.p2,'','#f0dce8')+prod(c.n3,sym+c.p3,'','#dcf0e4')+
        '</div>'+
        cta(c.cta,'width:100%;')+
      '</div>');
  }

  function mPredictiveClv(sym,c){
    var bars=[['Top 10%',82,C,sym+'2 400+'],['Top 25%',58,'#0e7bb0',sym+'1 200–2 400'],['Mid',35,BD,sym+'400–1 200'],['Low',18,'#edf0f4',sym+'0–400']];
    return wrap(
      actbar('Predictive AI / CLV scores')+
      '<div '+s('padding:12px 14px;display:flex;flex-direction:column;gap:8px;flex:1;')+'>'+
        '<div '+s('background:'+W+';border:1px solid '+BD+';border-radius:8px;padding:10px;')+'>'+
          '<div '+s('font-weight:800;color:'+N+';font-size:12px;margin-bottom:8px;')+'>Customer lifetime value — decile segments</div>'+
          bars.map(function(b){
            return '<div '+s('display:flex;align-items:center;gap:8px;margin-bottom:5px;')+'>'+
              '<div '+s('width:60px;font-size:10px;color:'+N+';font-weight:700;flex-shrink:0;')+'>'+b[0]+'</div>'+
              '<div '+s('flex:1;height:13px;background:#f0f4f7;border-radius:4px;overflow:hidden;')+'>'+
                '<div '+s('width:'+b[1]+'%;height:100%;background:'+b[2]+';border-radius:4px;')+'></div>'+
              '</div>'+
              '<div '+s('width:80px;font-size:10px;color:'+G+';text-align:right;flex-shrink:0;')+'>'+b[3]+'</div>'+
            '</div>';
          }).join('')+
          '<div '+s('margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;')+'>'+
            pill('4 821 profiles scored')+pill('482 top-10% customers','#dcf0e4','#1a5c2e')+
          '</div>'+
        '</div>'+
        '<div '+s('background:'+BG+';border-radius:8px;padding:7px 10px;display:flex;gap:8px;align-items:center;')+'>'+
          '<span>⚡</span><span '+s('color:'+N+';font-size:11px;')+'>Auto-scored · updated daily · ready to activate</span>'+
        '</div>'+
      '</div>');
  }

  // ─── dispatch ──────────────────────────────────────────────────────────────

  var MOCKS={
    'email-capture':mEmailCapture,'profile-enrichment':mProfileEnrichment,
    'email-recognition':mEmailRecognition,'rt-segmentation':mRtSegmentation,
    'rec-onsite':mRecOnsite,'rec-email':mRecEmail,'rec-matching':mRecMatching,
    'abandoned-cart':mAbandonedCart,'browse-abandonment':mBrowseAbandonment,
    'website-reminder':mWebsiteReminder,'online-retargeting':mOnlineRetargeting,
    'back-in-stock':mBackInStock,'pers-homepage':mPersHomepage,
    'persuasive-popups':mPersuasivePopups,'persuasive-product':mPersuasiveProduct,
    'rec-crosssell':mRecCrosssell,'followup-loyalty':mFollowupLoyalty,
    'predictive-clv':mPredictiveClv
  };

  // ─── Web Component ─────────────────────────────────────────────────────────

  class UCMockupEl extends HTMLElement {
    static get observedAttributes(){return['uc-id','icp','currency'];}
    connectedCallback(){this._init();this._r();}
    attributeChangedCallback(){this._init();this._r();}
    _init(){
      var ucId=this.getAttribute('uc-id')||'';
      if(this._activeUcId!==ucId){this._activeUcId=ucId;this._step=1;this._clicks=[];this._mobileTab='storefront';}
    }
    _rerender(){this._r();}
    _r(){
      var ucId=this._activeUcId||this.getAttribute('uc-id')||'';
      var icp=this.getAttribute('icp')||'commerce';
      var currency=this.getAttribute('currency')||'eur';
      var sym=SYM[currency]||'€';
      var c=CP[icp]||CP.commerce;
      var fn=MOCKS[ucId];
      this.innerHTML=fn?fn(sym,c,icp,this):'<div style="display:flex;align-items:center;justify-content:center;height:240px;color:'+G+';font-family:system-ui;font-size:12px;">Mockup coming soon</div>';
      this.style.cssText='display:block;width:100%;min-height:240px;border-radius:12px;overflow:hidden;position:relative;';
    }
  }

  if(!customElements.get('uc-mockup')){
    customElements.define('uc-mockup',UCMockupEl);
  }

}());
