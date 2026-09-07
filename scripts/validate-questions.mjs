// 题库结构校验：node scripts/validate-questions.mjs
import company from '../src/data/qs.company.js'
import genshin from '../src/data/qs.genshin.js'
import bh3 from '../src/data/qs.bh3.js'
import starrail from '../src/data/qs.starrail.js'
import zzz from '../src/data/qs.zzz.js'
import bh2 from '../src/data/qs.bh2.js'

const groups = { company, genshin, bh3, starrail, zzz, bh2 }
let errors = 0
const allQ = []

for (const [name, list] of Object.entries(groups)) {
  const seen = new Set()
  list.forEach((q, i) => {
    const tag = `${name}[${i}]`
    if (!q.q || !q.e) { console.error(`${tag} 缺少题目或解析`); errors++ }
    if (seen.has(q.q)) { console.error(`${tag} 题目重复: ${q.q}`); errors++ }
    seen.add(q.q)
    if (q.t === 'c') {
      if (!Array.isArray(q.o) || q.o.length !== 4) { console.error(`${tag} 选择题选项数不为4`); errors++ }
      if (!q.o || new Set(q.o).size !== q.o.length) { console.error(`${tag} 选项重复: ${q.q}`); errors++ }
      if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) { console.error(`${tag} 答案下标越界: ${q.q}`); errors++ }
      else if (q.q.includes('不是') && q.o[q.a] && false) { /* 语义无法校验，仅结构 */ }
    } else if (q.t === 'j') {
      if (typeof q.a !== 'boolean') { console.error(`${tag} 判断题答案必须是布尔值: ${q.q}`); errors++ }
    } else {
      console.error(`${tag} 未知类型: ${q.t}`); errors++
    }
    allQ.push({ ...q, category: name })
  })
  console.log(`${name}: ${list.length} 题`)
}

// 答案分布检查（选择题正确项不应集中在同一位置）
const dist = [0, 0, 0, 0]
for (const q of allQ) if (q.t === 'c') dist[q.a]++
const total = allQ.length
console.log(`总计: ${total} 题（选择 ${dist.reduce((a, b) => a + b, 0)} / 判断 ${total - dist.reduce((a, b) => a + b, 0)}）`)
console.log(`选择题答案分布 A/B/C/D: ${dist.join(' / ')}`)

if (errors) {
  console.error(`\n❌ 发现 ${errors} 个结构问题`)
  process.exit(1)
}
console.log('\n✅ 结构校验通过')
