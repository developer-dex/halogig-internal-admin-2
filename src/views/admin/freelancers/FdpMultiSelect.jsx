import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function FdpMultiSelect({
  selectedValues = [],
  onChange,
  options = [],
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const dropRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOptions = options.filter((o) => selectedValues.includes(String(o.value)));

  const computeStyle = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const dropH = Math.min(280, window.innerHeight * 0.4);
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < dropH + 8 && r.top > spaceBelow;

    setStyle(
      openUp
        ? { position: 'fixed', bottom: window.innerHeight - r.top + 4, left: r.left, width: r.width, zIndex: 99999 }
        : { position: 'fixed', top: r.bottom + 4, left: r.left, width: r.width, zIndex: 99999 }
    );
  };

  useLayoutEffect(() => { if (open) computeStyle(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = () => computeStyle();
    window.addEventListener('scroll', h, true);
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h, true); window.removeEventListener('resize', h); };
  }, [open]);

  useEffect(() => {
    const h = (e) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div
      className={`fdp-csel-wrap${disabled ? ' fdp-csel-wrap--disabled' : ''}`}
      ref={wrapRef}
    >
      {/* Trigger with chips inside */}
      <div
        className={`fdp-csel-trigger fdp-msel-trigger${open ? ' fdp-csel-trigger--open' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !open) setOpen(true);
          if (e.key === 'Escape') { setOpen(false); setSearch(''); }
        }}
      >
        <div className="fdp-msel-trigger-inner">
          {selectedOptions.length === 0
            ? <span className="fdp-csel-placeholder">{placeholder}</span>
            : (
              <div className="fdp-msel-chips-inline">
                {selectedOptions.map((opt) => (
                  <span key={opt.value} className="fdp-msel-chip">
                    {opt.label}
                    <button
                      type="button"
                      className="fdp-msel-chip-remove"
                      onClick={(e) => { e.stopPropagation(); onChange(String(opt.value), false); }}
                      aria-label={`Remove ${opt.label}`}
                    >×</button>
                  </span>
                ))}
              </div>
            )
          }
        </div>
        <svg className={`fdp-csel-arrow${open ? ' fdp-csel-arrow--open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, marginLeft: 8 }}>
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {open && createPortal(
        <div ref={dropRef} className="fdp-csel-dropdown" role="listbox" aria-multiselectable="true" style={style}>
          <div className="fdp-csel-search-wrap">
            <input ref={searchRef} className="fdp-csel-search" placeholder={searchPlaceholder} value={search}
              onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
          <div className="fdp-csel-list">
            {filtered.length === 0
              ? <div className="fdp-csel-empty">No results</div>
              : filtered.map((opt) => {
                const checked = selectedValues.includes(String(opt.value));
                return (
                  <label key={opt.value} className={`fdp-msel-opt${checked ? ' fdp-msel-opt--checked' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <span className={`fdp-msel-checkbox${checked ? ' fdp-msel-checkbox--checked' : ''}`}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" style={{ display: 'none' }} checked={checked} onChange={(e) => onChange(String(opt.value), e.target.checked)} />
                    <span className="fdp-msel-opt-label">{opt.label}</span>
                  </label>
                );
              })
            }
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
