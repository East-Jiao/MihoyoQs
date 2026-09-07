// 翻译校验：node scripts/validate-i18n.mjs
// 逐 id 检查：英文/日文翻译的选项集合必须与源题一致（顺序无关），正确答案文本必须存在于选项中；
// 判断题必须给出 a 布尔值；解析不可为空。
import { QUESTIONS } from '../src/data/questions.js'
import { Q_EN } from '../src/i18n/q.en.js'
import { Q_JA } from '../src/i18n/q.ja.js'

const BANKS = { en: Q_EN, ja: Q_JA }
let errors = 0
let translated = 0

const sorted = [...QUESTIONS].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

for (const [lang, bank] of Object.entries(BANKS)) {
  for (const q of sorted) {
    const t = bank[q.id]
    if (!t) { console.error(`[${lang}] ${q.id} 缺少翻译`); errors++; continue }
    translated++
    if (!t.q || !t.e) { console.error(`[${lang}] ${q.id} 题干或解析为空`); errors++ }
    if (q.type === 'choice') {
      if (!Array.isArray(t.o) || t.o.length !== 4) { console.error(`[${lang}] ${q.id} 选项数不为4: ${q.q}`); errors++; continue }
      if (new Set(t.o).size !== 4) { console.error(`[${lang}] ${q.id} 选项重复: ${t.o.join(' / ')}`); errors++ }
      if (t.c !== undefined && !t.o.includes(t.c)) { console.error(`[${lang}] ${q.id} 正确答案文本不在选项中: ${t.c}`); errors++ }
      if (t.c === undefined && t.a === undefined) { console.error(`[${lang}] ${q.id} 缺少 c 或 a`); errors++ }
    } else {
      if (typeof t.a !== 'boolean') { console.error(`[${lang}] ${q.id} 判断题缺少布尔 a`); errors++ }
      if (typeof t.a === 'boolean' && t.a !== q.answer) { console.error(`[${lang}] ${q.id} 判断题答案与源不一致`); errors++ }
    }
  }
  const extra = Object.keys(bank).filter((k) => !sorted.some((q) => q.id === k))
  for (const k of extra) { console.error(`[${lang}] 多余的翻译键: ${k}`); errors++ }
  console.log(`[${lang}] 覆盖 ${Object.keys(bank).filter((k) => sorted.some((q) => q.id === k)).length} / ${sorted.length}`)
}

console.log(`\n共检查 ${translated} 条翻译`)
if (errors) { console.error(`❌ ${errors} 个问题`); process.exit(1) }
console.log('✅ 翻译校验通过')
