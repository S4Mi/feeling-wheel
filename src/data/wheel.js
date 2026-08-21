/** Core → secondary → tertiary, matching the attached wheel. Typos from the image are corrected. */
export const CORES = [
  {
    id: 'bad',
    label: 'Bad',
    color: '#e3c03c',
    children: [
      { label: 'Bored', children: ['Indifferent', 'Apathetic'] },
      { label: 'Busy', children: ['Pressured', 'Rushed'] },
      { label: 'Stressed', children: ['Overwhelmed', 'Out of control'] },
      { label: 'Tired', children: ['Sleepy', 'Unfocused'] },
    ],
  },
  {
    id: 'fearful',
    label: 'Fearful',
    color: '#ee9440',
    children: [
      { label: 'Scared', children: ['Helpless', 'Frightened'] },
      { label: 'Anxious', children: ['Overwhelmed', 'Worried'] },
      { label: 'Insecure', children: ['Inadequate', 'Inferior'] },
      { label: 'Weak', children: ['Worthless', 'Insignificant'] },
      { label: 'Rejected', children: ['Excluded', 'Persecuted'] },
      { label: 'Threatened', children: ['Nervous', 'Exposed'] },
    ],
  },
  {
    id: 'angry',
    label: 'Angry',
    color: '#e0524a',
    children: [
      { label: 'Let down', children: ['Betrayed', 'Resentful'] },
      { label: 'Humiliated', children: ['Disrespected', 'Ridiculed'] },
      { label: 'Bitter', children: ['Indignant', 'Violated'] },
      { label: 'Mad', children: ['Furious', 'Jealous'] },
      { label: 'Aggressive', children: ['Provoked', 'Hostile'] },
      { label: 'Frustrated', children: ['Infuriated', 'Annoyed'] },
      { label: 'Distant', children: ['Withdrawn', 'Numb'] },
      { label: 'Critical', children: ['Skeptical', 'Dismissive'] },
    ],
  },
  {
    id: 'disgusted',
    label: 'Disgusted',
    color: '#c44586',
    children: [
      { label: 'Disapproving', children: ['Judgmental', 'Embarrassed'] },
      { label: 'Disappointed', children: ['Appalled', 'Revolted'] },
      { label: 'Awful', children: ['Nauseated', 'Detestable'] },
      { label: 'Repelled', children: ['Horrified', 'Hesitant'] },
    ],
  },
  {
    id: 'sad',
    label: 'Sad',
    color: '#3a528c',
    children: [
      { label: 'Hurt', children: ['Embarrassed', 'Disappointed'] },
      { label: 'Depressed', children: ['Inferior', 'Empty'] },
      { label: 'Guilty', children: ['Ashamed', 'Remorseful'] },
      { label: 'Despair', children: ['Grief', 'Powerless'] },
      { label: 'Vulnerable', children: ['Victimized', 'Fragile'] },
      { label: 'Lonely', children: ['Isolated', 'Abandoned'] },
    ],
  },
  {
    id: 'happy',
    label: 'Happy',
    color: '#4eb8c8',
    children: [
      { label: 'Playful', children: ['Aroused', 'Cheeky'] },
      { label: 'Content', children: ['Free', 'Joyful'] },
      { label: 'Interested', children: ['Curious', 'Inquisitive'] },
      { label: 'Proud', children: ['Successful', 'Confident'] },
      { label: 'Accepted', children: ['Respected', 'Valued'] },
      { label: 'Powerful', children: ['Courageous', 'Creative'] },
      { label: 'Peaceful', children: ['Loving', 'Thankful'] },
      { label: 'Trusting', children: ['Sensitive', 'Intimate'] },
      { label: 'Optimistic', children: ['Hopeful', 'Inspired'] },
    ],
  },
  {
    id: 'surprised',
    label: 'Surprised',
    color: '#5aaa4e',
    children: [
      { label: 'Startled', children: ['Shocked', 'Dismayed'] },
      { label: 'Confused', children: ['Disillusioned', 'Perplexed'] },
      { label: 'Amazed', children: ['Astonished', 'Awe'] },
      { label: 'Excited', children: ['Eager', 'Energetic'] },
    ],
  },
]

const TINT = [0, 0.2, 0.42]

function mix(hex, white) {
  const n = Number.parseInt(hex.slice(1), 16)
  const mixC = (c) => Math.round(c + (255 - c) * white)
  const r = mixC((n >> 16) & 255)
  const g = mixC((n >> 8) & 255)
  const b = mixC(n & 255)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function ink(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum > 0.58 ? '#1a1714' : '#fffaf3'
}

export function related(a, b) {
  if (!a || !b) return false
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)
}

export function buildSegments(startDeg = -90) {
  const segments = []
  const coreSpan = 360 / CORES.length

  CORES.forEach((core, i) => {
    const c0 = startDeg + i * coreSpan
    const c1 = c0 + coreSpan
    const push = (id, label, level, start, end, path) => {
      const color = mix(core.color, TINT[level])
      segments.push({
        id,
        label,
        level,
        start,
        end,
        color,
        ink: ink(color),
        path,
      })
    }

    push(core.id, core.label, 0, c0, c1, [core.label])

    const midSpan = coreSpan / core.children.length
    core.children.forEach((mid, j) => {
      const m0 = c0 + j * midSpan
      const m1 = m0 + midSpan
      const midId = `${core.id}/${mid.label}`
      push(midId, mid.label, 1, m0, m1, [core.label, mid.label])

      const outSpan = midSpan / mid.children.length
      mid.children.forEach((out, k) => {
        const o0 = m0 + k * outSpan
        const o1 = o0 + outSpan
        push(`${midId}/${out}`, out, 2, o0, o1, [core.label, mid.label, out])
      })
    })
  })

  return segments
}
