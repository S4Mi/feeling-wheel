import { useEffect, useId, useRef, useState } from 'react'
import { LANGUAGES } from '../data/languages.js'
import './LanguageSelectionDropdown.css'

export default function LanguageSelectionDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const selected = LANGUAGES.find((lang) => lang.code === value) ?? LANGUAGES[0]

  useEffect(() => {
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="lang-dd" ref={rootRef}>
      <button
        type="button"
        className="lang-dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className="lang-dd-native">{selected.native}</span>
        <span className="lang-dd-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="lang-dd-list" id={listId} role="listbox" aria-label="Language">
          {LANGUAGES.map((lang) => (
            <li key={lang.code} role="none">
              <button
                type="button"
                role="option"
                aria-selected={lang.code === selected.code}
                className={lang.code === selected.code ? 'is-active' : undefined}
                onClick={() => {
                  onChange(lang.code)
                  setOpen(false)
                }}
              >
                <span className="lang-dd-native">{lang.native}</span>
                <span className="lang-dd-en">{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 3 3.8 6 3.8 9s-1.3 6-3.8 9c-2.5-3-3.8-6-3.8-9s1.3-6 3.8-9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}
