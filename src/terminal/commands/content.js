import { isPlaceholder } from '../../data/placeholders.js'

const out = (text, extra) => ({ type: 'out', text, ...extra })
const err = (text) => ({ type: 'err', text })
const range = (e) => `${e.start} - ${e.end}`

const sections = {
  about: (d) => d.about.map((t) => out(t)),
  experience: (d, args) => {
    if (!args[0]) return d.experience.map((e) => out(`${range(e)}  ${e.role}, ${e.company}  (id: ${e.id})`))
    const q = args[0].toLowerCase()
    const e = d.experience.find((x) => x.id === q || x.company.toLowerCase() === q)
    if (!e) return [err(`no such role: ${args[0]}. Try: ${d.experience.map((x) => x.id).join(', ')}`)]
    return [
      out(`${e.role}, ${e.company}  ${range(e)}`),
      ...e.bullets.map((b) => out(`- ${b}`)),
    ]
  },
  projects: (d) => d.projects.flatMap((p) => [
    out(`${p.name}  [${p.stack.join(', ')}]`),
    out(`  ${p.summary}`),
    ...(p.repo ? [out(`  ${p.repo}`, { href: p.repo })] : p.note ? [out(`  ${p.note}`)] : []),
  ]),
  skills: (d) => d.skills.map((s) => out(`${s.group}: ${s.items.join(', ')}`)),
  education: (d) => d.education.map((e) => out(`${e.school}  ${e.degree}  ${e.years}`)),
  contact: (d) => [
    out(`LinkedIn  ${d.links.linkedin}`, { href: d.links.linkedin }),
    out(`GitHub    ${d.links.github}`, { href: d.links.github }),
    out(`Repo      ${d.links.repo}`, { href: d.links.repo }),
    out(`Email     ${d.links.email}`, isPlaceholder(d.links.email) ? undefined : { href: `mailto:${d.links.email}` }),
  ],
}

const summaries = {
  about: 'about me',
  experience: 'career history; experience <id|company> for one role',
  projects: 'selected projects',
  skills: 'skills by group',
  education: 'education',
  contact: 'links and email',
}

const sectionCmds = Object.keys(sections).map((name) => ({
  name,
  summary: summaries[name],
  args: name === 'experience' ? (_p, ctx) => ctx.data.experience.map((e) => e.id) : undefined,
  run(args, ctx) {
    ctx.store.section = name
    return sections[name](ctx.data, args)
  },
}))

const files = { 'about.txt': 'about', 'skills.txt': 'skills', 'education.txt': 'education', 'contact.txt': 'contact', 'experience/': 'experience', 'projects/': 'projects' }

export const commands = [
  ...sectionCmds,
  { name: 'resume', summary: 'Resume / Save PDF (printable view)', run: (_a, ctx) => { ctx.store.mode = 'resume'; return [] } },
  { name: 'ls', summary: 'list files', run: () => [out(Object.keys(files).join('  '))] },
  {
    name: 'cat',
    summary: 'print a file: cat <file>',
    args: () => Object.keys(files),
    run(args, ctx) {
      const f = args[0]
      const key = Object.hasOwn(files, f) ? files[f] : Object.hasOwn(files, `${f}/`) ? files[`${f}/`] : undefined
      if (!key) return [err(`cat: ${f ?? ''}: No such file`)]
      ctx.store.section = key
      return sections[key](ctx.data, [])
    },
  },
]
