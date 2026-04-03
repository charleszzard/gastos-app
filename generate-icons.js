// Script para gerar ícones PWA sem dependências externas
// Executa com: node generate-icons.js

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.18

  // Background
  ctx.fillStyle = '#7c3aed'
  roundRect(ctx, 0, 0, size, size, r)
  ctx.fill()

  // Coin circle
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.48, size * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // R$ sign
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.38}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('R$', size * 0.5, size * 0.48)

  return canvas.toBuffer('image/png')
}

// Maskable icon: conteúdo centralizado dentro do safe zone (80% da área)
// O Android recorta o ícone em círculo/formas — o conteúdo deve ficar no centro
function drawMaskableIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background completo (sem border-radius — maskable precisa preencher tudo)
  ctx.fillStyle = '#7c3aed'
  ctx.fillRect(0, 0, size, size)

  // Coin circle (dentro do safe zone de 80%)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // R$ sign (dentro do safe zone)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.22}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('R$', size * 0.5, size * 0.5)

  return canvas.toBuffer('image/png')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const publicDir = join(__dirname, 'public')
writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192))
writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512))
writeFileSync(join(publicDir, 'icon-512-maskable.png'), drawMaskableIcon(512))
writeFileSync(join(publicDir, 'apple-touch-icon.png'), drawIcon(180))
console.log('✅ Ícones gerados em public/')
console.log('   - icon-192.png (any)')
console.log('   - icon-512.png (any)')
console.log('   - icon-512-maskable.png (maskable - Android adaptável)')
console.log('   - apple-touch-icon.png (iOS)')
