import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ====== SONIDO: muu sintetizado con Web Audio (sin archivos) ====== */
let _ctx = null
function getCtx() {
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) _ctx = new AC()
  }
  return _ctx
}

function playMuu(pitch = 1) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  const t = ctx.currentTime
  const base = 175 * pitch

  const o1 = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  o1.type = 'sawtooth'
  o2.type = 'sine'
  // contorno de un "muuuu": baja, sube un toque y cae
  o1.frequency.setValueAtTime(base, t)
  o1.frequency.linearRampToValueAtTime(base * 0.78, t + 0.18)
  o1.frequency.linearRampToValueAtTime(base * 0.92, t + 0.42)
  o1.frequency.linearRampToValueAtTime(base * 0.6, t + 0.7)
  o2.frequency.setValueAtTime(base * 0.5, t)
  o2.frequency.linearRampToValueAtTime(base * 0.42, t + 0.7)

  // vibrato (que tiemble como mugido)
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 13
  lfoGain.gain.value = 9
  lfo.connect(lfoGain)
  lfoGain.connect(o1.frequency)

  // filtro para que suene apagado/animal
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(1100, t)
  lp.frequency.linearRampToValueAtTime(600, t + 0.7)

  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.05)
  g.gain.setValueAtTime(0.08, t + 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85)

  o1.connect(lp)
  o2.connect(lp)
  lp.connect(g)
  g.connect(ctx.destination)

  o1.start(t)
  o2.start(t)
  lfo.start(t)
  o1.stop(t + 0.9)
  o2.stop(t + 0.9)
  lfo.stop(t + 0.9)
}

/* ====== AUDIOS RANDOM (clic) ====== */
const AUDIOS = [
  '/audios/LFG_1.mp3',
  '/audios/LFG_2.mp3',
  '/audios/LFG_3.mp3',
  '/audios/LFG_4.mp3',
  '/audios/LFG_5.mp3',
]

function playRandomAudio() {
  const src = AUDIOS[Math.floor(Math.random() * AUDIOS.length)]
  const a = new Audio(src)
  a.volume = 0.9
  a.play().catch(() => {})
}

/* ====== datos del evento ====== */
const FORM_URL = 'https://forms.gle/XAq3VHx8tKjGgSWKA'
const CAL_URL = 'https://calendar.app.google/iuM8KzGJtKKAY22P9'
const EVENTO = new Date('2026-06-27T23:59:00')

const FOTOS_DAFO = ['/images/dafo-auto.jpeg', '/images/dafo-dormido.jpeg']
const FOTOS_GALERIA = [
  '/images/dafo-auto.jpeg',
  '/images/dafo-dormido.jpeg',
  '/images/grupo-noche.jpeg',
  '/images/pareja.jpeg',
  '/images/chicas.jpeg',
  '/images/pose.jpeg',
  '/images/planta.jpeg',
]

const EMOJIS = ['🥛', '🐄', '⚗️', '🧪', '🧬', '🥼', '🔬', '💊', '🧫', '✨', '⭐', '🌟', '🫧', '🧀']

const FRASES_MARQUESINA =
  'RECIBIMIENTO DAFO ★ INGENIEROS QUÍMICOS SUELTOS ★ MÁS LECHE POR FAVOR 🥛 ★ PONEMOS CORTE Y HIELO ★ VOS TRAÉ EL ALCOHOL (C₂H₅OH) ★ 27 DE JUNIO 23:59 ★ '

const ELEMENTOS_DAFO = [
  { num: 6, sim: 'Da', nom: 'Dafonio' },
  { num: 47, sim: 'A', nom: 'Alcoholato' },
  { num: 26, sim: 'F', nom: 'Fiestium' },
  { num: 8, sim: 'O', nom: 'Obvio' },
]

/* posicionamiento pseudo-aleatorio estable por índice */
function rand(seed) {
  const x = Math.sin(seed * 99.13) * 10000
  return x - Math.floor(x)
}

function Contador() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, EVENTO - ahora)
  const dias = Math.floor(diff / 86400000)
  const horas = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const segs = Math.floor((diff % 60000) / 1000)

  const llegó = diff === 0
  if (llegó) {
    return (
      <div className="seccion-titulo">🎉 ¡YA EMPEZÓ, VENÍ CORRIENDO! 🎉</div>
    )
  }

  return (
    <div className="contador">
      <div className="caja"><div className="n">{dias}</div><div className="l">días</div></div>
      <div className="caja"><div className="n">{String(horas).padStart(2, '0')}</div><div className="l">horas</div></div>
      <div className="caja"><div className="n">{String(mins).padStart(2, '0')}</div><div className="l">min</div></div>
      <div className="caja"><div className="n">{String(segs).padStart(2, '0')}</div><div className="l">seg de leche</div></div>
    </div>
  )
}

function CosasFlotando() {
  // emojis flotando
  const emojis = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        emoji: EMOJIS[i % EMOJIS.length],
        left: rand(i + 1) * 95,
        top: rand(i + 50) * 90,
        dur: 4 + rand(i + 7) * 6,
        delay: rand(i + 3) * 4,
        size: 2 + rand(i + 11) * 2.5,
      })),
    [],
  )

  // lluvia de leche (gotas/cartones cayendo)
  const lluvia = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        emoji: ['🥛', '💧', '🐄', '🍼'][i % 4],
        left: rand(i + 200) * 98,
        dur: 5 + rand(i + 17) * 7,
        delay: rand(i + 31) * 8,
        size: 1.5 + rand(i + 5) * 2,
      })),
    [],
  )

  // cabezas de dafo — SOLO en los márgenes para no pisar el texto
  const cabezas = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const derecha = i % 2 === 0
        return {
          src: FOTOS_DAFO[i % FOTOS_DAFO.length],
          left: derecha ? 82 + rand(i + 300) * 14 : rand(i + 300) * 12,
          top: 4 + rand(i + 333) * 88,
          dur: 5 + rand(i + 19) * 6,
          spin: 8 + rand(i + 23) * 10,
          delay: rand(i + 13) * 3,
        }
      }),
    [],
  )

  return (
    <>
      {emojis.map((e, i) => (
        <div
          key={`e${i}`}
          className="flotante emoji-flotante"
          style={{
            left: `${e.left}vw`,
            top: `${e.top}vh`,
            fontSize: `${e.size}rem`,
            animation: `flotar ${e.dur}s ease-in-out ${e.delay}s infinite`,
          }}
        >
          {e.emoji}
        </div>
      ))}

      {lluvia.map((g, i) => (
        <div
          key={`g${i}`}
          className="flotante"
          style={{
            left: `${g.left}vw`,
            top: 0,
            fontSize: `${g.size}rem`,
            animation: `caer ${g.dur}s linear ${g.delay}s infinite`,
          }}
        >
          {g.emoji}
        </div>
      ))}

      {cabezas.map((c, i) => (
        <img
          key={`c${i}`}
          className="cabeza-dafo"
          src={c.src}
          alt="dafo flotando"
          title="¡es dafo!"
          style={{
            left: `${c.left}vw`,
            top: `${c.top}vh`,
            animation: `flotar ${c.dur}s ease-in-out ${c.delay}s infinite, girar ${c.spin}s linear infinite`,
          }}
        />
      ))}
    </>
  )
}

function EstrellasDeco() {
  const estrellas = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        izq: rand(i + 700) * 92,
        arr: rand(i + 720) * 92,
        size: 1.5 + rand(i + 740) * 3,
        rosa: rand(i + 760) > 0.4,
        dur: 5 + rand(i + 780) * 5,
      })),
    [],
  )
  return (
    <>
      {estrellas.map((s, i) => (
        <div
          key={`s${i}`}
          className="estrella-deco"
          style={{
            left: `${s.izq}vw`,
            top: `${s.arr}vh`,
            fontSize: `${s.size}rem`,
            color: s.rosa ? '#f4b9d0' : '#d8d8e0',
            animation: `flotar ${s.dur}s ease-in-out infinite`,
          }}
        >
          {s.rosa ? '★' : '✦'}
        </div>
      ))}
    </>
  )
}

function VacaGigante({ onCruzar }) {
  const [run, setRun] = useState(0)
  const [dir, setDir] = useState('der')
  const [topVh, setTopVh] = useState(35)

  useEffect(() => {
    let timer
    const lanzar = () => {
      setDir(Math.random() > 0.5 ? 'der' : 'izq')
      setTopVh(12 + Math.random() * 58)
      setRun((r) => r + 1)
      if (onCruzar) onCruzar()
      timer = setTimeout(lanzar, 8000 + Math.random() * 9000)
    }
    timer = setTimeout(lanzar, 3500)
    return () => clearTimeout(timer)
  }, [onCruzar])

  if (run === 0) return null
  return (
    <div key={run} className={`vaca-gigante ${dir}`} style={{ top: `${topVh}vh` }}>
      <span className="vaca-trote">🐄</span>
    </div>
  )
}

export default function App() {
  const [muteado, setMuteado] = useState(false)
  const muteRef = useRef(false)
  muteRef.current = muteado

  const muu = useCallback((pitch = 1) => {
    if (!muteRef.current) playMuu(pitch)
  }, [])

  const vacaMuu = useCallback(() => muu(0.85), [muu])
  // ====== FÁBRICA DE CAOS: estela + explosiones + ondas + temblor ======
  useEffect(() => {
    const TRAIL = ['🥛', '💧', '✨', '⭐', '🫧']
    const BOOM = ['🥛', '💧', '✨', '⚗️', '🧪', '🐄', '⭐', '🫧', '🧀', '💊', '🧬', '🥼']
    const MUUS = ['MUU', 'MUUU', '¡LECHE!', 'DAFO', '¡SÍ OBVIO!', 'PRÓST', '🥛🥛🥛']

    // estela al mover el mouse
    const dejarGota = (x, y) => {
      const g = document.createElement('div')
      g.textContent = TRAIL[Math.floor(Math.random() * TRAIL.length)]
      const drift = (Math.random() - 0.5) * 40
      g.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:9990;pointer-events:none;font-size:${12 + Math.random() * 14}px;transition:transform 1s ease-out,opacity 1s ease-out;will-change:transform,opacity;`
      document.body.appendChild(g)
      requestAnimationFrame(() => {
        g.style.transform = `translate(${drift}px, 50px) rotate(${(Math.random() - 0.5) * 180}deg)`
        g.style.opacity = '0'
      })
      setTimeout(() => g.remove(), 1000)
    }

    // explosión de partículas en un punto
    const explotar = (x, y, fuerza = 1) => {
      const n = Math.round(18 * fuerza)
      for (let i = 0; i < n; i++) {
        const p = document.createElement('div')
        p.textContent = BOOM[Math.floor(Math.random() * BOOM.length)]
        const ang = Math.random() * Math.PI * 2
        const dist = (60 + Math.random() * 160) * fuerza
        const dx = Math.cos(ang) * dist
        const dy = Math.sin(ang) * dist - 40 // sesgo hacia arriba, como salpicadura
        p.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:9995;pointer-events:none;font-size:${14 + Math.random() * 24}px;transition:transform .9s cubic-bezier(.15,.7,.3,1),opacity .9s ease-out;will-change:transform,opacity;`
        document.body.appendChild(p)
        requestAnimationFrame(() => {
          p.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 900}deg) scale(${0.4 + Math.random()})`
          p.style.opacity = '0'
        })
        setTimeout(() => p.remove(), 950)
      }
      // onda expansiva
      const ring = document.createElement('div')
      ring.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:12px;height:12px;border:4px solid var(--rosa);border-radius:50%;transform:translate(-50%,-50%);z-index:9994;pointer-events:none;transition:all .6s ease-out;`
      document.body.appendChild(ring)
      requestAnimationFrame(() => {
        ring.style.width = `${180 * fuerza}px`
        ring.style.height = `${180 * fuerza}px`
        ring.style.opacity = '0'
        ring.style.borderWidth = '1px'
      })
      setTimeout(() => ring.remove(), 650)
      // cartelito tipo MUU
      const muu = document.createElement('div')
      muu.textContent = MUUS[Math.floor(Math.random() * MUUS.length)]
      muu.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:9996;pointer-events:none;font-family:'Bungee',sans-serif;font-size:${22 + Math.random() * 16}px;color:var(--leche);text-shadow:3px 3px 0 var(--rosa-fuerte);transform:translate(-50%,-50%);transition:transform .8s ease-out,opacity .8s ease-out;`
      document.body.appendChild(muu)
      requestAnimationFrame(() => {
        muu.style.transform = `translate(-50%, -120px) rotate(${(Math.random() - 0.5) * 30}deg) scale(1.4)`
        muu.style.opacity = '0'
      })
      setTimeout(() => muu.remove(), 800)
    }

    // temblor de pantalla
    const root = document.getElementById('root')
    const temblar = () => {
      if (!root) return
      root.classList.remove('sacudida')
      void root.offsetWidth // reinicia la animación
      root.classList.add('sacudida')
    }

    let last = 0
    const onMove = (e) => {
      const now = Date.now()
      if (now - last > 60) {
        last = now
        dejarGota(e.clientX, e.clientY)
      }
    }
    const onDown = (e) => {
      const esDafo = e.target?.classList?.contains('cabeza-dafo')
      explotar(e.clientX, e.clientY, esDafo ? 1.8 : 1)
      temblar()
      muu(esDafo ? 0.7 + Math.random() * 0.2 : 0.9 + Math.random() * 0.35)
      if (!muteRef.current) playRandomAudio()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [muu])

  return (
    <>
      <div className="fondo" />
      <EstrellasDeco />
      <CosasFlotando />
      <VacaGigante onCruzar={vacaMuu} />

      <button
        className="mute-btn"
        onClick={() => setMuteado((m) => !m)}
        title={muteado ? 'Prender sonido' : 'Mutear'}
        aria-label={muteado ? 'Prender sonido' : 'Mutear'}
      >
        {muteado ? '🔇' : '🔊'}
      </button>

      <div className="marquesina">
        <span>{FRASES_MARQUESINA.repeat(2)}</span>
      </div>

      <div className="contenido">
        <div className="hero">
          <div className="fecha">27 DE JUNIO</div>
          <div className="hora">23:59 HS</div>
          <h1 className="titulazo">
            ¿La mejor fiesta de recibimiento?
          </h1>
          <div className="subtitulo-dafo">SÍ, ¡OBVIO!</div>
        </div>

        <p className="seccion-titulo">EL RECIBIMIENTO DE DAFO 🥛⚗️</p>

        <div className="periodica">
          {ELEMENTOS_DAFO.map((el) => (
            <div className="elemento" key={el.sim} title={el.nom}>
              <span className="num">{el.num}</span>
              <span className="sim">{el.sim}</span>
              <span className="nom">{el.nom}</span>
            </div>
          ))}
        </div>

        <Contador />

        <div className="tarjeta">
          <div className="donde-label">¿En dónde?</div>
          <div className="lugar">LA COMUNA — Santiago de Chile 1252</div>
          <div className="aclaracion">
            Ponemos corte y hielo,<br />solo te queda traer el alcohol! 🧊🍾
          </div>
        </div>

        <div className="botones">
          <a className="boton" href={FORM_URL} target="_blank" rel="noreferrer">
            ✍️ ¡ANOTATE ACÁ!
          </a>
          <a className="boton alt" href={CAL_URL} target="_blank" rel="noreferrer">
            📅 AGENDALO YA
          </a>
        </div>

        <div className="lechometro">
          <p className="seccion-titulo" style={{ margin: '0 0 1rem' }}>🥛 LECHE-O-METRO</p>
          <div className="barra">
            <div className="relleno">99.9% LECHE 🐄</div>
          </div>
        </div>

        <p className="seccion-titulo">📸 LA BANDA</p>
        <div className="galeria">
          {FOTOS_GALERIA.map((f, i) => (
            <img key={i} src={f} alt={`recuerdo ${i}`} loading="lazy" />
          ))}
        </div>

        <div className="firma">
          Atte <span className="nombres">Manu, Juli, Dafo y Mati</span> 💅
        </div>
      </div>

      <div className="marquesina reversa">
        <span>{FRASES_MARQUESINA.repeat(2)}</span>
      </div>
    </>
  )
}
