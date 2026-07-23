// The Use Case Menu — Spotler Activate
// Plain React (no build step). Ported from the Claude Design prototype
// (Use Case Menu.dc.html) — same behaviour and visual output, running on
// real React instead of the proprietary dc-runtime.
'use strict';

class App extends React.Component {
  state = {
    data: null,
    lang: 'en',
    industry: 'commerce',
    search: '',
    courses: [],       // array of course ids
    subs: [],          // array of challenge sub ids
    types: [],         // 'earn' | 'save'
    setups: [],        // 'core' | 'addon'
    needs: [],         // connection strings
    lifecycles: [],    // lifecycle stage strings
    view: 'cards',     // 'cards' | 'table'
    open: null,        // use case id
    expandedChallenge: null,
    tableSort: { key: 'number', dir: 'asc' },
    pitch: [],         // starred use case ids
    pitchCopied: false,
    expandedCards: [], // use case ids expanded to the tier-2 "quick why" state
    ucRoute: null,     // set when hash is /usecase/:id
  };

  componentDidMount() {
    this.setState({ data: window.USE_CASES }, () => this.readHash());
    window.addEventListener('hashchange', this._onHash = () => this.readHash());
    window.addEventListener('keydown', this._onKey = (e) => this.onKey(e));
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this._onHash);
    window.removeEventListener('keydown', this._onKey);
  }

  _setNoindex(active) {
    let el = document.head.querySelector('[data-demo-noindex]');
    if (active && !el) {
      el = document.createElement('meta');
      el.name = 'robots'; el.content = 'noindex';
      el.setAttribute('data-demo-noindex', '');
      document.head.appendChild(el);
    } else if (!active && el) {
      el.parentNode.removeChild(el);
    }
  }

  // -------- URL hash sync --------
  readHash() {
    const h = window.location.hash.replace(/^#/, '');
    if (h.startsWith('/usecase/')) {
      this._setNoindex(true);
      this.setState({ ucRoute: h.slice('/usecase/'.length) });
      return;
    }
    this._setNoindex(false);
    if (this.state.ucRoute) this.setState({ ucRoute: null });
    if (!h) return;
    const q = Object.fromEntries(h.split('&').map(p => p.split('=').map(decodeURIComponent)));
    const s = {};
    if (q.industry) s.industry = q.industry;
    if (q.search) s.search = q.search;
    if (q.courses) s.courses = q.courses.split(',').filter(Boolean);
    if (q.subs) s.subs = q.subs.split(',').filter(Boolean);
    if (q.types) s.types = q.types.split(',').filter(Boolean);
    if (q.setups) s.setups = q.setups.split(',').filter(Boolean);
    if (q.needs) s.needs = q.needs.split(',').filter(Boolean);
    if (q.lifecycles) s.lifecycles = q.lifecycles.split(',').filter(Boolean);
    if (q.view) s.view = q.view;
    if (q.open) s.open = q.open;
    if (q.pitch) s.pitch = q.pitch.split(',').filter(Boolean);
    if (q.expanded) s.expandedCards = q.expanded.split(',').filter(Boolean);
    if (q.lang) s.lang = q.lang;
    this.setState(s);
  }
  writeHash(nextOverride) {
    const s = { ...this.state, ...(nextOverride || {}) };
    const parts = [];
    const put = (k, v) => { if (v && (Array.isArray(v) ? v.length : true)) parts.push(k + '=' + encodeURIComponent(Array.isArray(v) ? v.join(',') : v)); };
    if (s.industry !== 'commerce') put('industry', s.industry);
    if (s.lang && s.lang !== 'en') put('lang', s.lang);
    put('search', s.search);
    put('courses', s.courses);
    put('subs', s.subs);
    put('types', s.types);
    put('setups', s.setups);
    put('needs', s.needs);
    put('lifecycles', s.lifecycles);
    if (s.view !== 'cards') put('view', s.view);
    put('open', s.open);
    put('pitch', s.pitch);
    put('expanded', s.expandedCards);
    const h = parts.join('&');
    const target = h ? '#' + h : window.location.pathname + window.location.search;
    if (window.location.hash.replace(/^#/, '') !== h) {
      history.replaceState(null, '', target);
    }
  }
  set(patch) {
    this.setState(patch, () => this.writeHash());
  }
  toggleIn(key, val) {
    const arr = this.state[key] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    this.set({ [key]: next });
  }
  // Accordion: expanding a card's "quick why" tier closes any other open one.
  toggleCardExpand(id) {
    const cur = this.state.expandedCards;
    this.set({ expandedCards: cur.includes(id) ? [] : [id] });
  }

  onKey(e) {
    if (!this.state.open) return;
    if (e.key === 'Escape') { this.set({ open: null }); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const list = this.filtered();
      const i = list.findIndex(u => u.id === this.state.open);
      if (i < 0) return;
      const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
      this.set({ open: list[j].id });
    }
  }

  // -------- i18n --------
  t(s) {
    if (this.state.lang !== 'nl' || !s) return s;
    const dict = (typeof window !== 'undefined' && window.NL_STRINGS) || {};
    return dict[s] || s;
  }
  translateData(d) {
    if (this.state.lang !== 'nl' || !d) return d;
    const t = (s) => this.t(s);
    const tArr = (a) => Array.isArray(a) ? a.map(t) : a;
    const tMetrics = (m) => {
      if (!m) return m;
      const out = {};
      for (const k in m) out[k] = { value: m[k].value, label: t(m[k].label), context: t(m[k].context) };
      return out;
    };
    const tExamples = (e) => {
      if (!e) return e;
      const out = {};
      for (const k in e) out[k] = t(e[k]);
      return out;
    };
    return {
      ...d,
      meta: { ...d.meta, disclaimer: t(d.meta.disclaimer) },
      industries: d.industries.map(i => ({ ...i, label: t(i.label), sublabel: t(i.sublabel) })),
      lifecycle_stages: tArr(d.lifecycle_stages),
      connections: tArr(d.connections),
      courses: d.courses.map(c => ({ ...c, name: t(c.name), tagline: t(c.tagline), line: t(c.line) })),
      challenges: d.challenges.map(c => ({
        ...c, name: t(c.name), line: t(c.line),
        subs: c.subs.map(s => ({ ...s, short: t(s.short), label: t(s.label), sounds_like: t(s.sounds_like) })),
      })),
      use_cases: d.use_cases.map(u => ({
        ...u,
        name: t(u.name), hook: t(u.hook), blurb: t(u.blurb),
        problem: t(u.problem), how: t(u.how), rivals: u.rivals ? t(u.rivals) : u.rivals,
        capability: t(u.capability), lifecycle: t(u.lifecycle),
        demo_screen: t(u.demo_screen),
        needs: tArr(u.needs),
        metrics: tMetrics(u.metrics),
        examples: tExamples(u.examples),
        solves: u.solves.map(s => ({ ...s, label: t(s.label) })),
      })),
    };
  }

  // -------- filtering --------
  filtered() {
    const raw = this.state.data;
    if (!raw) return [];
    const d = this.translateData(raw);
    const { search, courses, subs, types, setups, needs, lifecycles } = this.state;
    const q = search.trim().toLowerCase();
    return d.use_cases.filter(u => {
      if (courses.length && !courses.includes(u.course)) return false;
      if (types.length && !types.includes(u.type)) return false;
      if (setups.length && !setups.includes(u.setup)) return false;
      if (needs.length && !needs.every(n => u.needs.includes(n))) return false;
      if (lifecycles.length && !lifecycles.includes(u.lifecycle)) return false;
      if (subs.length) {
        // OR across sub ids
        const ok = subs.some(sid => {
          const sub = d.challenges.flatMap(c => c.subs).find(s => s.id === sid);
          return sub && sub.use_case_ids.includes(u.id);
        });
        if (!ok) return false;
      }
      if (q) {
        const hay = [u.name, u.hook, u.problem, u.capability, u.blurb].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  clearAll() {
    this.set({ search: '', courses: [], subs: [], types: [], setups: [], needs: [], lifecycles: [] });
  }

  activeChips() {
    const d = this.translateData(this.state.data);
    if (!d) return [];
    const out = [];
    if (this.state.search) out.push({ label: `"${this.state.search}"`, remove: () => this.set({ search: '' }) });
    this.state.courses.forEach(id => {
      const c = d.courses.find(x => x.id === id);
      if (c) out.push({ label: c.name, color: c.color, remove: () => this.toggleIn('courses', id) });
    });
    this.state.subs.forEach(sid => {
      const sub = d.challenges.flatMap(c => c.subs).find(s => s.id === sid);
      if (sub) out.push({ label: sub.short, remove: () => this.toggleIn('subs', sid) });
    });
    this.state.types.forEach(t => out.push({ label: t === 'earn' ? this.t('Earn') : this.t('Save'), remove: () => this.toggleIn('types', t) }));
    this.state.setups.forEach(s => out.push({ label: s === 'core' ? this.t('Core') : this.t('Add-on'), remove: () => this.toggleIn('setups', s) }));
    this.state.needs.forEach(n => out.push({ label: n, remove: () => this.toggleIn('needs', n) }));
    this.state.lifecycles.forEach(l => out.push({ label: l, remove: () => this.toggleIn('lifecycles', l) }));
    return out;
  }

  render() {
    const R = React.createElement;
    // Demo route: #/usecase/:id
    if (this.state.ucRoute) {
      const Comp = window.UC_STAGE && window.UC_STAGE[this.state.ucRoute];
      if (Comp) return R(Comp, null);
      return R('div', { style: { padding: 40, textAlign: 'center', fontFamily: "'Open Sans', sans-serif", color: '#6b7a89' } },
        R('div', { style: { fontSize: 18, fontWeight: 700, color: '#002a4d', marginBottom: 12 } }, 'Demo coming soon'),
        R('a', { href: '#', style: { color: '#23afe6', fontWeight: 700, textDecoration: 'none', fontSize: 14 } }, '← Back to the menu')
      );
    }
    const rawData = this.state.data;
    if (!rawData) {
      return R('div', { style: { minHeight: '100vh', background: '#eef2f6', padding: 40, color: '#6b7a89' } }, this.t('Loading…'));
    }
    const d = this.translateData(rawData);
    const B = d.brand;
    const T = (s) => this.t(s);

    // ---------- small helpers ----------
    const Chip = (opts) => R('span', {
      style: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        fontSize: 11, fontWeight: 600,
        background: opts.bg || '#f2f6f9', color: opts.color || B.ink,
        border: opts.border || '1px solid ' + B.line,
        letterSpacing: opts.upper ? '0.08em' : 0,
        textTransform: opts.upper ? 'uppercase' : 'none',
        whiteSpace: 'nowrap',
        cursor: opts.onClick ? 'pointer' : 'default',
      },
      onClick: opts.onClick,
    }, opts.children);

    const SectionLabel = (text) => R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 } },
      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.muted } }, text),
      R('div', { style: { width: 28, height: 3, background: B.yellow, borderRadius: 2 } })
    );

    const courseById = (id) => d.courses.find(c => c.id === id);
    const subById = (id) => d.challenges.flatMap(c => c.subs).find(s => s.id === id);

    // ---------- HEADER ----------
    const brandLogo = R('img', {
      src: './assets/spotler-logo.svg',
      alt: 'Spotler',
      style: { height: 32, width: 'auto', display: 'block', flex: 'none' },
    });

    const header = R('header', {
      style: {
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid ' + B.line,
      }
    }, R('div', {
      style: { maxWidth: 1440, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between' }
    },
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } },
        brandLogo,
        R('div', { style: { height: 32, width: 1, background: B.line } }),
        R('div', {},
          R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: B.muted, textTransform: 'uppercase' } }, T('The')),
          R('div', { style: { fontSize: 20, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em', lineHeight: 1 } }, T('Use Case Menu')),
        ),
      ),
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 16 } },
        R('div', { style: { display: 'inline-flex', padding: 3, background: '#fff', borderRadius: 999, border: '1px solid ' + B.line } },
          ['en', 'nl'].map(lg => R('button', {
            key: lg,
            onClick: () => this.set({ lang: lg }),
            'aria-pressed': this.state.lang === lg,
            style: {
              border: 0, cursor: 'pointer',
              padding: '6px 12px', borderRadius: 999,
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
              background: this.state.lang === lg ? B.navy : 'transparent',
              color: this.state.lang === lg ? '#fff' : B.ink,
              textTransform: 'uppercase',
            }
          }, lg))),
      ),
    ));

    // ---------- HERO — Start where it hurts ----------
    const chall = this.state.expandedChallenge;
    const hero = R('section', {
      style: {
        maxWidth: 1440, margin: '32px auto 0', padding: '0 32px',
      }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 18 } },
        R('div', {},
          R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 10, background: B.yellow, padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: B.navy } }, T('Start where it hurts')),
          R('h1', { style: { margin: '12px 0 4px', fontSize: 34, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em', lineHeight: 1.1 } }, T('What is the prospect actually struggling with?')),
          R('div', { style: { fontSize: 15, color: B.muted, maxWidth: 640 } }, T('Pick a challenge, then the specific pain. We will filter the menu to the two or three use cases that solve it.')),
        ),
      ),
      R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } },
        d.challenges.map(c => {
          const isOpen = chall === c.id;
          return R('div', {
            key: c.id,
            style: {
              background: '#fff', borderRadius: 20, padding: 20,
              border: '1px solid ' + (isOpen ? B.cyan : B.line),
              boxShadow: isOpen ? '0 8px 30px rgba(35,175,230,0.15)' : '0 1px 3px rgba(0,42,77,0.05)',
              transition: 'border-color .18s, box-shadow .18s',
              cursor: isOpen ? 'default' : 'pointer',
            },
            onClick: () => { if (!isOpen) this.setState({ expandedChallenge: c.id }); },
          },
            R('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
              R('div', {
                style: {
                  width: 44, height: 44, borderRadius: '50%', background: B.yellow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: B.navy, fontWeight: 800, fontSize: 20,
                },
              }, c.name[0]),
              R('div', {},
                R('div', { style: { fontSize: 18, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em' } }, c.name),
                R('div', { style: { fontSize: 13, color: B.muted } }, c.line),
              ),
              isOpen && R('button', {
                onClick: (e) => { e.stopPropagation(); this.setState({ expandedChallenge: null }); },
                style: { marginLeft: 'auto', border: 0, background: 'transparent', color: B.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1 },
                'aria-label': 'Collapse',
              }, '×'),
            ),
            isOpen && R('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, animation: 'ucm-fade .2s ease-out' } },
              c.subs.map(s => R('button', {
                key: s.id,
                onClick: () => this.set({ subs: [s.id], expandedChallenge: null }),
                style: {
                  textAlign: 'left', border: '1px solid ' + B.line, background: '#fafcfd',
                  borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 3,
                  transition: 'background .15s, border-color .15s',
                },
                onMouseEnter: (e) => { e.currentTarget.style.background = B.cyan_tint; e.currentTarget.style.borderColor = B.cyan; },
                onMouseLeave: (e) => { e.currentTarget.style.background = '#fafcfd'; e.currentTarget.style.borderColor = B.line; },
              },
                R('span', { style: { fontSize: 13, fontWeight: 700, color: B.navy } }, s.label),
                R('span', { style: { fontSize: 12, color: B.muted, fontStyle: 'italic' } }, s.sounds_like),
              )),
            ),
          );
        }),
      ),
    );

    // ---------- FILTER RAIL ----------
    const filterGroup = (title, children) => R('div', { style: { marginBottom: 22 } }, SectionLabel(title), children);

    const checkbox = (label, checked, onClick, colorSwatch) => R('button', {
      key: label,
      role: 'checkbox', 'aria-checked': checked,
      onClick,
      style: {
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '6px 4px', border: 0, background: 'transparent',
        cursor: 'pointer', textAlign: 'left',
      },
    },
      R('span', {
        style: {
          width: 16, height: 16, borderRadius: 4, flex: 'none',
          border: '1.5px solid ' + (checked ? B.cyan : B.line),
          background: checked ? B.cyan : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s, border-color .15s',
        },
      }, checked && R('svg', { width: 10, height: 10, viewBox: '0 0 10 10' }, R('path', { d: 'M1 5l3 3 5-6', stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))),
      colorSwatch && R('span', { style: { width: 10, height: 10, borderRadius: 2, background: colorSwatch, flex: 'none' } }),
      R('span', { style: { fontSize: 13, color: B.ink } }, label),
    );

    const searchField = R('div', { style: { position: 'relative', marginBottom: 20 } },
      R('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', style: { position: 'absolute', top: 12, left: 12, color: B.muted } },
        R('circle', { cx: 11, cy: 11, r: 7, stroke: 'currentColor', strokeWidth: 2 }),
        R('path', { d: 'M20 20l-3.5-3.5', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })
      ),
      R('input', {
        type: 'text', value: this.state.search, placeholder: T('Search use cases…'),
        onChange: (e) => this.set({ search: e.target.value }),
        style: {
          width: '100%', padding: '10px 12px 10px 36px',
          border: '1px solid ' + B.line, borderRadius: 10,
          fontSize: 13, background: '#fff', color: B.ink, outline: 'none',
          fontFamily: 'inherit',
        },
        onFocus: (e) => e.target.style.borderColor = B.cyan,
        onBlur: (e) => e.target.style.borderColor = B.line,
      }),
    );

    const rail = R('aside', {
      style: {
        position: 'sticky', top: 96,
        alignSelf: 'start',
        background: '#fff', borderRadius: 20, padding: 22,
        border: '1px solid ' + B.line, boxShadow: '0 1px 3px rgba(0,42,77,0.05)',
        maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
      }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 } },
        R('div', { style: { fontSize: 14, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em' } }, T('Filter')),
        R('button', {
          onClick: () => this.clearAll(),
          style: { border: 0, background: 'transparent', color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 },
        }, T('Clear all')),
      ),
      searchField,
      filterGroup(T('Outcome course'), d.courses.map(c => checkbox(c.name, this.state.courses.includes(c.id), () => this.toggleIn('courses', c.id), c.color))),
      filterGroup(T('Challenge'), d.challenges.map(c => R('div', { key: c.id, style: { marginBottom: 8 } },
        R('div', { style: { fontSize: 12, fontWeight: 700, color: B.navy, marginBottom: 4 } }, c.name),
        c.subs.map(s => checkbox(s.short, this.state.subs.includes(s.id), () => this.toggleIn('subs', s.id))),
      ))),
      filterGroup(T('Type'), [
        checkbox(T('Earn'), this.state.types.includes('earn'), () => this.toggleIn('types', 'earn'), B.earn),
        checkbox(T('Save'), this.state.types.includes('save'), () => this.toggleIn('types', 'save'), B.save),
      ]),
      filterGroup(T('Setup'), [
        checkbox(T('Core'), this.state.setups.includes('core'), () => this.toggleIn('setups', 'core')),
        checkbox(T('Add-on'), this.state.setups.includes('addon'), () => this.toggleIn('setups', 'addon')),
      ]),
      filterGroup(T('Needs'), d.connections.map(n => checkbox(n, this.state.needs.includes(n), () => this.toggleIn('needs', n)))),
      filterGroup(T('Lifecycle stage'), d.lifecycle_stages.map(l => checkbox(l, this.state.lifecycles.includes(l), () => this.toggleIn('lifecycles', l)))),
    );

    // ---------- CARDS ----------
    const filtered = this.filtered();
    const activeChips = this.activeChips();
    const industryLabel = d.industries.find(i => i.id === this.state.industry).label;

    const metricPill = (m, type, big) => {
      const color = type === 'earn' ? B.earn : B.save;
      const bg = type === 'earn' ? '#e6f6ea' : B.cyan_tint;
      return R('div', {
        style: {
          display: 'inline-flex', alignItems: 'baseline', gap: 8,
          padding: big ? '10px 14px' : '6px 10px',
          borderRadius: 12, background: bg, color,
        }
      },
        R('span', { style: { fontSize: big ? 26 : 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 } }, m.value),
        R('span', { style: { fontSize: big ? 12 : 11, fontWeight: 700, color: B.ink, opacity: 0.75 } }, m.label),
      );
    };

    // Tier-2 "quick why" is a digest, not the full-detail text — trim to the
    // first sentence (with a hard length cap as a safety net for run-on
    // sentences) rather than showing the whole problem/how paragraph.
    const digest = (text, max) => {
      max = max || 120;
      if (!text) return text;
      const m = text.match(/^[^.!?]*[.!?]+/);
      let s = m ? m[0].trim() : text;
      if (s.length > max) s = s.slice(0, max - 1).trim() + '…';
      return s;
    };

    const chevron = (expanded) => R('svg', {
      width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none',
      style: { flex: 'none', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .18s ease-out' },
    }, R('path', { d: 'M6 9l6 6 6-6', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }));

    const card = (u) => {
      const c = courseById(u.course);
      const m = u.metrics[this.state.industry];
      const starred = this.state.pitch.includes(u.id);
      const expanded = this.state.expandedCards.includes(u.id);
      const toggle = () => this.toggleCardExpand(u.id);
      return R('article', {
        key: u.id,
        onClick: toggle,
        tabIndex: 0,
        'aria-expanded': expanded,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } },
        style: {
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 16,
          border: '1px solid ' + B.line,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,42,77,0.05)',
          transition: 'transform .18s, box-shadow .18s, border-color .18s',
          animation: 'ucm-fade .2s ease-out',
        },
        onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,42,77,0.10)'; e.currentTarget.style.borderColor = '#d0dde5'; },
        onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,42,77,0.05)'; e.currentTarget.style.borderColor = B.line; },
      },
        R('div', { style: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, background: c.color } }),
        R('button', {
          'aria-label': starred ? 'Remove from pitch' : 'Add to pitch',
          onClick: (e) => { e.stopPropagation(); const p = this.state.pitch; this.set({ pitch: p.includes(u.id) ? p.filter(x => x !== u.id) : [...p, u.id] }); },
          style: {
            position: 'absolute', top: 12, right: 12,
            width: 30, height: 30, borderRadius: 8,
            border: '1px solid ' + (starred ? B.yellow : B.line),
            background: starred ? B.yellow : '#fff', color: B.navy,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          },
        }, R('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: starred ? B.navy : 'none' },
          R('path', { d: 'M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14 2 9l7-1z', stroke: B.navy, strokeWidth: 1.5, strokeLinejoin: 'round' }))),

        // ---- TIER 1 — closed card: name, hook, hero metric only ----
        R('div', { style: { padding: '20px 20px 16px 24px' } },
          R('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            R('div', {
              style: {
                width: 36, height: 36, borderRadius: '50%',
                background: B.cyan, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                flex: 'none',
              },
            }, String(u.number).padStart(2, '0')),
            R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.color } }, c.name),
          ),
          R('h3', { style: { margin: '14px 0 4px', fontSize: 18, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em', lineHeight: 1.2 } }, u.name),
          R('div', { style: { fontSize: 13, color: B.cyan_shade, fontStyle: 'italic', marginBottom: 12 } }, u.hook),
          R('div', {}, metricPill(m, u.type, true)),
        ),

        // ---- TIER 2 — expanded "quick why": animates open in place ----
        R('div', {
          style: {
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: 'grid-template-rows .22s ease-out',
          },
        },
          R('div', { style: { overflow: 'hidden' } },
            R('div', { style: { padding: '0 20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 } },
              R('div', {},
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 3 } }, T('The problem')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.4 } }, digest(u.problem)),
              ),
              R('div', {},
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 3 } }, T('How Spotler Activate does it')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.4 } }, digest(u.how)),
              ),
              R('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                R('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', style: { color: B.muted, flex: 'none' } },
                  R('path', { d: 'M9 6V3M15 6V3M6 11h12M8 11v6a3 3 0 003 3h2a3 3 0 003-3v-6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })),
                u.needs.map(n => Chip({ children: n, bg: '#fff', border: '1px solid ' + B.line, color: B.muted, key: n })),
              ),
              u.solves.length > 0 && R('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                R('span', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, flex: 'none' } }, T('Solves')),
                u.solves.slice(0, 2).map(s => Chip({ children: s.label, bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy, key: s.sub_id })),
                u.solves.length > 2 && Chip({ children: '+' + (u.solves.length - 2), bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy }),
              ),
              R('button', {
                onClick: (e) => { e.stopPropagation(); this.set({ open: u.id }); },
                style: {
                  alignSelf: 'flex-start', marginTop: 4,
                  border: '1px solid ' + B.cyan, background: B.cyan_tint, borderRadius: 8,
                  padding: '8px 14px',
                  color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                },
              }, T('Full details'), R('span', { 'aria-hidden': true }, '→')),
            ),
          ),
        ),

        // ---- expand affordance — obvious, always visible ----
        R('button', {
          onClick: (e) => { e.stopPropagation(); toggle(); },
          'aria-expanded': expanded,
          'aria-label': expanded ? T('Show less') : T('See how'),
          style: {
            marginTop: expanded ? 0 : 'auto',
            width: '100%', border: 0, borderTop: '1px solid ' + B.line,
            background: expanded ? '#fafcfd' : '#fff', color: B.cyan_shade,
            padding: '10px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
          },
        }, R('span', {}, expanded ? T('Show less') : T('See how')), chevron(expanded)),
      );
    };

    // Group filtered by course
    const bands = d.courses.map(c => {
      const items = filtered.filter(u => u.course === c.id);
      return { course: c, items };
    });

    const bandsRender = bands.map(({ course: c, items }) => items.length === 0 ? null : R('section', {
      key: c.id,
      style: { marginBottom: 40 },
    },
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 } },
        R('div', {
          style: {
            fontSize: 40, fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1,
          },
        }, c.no),
        R('div', { style: { flex: 1 } },
          R('div', { style: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' } },
            R('h2', { style: { margin: 0, fontSize: 24, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, c.tagline),
            R('div', { style: { fontSize: 12, fontWeight: 700, color: B.muted, letterSpacing: '0.08em', textTransform: 'uppercase' } }, `${items.length} ${items.length === 1 ? T('use case') : T('use cases')}`),
          ),
          R('div', { style: { fontSize: 14, color: B.muted, marginTop: 2 } }, c.line),

          R('div', { style: { width: 32, height: 3, background: B.yellow, borderRadius: 2, marginTop: 8 } }),
        ),
      ),
      R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18, alignItems: 'start' } }, items.map(card)),
    ));

    // ---------- TABLE ----------
    const sortIcon = (key) => {
      if (this.state.tableSort.key !== key) return null;
      return R('span', { style: { marginLeft: 4, fontSize: 10 } }, this.state.tableSort.dir === 'asc' ? '▲' : '▼');
    };
    const sortBy = (key) => {
      const s = this.state.tableSort;
      const dir = s.key === key && s.dir === 'asc' ? 'desc' : 'asc';
      this.setState({ tableSort: { key, dir } });
    };
    const metricNum = (u, ind) => {
      const v = u.metrics[ind].value;
      const n = parseFloat(v.replace('%', '').replace('+', ''));
      return isNaN(n) ? 0 : n;
    };
    const sortedTable = [...filtered].sort((a, b) => {
      const { key, dir } = this.state.tableSort;
      let av, bv;
      if (key === 'number') { av = a.number; bv = b.number; }
      else if (key === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (key === 'metric') { av = metricNum(a, this.state.industry); bv = metricNum(b, this.state.industry); }
      else { av = a[key]; bv = b[key]; }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    const th = (label, key) => R('th', {
      key: key || label,
      onClick: key ? () => sortBy(key) : undefined,
      style: {
        padding: '12px 14px', textAlign: 'left',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: B.muted, cursor: key ? 'pointer' : 'default',
        borderBottom: '1px solid ' + B.line,
        userSelect: 'none', whiteSpace: 'nowrap',
      },
    }, label, sortIcon(key));

    const tableView = R('div', {
      style: { background: '#fff', borderRadius: 16, border: '1px solid ' + B.line, boxShadow: '0 1px 3px rgba(0,42,77,0.05)', overflow: 'hidden' },
    },
      R('div', { style: { overflow: 'auto' } },
        R('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          R('thead', {}, R('tr', {},
            th('#', 'number'),
            th(T('Use case'), 'name'),
            th(T('Course')),
            th(T('Type'), 'type'),
            th(T('Setup'), 'setup'),
            ...d.industries.map(ind => R('th', {
              key: ind.id,
              onClick: () => sortBy('metric'),
              style: {
                padding: '12px 14px', textAlign: 'right',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: this.state.industry === ind.id ? B.cyan_shade : B.muted,
                cursor: 'pointer',
                borderBottom: '1px solid ' + B.line,
                background: this.state.industry === ind.id ? B.cyan_tint : 'transparent',
                whiteSpace: 'nowrap',
              },
            }, ind.label, this.state.industry === ind.id && sortIcon('metric')))
          )),
          R('tbody', {}, sortedTable.map(u => {
            const c = courseById(u.course);
            return R('tr', {
              key: u.id,
              onClick: () => this.set({ open: u.id }),
              style: { cursor: 'pointer', borderBottom: '1px solid ' + B.line, transition: 'background .12s' },
              onMouseEnter: (e) => e.currentTarget.style.background = '#fafcfd',
              onMouseLeave: (e) => e.currentTarget.style.background = 'transparent',
            },
              R('td', { style: { padding: '14px', width: 42 } },
                R('div', {
                  style: {
                    width: 28, height: 28, borderRadius: '50%',
                    background: B.cyan, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  },
                }, String(u.number).padStart(2, '0'))),
              R('td', { style: { padding: '14px' } },
                R('div', { style: { fontWeight: 700, color: B.navy, fontSize: 14 } }, u.name),
                R('div', { style: { fontStyle: 'italic', color: B.cyan_shade, fontSize: 12, marginTop: 2 } }, u.hook)),
              R('td', { style: { padding: '14px' } },
                R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
                  R('span', { style: { width: 8, height: 8, borderRadius: 2, background: c.color } }),
                  R('span', { style: { fontSize: 12, fontWeight: 700, color: B.navy } }, c.name))),
              R('td', { style: { padding: '14px' } },
                R('span', {
                  style: {
                    padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                    background: u.type === 'earn' ? '#e6f6ea' : B.cyan_tint,
                    color: u.type === 'earn' ? B.earn : B.save,
                    textTransform: 'capitalize',
                  }
                }, u.type)),
              R('td', { style: { padding: '14px', fontSize: 12, color: B.ink } }, u.setup === 'core' ? T('Core') : T('Add-on')),
              ...d.industries.map(ind => {
                const m = u.metrics[ind.id];
                const highlight = this.state.industry === ind.id;
                return R('td', {
                  key: ind.id,
                  style: {
                    padding: '14px', textAlign: 'right',
                    background: highlight ? B.cyan_tint : 'transparent',
                    whiteSpace: 'nowrap',
                  }
                },
                  R('div', {
                    style: { fontSize: 15, fontWeight: 800, color: highlight ? (u.type === 'earn' ? B.earn : B.save) : B.ink, letterSpacing: '-0.02em' }
                  }, m.value),
                  R('div', { style: { fontSize: 10, color: B.muted, marginTop: 1 } }, m.label));
              }),
            );
          })),
        ),
      ),
    );

    // ---------- TOOLBAR (view + chips + count) ----------
    const toolbar = R('div', {
      style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
        R('span', { style: { fontSize: 22, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, filtered.length),
        R('span', { style: { fontSize: 13, color: B.muted } }, `${T('of')} ${d.use_cases.length} ${T('use cases')}`),
        R('span', { style: { fontSize: 13, color: B.muted } }, ' · ' + T('specified for') + ' '),
        R('span', { style: { fontSize: 13, fontWeight: 700, color: B.navy } }, industryLabel),
      ),
      activeChips.length > 0 && R('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
        activeChips.map((ch, i) => R('span', {
          key: i,
          style: {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 6px 4px 10px', borderRadius: 999,
            background: '#fff', border: '1px solid ' + (ch.color || B.line),
            fontSize: 11, fontWeight: 600, color: B.ink,
          }
        },
          ch.color && R('span', { style: { width: 8, height: 8, borderRadius: 2, background: ch.color } }),
          ch.label,
          R('button', {
            onClick: ch.remove,
            'aria-label': 'Remove filter',
            style: { border: 0, background: '#f2f6f9', color: B.muted, width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 12, lineHeight: 1 },
          }, '×'),
        )),
        R('button', {
          onClick: () => this.clearAll(),
          style: { border: 0, background: 'transparent', color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
        }, T('Clear all')),
      ),
      R('div', { style: { marginLeft: 'auto', display: 'inline-flex', padding: 3, background: '#fff', borderRadius: 10, border: '1px solid ' + B.line } },
        ['cards', 'table'].map(v => R('button', {
          key: v,
          onClick: () => this.set({ view: v }),
          'aria-pressed': this.state.view === v,
          style: {
            border: 0, cursor: 'pointer',
            padding: '6px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 700,
            background: this.state.view === v ? B.navy : 'transparent',
            color: this.state.view === v ? '#fff' : B.ink,
            textTransform: 'capitalize',
          }
        }, T(v)))),
    );

    const emptyState = filtered.length === 0 && R('div', {
      style: {
        padding: 48, textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px dashed ' + B.line,
      }
    },
      R('div', { style: { fontSize: 42 } }, '🔎'),
      R('div', { style: { fontSize: 18, fontWeight: 800, color: B.navy, margin: '10px 0 6px' } }, T('No use cases match these filters')),
      R('div', { style: { fontSize: 13, color: B.muted, marginBottom: 16 } }, T('Loosen the filters or start fresh.')),
      R('button', {
        onClick: () => this.clearAll(),
        style: { border: 0, background: B.navy, color: '#fff', padding: '10px 20px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
      }, T('Clear all filters')),
    );

    // ---------- DRAWER ----------
    let drawer = null;
    if (this.state.open) {
      const u = d.use_cases.find(x => x.id === this.state.open);
      if (u) {
        const c = courseById(u.course);
        const m = u.metrics[this.state.industry];
        drawer = R('div', {
          style: {
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4vh 20px',
            animation: 'ucm-fade .18s ease-out',
          },
          role: 'dialog', 'aria-modal': true, 'aria-label': u.name,
        },
          R('div', {
            onClick: () => this.set({ open: null }),
            style: { position: 'absolute', inset: 0, background: 'rgba(0,42,77,0.45)', backdropFilter: 'blur(4px)' },
          }),
          R('div', {
            style: {
              position: 'relative',
              width: 'min(1040px, 96vw)', maxHeight: '90vh',
              background: '#fff', borderRadius: 24,
              boxShadow: '0 40px 100px rgba(0,42,77,0.35)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              animation: 'ucm-pop .22s cubic-bezier(0.22,0.61,0.36,1)',
            },
          },
            // header
            R('div', { style: { padding: '32px 36px 24px', borderBottom: '1px solid ' + B.line, position: 'relative' } },
              R('div', { style: { position: 'absolute', left: 0, top: 28, bottom: 24, width: 5, background: c.color } }),
              R('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start' } },
                R('div', {
                  style: {
                    width: 44, height: 44, borderRadius: '50%', background: B.cyan, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, flex: 'none',
                  }
                }, String(u.number).padStart(2, '0')),
                R('div', { style: { flex: 1, minWidth: 0 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.color } }, c.name + ' · ' + c.tagline),
                  R('h2', { style: { margin: '4px 0 4px', fontSize: 24, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, u.name),
                  R('div', { style: { fontSize: 14, color: B.cyan_shade, fontStyle: 'italic' } }, u.hook),
                ),
                R('button', {
                  onClick: () => this.set({ open: null }),
                  'aria-label': 'Close',
                  style: {
                    border: '1px solid ' + B.line, background: '#fff', width: 34, height: 34, borderRadius: '50%',
                    cursor: 'pointer', color: B.ink, fontSize: 16, flex: 'none',
                  },
                }, '×'),
              ),
              R('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                metricPill(m, u.type, true),
                Chip({ children: u.lifecycle, bg: '#f2f6f9' }),
                Chip({ children: u.setup === 'core' ? T('Core') : T('Add-on'), bg: u.setup === 'core' ? B.navy_tint : '#f2ecff', color: u.setup === 'core' ? B.navy : '#4a2fa8' }),
                Chip({ children: u.capability, bg: '#fff', border: '1px dashed ' + B.line }),
              ),
            ),
            // body
            R('div', { style: { flex: 1, overflowY: 'auto', padding: '28px 36px 12px' } },
              // -- mockup hero --
              (() => {
                const icpMap = { commerce: 'commerce', travel: 'travel', culture: 'leisure' };
                const viewIsActivate = /Spotler Activate|dashboard|profile|segment builder|CDP|deck|report/i.test(u.demo_screen || '');
                return R('div', { style: { marginBottom: 22 } },
                  R('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12 } },
                    R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.muted } }, T('How it looks')),
                      R('div', { style: { width: 28, height: 3, background: B.yellow, borderRadius: 2 } }),
                    ),
                    R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: viewIsActivate ? B.navy : B.cyan_tint, color: viewIsActivate ? '#fff' : B.cyan_shade, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' } },
                      R('span', { style: { width: 6, height: 6, borderRadius: '50%', background: viewIsActivate ? B.cyan : B.cyan_shade } }),
                      viewIsActivate ? T('Marketer · Spotler Activate') : T('Customer-facing'),
                    ),
                  ),
                  R('div', {
                    style: {
                      background: '#fff', borderRadius: 12, overflow: 'hidden',
                      border: '1px solid ' + B.line, boxShadow: '0 4px 16px rgba(0,42,77,0.06)',
                    }
                  }, R('uc-mockup', { key: u.id + this.state.industry, 'uc-id': u.id, icp: icpMap[this.state.industry] || 'commerce', currency: 'eur' })),
                  u.demo_screen && R('div', { style: { marginTop: 8, fontSize: 11, color: B.muted, fontStyle: 'italic', lineHeight: 1.45 } }, u.demo_screen),
                );
              })(),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('The problem')),
                R('p', { style: { margin: 0, fontSize: 15, color: B.ink, lineHeight: 1.55 } }, u.problem),
              ),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('How Spotler Activate does it')),
                R('p', { style: { margin: 0, fontSize: 15, color: B.ink, lineHeight: 1.55 } }, u.how),
              ),
              u.rivals && R('div', {
                style: {
                  marginBottom: 22, padding: '12px 14px',
                  background: B.cyan_tint, borderLeft: '3px solid ' + B.cyan,
                  borderRadius: 8,
                },
              },
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.cyan_shade, marginBottom: 4 } }, T('Where rivals fall short')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.5 } }, u.rivals),
              ),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('What it looks like — per industry')),
                R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 } },
                  d.industries.map(ind => {
                    const highlight = this.state.industry === ind.id;
                    const im = u.metrics[ind.id];
                    return R('div', {
                      key: ind.id,
                      onClick: () => this.set({ industry: ind.id }),
                      style: {
                        cursor: 'pointer',
                        padding: 14, borderRadius: 12,
                        background: highlight ? B.cyan_tint : '#fafcfd',
                        border: '1px solid ' + (highlight ? B.cyan : B.line),
                        transition: 'background .15s, border-color .15s',
                      },
                    },
                      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: highlight ? B.cyan_shade : B.muted, marginBottom: 6 } }, ind.label),
                      R('div', { style: { fontSize: 20, fontWeight: 800, color: u.type === 'earn' ? B.earn : B.save, letterSpacing: '-0.02em' } }, im.value),
                      R('div', { style: { fontSize: 11, color: B.muted, marginBottom: 8 } }, im.label),
                      R('div', { style: { fontSize: 12, color: B.ink, lineHeight: 1.45 } }, u.examples[ind.id]),
                    );
                  })
                ),
              ),
            ),
            // footer
            R('div', { style: { padding: '20px 36px 28px', borderTop: '1px solid ' + B.line, background: '#fafcfd' } },
              R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 20 } },
                R('div', { style: { flex: 1, minWidth: 200 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 8 } }, T('Needs')),
                  R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, u.needs.map(n => Chip({ children: n, key: n, bg: '#fff', border: '1px solid ' + B.line, color: B.muted }))),
                ),
                u.solves.length > 0 && R('div', { style: { flex: 1, minWidth: 200 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 8 } }, T('Solves')),
                  R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, u.solves.map(s => Chip({
                    children: s.label,
                    key: s.sub_id,
                    bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy,
                    onClick: () => this.set({ subs: [s.sub_id], open: null }),
                  }))),
                ),
              ),
              R('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + B.line } },
                R('div', { style: { fontSize: 11, color: B.muted } }, T('← → navigate · Esc to close')),
                R('div', { style: { display: 'flex', gap: 8 } },
                  R('button', {
                    onClick: () => this.onKey({ key: 'ArrowLeft' }),
                    style: { border: '1px solid ' + B.line, background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: B.ink },
                  }, T('← Prev')),
                  R('button', {
                    onClick: () => this.onKey({ key: 'ArrowRight' }),
                    style: { border: 0, background: B.navy, color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 },
                  }, T('Next →')),
                ),
              ),
            ),
          ),
        );
      }
    }

    // ---------- PITCH TRAY ----------
    let pitchTray = null;
    if (this.state.pitch.length > 0) {
      const items = this.state.pitch.map(id => d.use_cases.find(u => u.id === id)).filter(Boolean);
      const copyText = () => {
        const lines = items.map(u => `#${String(u.number).padStart(2, '0')} ${u.name} — ${u.hook}\n  ${u.metrics[this.state.industry].value} ${u.metrics[this.state.industry].label} (${industryLabel})`).join('\n\n');
        const head = `${T('Spotler Activate — pitch shortlist for ')}${industryLabel}\n\n`;
        navigator.clipboard && navigator.clipboard.writeText(head + lines);
        this.setState({ pitchCopied: true });
        setTimeout(() => this.setState({ pitchCopied: false }), 1600);
      };
      pitchTray = R('div', {
        style: {
          position: 'fixed', bottom: 20, right: 20, zIndex: 50,
          background: B.navy, color: '#fff', borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,42,77,0.35)',
          padding: 16, width: 320,
          animation: 'ucm-pop .2s ease-out',
        }
      },
        R('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
          R('div', { style: { fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' } }, T('My pitch · ') + items.length),
          R('button', {
            onClick: () => this.set({ pitch: [] }),
            style: { border: 0, background: 'transparent', color: '#93aebf', cursor: 'pointer', fontSize: 11, fontWeight: 700 },
          }, T('Clear')),
        ),
        R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', marginBottom: 12 } },
          items.map(u => R('div', {
            key: u.id,
            style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', cursor: 'pointer' },
            onClick: () => this.set({ open: u.id }),
          },
            R('div', { style: { width: 22, height: 22, borderRadius: '50%', background: B.cyan, color: B.navy, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, String(u.number).padStart(2, '0')),
            R('div', { style: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, u.name),
            R('button', {
              onClick: (e) => { e.stopPropagation(); this.set({ pitch: this.state.pitch.filter(x => x !== u.id) }); },
              style: { border: 0, background: 'transparent', color: '#93aebf', cursor: 'pointer', padding: 2, fontSize: 14 },
              'aria-label': 'Remove',
            }, '×'),
          )),
        ),
        R('button', {
          onClick: copyText,
          style: { width: '100%', border: 0, background: B.cyan, color: B.navy, padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em' },
        }, this.state.pitchCopied ? T('✓ Copied to clipboard') : T('Copy shortlist')),
      );
    }

    // ---------- FOOTER ----------
    const footer = R('footer', {
      style: {
        maxWidth: 1440, margin: '40px auto 0', padding: '32px', borderTop: '1px solid ' + B.line, color: B.muted, fontSize: 12,
      }
    },
      R('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
        R('div', { style: { flex: 1, minWidth: 240 } },
          R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.navy, marginBottom: 6 } }, T('A note on the numbers')),
          R('div', { style: { lineHeight: 1.5, maxWidth: 720 } }, d.meta.disclaimer),
        ),
        R('div', { style: { flex: 1, minWidth: 220 } },
          R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.navy, marginBottom: 6 } }, T('Questions or remarks?')),
          R('div', { style: { lineHeight: 1.5, marginBottom: 10 } }, T('Contact Erik de Kock — preferably via Teams, or by email.')),
          R('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            R('a', {
              href: 'https://teams.microsoft.com/l/chat/0/0?users=erik.dekock@spotler.com',
              target: '_blank', rel: 'noopener noreferrer',
              style: {
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: B.navy, color: '#fff',
                fontSize: 11, fontWeight: 700, textDecoration: 'none',
              },
            },
              R('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
                R('path', { d: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z', stroke: '#fff', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' })),
              T('Chat on Teams'),
            ),
            R('a', {
              href: 'mailto:erik.dekock@spotler.com',
              style: {
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                border: '1px solid ' + B.line, color: B.ink,
                fontSize: 11, fontWeight: 700, textDecoration: 'none',
              },
            },
              R('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
                R('path', { d: 'M4 6h16v12H4z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
                R('path', { d: 'M4 7l8 6 8-6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' })),
              T('Email'),
            ),
          ),
        ),
        R('div', { style: { fontSize: 11 } }, T('© Spotler · '), d.meta.count, ' ' + T('use cases') + ' · ', d.meta.product),
      ),
    );

    // ---------- MAIN LAYOUT ----------
    const main = R('div', {
      style: { maxWidth: 1440, margin: '32px auto 0', padding: '0 32px 40px', display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 28, alignItems: 'start' }
    },
      rail,
      R('div', { style: { minWidth: 0 } },
        toolbar,
        this.state.view === 'cards'
          ? (filtered.length === 0 ? emptyState : R('div', {}, bandsRender))
          : (filtered.length === 0 ? emptyState : tableView),
      ),
    );

    return R('div', { style: { minHeight: '100vh', background: '#eef2f6' } }, header, hero, main, footer, drawer, pitchTray);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

// ============================================================
// Routes  #/usecase/:id — demo pages
// Registry: window.UC_STAGE[ucId] = React component function
// ============================================================
window.UC_STAGE = window.UC_STAGE || {};

// ── Products catalogue ────────────────────────────────────────
// No SKUs hard-coded in the journey; the flow definition references
// DEMO_PRODUCTS by category. Swap this array to try a different catalogue.
var DEMO_PRODUCTS = [
  { id: 'merino',   name: 'Merino Wool Sweater', cat: 'knitwear',     price: 79,  color: '#dce8f0', care: 'Hand wash cold, dry flat.' },
  { id: 'chino',    name: 'Slim Chino Trousers', cat: 'bottoms',      price: 59,  color: '#f0dce8', care: 'Machine wash 30°C, iron warm.' },
  { id: 'shirt',    name: 'Classic White Shirt',  cat: 'tops',         price: 45,  color: '#dcf0e4', care: 'Machine wash 40°C, tumble dry low.' },
  { id: 'shoes',    name: 'Running Shoes',         cat: 'footwear',    price: 89,  color: '#f0ece0', care: 'Wipe clean with a damp cloth.' },
  { id: 'backpack', name: 'Canvas Backpack',       cat: 'accessories', price: 49,  color: '#e8dcf0', care: 'Spot clean only, air dry.' },
  { id: 'jacket',   name: 'Puffer Jacket',          cat: 'outerwear',   price: 119, color: '#dcf0f0', care: 'Machine wash 30°C, tumble dry low heat.' },
];

var DEMO_CAT_RECS = {
  knitwear:     ['chino', 'shirt'],
  bottoms:      ['shirt', 'shoes'],
  tops:         ['chino', 'backpack'],
  footwear:     ['merino', 'backpack'],
  accessories:  ['merino', 'shirt'],
  outerwear:    ['merino', 'chino'],
};

// Persona
var ROBIN = { name: 'Robin Jansen', email: 'robin.jansen@example.com' };
var ROBIN_PURCHASE = DEMO_PRODUCTS[0]; // Merino Wool Sweater — resolved at load
var ROBIN_RECS = (DEMO_CAT_RECS[ROBIN_PURCHASE.cat] || [])
  .map(function(id) { return DEMO_PRODUCTS.find(function(p) { return p.id === id; }); })
  .filter(Boolean);

// ── Shared helpers ────────────────────────────────────────────
function ucBenchmarkStr(ucId) {
  var ucs = window.USE_CASES && window.USE_CASES.use_cases;
  var uc = ucs && ucs.find(function(u) { return u.id === ucId; });
  return uc ? (uc.metrics.commerce.value + ' ' + uc.metrics.commerce.label) : '';
}
function ucNameStr(ucId) {
  var ucs = window.USE_CASES && window.USE_CASES.use_cases;
  var uc = ucs && ucs.find(function(u) { return u.id === ucId; });
  return uc ? uc.name : ucId;
}

// ── Reusable journey canvas renderer ─────────────────────────
// Usage: React.createElement(UcJourneyCanvas, { flow, ds })
//   flow: { nodes: [{id,type,x,y,label,sub}...], edges: [{id,from,to,path,label,lx,ly}...] }
//   ds:   { tokenNode, visitedNodes[], visitedEdges[], dimNodes[], dimEdges[] }
//
// To use this canvas for a different journey (e.g. abandoned-cart), supply a
// different flow object with the same shape. The renderer is fully generic.
//
// Node types:
//   entry, exit, goal           → green circle
//   email, coupon, action,      → blue rounded square
//   audience, update-profile
//   wait, split, prodsplit      → orange diamond

function UcJourneyCanvas(props) {
  var CE = React.createElement;
  var flow = props.flow;
  var ds = props.ds || {};
  var NH = 23;
  var GREEN  = '#2f9e5f';
  var BLUE   = '#1f5fc4';
  var ORANGE = '#f08a24';

  function isVisitedNode(id)  { return ds.visitedNodes && ds.visitedNodes.indexOf(id) >= 0; }
  function isDimmedNode(id)   { return ds.dimNodes     && ds.dimNodes.indexOf(id) >= 0; }
  function isVisitedEdge(id)  { return ds.visitedEdges && ds.visitedEdges.indexOf(id) >= 0; }
  function isDimmedEdge(id)   { return ds.dimEdges     && ds.dimEdges.indexOf(id) >= 0; }

  function renderNode(n) {
    var token   = ds.tokenNode === n.id;
    var dimmed  = isDimmedNode(n.id);
    var x = n.x, y = n.y;
    var els = [];

    if (n.type === 'entry' || n.type === 'exit' || n.type === 'goal') {
      els.push(CE('circle', { key: 's', cx: x, cy: y, r: NH, fill: GREEN }));
      var icon = n.type === 'entry' ? '▶' : n.type === 'goal' ? '⚑' : '→';
      els.push(CE('text', { key: 'i', x: x, y: y + 5, textAnchor: 'middle', fill: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'system-ui' }, icon));
    } else if (n.type === 'wait' || n.type === 'split' || n.type === 'prodsplit') {
      var pts = x + ',' + (y - NH) + ' ' + (x + NH) + ',' + y + ' ' + x + ',' + (y + NH) + ' ' + (x - NH) + ',' + y;
      els.push(CE('polygon', { key: 's', points: pts, fill: ORANGE }));
      var icon2 = n.type === 'wait' ? '⧖' : '?';
      els.push(CE('text', { key: 'i', x: x, y: y + 4, textAnchor: 'middle', fill: '#fff', fontSize: n.type === 'wait' ? 13 : 14, fontFamily: 'system-ui' }, icon2));
    } else {
      // email, coupon, action, audience
      els.push(CE('rect', { key: 's', x: x - NH, y: y - NH, width: NH * 2, height: NH * 2, rx: 8, fill: BLUE }));
      var icon3 = n.type === 'email' ? '✉' : n.type === 'coupon' ? '%' : n.type === 'audience' ? '●' : '⇧';
      els.push(CE('text', { key: 'i', x: x, y: y + 5, textAnchor: 'middle', fill: '#fff', fontSize: 14, fontFamily: 'system-ui' }, icon3));
    }

    // Node name label
    els.push(CE('text', { key: 'lbl', x: x, y: y + NH + 13, textAnchor: 'middle', fill: '#1a2b3c', fontSize: 10, fontWeight: '600', fontFamily: "'Open Sans', system-ui" }, n.label));
    if (n.sub) {
      els.push(CE('text', { key: 'sub', x: x, y: y + NH + 24, textAnchor: 'middle', fill: '#6b7a89', fontSize: 9, fontFamily: "'Open Sans', system-ui" }, n.sub));
    }

    // Live token ring
    if (token) {
      els.push(CE('circle', { key: 'tok', cx: x, cy: y, r: NH + 6, fill: 'none', stroke: '#23afe6', strokeWidth: 3 }));
    }

    return CE('g', { key: n.id, opacity: dimmed ? 0.22 : 1 }, ...els);
  }

  function renderEdge(e) {
    var visited = isVisitedEdge(e.id);
    var dimmed  = isDimmedEdge(e.id);
    var stroke  = dimmed ? '#dde4ea' : visited ? '#002a4d' : '#c8d0d8';
    var sw      = visited ? 2.5 : 1.5;
    var dash    = dimmed ? '4 3' : 'none';
    var els = [];

    els.push(CE('path', { key: 'p', d: e.path, stroke: stroke, strokeWidth: sw, strokeDasharray: dash, fill: 'none', opacity: dimmed ? 0.5 : 1 }));

    if (e.label) {
      var isSR   = e.label === 'Sent' || e.label === 'Remainder';
      var pillBg = dimmed ? '#f0f4f7' : isSR ? '#e6f6fc' : '#f5f5f5';
      var pillFg = dimmed ? '#b0bcc6' : isSR ? '#1f5fc4' : '#6b7a89';
      var tw     = e.label.length * 5.5 + 12;
      var lx = e.lx, ly = e.ly;
      els.push(CE('g', { key: 'lbl', opacity: dimmed ? 0.4 : 1 },
        CE('rect', { x: lx - tw / 2, y: ly - 7, width: tw, height: 14, rx: 7, fill: pillBg }),
        CE('text', { x: lx, y: ly + 4, textAnchor: 'middle', fill: pillFg, fontSize: 9, fontWeight: '700', fontFamily: "'Open Sans', system-ui" }, e.label)
      ));
    }

    return CE('g', { key: e.id }, ...els);
  }

  return CE('svg', { width: 440, height: 900, style: { display: 'block', minWidth: 440 } },
    CE('g', { key: 'edges' }, ...flow.edges.map(renderEdge)),
    CE('g', { key: 'nodes' }, ...flow.nodes.map(renderNode))
  );
}

// ── UC17 flow definition ──────────────────────────────────────
// To reuse UcJourneyCanvas for another journey (abandoned-cart, etc.),
// define a new { nodes, edges } object and pass it as `flow`.
// The renderer only reads x, y, type, label, sub on nodes
// and id, from, to, path, label, lx, ly on edges.

var FOLLOWUP_LOYALTY_FLOW = {
  nodes: [
    { id: 'entry',          type: 'entry',     x: 220, y: 40,  label: 'Purchase',          sub: 'Event is one of Purchase' },
    { id: 'wait-3d',        type: 'wait',      x: 220, y: 120, label: 'Wait 3 days',        sub: 'Covering delivery' },
    { id: 'email-thankyou', type: 'email',     x: 220, y: 200, label: 'Thank-you email',    sub: 'Care guide for item' },
    { id: 'exit-1',         type: 'exit',      x: 55,  y: 200, label: 'Exit',               sub: 'No address or consent' },
    { id: 'split-30d',      type: 'split',     x: 220, y: 290, label: 'Purchased',          sub: 'within 30 days?' },
    { id: 'goal-1',         type: 'goal',      x: 385, y: 290, label: 'Goal',               sub: 'Repeat purchase' },
    { id: 'product-split',  type: 'prodsplit', x: 220, y: 375, label: 'Category?',          sub: 'Route by item bought' },
    { id: 'coupon',         type: 'coupon',    x: 220, y: 450, label: 'Coupon',             sub: 'Loyalty reward' },
    { id: 'email-offer',    type: 'email',     x: 220, y: 525, label: 'Offer email',        sub: 'Next purchase + coupon' },
    { id: 'exit-2',         type: 'exit',      x: 55,  y: 525, label: 'Exit',               sub: 'No address or consent' },
    { id: 'split-14d',      type: 'split',     x: 220, y: 610, label: 'Purchased',          sub: 'within 14 days?' },
    { id: 'goal-2',         type: 'goal',      x: 385, y: 610, label: 'Goal',               sub: 'Repeat purchase' },
    { id: 'update-profile', type: 'action',    x: 220, y: 690, label: 'Update profile',     sub: 'Increment loyalty score' },
    { id: 'audience',       type: 'audience',  x: 220, y: 765, label: 'Audience',           sub: 'Repeat customers' },
    { id: 'exit-3',         type: 'exit',      x: 220, y: 840, label: 'Exit',               sub: '' },
  ],
  edges: [
    { id: 'e1',  from: 'entry',          to: 'wait-3d',        path: 'M220,63 L220,97' },
    { id: 'e2',  from: 'wait-3d',        to: 'email-thankyou', path: 'M220,143 L220,177' },
    { id: 'e3',  from: 'email-thankyou', to: 'split-30d',      path: 'M220,223 L220,267',  label: 'Sent',      lx: 240, ly: 245 },
    { id: 'e4',  from: 'email-thankyou', to: 'exit-1',         path: 'M197,200 L78,200',   label: 'Remainder', lx: 137, ly: 192 },
    { id: 'e5',  from: 'split-30d',      to: 'goal-1',         path: 'M243,290 L362,290',  label: 'yes',       lx: 302, ly: 283 },
    { id: 'e6',  from: 'split-30d',      to: 'product-split',  path: 'M220,313 L220,352',  label: 'no',        lx: 235, ly: 332 },
    { id: 'e7',  from: 'product-split',  to: 'coupon',         path: 'M220,398 L220,427' },
    { id: 'e8',  from: 'coupon',         to: 'email-offer',    path: 'M220,473 L220,502' },
    { id: 'e9',  from: 'email-offer',    to: 'split-14d',      path: 'M220,548 L220,587',  label: 'Sent',      lx: 240, ly: 567 },
    { id: 'e10', from: 'email-offer',    to: 'exit-2',         path: 'M197,525 L78,525',   label: 'Remainder', lx: 137, ly: 517 },
    { id: 'e11', from: 'split-14d',      to: 'goal-2',         path: 'M243,610 L362,610',  label: 'yes',       lx: 302, ly: 603 },
    { id: 'e12', from: 'split-14d',      to: 'update-profile', path: 'M220,633 L220,667',  label: 'no',        lx: 235, ly: 650 },
    { id: 'e13', from: 'update-profile', to: 'audience',       path: 'M220,713 L220,742' },
    { id: 'e14', from: 'audience',       to: 'exit-3',         path: 'M220,788 L220,817' },
  ]
};

// ── UC17 state machine ────────────────────────────────────────
// Returns the visual state (which node holds the token, which paths are
// visited / dimmed) plus an email list and a commentary string.
// All args are primitives; this is a pure function with no side-effects.

function uc17ComputeState(day, buyDay, noConsent) {
  var bought30 = buyDay !== null && buyDay > 0 && buyDay <= 34;
  var bought14 = buyDay !== null && buyDay > 0; // bought at any point

  if (day < 3) {
    return {
      tokenNode: 'entry', visitedNodes: ['entry'], visitedEdges: [],
      dimNodes: [], dimEdges: [],
      comment: 'Robin just placed her order. Activate records the Purchase event and enters her into the journey.',
      emails: []
    };
  }
  if (day === 3) {
    return {
      tokenNode: 'wait-3d', visitedNodes: ['entry', 'wait-3d'], visitedEdges: ['e1'],
      dimNodes: [], dimEdges: [],
      comment: 'Wait node: Activate holds for 3 days — long enough for delivery — before sending anything.',
      emails: []
    };
  }

  // day >= 4
  if (noConsent) {
    return {
      tokenNode: 'exit-1',
      visitedNodes: ['entry', 'wait-3d', 'email-thankyou', 'exit-1'],
      visitedEdges: ['e1', 'e2', 'e4'],
      dimNodes: ['split-30d','goal-1','product-split','coupon','email-offer','exit-2','split-14d','goal-2','update-profile','audience','exit-3'],
      dimEdges: ['e3','e5','e6','e7','e8','e9','e10','e11','e12','e13','e14'],
      comment: 'Email node: no address or consent on file. Activate routes Robin through the Remainder branch to an exit. The inbox stays empty.',
      emails: []
    };
  }

  if (day === 4) {
    return {
      tokenNode: 'email-thankyou',
      visitedNodes: ['entry', 'wait-3d', 'email-thankyou'], visitedEdges: ['e1', 'e2'],
      dimNodes: [], dimEdges: [],
      comment: 'Email node: Activate sends the thank-you with care guidance for the ' + ROBIN_PURCHASE.name + '. The Sent branch opens.',
      emails: ['thankyou']
    };
  }

  if (day >= 5 && day < 34) {
    return {
      tokenNode: 'split-30d',
      visitedNodes: ['entry','wait-3d','email-thankyou','split-30d'], visitedEdges: ['e1','e2','e3'],
      dimNodes: [], dimEdges: [],
      comment: 'Engagement split: Activate watches whether Robin purchases again within 30 days. Journey is live; no messages go out until the split resolves.',
      emails: ['thankyou']
    };
  }

  // day >= 34
  if (bought30) {
    return {
      tokenNode: 'goal-1',
      visitedNodes: ['entry','wait-3d','email-thankyou','split-30d','goal-1'],
      visitedEdges: ['e1','e2','e3','e5'],
      dimNodes: ['product-split','coupon','email-offer','exit-2','split-14d','goal-2','update-profile','audience','exit-3'],
      dimEdges: ['e6','e7','e8','e9','e10','e11','e12','e13','e14'],
      comment: 'Robin bought again on day ' + buyDay + '. The split resolves YES — first goal reached. The offer email, coupon, and everything downstream were never sent, because the goal was already achieved.',
      emails: ['thankyou'],
      goalReached: 1
    };
  }

  if (day === 34) {
    return {
      tokenNode: 'split-30d',
      visitedNodes: ['entry','wait-3d','email-thankyou','split-30d'], visitedEdges: ['e1','e2','e3'],
      dimNodes: [], dimEdges: [],
      comment: 'Engagement split resolves: Robin has not purchased in 30 days. Split fires NO — the journey continues.',
      emails: ['thankyou']
    };
  }
  if (day === 35) {
    return {
      tokenNode: 'product-split',
      visitedNodes: ['entry','wait-3d','email-thankyou','split-30d','product-split'],
      visitedEdges: ['e1','e2','e3','e6'],
      dimNodes: [], dimEdges: [],
      comment: 'Product split: routing on what Robin bought (“' + ROBIN_PURCHASE.cat + '”). The next offer will be category-appropriate, not a generic blast.',
      emails: ['thankyou']
    };
  }
  if (day === 36) {
    return {
      tokenNode: 'coupon',
      visitedNodes: ['entry','wait-3d','email-thankyou','split-30d','product-split','coupon'],
      visitedEdges: ['e1','e2','e3','e6','e7'],
      dimNodes: [], dimEdges: [],
      comment: 'Coupon node: Activate generates a loyalty reward and attaches it to Robin’s profile, ready for the offer email.',
      emails: ['thankyou']
    };
  }

  var midV  = ['entry','wait-3d','email-thankyou','split-30d','product-split','coupon','email-offer'];
  var midE  = ['e1','e2','e3','e6','e7','e8'];

  if (day === 37) {
    return {
      tokenNode: 'email-offer',
      visitedNodes: midV, visitedEdges: midE,
      dimNodes: [], dimEdges: [],
      comment: 'Email node: Activate sends the next-purchase offer with the loyalty coupon and ' + ROBIN_PURCHASE.cat + '-matched recommendations.',
      emails: ['thankyou', 'offer']
    };
  }

  if (day >= 38 && day < 45) {
    if (bought14) {
      return {
        tokenNode: 'goal-2',
        visitedNodes: [...midV, 'split-14d', 'goal-2'],
        visitedEdges: [...midE, 'e9', 'e11'],
        dimNodes: ['update-profile','audience','exit-3'], dimEdges: ['e10','e12','e13','e14'],
        comment: 'Robin bought again on day ' + buyDay + '. The 14-day split resolves YES — second goal reached. No further messages.',
        emails: ['thankyou', 'offer'],
        goalReached: 2
      };
    }
    return {
      tokenNode: 'split-14d',
      visitedNodes: [...midV, 'split-14d'], visitedEdges: [...midE, 'e9'],
      dimNodes: [], dimEdges: [],
      comment: 'Engagement split: Activate watches whether Robin purchases within 14 days of the offer.',
      emails: ['thankyou', 'offer']
    };
  }

  // day >= 45
  if (bought14) {
    return {
      tokenNode: 'goal-2',
      visitedNodes: [...midV, 'split-14d', 'goal-2'],
      visitedEdges: [...midE, 'e9', 'e11'],
      dimNodes: ['update-profile','audience','exit-3'], dimEdges: ['e10','e12','e13','e14'],
      comment: 'The 14-day split resolves YES — second goal reached.',
      emails: ['thankyou', 'offer'],
      goalReached: 2
    };
  }

  return {
    tokenNode: 'exit-3',
    visitedNodes: [...midV, 'split-14d', 'update-profile', 'audience', 'exit-3'],
    visitedEdges: [...midE, 'e9', 'e12', 'e13', 'e14'],
    dimNodes: [], dimEdges: ['e10', 'e11'],
    comment: 'Split resolves NO. Update profile increments Robin’s loyalty score; Audience adds her to the repeat-customers segment; Exit. — This is a demo: in a live journey, the 30-day and 14-day waits run in real time.',
    emails: ['thankyou', 'offer']
  };
}

// ── UC17 page component ───────────────────────────────────────
window.UC_STAGE['followup-loyalty'] = function UC17Page() {
  var CE = React.createElement;
  var useState = React.useState;

  var _day = useState(0);     var day = _day[0];       var setDay = _day[1];
  var _buy = useState(null);  var buyDay = _buy[0];    var setBuyDay = _buy[1];
  var _nc  = useState(false); var noConsent = _nc[0];  var setNoConsent = _nc[1];
  var _bi  = useState('');    var buyInput = _bi[0];   var setBuyInput = _bi[1];

  var ds   = uc17ComputeState(day, buyDay, noConsent);
  var flow = FOLLOWUP_LOYALTY_FLOW;

  // Email content resolved from ROBIN_PURCHASE (no hard-coded SKUs in flow)
  var EMAIL_CONTENT = {
    thankyou: {
      from: 'Shopler <hello@shopler.com>',
      subject: 'Thank you, Robin — your ' + ROBIN_PURCHASE.name + ' is on its way',
      sentDay: 4,
      lines: [
        'Hi Robin,',
        'Your ' + ROBIN_PURCHASE.name + ' left our warehouse today.',
        'Care tip: ' + ROBIN_PURCHASE.care,
        'We’re so pleased you chose Shopler. Enjoy it!'
      ]
    },
    offer: {
      from: 'Shopler <hello@shopler.com>',
      subject: 'A little something for you, Robin — your loyalty reward inside',
      sentDay: 37,
      lines: [
        'Hi Robin,',
        'As a thank-you for shopping with us, here’s a loyalty reward: code LOYAL10 gives you 10% off your next order.',
        ROBIN_RECS[0] ? ('We think you’d love the ' + ROBIN_RECS[0].name + ' (€' + ROBIN_RECS[0].price + ') — a great match with your ' + ROBIN_PURCHASE.name + '.') : '',
        'Use LOYAL10 at checkout. Valid for 30 days.'
      ].filter(Boolean)
    }
  };

  var NAV1 = [
    { label: 'Dashboard',       icon: '⊞' },
    { label: 'Predictive AI',   icon: '★' },
    { label: 'Personalizations',icon: '▦' },
    { label: 'Journeys',        icon: '➡', active: true },
    { label: 'Lifecycles',      icon: '↺' },
  ];
  var NAV2 = [
    { label: 'Audiences',       icon: '●' },
    { label: 'Products',        icon: '□' },
    { label: '360° profiles', icon: '◌' },
    { label: 'Data',            icon: '▽' },
    { label: 'Apps',            icon: '△' },
  ];
  var PAL_ACTIONS = ['Email','Messaging','Audience','Webhook','Trigger','Update profile','Notification','Coupon'];
  var PAL_OTHER   = ['Wait','Wait until','A-B split','Visitor split','Audience split','Product split','Teleport','Engagement split'];

  // ── Activate sidebar ────────────────────────────────────────
  var sidebar = CE('div', { style: { width: 180, background: '#0a2540', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' } },
    CE('div', { style: { padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 } },
      CE('div', { style: { fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' } },
        CE('span', { style: { color: '#fff' } }, 'spotler'),
        CE('span', { style: { color: '#23afe6' } }, 'activate')
      )
    ),
    CE('div', { style: { padding: '6px 0', flexShrink: 0 } },
      ...NAV1.map(function(item) {
        return CE('div', { key: item.label, style: {
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          background: item.active ? '#16375a' : 'transparent',
          color: item.active ? '#fff' : 'rgba(255,255,255,0.72)',
          fontSize: 13, cursor: 'default', userSelect: 'none'
        }},
          CE('span', { style: { fontSize: 11, opacity: 0.8 } }, item.icon),
          item.label
        );
      })
    ),
    CE('div', { style: { height: 1, background: 'rgba(255,255,255,0.12)', margin: '2px 0', flexShrink: 0 } }),
    CE('div', { style: { padding: '6px 0', flex: 1, overflowY: 'auto' } },
      ...NAV2.map(function(item) {
        return CE('div', { key: item.label, style: {
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.72)', fontSize: 13, cursor: 'default', userSelect: 'none'
        }},
          CE('span', { style: { fontSize: 11, opacity: 0.8 } }, item.icon),
          item.label
        );
      })
    ),
    CE('div', { style: { padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 } },
      CE('div', { style: { color: '#fff', fontSize: 12, fontWeight: 600, marginBottom: 6 } }, 'Shopler'),
      CE('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1f5fc4', borderRadius: 100, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 700, cursor: 'default', marginBottom: 8 } }, '⇄ Switch merchant'),
      CE('div', { style: { color: 'rgba(255,255,255,0.45)', fontSize: 11 } }, 'Erik de Kock')
    )
  );

  // ── Editor header ───────────────────────────────────────────
  var editorHeader = CE('div', { style: { padding: '8px 12px', background: '#fff', borderBottom: '1px solid #e4eaf0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 } },
    CE('div', { style: { fontSize: 14, fontWeight: 700, color: '#1a2b3c' } }, 'Edit Journey'),
    CE('div', { style: { fontSize: 12, color: '#6b7a89', fontWeight: 400 } }, ' — Post-purchase & loyalty'),
    CE('div', { style: { marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' } },
      ['Notes','Settings','Save'].map(function(btn) {
        return CE('button', { key: btn, style: { border: '1px solid #d8dee4', background: '#fff', borderRadius: 5, padding: '3px 9px', fontSize: 11, fontWeight: 600, cursor: 'default', color: '#1a2b3c' } }, btn);
      }),
      CE('button', { style: { border: 'none', background: '#1f5fc4', borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'default', color: '#fff' } }, 'Save & Publish')
    )
  );

  // ── Node palette ─────────────────────────────────────────────
  function palNode(label, isAction) {
    var color = isAction ? '#1f5fc4' : '#f08a24';
    var shapeEl = isAction
      ? CE('div', { style: { width: 18, height: 18, background: color, borderRadius: 4, flexShrink: 0 } })
      : CE('svg', { width: 20, height: 20, style: { flexShrink: 0, overflow: 'visible' } },
          CE('polygon', { points: '10,1 19,10 10,19 1,10', fill: color })
        );
    return CE('div', { key: label, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 4px', gap: 3, cursor: 'default' } },
      shapeEl,
      CE('div', { style: { fontSize: 8.5, color: '#6b7a89', textAlign: 'center', lineHeight: 1.25, maxWidth: 72 } }, label)
    );
  }

  var palette = CE('div', { style: { width: 90, background: '#fff', borderRight: '1px solid #e4eaf0', overflowY: 'auto', flexShrink: 0, padding: '8px 0' } },
    CE('div', { style: { fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a89', padding: '0 8px 4px', borderBottom: '1px solid #f0f4f7', marginBottom: 2 } }, 'Actions'),
    ...PAL_ACTIONS.map(function(l) { return palNode(l, true); }),
    CE('div', { style: { fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a89', padding: '6px 8px 4px', borderTop: '1px solid #f0f4f7', borderBottom: '1px solid #f0f4f7', marginTop: 2, marginBottom: 2 } }, 'Other'),
    ...PAL_OTHER.map(function(l) { return palNode(l, false); })
  );

  // ── Journey canvas ────────────────────────────────────────
  var canvasEl = CE('div', { className: 'ucjrny-wrap', style: { flex: 1, overflow: 'auto', background: '#fafafa', position: 'relative' } },
    CE(UcJourneyCanvas, { flow: flow, ds: ds })
  );

  // ── Full left panel (Activate editor) ────────────────────
  var leftPanel = CE('div', { style: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' } },
    CE('div', { style: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' } },
      sidebar,
      CE('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' } },
        editorHeader,
        CE('div', { style: { flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' } },
          palette,
          canvasEl
        )
      )
    )
  );

  // ── Robin's order card ──────────────────────────────────────
  var orderCard = CE('div', { style: { background: '#fff', border: '1px solid #e4eaf0', borderRadius: 10, padding: '12px 16px', margin: '14px 16px 8px' } },
    CE('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a89', marginBottom: 8 } }, 'Trigger order — Day 0'),
    CE('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
      CE('div', { style: { width: 48, height: 48, background: ROBIN_PURCHASE.color, borderRadius: 8, flexShrink: 0 } }),
      CE('div', {},
        CE('div', { style: { fontWeight: 700, color: '#002a4d', fontSize: 13 } }, ROBIN_PURCHASE.name),
        CE('div', { style: { color: '#23afe6', fontWeight: 700, fontSize: 13 } }, '€' + ROBIN_PURCHASE.price),
        CE('div', { style: { color: '#6b7a89', fontSize: 11, marginTop: 2 } }, ROBIN.name + ' · ' + ROBIN.email)
      )
    )
  );

  // ── Goal notice ─────────────────────────────────────────────
  var goalNotice = ds.goalReached ? CE('div', { style: { margin: '0 16px 8px', padding: '10px 14px', background: '#e6f6ea', border: '1px solid #5cd975', borderRadius: 10 } },
    CE('div', { style: { fontWeight: 700, color: '#2f9e5f', fontSize: 13, marginBottom: 4 } }, '⚑ Goal reached — journey complete'),
    CE('div', { style: { fontSize: 12, color: '#1f2d3a', lineHeight: 1.5 } }, 'Robin already bought again. Every downstream message was not sent because it was no longer needed. Dimmed paths on the canvas show what was skipped.')
  ) : null;

  // ── Email inbox ─────────────────────────────────────────────
  var inboxItems = (ds.emails || []).map(function(key) {
    var em = EMAIL_CONTENT[key];
    if (!em) return null;
    return CE('div', { key: key, style: { background: '#fff', border: '1px solid #e4eaf0', borderRadius: 10, padding: '12px 14px', marginBottom: 8 } },
      CE('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 2 } },
        CE('div', { style: { fontSize: 10, color: '#6b7a89' } }, 'From: ', CE('strong', { style: { color: '#002a4d' } }, em.from)),
        CE('div', { style: { fontSize: 10, color: '#6b7a89' } }, 'Day ' + em.sentDay)
      ),
      CE('div', { style: { fontWeight: 700, color: '#002a4d', fontSize: 13, marginBottom: 10, lineHeight: 1.3 } }, em.subject),
      CE('div', { style: { background: '#fafcfd', borderRadius: 8, padding: '10px 12px', marginBottom: key === 'offer' && ROBIN_RECS.length ? 8 : 0 } },
        ...em.lines.map(function(line, i) {
          return CE('div', { key: i, style: { fontSize: 12, color: '#1f2d3a', marginBottom: 4, lineHeight: 1.5 } }, line);
        })
      ),
      key === 'offer' && ROBIN_RECS.length ? CE('div', { style: { display: 'flex', gap: 6, marginTop: 0 } },
        ...ROBIN_RECS.slice(0, 2).map(function(p) {
          return CE('div', { key: p.id, style: { flex: 1, background: '#f5f7fa', borderRadius: 8, padding: '8px', textAlign: 'center' } },
            CE('div', { style: { width: '100%', height: 34, background: p.color, borderRadius: 6, marginBottom: 4 } }),
            CE('div', { style: { fontSize: 11, fontWeight: 600, color: '#002a4d' } }, p.name),
            CE('div', { style: { fontSize: 11, color: '#23afe6', fontWeight: 700 } }, '€' + p.price)
          );
        })
      ) : null
    );
  });

  var inbox = inboxItems.length === 0
    ? CE('div', { style: { padding: '20px 16px', color: '#6b7a89', fontSize: 12, textAlign: 'center' } }, 'Inbox is empty — no emails sent yet.')
    : CE('div', { style: { padding: '0 16px 8px' } },
        CE('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7a89', marginBottom: 8, marginTop: 8 } }, 'Inbox — Robin Jansen'),
        ...inboxItems
      );

  // ── Robin buys again control ─────────────────────────────────
  var buyAgainCtrl = CE('div', { style: { padding: '12px 16px', borderTop: '1px solid #e4eaf0', background: '#fafcfd', flexShrink: 0 } },
    CE('div', { style: { fontSize: 11, fontWeight: 700, color: '#002a4d', marginBottom: 6 } }, 'Robin buys again on day …'),
    CE('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
      CE('input', {
        type: 'number', min: 1, max: 44, value: buyInput,
        onChange: function(e) { setBuyInput(e.target.value); },
        placeholder: 'e.g. 20',
        style: { width: 72, padding: '5px 8px', border: '1px solid #d8dee4', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }
      }),
      CE('button', {
        onClick: function() {
          var n = parseInt(buyInput, 10);
          if (!isNaN(n) && n >= 1 && n <= 44) setBuyDay(n);
        },
        style: { padding: '5px 12px', background: '#002a4d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }
      }, 'Set'),
      buyDay !== null ? CE('button', {
        onClick: function() { setBuyDay(null); setBuyInput(''); },
        style: { padding: '5px 10px', background: '#fff', color: '#6b7a89', border: '1px solid #e4eaf0', borderRadius: 6, fontSize: 11, cursor: 'pointer' }
      }, 'Clear') : null
    ),
    buyDay !== null ? CE('div', { style: { marginTop: 6, fontSize: 11, color: '#429b54', fontWeight: 700 } }, '✓ Robin buys again on day ' + buyDay + '. Set the scrubber past day ' + (buyDay <= 34 ? 5 : 38) + ' to see the split resolve.') : null
  );

  // ── Right panel assembled ────────────────────────────────────
  var rightPanel = CE('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    orderCard,
    goalNotice,
    CE('div', { style: { flex: 1, overflowY: 'auto' } }, inbox),
    buyAgainCtrl
  );

  // ── Top bar ──────────────────────────────────────────────────
  var bench = ucBenchmarkStr('followup-loyalty');
  var topbar = CE('div', { style: { background: '#fff', borderBottom: '1px solid #e4eaf0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 } },
    CE('a', { href: '#', style: { color: '#23afe6', fontWeight: 700, fontSize: 12, textDecoration: 'none' } }, '← Back to menu'),
    CE('div', { style: { width: 1, height: 18, background: '#e4eaf0' } }),
    CE('div', { style: { fontSize: 13, fontWeight: 700, color: '#002a4d' } }, ucNameStr('followup-loyalty')),
    CE('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 } },
      CE('span', { style: { fontSize: 20, fontWeight: 800, color: '#429b54', letterSpacing: '-0.02em' } }, bench.split(' ')[0]),
      CE('span', { style: { fontSize: 12, color: '#6b7a89' } }, bench.split(' ').slice(1).join(' '))
    )
  );

  // ── Timeline scrubber ────────────────────────────────────────
  var MARKERS = [0,3,4,5,34,35,36,37,38,45];
  var scrubber = CE('div', { style: { padding: '14px 20px 10px', background: '#fff', borderTop: '1px solid #e4eaf0', flexShrink: 0 } },
    CE('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      CE('div', { style: { flex: 1, minWidth: 200 } },
        CE('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
          CE('span', { style: { fontSize: 10, color: '#6b7a89', fontWeight: 700 } }, 'Day 0'),
          CE('span', { style: { fontSize: 12, fontWeight: 700, color: '#002a4d' } }, 'Day ' + day),
          CE('span', { style: { fontSize: 10, color: '#6b7a89', fontWeight: 700 } }, 'Day 45')
        ),
        CE('input', {
          type: 'range', min: 0, max: 45, value: day,
          className: 'uc17-range',
          onChange: function(e) { setDay(parseInt(e.target.value, 10)); },
          style: { width: '100%', accentColor: '#23afe6' }
        }),
        CE('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 3, position: 'relative' } },
          MARKERS.map(function(m) {
            return CE('div', { key: m, style: { fontSize: 9, color: m === day ? '#23afe6' : '#b0bcc6', fontWeight: m === day ? 700 : 400 } }, m);
          })
        )
      ),
      CE('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
        CE('button', {
          onClick: function() { setDay(function(d) { return Math.max(0, d - 1); }); },
          style: { width: 30, height: 30, border: '1px solid #e4eaf0', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, '‹'),
        CE('button', {
          onClick: function() { setDay(function(d) { return Math.min(45, d + 1); }); },
          style: { width: 30, height: 30, border: '1px solid #e4eaf0', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }, '›'),
        CE('label', { style: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, userSelect: 'none' } },
          CE('input', { type: 'checkbox', checked: noConsent, onChange: function(e) { setNoConsent(e.target.checked); } }),
          CE('span', { style: { color: '#1f2d3a', fontWeight: 600 } }, 'No email consent')
        )
      )
    )
  );

  // ── Commentary ───────────────────────────────────────────────
  var commentary = CE('div', { style: { padding: '8px 20px 10px', background: '#eef2f6', fontSize: 12, color: '#1f2d3a', lineHeight: 1.6, flexShrink: 0 } },
    CE('span', { style: { fontWeight: 700, color: '#002a4d' } }, 'Day ' + day + ': '),
    ds.comment || '…'
  );

  // ── Full page ────────────────────────────────────────────────
  return CE('div', { style: { height: '100vh', background: '#eef2f6', display: 'flex', flexDirection: 'column', fontFamily: "'Open Sans', system-ui, sans-serif", overflow: 'hidden' } },
    topbar,
    CE('div', { className: 'uc17-twin' },
      CE('div', { className: 'uc17-left' }, leftPanel),
      CE('div', { className: 'uc17-right' }, rightPanel)
    ),
    scrubber,
    commentary
  );
};
