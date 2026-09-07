<script setup>
// 自绘的米游社风格图标：圆角方块 + 描改的"米"字星芒（横竖撇捺四笔 + 中心点），
// 为原创几何化设计，非官方 Logo 复制。
const props = defineProps({ size: { type: Number, default: 40 } })
const uid = 'ysg' + Math.random().toString(36).slice(2, 8)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" aria-hidden="true" class="ys-icon">
    <defs>
      <linearGradient :id="uid" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fc0f6" />
        <stop offset="1" stop-color="#1e7fd6" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="11" :fill="`url(#${uid})`" />
    <g stroke="#fff" stroke-width="4.4" stroke-linecap="round" fill="none">
      <path d="M24 9.5 V38.5" />
      <path d="M9.5 24 H38.5" />
      <path d="M14 14 L34 34" />
      <path d="M34 14 L14 34" />
    </g>
    <circle cx="24" cy="24" r="5.4" :fill="`url(#${uid})`" />
    <circle cx="24" cy="24" r="2.7" fill="#fff" />
  </svg>
</template>

<style scoped>
.ys-icon {
  display: block;
  filter: drop-shadow(0 2px 6px rgba(30, 127, 214, 0.35));
  border-radius: 22%;
}
</style>
