import { useEffect, useMemo, useState } from 'react'
import FeelingWheel from './components/FeelingWheel.jsx'
import LanguageSelectionDropdown from './components/LanguageSelectionDropdown.jsx'
import DefinitionPanel from './components/DefinitionPanel.jsx'
import { buildSegments } from './data/wheel.js'
import { translate } from './data/translations.js'
import './App.css'

export default function App() {
  const segments = useMemo(() => buildSegments(), [])
  const byId = useMemo(
    () => Object.fromEntries(segments.map((seg) => [seg.id, seg])),
    [segments],
  )
  const [lang, setLang] = useState('en')
  const [selectedIds, setSelectedIds] = useState([])
  const [focusId, setFocusId] = useState(null)
  const selected = selectedIds.map((id) => byId[id]).filter(Boolean)
  const focused = byId[focusId] ?? null

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function toggle(id) {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    )
  }

  return (
    <main className="page">
      <header className="intro">
        <div className="intro-copy">
          <h1>Feelings Wheel</h1>
          <p className="lede">
            Start in the center, then move outward. Hover for the meaning.
            Click a slice to keep it.
          </p>
        </div>
        <LanguageSelectionDropdown value={lang} onChange={setLang} />
      </header>

      <div className="workspace">
        <FeelingWheel
          segments={segments}
          selectedIds={selectedIds}
          onToggle={toggle}
          lang={lang}
          onHover={setFocusId}
        />
        <DefinitionPanel segment={focused} lang={lang} />
      </div>

      <section className="selection" aria-live="polite">
        {selected.length === 0 ? (
          <p className="hint">Click feelings to collect them here.</p>
        ) : (
          <>
            <div className="selection-head">
              <h2>
                Selected
                <span className="count">{selected.length}</span>
              </h2>
              <button type="button" className="clear" onClick={() => setSelectedIds([])}>
                Clear all
              </button>
            </div>
            <ul className="chips">
              {selected.map((seg) => {
                const tr = translate(seg.label, lang)
                return (
                  <li key={seg.id}>
                    <span
                      className="chip"
                      style={{ '--chip': seg.color }}
                      role="button"
                      tabIndex={0}
                      onClick={() => setFocusId(seg.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setFocusId(seg.id)
                        }
                      }}
                    >
                      <i />
                      <span className="chip-en">{seg.label}</span>
                      {tr && <span className="chip-tr">{tr}</span>}
                      <button
                        type="button"
                        className="chip-x"
                        aria-label={`Remove ${seg.label}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggle(seg.id)
                        }}
                      >
                        ×
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </main>
  )
}
