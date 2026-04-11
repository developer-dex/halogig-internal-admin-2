import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function FdpSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const dropRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const showSearch = options.length > 10;
  const filtered = showSearch
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const computeStyle = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const dropH = Math.min(260, window.innerHeight * 0.4);
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
    if (open && showSearch && searchRef.current) searchRef.current.focus();
    if (open && listRef.current) {
      const a = listRef.current.querySelector('.fdp-csel-opt--active');
      if (a) a.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  const handleSelect = (val) => { onChange(val); setOpen(false); setSearch(''); };

  return (
    <div
      className={`fdp-csel-wrap${disabled ? ' fdp-csel-wrap--disabled' : ''}`}
      ref={wrapRef}
    >
      <button
        type="button"
        className={`fdp-csel-trigger ${className}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setOpen(false); setSearch(''); }
          if ((e.key === 'Enter' || e.key === ' ') && !open) setOpen(true);
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`fdp-csel-value${!selected ? ' fdp-csel-placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`fdp-csel-arrow${open ? ' fdp-csel-arrow--open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && createPortal(
        <div ref={dropRef} className="fdp-csel-dropdown" role="listbox" style={style}>
          {showSearch && (
            <div className="fdp-csel-search-wrap">
              <input ref={searchRef} className="fdp-csel-search" placeholder="Search…" value={search}
                onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
            </div>
          )}
          <div className="fdp-csel-list" ref={listRef}>
            <div className={`fdp-csel-opt${!value ? ' fdp-csel-opt--active' : ''}`} role="option" onClick={() => handleSelect('')}>
              {placeholder}
            </div>
            {filtered.length === 0
              ? <div className="fdp-csel-empty">No results</div>
              : filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`fdp-csel-opt${String(opt.value) === String(value) ? ' fdp-csel-opt--active' : ''}`}
                  role="option"
                  onClick={() => handleSelect(String(opt.value))}
                >
                  {opt.label}
                </div>
              ))
            }
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
