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

  // -------- URL hash sync --------
  readHash() {
    const h = window.location.hash.replace(/^#/, '');
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

// ============================================================
// Demo module — Routes  #/usecase/:id
// ============================================================

// ─── Helpers ────────────────────────────────────────────────
function ucBenchmark(ucId, industry) {
  const d = window.USE_CASES;
  const u = d && d.use_cases && d.use_cases.find(function(x){ return x.id === ucId; });
  if (!u) return '';
  const m = u.metrics && (u.metrics[industry] || u.metrics.commerce);
  if (!m) return '';
  return m.value + ' ' + m.label;
}
function ucExample(ucId, industry) {
  const d = window.USE_CASES;
  const u = d && d.use_cases && d.use_cases.find(function(x){ return x.id === ucId; });
  if (!u) return '';
  return (u.examples && (u.examples[industry] || u.examples.commerce)) || '';
}

// ─── Catalogue helpers ───────────────────────────────────────
function _deriveSizes(p) {
  // Fallback for stale catalogues without .sizes
  const cat = (p.category || '').toLowerCase();
  if (cat === 'accessories') return ['One size'];
  return ['XS','S','M','L','XL'];
}
function _getSizes(p) { return (p.sizes && p.sizes.length) ? p.sizes : _deriveSizes(p); }

// ─── sidePanel — shared Activate 360° profile shell ─────────
// (currently rendered inline in uc08; stub kept for future use cases)
function sidePanel(config) { return config; }

// ─── STAGE ──────────────────────────────────────────────────
const STAGE = {
  // 17 stubs — filled by other sessions
  'email-capture': null, 'profile-enrichment': null,
  'email-recognition': null, 'rt-segmentation': null,
  'rec-onsite': null, 'rec-email': null,
  'abandoned-cart': null, 'browse-abandonment': null,
  'website-reminder': null, 'online-retargeting': null,
  'back-in-stock': null, 'pers-homepage': null,
  'persuasive-popups': null, 'persuasive-product': null,
  'rec-crosssell': null, 'followup-loyalty': null,
  'predictive-clv': null,

  // ── UC08 — Recommend similar products ─────────────────────
  'rec-matching': function(el) {
    el.className = 'demo-root';

    const P = (window.PRODUCTS || []);

    // ── Persona (derived from catalogue) ────────────────────
    const personaBrand    = 'Noreen';
    const personaCat      = 'Coats';
    const personaColour   = 'Black';
    const personaSize     = 'M';
    const personaEmail    = 'robin.jansen@example.com';
    const personaName     = 'Robin Jansen';
    const personaId       = '2';

    // Near-miss: highest-popularity coat, brand≠Noreen, colour≠Black, in_stock
    const nearMissPool = P.filter(function(p) {
      return p.category === personaCat &&
             p.brand !== personaBrand &&
             p.colour !== personaColour &&
             p.in_stock;
    }).sort(function(a, b) { return b.popularity - a.popularity; });
    const pdp = nearMissPool[0] ||
                P.filter(function(p) { return p.category === personaCat && p.in_stock; })
                 .sort(function(a, b) { return b.popularity - a.popularity; })[0] ||
                P[0];

    // ── Demo state (in memory only) ─────────────────────────
    const state = {
      filterSource: 'event',       // 'event' | 'profile' | 'both'
      selectionMethod: 'like',     // 'like' | 'crosssell'
      useProductRelations: true,   // true = rank by pdp relations; false = profile affinity
      maxProducts: 4,
      fallbackSet: 'most-sold',    // 'most-sold' | 'newest' | 'none'
      activeTab: 'product-sets',   // Activate panel tab
    };

    // ── Algorithm ───────────────────────────────────────────
    function _filterCandidates(s) {
      const base = P.filter(function(p) { return p.id !== pdp.id; });
      if (s.filterSource === 'event') {
        return base.filter(function(p) { return p.category === pdp.category; });
      }
      if (s.filterSource === 'profile') {
        return base.filter(function(p) {
          return p.brand === personaBrand && _getSizes(p).indexOf(personaSize) !== -1;
        });
      }
      // both
      return base.filter(function(p) {
        return p.category === pdp.category &&
               p.brand === personaBrand &&
               _getSizes(p).indexOf(personaSize) !== -1;
      });
    }

    function _scoreProduct(p, s) {
      let score = p.popularity;
      const pdpPairs = pdp.pairs_with || [];
      if (s.useProductRelations) {
        // rank by relationship to viewed product
        if (pdpPairs.indexOf(p.id) !== -1) score += 40;
        if (p.category === pdp.category) score += 20;
        if (p.brand === pdp.brand) score += 15;
        if (p.colour === pdp.colour) score += 10;
      } else {
        // rank by profile affinity
        if (p.brand === personaBrand) score += 40;
        if (p.category === personaCat) score += 25;
        if (p.colour === personaColour) score += 20;
        if (_getSizes(p).indexOf(personaSize) !== -1) score += 15;
      }
      if (p.in_stock) score += 5;
      return score;
    }

    function _getFallback(usedIds, s) {
      if (s.fallbackSet === 'none') return [];
      const candidates = P.filter(function(p) {
        return p.in_stock && p.id !== pdp.id && usedIds.indexOf(p.id) === -1;
      });
      if (s.fallbackSet === 'most-sold') {
        return candidates.sort(function(a, b) { return b.popularity - a.popularity; });
      }
      // newest — use reverse catalogue order as proxy
      return candidates.slice().reverse();
    }

    function _resolveGrid(s) {
      const candidates = _filterCandidates(s)
        .map(function(p) { return { p: p, score: _scoreProduct(p, s) }; })
        .sort(function(a, b) { return b.score - a.score; })
        .map(function(x) { return x.p; });

      const max = Math.max(0, Math.min(8, s.maxProducts));
      const primary = candidates.slice(0, max);
      const primaryIds = primary.map(function(p) { return p.id; });

      let fallbackItems = [];
      let fallbackCount = 0;
      if (primary.length < max && s.fallbackSet !== 'none') {
        const fb = _getFallback(primaryIds, s);
        fallbackItems = fb.slice(0, max - primary.length);
        fallbackCount = fallbackItems.length;
      }

      return {
        items: primary.concat(fallbackItems),
        matchedCount: primary.length,
        fallbackCount: fallbackCount,
        max: max,
      };
    }

    function _getMatchTags(p, s, isFallback) {
      const tags = [];
      if (isFallback) { return [{ type: 'fallback', label: 'fallback' }]; }
      if (p.category === pdp.category) tags.push({ type: 'category', label: 'same category' });
      if (p.brand === personaBrand)    tags.push({ type: 'brand',    label: 'your brand' });
      const sz = _getSizes(p);
      if (sz.indexOf(personaSize) !== -1) tags.push({ type: 'size', label: 'your size' });
      if (p.in_stock && p.stock > 5)  tags.push({ type: 'stock',    label: 'in stock' });
      if (p.in_stock && p.stock <= 5) tags.push({ type: 'lowstock', label: p.stock + ' left' });
      return tags;
    }

    // ── Rendering helpers ────────────────────────────────────
    function _priceHtml(p, cls) {
      const c = cls || 'uc08-rec-card-price';
      if (p.sale_price) {
        return '<span class="' + c + '">' +
               '<span class="' + c + '-old">€' + p.price.toFixed(2) + '</span>' +
               '<span class="' + c + '-sale">€' + p.sale_price.toFixed(2) + '</span>' +
               '</span>';
      }
      return '<span class="' + c + '">€' + p.price.toFixed(2) + '</span>';
    }

    function _cardHtml(p, tags, isEmpty) {
      if (isEmpty) {
        return '<div class="uc08-rec-card-empty">—</div>';
      }
      const tagsHtml = tags.map(function(t) {
        return '<span class="uc08-tag uc08-tag--' + t.type + '">' + t.label + '</span>';
      }).join('');
      return '<div class="uc08-rec-card">' +
        '<div class="uc08-rec-card-img" style="background:' + p.img_color + '"></div>' +
        '<div class="uc08-rec-card-body">' +
          '<div class="uc08-rec-card-brand">' + p.brand + '</div>' +
          '<div class="uc08-rec-card-name">' + p.name + '</div>' +
          _priceHtml(p, 'uc08-rec-card-price') +
          '<div class="uc08-rec-card-tags">' + tagsHtml + '</div>' +
        '</div>' +
      '</div>';
    }

    // ── Activate grid tile ────────────────────────────────────
    function _activeTileHtml(p) {
      return '<div class="uc08-act-product-tile">' +
        '<div class="uc08-act-product-tile-img" style="background:' + p.img_color + '">' +
          '<div class="uc08-act-product-tile-stock-dot' + (p.stock <= 5 ? ' low' : '') + '"></div>' +
        '</div>' +
        '<div class="uc08-act-product-tile-info">' +
          '<div class="uc08-act-product-tile-name">' + p.name + '</div>' +
          '<div class="uc08-act-product-tile-price">€' + (p.sale_price || p.price).toFixed(2) + '</div>' +
        '</div>' +
      '</div>';
    }

    // ── Resolution line ──────────────────────────────────────
    function _resolutionHtml(s, resolved) {
      const methodLabel  = s.selectionMethod === 'like' ? 'Items you may like' : 'Recommended for you';
      const rankLabel    = s.useProductRelations ? 'product relations' : 'profile behaviour';
      let filterDesc = '';
      if (s.filterSource === 'event')   filterDesc = 'filters from <span class="uc08-res-filter">event (category)</span>';
      else if (s.filterSource === 'profile') filterDesc = 'filters from <span class="uc08-res-filter">profile (brand, size)</span>';
      else filterDesc = 'filters from <span class="uc08-res-filter">event (category) + profile (brand, size)</span>';

      let tail = '';
      if (resolved.fallbackCount > 0) {
        const fbLabel = s.fallbackSet === 'most-sold' ? 'Most sold' : 'Newest arrivals';
        tail = ' → <span class="uc08-res-fallback">' + fbLabel + ' filled ' + resolved.fallbackCount + '</span>';
      }
      const emptySlots = resolved.max - resolved.items.length;
      if (emptySlots > 0 && s.fallbackSet === 'none') {
        tail = ' → <span class="uc08-res-empty">' + emptySlots + ' slot' + (emptySlots > 1 ? 's' : '') + ' empty (no fallback)</span>';
      }

      return '<span class="uc08-res-event">ViewContent · ' + pdp.id + '</span>' +
        ' → <span class="uc08-res-method">' + methodLabel + '</span>' +
        ' · ' + filterDesc +
        ' · ranked by ' + rankLabel +
        ' · max <span class="uc08-res-count">' + resolved.max + '</span>' +
        ' → <span class="uc08-res-count">' + resolved.matchedCount + '</span> matched' +
        tail +
        '<span class="uc08-res-honest">Demo simplification: one profile and ' + P.length + ' products; real Activate ranks across full populations with time-weighted decay.</span>';
    }

    // ── Main render (update dynamic parts only) ──────────────
    function _render() {
      const resolved = _resolveGrid(state);
      const grid = el.querySelector('#uc08-rec-grid');
      const actGrid = el.querySelector('#uc08-act-prod-grid');
      const resLine = el.querySelector('#uc08-resolution');
      const actMeta = el.querySelector('#uc08-act-set-meta');
      const actEmpty = el.querySelector('#uc08-act-empty-slots');

      // Recs grid
      if (grid) {
        grid.classList.add('uc08-rec-grid-animating');
        const cards = [];
        for (let i = 0; i < state.maxProducts; i++) {
          const item = resolved.items[i];
          if (!item) {
            cards.push('<div class="uc08-rec-card-empty">—</div>');
          } else {
            const isFb = i >= resolved.matchedCount;
            const tags = _getMatchTags(item, state, isFb);
            cards.push(_cardHtml(item, tags, false));
          }
        }
        grid.innerHTML = cards.join('');
        setTimeout(function() { grid.classList.remove('uc08-rec-grid-animating'); }, 250);
      }

      // Activate product-sets tab grid (must match right panel exactly)
      if (actGrid) {
        const tiles = resolved.items.map(function(p) { return _activeTileHtml(p); });
        actGrid.innerHTML = tiles.join('') || '<div class="uc08-act-empty-slots">No products resolved.</div>';
      }
      if (actEmpty) {
        const emptySlots = resolved.max - resolved.items.length;
        actEmpty.textContent = emptySlots > 0 ? emptySlots + ' slot' + (emptySlots > 1 ? 's' : '') + ' empty' : '';
      }

      // Set method meta chip
      if (actMeta) {
        const methodLabel = state.selectionMethod === 'like' ? 'Items you may like' : 'Recommended for you';
        actMeta.innerHTML =
          '<span class="uc08-act-set-chip">nl-NL</span>' +
          '<span class="uc08-act-set-chip">Method: ' + methodLabel + '</span>' +
          '<span class="uc08-act-set-chip">Filters: ' + state.filterSource + '</span>' +
          '<span class="uc08-act-set-chip">Max: ' + state.maxProducts + '</span>';
      }

      // Profile tab: highlight rows used as filters
      const useProfile = state.filterSource === 'profile' || state.filterSource === 'both';
      const useEvent   = state.filterSource === 'event'   || state.filterSource === 'both';
      el.querySelectorAll('[data-field]').forEach(function(row) {
        const field = row.dataset.field;
        let isActive = false;
        if ((field === 'favorite_brand_1' || field === 'favorite_size_1') && useProfile) isActive = true;
        row.classList.toggle('highlighted', isActive);
        const badge = row.querySelector('.uc08-act-filter-badge');
        if (badge) badge.style.display = isActive ? '' : 'none';
      });

      // Resolution line
      if (resLine) resLine.innerHTML = _resolutionHtml(state, resolved);

      // Controls description update (selection method)
      const methodDesc = el.querySelector('#uc08-method-desc');
      if (methodDesc) {
        methodDesc.textContent = state.selectionMethod === 'like'
          ? 'Ranks by what others viewed or carted after interacting with the same product (ViewContent, AddToCart).'
          : 'Ranks by products bought together in the same order — cross-sell (Purchase events).';
      }
      const relDesc = el.querySelector('#uc08-rel-desc');
      if (relDesc) {
        relDesc.textContent = state.useProductRelations
          ? 'On — ranking driven by this product\'s own relationships.'
          : 'Off — ranking driven by the visitor\'s overall profile behaviour.';
      }
    }

    // ── Nav SVG icons (inline, minimal) ─────────────────────
    function _icon(type) {
      const icons = {
        dashboard: '<polyline points="3 9 12 2 21 9"/><polyline points="9 22 9 12 15 12 15 22"/>',
        ai: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
        pers: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75"/>',
        journeys: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>',
        lifecycles: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
        audiences: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
        products: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',
        profiles: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        data: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
        apps: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      };
      return '<svg class="uc08-act-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (icons[type] || '') + '</svg>';
    }

    // ── Activate sidebar nav ─────────────────────────────────
    function _navItem(label, iconKey, isActive) {
      return '<div class="uc08-act-nav-item' + (isActive ? ' active' : '') + '">' +
        _icon(iconKey) +
        '<span>' + label + '</span>' +
      '</div>';
    }

    // ── Full page HTML ───────────────────────────────────────
    const ucData = (window.USE_CASES && window.USE_CASES.use_cases &&
                    window.USE_CASES.use_cases.find(function(u) { return u.id === 'rec-matching'; })) || {};
    const benchmarkStr = ucBenchmark('rec-matching', 'commerce');
    const exampleStr   = ucExample('rec-matching', 'commerce');

    el.innerHTML =
      '<div class="uc08-demo">' +

        // ── Header ──
        '<div class="uc08-header">' +
          '<a href="#" class="uc08-back">← Use Case Menu</a>' +
          '<div class="uc08-header-uc">' +
            '<span class="uc08-header-num">08</span>' +
            '<span class="uc08-header-name">' + (ucData.name || 'Recommend similar products') + '</span>' +
            '<span class="uc08-header-hook">' + (ucData.hook || 'When the first choice misses, show the next.') + '</span>' +
          '</div>' +
          (benchmarkStr ? '<div class="uc08-header-metric">' + benchmarkStr + '</div>' : '') +
        '</div>' +

        // ── Main panels ──
        '<div class="uc08-panels">' +

          // Left: Activate
          '<div class="uc08-panel-left">' +
            '<div class="uc08-activate">' +

              // Sidebar
              '<div class="uc08-act-sidebar">' +
                '<div class="uc08-act-logo">' +
                  '<span class="uc08-act-logo-spotler">spotler</span>' +
                  '<span class="uc08-act-logo-act">activate</span>' +
                '</div>' +
                '<nav class="uc08-act-nav">' +
                  _navItem('Dashboard', 'dashboard', false) +
                  _navItem('Predictive AI', 'ai', false) +
                  _navItem('Personalizations', 'pers', false) +
                  _navItem('Journeys', 'journeys', false) +
                  _navItem('Lifecycles', 'lifecycles', false) +
                  '<div class="uc08-act-nav-divider"></div>' +
                  _navItem('Audiences', 'audiences', false) +
                  _navItem('Products', 'products', false) +
                  _navItem('360° profiles', 'profiles', true) +
                  _navItem('Data', 'data', false) +
                  _navItem('Apps', 'apps', false) +
                '</nav>' +
                '<div class="uc08-act-bottom">' +
                  '<div class="uc08-act-merchant-name">Shopler</div>' +
                  '<div><button class="uc08-act-switch">⇄ Switch merchant</button></div>' +
                  '<div class="uc08-act-user">Erik de Kock</div>' +
                '</div>' +
              '</div>' +

              // Main area
              '<div class="uc08-act-main">' +
                '<div class="uc08-act-page-header">' +
                  '<div class="uc08-act-page-icon">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a2b3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                  '</div>' +
                  '<div class="uc08-act-page-title">360° profiles</div>' +
                '</div>' +

                // Profile card
                '<div class="uc08-act-profile-card">' +
                  '<div class="uc08-act-profile-header">' +
                    '<div class="uc08-act-avatar">RJ</div>' +
                    '<div>' +
                      '<div class="uc08-act-profile-name">' + personaName + '</div>' +
                      '<div class="uc08-act-chips">' +
                        '<span class="uc08-act-chip">' + personaEmail + '</span>' +
                        '<span class="uc08-act-chip">ID: ' + personaId + '</span>' +
                        '<span class="uc08-act-chip">Active 3 days ago</span>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +

                // Tabs
                '<div class="uc08-act-tabs">' +
                  '<button class="uc08-act-tab" data-tab="profile">Profile</button>' +
                  '<button class="uc08-act-tab" data-tab="predictive">Predictive AI</button>' +
                  '<button class="uc08-act-tab active" data-tab="product-sets">Product sets</button>' +
                  '<button class="uc08-act-tab" data-tab="activity">Activity</button>' +
                  '<button class="uc08-act-tab" data-tab="journeys">Journeys</button>' +
                  '<button class="uc08-act-tab" data-tab="audiences">Audiences</button>' +
                '</div>' +

                // Tab panels
                '<div class="uc08-act-tab-panels">' +

                  // Profile tab
                  '<div class="uc08-act-tab-panel" data-panel="profile">' +
                    '<div style="margin-bottom:10px;font-size:11px;font-weight:700;color:#6b7a89;text-transform:uppercase;letter-spacing:.08em">System fields</div>' +
                    '<table class="uc08-act-fields-table">' +
                      '<thead><tr><th>Name</th><th>Value</th><th>Last update</th></tr></thead>' +
                      '<tbody>' +
                        '<tr class="uc08-act-fields-row" data-field="favorite_brand_1">' +
                          '<td class="uc08-act-field-key">favorite_brand_1<span class="uc08-act-filter-badge" style="display:none">filter</span></td>' +
                          '<td class="uc08-act-field-val">' + personaBrand + '</td>' +
                          '<td class="uc08-act-field-time">2 days ago</td>' +
                        '</tr>' +
                        '<tr class="uc08-act-fields-row" data-field="favorite_category_1">' +
                          '<td class="uc08-act-field-key">favorite_category_1<span class="uc08-act-filter-badge" style="display:none">filter</span></td>' +
                          '<td class="uc08-act-field-val">' + personaCat + '</td>' +
                          '<td class="uc08-act-field-time">2 days ago</td>' +
                        '</tr>' +
                        '<tr class="uc08-act-fields-row" data-field="favorite_color_1">' +
                          '<td class="uc08-act-field-key">favorite_color_1</td>' +
                          '<td class="uc08-act-field-val">' + personaColour + '</td>' +
                          '<td class="uc08-act-field-time">5 days ago</td>' +
                        '</tr>' +
                        '<tr class="uc08-act-fields-row" data-field="favorite_size_1">' +
                          '<td class="uc08-act-field-key">favorite_size_1<span class="uc08-act-filter-badge" style="display:none">filter</span></td>' +
                          '<td class="uc08-act-field-val">' + personaSize + '</td>' +
                          '<td class="uc08-act-field-time">2 days ago</td>' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                    (exampleStr ? '<div style="margin-top:14px;padding:10px 12px;background:#f7f9fb;border-radius:6px;font-size:11px;color:#4a5568;font-style:italic">' + exampleStr + '</div>' : '') +
                  '</div>' +

                  // Predictive AI tab (inert)
                  '<div class="uc08-act-tab-panel" data-panel="predictive">' +
                    '<div style="font-size:12px;color:#6b7a89;padding:16px 0">Predictive scores not shown in this demo.</div>' +
                  '</div>' +

                  // Product sets tab (ACTIVE — synced with right panel)
                  '<div class="uc08-act-tab-panel active" data-panel="product-sets">' +
                    '<div id="uc08-act-set-meta" class="uc08-act-set-meta"></div>' +
                    '<div id="uc08-act-prod-grid" class="uc08-act-product-grid"></div>' +
                    '<div id="uc08-act-empty-slots" class="uc08-act-empty-slots"></div>' +
                  '</div>' +

                  // Activity tab
                  '<div class="uc08-act-tab-panel" data-panel="activity">' +
                    '<div class="uc08-act-activity-row">' +
                      '<div class="uc08-act-activity-dot"></div>' +
                      '<div>' +
                        '<div class="uc08-act-activity-event">ViewContent</div>' +
                        '<div class="uc08-act-activity-meta">' +
                          '<span class="uc08-act-activity-sku">' + pdp.id + '</span>' +
                          ' &nbsp;' + pdp.name + ' · €' + pdp.price.toFixed(2) + ' · Just now' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="uc08-act-activity-row">' +
                      '<div class="uc08-act-activity-dot" style="background:#dde4ea"></div>' +
                      '<div>' +
                        '<div class="uc08-act-activity-event" style="color:#8fa0b0">ViewContent</div>' +
                        '<div class="uc08-act-activity-meta">NR-W-001 &nbsp;Noreen Classic Wool Coat · 2 days ago</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="uc08-act-activity-row">' +
                      '<div class="uc08-act-activity-dot" style="background:#dde4ea"></div>' +
                      '<div>' +
                        '<div class="uc08-act-activity-event" style="color:#8fa0b0">ViewContent</div>' +
                        '<div class="uc08-act-activity-meta">NR-K-001 &nbsp;Noreen Merino Rollneck · 3 days ago</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +

                  // Journeys / Audiences (inert)
                  '<div class="uc08-act-tab-panel" data-panel="journeys"><div style="font-size:12px;color:#6b7a89;padding:16px 0">Not shown in this demo.</div></div>' +
                  '<div class="uc08-act-tab-panel" data-panel="audiences"><div style="font-size:12px;color:#6b7a89;padding:16px 0">Not shown in this demo.</div></div>' +

                '</div>' + // tab-panels
              '</div>' + // act-main
            '</div>' + // activate
          '</div>' + // panel-left

          // Right: Shopler PDP
          '<div class="uc08-panel-right">' +
            '<div class="uc08-shopler">' +

              // Browser chrome
              '<div class="uc08-shop-browser">' +
                '<div class="uc08-shop-browser-dot" style="background:#ff5f57"></div>' +
                '<div class="uc08-shop-browser-dot" style="background:#febc2e"></div>' +
                '<div class="uc08-shop-browser-dot" style="background:#28c840"></div>' +
                '<div class="uc08-shop-browser-bar">shopler.com/coats/' + pdp.id.toLowerCase() + '</div>' +
              '</div>' +

              // Shopler nav
              '<div class="uc08-shop-nav">' +
                '<div class="uc08-shop-logo">Shop<span>ler</span></div>' +
                '<div class="uc08-shop-nav-links">' +
                  '<a class="uc08-shop-nav-link" href="#">Women</a>' +
                  '<a class="uc08-shop-nav-link active" href="#">Coats</a>' +
                  '<a class="uc08-shop-nav-link" href="#">Knitwear</a>' +
                  '<a class="uc08-shop-nav-link" href="#">Dresses</a>' +
                '</div>' +
              '</div>' +

              // Breadcrumb
              '<div class="uc08-shop-breadcrumb">' +
                '<a href="#">Women</a><span>›</span><a href="#">Coats</a><span>›</span><span>' + pdp.name + '</span>' +
              '</div>' +

              // PDP
              '<div class="uc08-pdp">' +
                '<div class="uc08-pdp-img" style="background:' + pdp.img_color + '">' +
                  '<div class="uc08-pdp-stock-badge">Only ' + pdp.stock + ' left</div>' +
                '</div>' +
                '<div class="uc08-pdp-info">' +
                  '<div class="uc08-pdp-brand">' + pdp.brand + '</div>' +
                  '<div class="uc08-pdp-name">' + pdp.name + '</div>' +
                  '<div>€<span class="uc08-pdp-price">' + pdp.price.toFixed(2) + '</span></div>' +
                  '<div class="uc08-pdp-attr"><strong>Colour</strong> ' + pdp.colour + '</div>' +
                  '<div class="uc08-pdp-attr"><strong>Material</strong> ' + pdp.material + '</div>' +
                  '<div class="uc08-pdp-attr"><strong>Size</strong>' +
                    '<div class="uc08-pdp-sizes">' +
                      (pdp.sizes || []).map(function(s) {
                        return '<div class="uc08-pdp-size-btn' + (s === 'M' ? ' selected' : '') + '">' + s + '</div>';
                      }).join('') +
                    '</div>' +
                  '</div>' +
                  '<div class="uc08-pdp-stock">Only ' + pdp.stock + ' left</div>' +
                  '<button class="uc08-pdp-cta">Add to bag</button>' +
                '</div>' +
              '</div>' +

              // Recommendations grid
              '<div class="uc08-recs">' +
                '<div class="uc08-recs-heading">' +
                  'You might also like' +
                  '<span class="uc08-recs-heading-sub">Powered by Activate</span>' +
                '</div>' +
                '<div id="uc08-rec-grid" class="uc08-rec-grid"></div>' +
              '</div>' +

            '</div>' + // shopler
          '</div>' + // panel-right

        '</div>' + // panels

        // ── Controls strip ──
        '<div class="uc08-controls">' +
          '<div class="uc08-controls-label">Configured under Products → Product sets in Spotler Activate</div>' +
          '<div class="uc08-controls-row">' +

            // Filter source (primary)
            '<div class="uc08-ctrl-group">' +
              '<div class="uc08-ctrl-group-label">Filter source</div>' +
              '<div class="uc08-filter-toggle">' +
                '<button class="uc08-filter-btn active" data-filter="event">From event</button>' +
                '<button class="uc08-filter-btn" data-filter="profile">From profile</button>' +
                '<button class="uc08-filter-btn" data-filter="both">Both</button>' +
              '</div>' +
            '</div>' +

            // Selection method
            '<div class="uc08-ctrl-group">' +
              '<div class="uc08-ctrl-group-label">Selection method</div>' +
              '<div class="uc08-method-toggle">' +
                '<button class="uc08-method-btn active" data-method="like">Items you may like</button>' +
                '<button class="uc08-method-btn" data-method="crosssell">Recommended for you</button>' +
              '</div>' +
              '<div id="uc08-method-desc" class="uc08-ctrl-desc"></div>' +
            '</div>' +

            // Recommend based on products
            '<div class="uc08-ctrl-group">' +
              '<div class="uc08-ctrl-group-label">Recommend based on products</div>' +
              '<div class="uc08-toggle-row">' +
                '<label class="uc08-toggle">' +
                  '<input type="checkbox" id="uc08-rel-toggle" checked>' +
                  '<span class="uc08-toggle-slider"></span>' +
                '</label>' +
                '<span class="uc08-toggle-label" id="uc08-rel-label">On</span>' +
              '</div>' +
              '<div id="uc08-rel-desc" class="uc08-ctrl-desc"></div>' +
            '</div>' +

            // Max products
            '<div class="uc08-ctrl-group">' +
              '<div class="uc08-ctrl-group-label">Max products</div>' +
              '<input type="number" id="uc08-max-input" class="uc08-max-input" min="2" max="8" value="4">' +
            '</div>' +

            // Fallback set
            '<div class="uc08-ctrl-group">' +
              '<div class="uc08-ctrl-group-label">Fallback set</div>' +
              '<select id="uc08-fallback-select" class="uc08-fallback-select">' +
                '<option value="most-sold">Most sold</option>' +
                '<option value="newest">Newest arrivals</option>' +
                '<option value="none">None</option>' +
              '</select>' +
            '</div>' +

          '</div>' + // controls-row
        '</div>' + // controls

        // ── Resolution line ──
        '<div id="uc08-resolution" class="uc08-resolution"></div>' +

      '</div>'; // uc08-demo

    // ── Wire controls ────────────────────────────────────────
    // Filter source buttons
    el.querySelectorAll('[data-filter]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.filterSource = btn.dataset.filter;
        el.querySelectorAll('[data-filter]').forEach(function(b) {
          b.classList.toggle('active', b === btn);
        });
        _render();
      });
    });

    // Selection method buttons
    el.querySelectorAll('[data-method]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.selectionMethod = btn.dataset.method;
        el.querySelectorAll('[data-method]').forEach(function(b) {
          b.classList.toggle('active', b === btn);
        });
        _render();
      });
    });

    // Recommend based on products toggle
    var relToggle = el.querySelector('#uc08-rel-toggle');
    var relLabel  = el.querySelector('#uc08-rel-label');
    if (relToggle) {
      relToggle.addEventListener('change', function() {
        state.useProductRelations = relToggle.checked;
        if (relLabel) relLabel.textContent = relToggle.checked ? 'On' : 'Off';
        _render();
      });
    }

    // Max products
    var maxInput = el.querySelector('#uc08-max-input');
    if (maxInput) {
      maxInput.addEventListener('input', function() {
        var v = parseInt(maxInput.value, 10);
        if (!isNaN(v) && v >= 2 && v <= 8) {
          state.maxProducts = v;
          _render();
        }
      });
    }

    // Fallback select
    var fbSelect = el.querySelector('#uc08-fallback-select');
    if (fbSelect) {
      fbSelect.addEventListener('change', function() {
        state.fallbackSet = fbSelect.value;
        _render();
      });
    }

    // Activate tab switching (Profile · Predictive AI · Activity · Product sets · Journeys · Audiences)
    el.querySelectorAll('.uc08-act-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        el.querySelectorAll('.uc08-act-tab').forEach(function(t) { t.classList.remove('active'); });
        el.querySelectorAll('.uc08-act-tab-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = el.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (panel) panel.classList.add('active');
      });
    });

    // Initial render
    _render();
  }, // end 'rec-matching'
}; // end STAGE

// ─── Routing ────────────────────────────────────────────────
let _appRoot = null;

function _mountMainApp() {
  const ni = document.querySelector('meta[name="robots"]');
  if (ni) ni.remove();
  if (!_appRoot) {
    _appRoot = ReactDOM.createRoot(document.getElementById('root'));
  }
  _appRoot.render(React.createElement(App));
}

function _renderDemo(ucId) {
  const el = document.getElementById('root');
  el.innerHTML = '';
  el.className = '';
  // Noindex
  let ni = document.querySelector('meta[name="robots"]');
  if (!ni) { ni = document.createElement('meta'); ni.name = 'robots'; document.head.appendChild(ni); }
  ni.setAttribute('content', 'noindex');
  const fn = STAGE[ucId];
  if (fn) {
    fn(el);
  } else {
    el.innerHTML = '<div style="padding:40px;font-family:system-ui;color:#6b7a89">' +
      '<h2 style="color:#002a4d">UC ' + ucId + '</h2>' +
      '<p>Demo coming soon — this is a placeholder for another session.</p>' +
      '<a href="#" style="color:#23afe6;font-weight:700">← Back to Use Case Menu</a>' +
      '</div>';
  }
}

function _route() {
  const h = window.location.hash;
  if (h.startsWith('#/usecase/')) {
    const ucId = h.slice('#/usecase/'.length).split('/')[0].split('?')[0];
    if (_appRoot) { _appRoot.unmount(); _appRoot = null; }
    _renderDemo(ucId);
  } else {
    document.getElementById('root').innerHTML = '';
    _mountMainApp();
  }
}

window.addEventListener('hashchange', _route);
_route();
