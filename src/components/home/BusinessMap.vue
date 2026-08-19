<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const el = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null

const POSITION: [number, number] = [4.8739568, -75.6294321]
const ADDRESS = 'Cra 23 # 18-87, La Hermosa'

onMounted(() => {
  if (!el.value) return
  map = L.map(el.value, {
    center: POSITION,
    zoom: 17,
    scrollWheelZoom: false,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    subdomains: 'abcd',
  }).addTo(map)

  const icon = L.divIcon({
    className: '',
    html: '<span class="bb-pin"></span>',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -42],
  })

  const marker = L.marker(POSITION, { icon }).addTo(map)
  marker.bindPopup(
    `<div class="bb-popup"><strong>THE BOSS BARBER</strong><span>${ADDRESS}</span></div>`,
    { closeButton: false, offset: [0, -2] },
  )
  marker.openPopup()
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="el" class="bb-map absolute inset-0 h-full w-full" role="region" aria-label="Mapa de The Boss Barber" />
</template>

<style>
.bb-map .leaflet-control-attribution {
  display: none;
}
.bb-map .leaflet-control-zoom a {
  color: #fff;
  background: #141414;
  border: 1px solid #2a2a2a;
}
.bb-map .leaflet-control-zoom a:hover {
  background: #1a1a1a;
}
.bb-map .leaflet-control-zoom {
  border: none;
  box-shadow: none;
}
.bb-map .leaflet-container {
  background: #0d0d0d;
  font-family: Manrope, system-ui, sans-serif;
}
.bb-pin {
  display: block;
  width: 44px;
  height: 44px;
  background: #e10600;
  border: 3px solid #fff;
  border-radius: 0 50% 50% 50%;
  transform: rotate(45deg);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55);
}
.bb-popup {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-top: 3px solid #e10600;
  padding: 12px 14px;
  color: #fff;
  font-family: Manrope, system-ui, sans-serif;
  line-height: 1.4;
}
.bb-popup strong {
  display: block;
  font-size: 12px;
  letter-spacing: 0.14em;
}
.bb-popup span {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #a3a3a3;
}
.leaflet-popup-content-wrapper {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}
.leaflet-popup-content {
  margin: 0;
}
.leaflet-popup-tip {
  background: #e10600;
}
</style>