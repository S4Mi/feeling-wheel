import { useMemo, useState } from 'react'
import { related } from '../data/wheel.js'
import { translate } from '../data/translations.js'
import './FeelingWheel.css'

const SIZE = 960
const CX = SIZE / 2
const CY = SIZE / 2
const RINGS = [
  { inner: 96, outer: 214 },
  { inner: 214, outer: 328 },
  { inner: 328, outer: 468 },
]

function polar(r, angle) {
  const a = ((angle - 90) * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function sectorPath(inner, outer, start, end) {
  const [x1, y1] = polar(outer, start)
  const [x2, y2] = polar(outer, end)
  const [x3, y3] = polar(inner, end)
  const [x4, y4] = polar(inner, start)
  const large = end - start > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`
}

function midAngle(seg) {
  return ((seg.start + seg.end) / 2 + 360) % 360
}

function tangentRotate(mid) {
  let rotate = mid
  if (rotate > 90 && rotate < 270) rotate += 180
  return rotate
}

function radialRotate(mid, x) {
  let rotate = mid - 90
  if (x < CX) rotate += 180
  return rotate
}

function fontSize(seg, r, translated, showBoth) {
  const arc = (Math.abs(seg.end - seg.start) * Math.PI) / 180 * r
  const longest = Math.max(seg.label.length, showBoth ? translated.length : 0, 4)
  if (seg.level === 2) {
    const radial = RINGS[2].outer - RINGS[2].inner
    const along = radial / (longest * 0.58)
    const across = arc * 0.42
    return Math.max(10, Math.min(15.5, along, across))
  }
  const max = seg.level === 0 ? 19 : 14
  const min = seg.level === 0 ? 12 : 10
  return Math.max(min, Math.min(max, (arc / longest) * 1.35))
}

function canFitTranslation(seg, translated) {
  if (!translated) return false
  const { inner, outer } = RINGS[seg.level]
  const r = (inner + outer) / 2
  const arc = (Math.abs(seg.end - seg.start) * Math.PI) / 180 * r
  const radial = outer - inner
  if (seg.level === 0) return true
  if (seg.level === 1) return arc > 78 && radial > 88 && translated.length <= 16
  return radial > 118 && translated.length <= 12 && arc > 42
}

function SliceLabel({ seg, translated, showBoth, ink }) {
  const { inner, outer } = RINGS[seg.level]
  const mid = midAngle(seg)
  const radial = outer - inner
  const isLeaf = seg.level === 2
  const rMain = showBoth
    ? inner + radial * (isLeaf ? 0.34 : 0.38)
    : (inner + outer) / 2
  const rAlt = inner + radial * (isLeaf ? 0.7 : 0.7)
  const [x, y] = polar(rMain, mid)
  const [tx, ty] = polar(rAlt, mid)
  const rotate = isLeaf ? radialRotate(mid, x) : tangentRotate(mid)
  const english = seg.level === 0 ? seg.label.toUpperCase() : seg.label
  const size = fontSize(seg, rMain, translated ?? '', showBoth)
  const tSize = Math.max(9, size * 0.82)

  return (
    <>
      <text
        className="slice-en"
        x={x}
        y={y}
        fill={ink}
        transform={`rotate(${rotate} ${x} ${y})`}
        fontSize={size}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {english}
      </text>
      {showBoth && (
        <text
          className="slice-tr"
          x={tx}
          y={ty}
          fill={ink}
          transform={`rotate(${rotate} ${tx} ${ty})`}
          fontSize={tSize}
          textAnchor="middle"
          dominantBaseline="middle"
          opacity="0.9"
        >
          {translated}
        </text>
      )}
    </>
  )
}

export default function FeelingWheel({
  segments,
  selectedIds,
  onToggle,
  lang,
  onHover,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const hovered = segments.find((s) => s.id === hoveredId) ?? null
  const hoverTranslation = hovered ? translate(hovered.label, lang) : null
  const showHoverCard = Boolean(hovered && hoverTranslation && !canFitTranslation(hovered, hoverTranslation))

  const byLevel = useMemo(() => {
    const groups = [[], [], []]
    for (const seg of segments) groups[seg.level].push(seg)
    return groups
  }, [segments])

  const hub =
    hovered ?? segments.find((s) => s.id === selectedIds[selectedIds.length - 1]) ?? null

  return (
    <div className="wheel-wrap">
      <svg
        className="wheel"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Interactive feelings wheel"
        onMouseLeave={() => setHoveredId(null)}
      >
        {byLevel.map((group) =>
          group.map((seg) => {
            const ring = RINGS[seg.level]
            const selected = selectedSet.has(seg.id)
            const relatedHover = related(hoveredId, seg.id)
            const lit = selected || relatedHover
            const dim =
              (hoveredId || selectedSet.size > 0) && !lit
            const translated = translate(seg.label, lang)
            const showBoth = canFitTranslation(seg, translated)
            return (
              <g
                key={seg.id}
                className={`slice${dim ? ' dim' : ''}${selected ? ' selected' : ''}${relatedHover ? ' on' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={seg.path.join(', ')}
                onMouseEnter={() => {
                  setHoveredId(seg.id)
                  onHover?.(seg.id)
                }}
                onClick={() => onToggle(seg.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onToggle(seg.id)
                  }
                }}
              >
                <path
                  d={sectorPath(ring.inner, ring.outer, seg.start, seg.end)}
                  fill={seg.color}
                  stroke="#fffdf8"
                  strokeWidth={selected ? 3.4 : seg.level === 0 ? 3 : 2.2}
                />
                <SliceLabel
                  seg={seg}
                  translated={translated}
                  showBoth={showBoth}
                  ink={seg.ink}
                />
              </g>
            )
          }),
        )}
        <circle cx={CX} cy={CY} r={RINGS[0].inner - 2} fill="#fffdf8" />
        <text className="hub-kicker" x={CX} y={CY - 14} textAnchor="middle">
          I feel
        </text>
        <text
          className="hub-word"
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fontSize={hub && hub.label.length > 12 ? 16 : 22}
        >
          {hub?.label ?? '…'}
        </text>
        {hub && translate(hub.label, lang) && (
          <text className="hub-tr" x={CX} y={CY + 34} textAnchor="middle">
            {translate(hub.label, lang)}
          </text>
        )}
      </svg>

      {showHoverCard && (
        <div className="hover-card" role="status">
          <strong>{hovered.label}</strong>
          <span>{hoverTranslation}</span>
        </div>
      )}
    </div>
  )
}
