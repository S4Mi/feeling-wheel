import {
  cambridgeUrl,
  getDefinition,
  merriamWebsterUrl,
} from '../data/definitions.js'
import { translate } from '../data/translations.js'
import './DefinitionPanel.css'

export default function DefinitionPanel({ segment, lang }) {
  if (!segment) {
    return (
      <section className="define" aria-live="polite">
        <p className="define-empty">
          Hover a slice to read the dictionary meaning. In session or homework,
          stay with a word until it fits what you notice in your body.
        </p>
      </section>
    )
  }

  const entry = getDefinition(segment.label)
  const tr = translate(segment.label, lang)

  return (
    <section className="define" aria-live="polite">
      <p className="define-kicker">Dictionary</p>
      <div className="define-head">
        <h2>{segment.label}</h2>
      </div>
      {tr && <p className="define-tr">{tr}</p>}
      <p className="define-path">{segment.path.join(' → ')}</p>

      {entry ? (
        <>
          {entry.groups.map((group) => (
            <div className="pos-group" key={group.pos}>
              <h3>{group.pos}</h3>
              <ol className="senses">
                {group.senses.map((sense) => (
                  <li key={sense.definition}>
                    <p>{sense.definition}</p>
                    {sense.examples?.map((example) => (
                      <p className="example" key={example}>
                        “{example}”
                      </p>
                    ))}
                    {sense.synonyms?.length > 0 && (
                      <p className="syns">
                        <span>Similar:</span> {sense.synonyms.join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p className="define-prompt">
            Does this match what you feel, or is a neighboring word closer?
          </p>
          <p className="define-links">
            <a href={merriamWebsterUrl(segment.label)} target="_blank" rel="noreferrer">
              Merriam-Webster
            </a>
            <a href={cambridgeUrl(segment.label)} target="_blank" rel="noreferrer">
              Cambridge
            </a>
          </p>
          <p className="define-source">
            In-app senses are from {entry.source}, the standard English lexicon
            used in language research. Open Merriam-Webster for the collegiate
            entry. This tool is for naming feelings in therapy or CBT/EFT
            homework — not a diagnosis.
          </p>
        </>
      ) : (
        <p className="define-empty">No dictionary entry for this label yet.</p>
      )}
    </section>
  )
}
