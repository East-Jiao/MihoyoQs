// ===== 题库入口 =====
// 各分类题目分别存放在 qs.*.js 中（紧凑格式：t 类型 / o 选项 / a 答案下标 / e 解析）。
// 题目依据米哈游官网、米游社、官方 Wiki（观测枢/开拓者笔记/绳网情报站/圣芙蕾雅档案馆）及
// 维基百科、萌娘百科等公开资料整理编写，均为客观事实题。
// 多语言：i18n/index.js 中按 id（分类-序号）提供中/英/日翻译；选项乱序在取题时进行。

import company from './qs.company.js'
import genshin from './qs.genshin.js'
import bh3 from './qs.bh3.js'
import starrail from './qs.starrail.js'
import zzz from './qs.zzz.js'
import bh2 from './qs.bh2.js'

export const CATEGORIES = [
  { id: 'company', name: '米哈游与米游社', short: '米哈游', icon: true, img: null, color: '#2ba3e8', desc: '公司历程、社区与作品年表' },
  { id: 'ys', name: '原神', short: '原神', img: '/img/paimon.jpg', color: '#57b28f', desc: '提瓦特七国与角色' },
  { id: 'bh3', name: '崩坏3', short: '崩坏3', img: '/img/kiana_bh3.png', color: '#8f6fe8', desc: '女武神与崩坏世界' },
  { id: 'sr', name: '崩坏：星穹铁道', short: '星穹铁道', img: '/img/march7th.png', color: '#3f8fd8', desc: '星穹列车与星神' },
  { id: 'zzz', name: '绝区零', short: '绝区零', img: '/img/anby.png', color: '#8bc34a', desc: '新艾利都与绳匠' },
  { id: 'bh2', name: '崩坏学园2', short: '崩学2', img: '/img/kiana_bh2.jpg', color: '#e8a23f', desc: '长空市与千羽学园' }
]

const SOURCES = { company, ys: genshin, bh3, sr: starrail, zzz, bh2 }

function build(cat, list) {
  return list.map((q, i) => ({
    id: `${cat}-${i}`,
    category: cat,
    type: q.t === 'j' ? 'judge' : 'choice',
    q: q.q,
    options: q.o ? [...q.o] : null,
    answer: q.a,
    explain: q.e
  }))
}

export const QUESTIONS = Object.entries(SOURCES).flatMap(([cat, list]) => build(cat, list))
