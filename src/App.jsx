import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'


// ── Leaflet loader ──────────────────────────────────────────────────────────
function useLeaflet() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (window.L) { setReady(true); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])
  return ready
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function geocodificar(endereco) {
  try {
    const q = encodeURIComponent(endereco + ', Brasil')
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)
    const d = await r.json()
    if (d && d[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) }
  } catch {}
  return null
}

// ── Mapa generico ────────────────────────────────────────────────────────────
function MapaMonitoramento({ tecnicos, osLista, onVoltar, titulo }) {
  const leafletReady = useLeaflet()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!leafletReady || !mapRef.current) return
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }

    const L = window.L
    const map = L.map(mapRef.current).setView([-15.8, -47.9], 5)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    const bounds = []

    tecnicos.forEach(t => {
      if (!t.lat || !t.lng) return
      const icon = L.divIcon({
        html: `<div style="background:#1A6B4A;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${t.nome[0]}</div>`,
        className: '', iconSize: [36,36], iconAnchor: [18,18]
      })
      const atualizado = t.ultima_localizacao ? new Date(t.ultima_localizacao).toLocaleString('pt-BR') : 'desconhecido'
      L.marker([t.lat, t.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${t.nome}</b><br>Tecnico<br><small>Atualizado: ${atualizado}</small>`)
      bounds.push([t.lat, t.lng])
    })

    osLista.forEach(os => {
      if (!os._lat || !os._lng) return
      const cor = STATUS_COR[os.status] || '#FAC775'
      const icon = L.divIcon({
        html: `<div style="background:${cor};color:#1A2340;border-radius:8px;padding:2px 7px;font-size:11px;font-weight:600;border:1.5px solid rgba(0,0,0,0.15);box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap">${os.numero}</div>`,
        className: '', iconAnchor: [0,0]
      })
      L.marker([os._lat, os._lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${os.numero}</b><br>${os.especialidade}<br>${os.endereco}<br><small>${STATUS_LABEL[os.status]||os.status}</small>`)
      bounds.push([os._lat, os._lng])
    })

    if (bounds.length > 0) {
      try { map.fitBounds(bounds, { padding: [40, 40] }) } catch {}
    }

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null } }
  }, [leafletReady, tecnicos, osLista])

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{titulo}</div>
      </div>
      <div style={{ flex:1, position:'relative' }}>
        {!leafletReady && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#E6F1FB' }}>
            <div style={{ color:'#4A7FC1' }}>Carregando mapa...</div>
          </div>
        )}
        <div ref={mapRef} style={{ width:'100%', height:'100%', minHeight:'calc(100vh - 54px)' }} />
      </div>
      <div style={{ background:'#fff', padding:'10px 16px', display:'flex', gap:16, borderTop:'0.5px solid #B5D4F4', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#1A2340' }}>
          <div style={{ width:14, height:14, borderRadius:'50%', background:'#1A6B4A' }} /> Tecnicos
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#1A2340' }}>
          <div style={{ width:14, height:10, borderRadius:3, background:'#FAC775', border:'1px solid #ccc' }} /> OS em aberto
        </div>
        {tecnicos.filter(t => !t.lat).length > 0 && (
          <div style={{ fontSize:11, color:'#E67E22' }}>{tecnicos.filter(t=>!t.lat).length} tecnico(s) sem localizacao</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null)
      if (data.session?.user) carregarPerfil(data.session.user.id)
      else setCarregando(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      else { setPerfil(null); setCarregando(false) }
    })
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single()
    setPerfil(data)
    setCarregando(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (carregando) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#87CEEB', fontSize:16 }}>Carregando...</div>
    </div>
  )

  if (!usuario) return <Login />
  if (!perfil) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#F09595', fontSize:14, textAlign:'center', padding:24 }}>Perfil nao encontrado. Entre em contato com o ADM.</div>
    </div>
  )

  if (perfil.perfil === 'tecnico') return <PainelTecnico perfil={perfil} onLogout={handleLogout} />
  if (perfil.perfil === 'lider') return <PainelLider perfil={perfil} onLogout={handleLogout} />
  if (perfil.perfil === 'adm') return <PainelAdm perfil={perfil} onLogout={handleLogout} />
}

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha incorretos')
    setCarregando(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#E6F1FB', borderRadius:20, padding:'40px 32px', width:'100%', maxWidth:380, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:28, fontWeight:700, color:'#2D3A8C', letterSpacing:1 }}>GRUPO PG</div>
          <div style={{ fontSize:13, color:'#4A7FC1', marginTop:4 }}>Sistema de gestao de OS</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@grupopg.com.br"
              style={{ width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Senha</label>
            <div style={{ position:'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e=>setSenha(e.target.value)}
                placeholder="********"
                style={{ width:'100%', padding:'10px 40px 10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box' }}
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4A7FC1', fontSize:16, padding:0 }}>
                {mostrarSenha ? 'ocultar' : 'ver'}
              </button>
            </div>
          </div>
          {erro && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12, textAlign:'center' }}>{erro}</div>}
          <button type="submit" disabled={carregando}
            style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', opacity:carregando?0.7:1 }}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Header({ nome, tipo, onLogout }) {
  return (
    <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #3D4FA0' }}>
      <div>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>Ola, {nome}</div>
        <div style={{ fontSize:11, color:'#87CEEB', marginTop:2 }}>{tipo}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:11, background:'#87CEEB', color:'#1A2340', padding:'3px 9px', borderRadius:99, fontWeight:500 }}>{tipo.split('·')[0].trim()}</span>
        <button onClick={onLogout} style={{ fontSize:11, background:'none', border:'none', color:'#87CEEB', cursor:'pointer' }}>Sair</button>
      </div>
    </div>
  )
}

function Caixa({ num, label, corFundo, corTexto, onClick }) {
  return (
    <div onClick={onClick} style={{ background:corFundo, borderRadius:16, padding:'14px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, border:'0.5px solid rgba(255,255,255,0.1)' }}>
      <div>
        <div style={{ fontSize:26, fontWeight:500, color:corTexto }}>{num}</div>
        <div style={{ fontSize:13, color:corTexto, marginTop:3 }}>{label}</div>
      </div>
      <div style={{ fontSize:18, color:corTexto, opacity:0.7 }}>›</div>
    </div>
  )
}

const REDES = ['Bradesco','Banco24Horas','Saque&Pague','Banrisul','Agibank','Crefisa']

const TIPOS_SERVICO = [
  'Instalacao ATM Projeto T','Instalacao ATM Concretada','Instalacao ATM Quimico',
  'Desativacao de ATM','Troca de ATM e fixacao','Troca de ATM','Remanejamento',
  'Reativacao','Substituicao de ATM','Pintura de ATM','Descaracterizacao de agencia',
  'Vistoria de BDN','Vistoria de Encerramento de PA PAB PAE',
  'Vistoria de Transformacao de UN','Vistoria de Transformacao de EN',
  'Vistoria BDN Movimentacao','Vistoria Crefisa','Reparo de piso desativacao',
]

const LABEL_IDENTIFICADOR = {
  'Bradesco':'No BDN / PA','Banco24Horas':'No PC / PA','Saque&Pague':'No PC / PA',
  'Banrisul':'No PC / PA','Agibank':'No PC / PA','Crefisa':'No PC / PA',
}

const HORARIOS = [
  '06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'
]

const UFs = ['SP','MG','RJ','PR','ES','SC']

const STATUS_LABEL = {
  novo: 'Nova OS',
  agendar_ec: 'Agendar com EC',
  aguardando_ec: 'Aguardando EC',
  confirmado_ec: 'Confirmado com EC',
  liberado_lider: 'Liberado p/ Lider',
  em_campo: 'No campo',
  concluido: 'Concluido',
  elaborar_rm: 'Elaborar RM',
  aguardando_proxima_etapa: 'Aguard. prox. etapa',
}

const STATUS_COR = {
  novo: '#FAC775',
  agendar_ec: '#FFD9A0',
  aguardando_ec: '#AFA9EC',
  confirmado_ec: '#87CEEB',
  liberado_lider: '#B5D4F4',
  em_campo: '#C0DD97',
  concluido: '#9FD9BE',
  elaborar_rm: '#F5CBA7',
  aguardando_proxima_etapa: '#F09595',
}

// ── Iniciais a partir do nome ────────────────────────────────────────────────
function iniciaisNome(nome) {
  if (!nome) return '?'
  const partes = nome.trim().split(' ').filter(Boolean)
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function CardOS({ os, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:14, padding:'14px 16px', marginBottom:10, border:'0.5px solid #B5D4F4', cursor:'pointer', position:'relative' }}>
      {/* Iniciais do tecnico — canto inferior esquerdo */}
      {os._nome_tecnico && (
        <div style={{ position:'absolute', bottom:10, left:12, width:28, height:28, borderRadius:99, background:'#1A6B4A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
          {iniciaisNome(os._nome_tecnico)}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#1A2340' }}>{os.numero}</div>
        <span style={{ fontSize:11, background: STATUS_COR[os.status]||'#eee', color:'#1A2340', padding:'2px 8px', borderRadius:99 }}>
          {STATUS_LABEL[os.status]||os.status}
        </span>
      </div>
      <div style={{ fontSize:13, color:'#2D3A8C', fontWeight:500, marginBottom:2 }}>{os.contrato}</div>
      <div style={{ fontSize:12, color:'#4A7FC1', marginBottom:2 }}>{os.especialidade}</div>
      <div style={{ fontSize:12, color:'#666' }}>{os.endereco}{os.cidade ? ` · ${os.cidade}` : ''}{os.estado ? `/${os.estado}` : ''}</div>
      {os.data && <div style={{ fontSize:12, color:'#666', marginTop:4 }}>Data: {new Date(os.data+'T12:00:00').toLocaleDateString('pt-BR')}{os.hora ? ` · ${os.hora}` : ''}</div>}
      {/* Nome tecnico e lider */}
      <div style={{ marginTop: os._nome_tecnico ? 6 : 4, paddingLeft: os._nome_tecnico ? 36 : 0, display:'flex', flexWrap:'wrap', gap:8 }}>
        {os._nome_tecnico && (
          <div style={{ fontSize:11, color:'#1A6B4A', fontWeight:500 }}>Tec: {os._nome_tecnico}</div>
        )}
        {os._nome_lider && (
          <div style={{ fontSize:11, color:'#2D3A8C', fontWeight:500 }}>Lider: {os._nome_lider}</div>
        )}
      </div>
    </div>
  )
}

// ── ListaOS com join de nomes ────────────────────────────────────────────────
function ListaOS({ titulo, status, onVoltar, onVerOS }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const statusArray = Array.isArray(status) ? status : [status]
      const { data } = await supabase
        .from('ordens_servico')
        .select('*')
        .in('status', statusArray)
        .order('criado_em', { ascending: false })

      if (!data) { setCarregando(false); return }

      // Coletar IDs unicos de tecnicos e lideres
      const tecIds = [...new Set(data.map(o => o.tecnico_id).filter(Boolean))]
      const lidIds = [...new Set(data.map(o => o.lider_id).filter(Boolean))]
      const allIds = [...new Set([...tecIds, ...lidIds])]

      let nomeMap = {}
      if (allIds.length > 0) {
        const { data: perfis } = await supabase.from('perfis').select('id,nome').in('id', allIds)
        ;(perfis || []).forEach(p => { nomeMap[p.id] = p.nome })
      }

      const enriquecido = data.map(o => ({
        ...o,
        _nome_tecnico: o.tecnico_id ? nomeMap[o.tecnico_id] || null : null,
        _nome_lider: o.lider_id ? nomeMap[o.lider_id] || null : null,
      }))

      setLista(enriquecido)
      setCarregando(false)
    }
    carregar()
  }, [status])

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{titulo}</div>
        <span style={{ marginLeft:'auto', fontSize:12, background:'#3D4FA0', color:'#87CEEB', padding:'2px 10px', borderRadius:99 }}>{lista.length}</span>
      </div>
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        {carregando && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40 }}>Carregando...</div>}
        {!carregando && lista.length === 0 && (
          <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma OS aqui ainda</div>
        )}
        {lista.map(os => <CardOS key={os.id} os={os} onClick={() => onVerOS(os)} />)}
      </div>
    </div>
  )
}

// ── Historico OS ─────────────────────────────────────────────────────────────
function HistoricoOS({ osId }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('os_historico')
      .select('*')
      .eq('os_id', osId)
      .order('criado_em', { ascending: true })
      .then(({ data }) => {
        setHistorico(data || [])
        setCarregando(false)
      })
  }, [osId])

  if (carregando) return null
  if (historico.length === 0) return null

  return (
    <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
      <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:10 }}>Historico</div>
      {historico.map((h, i) => (
        <div key={h.id || i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
          <div style={{ width:8, height:8, borderRadius:99, background:'#2D3A8C', marginTop:5, flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>
              {STATUS_LABEL[h.status_novo] || h.status_novo}
            </div>
            {h.observacao && (
              <div style={{ fontSize:11, color:'#666', marginTop:2 }}>{h.observacao}</div>
            )}
            <div style={{ fontSize:11, color:'#4A7FC1', marginTop:2 }}>
              {h.criado_em ? new Date(h.criado_em).toLocaleString('pt-BR') : ''}
              {h.usuario_nome ? ` · ${h.usuario_nome}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Registrar historico ───────────────────────────────────────────────────────
async function registrarHistorico(osId, statusNovo, usuarioNome, observacao) {
  try {
    await supabase.from('os_historico').insert({
      os_id: osId,
      status_novo: statusNovo,
      usuario_nome: usuarioNome || null,
      observacao: observacao || null,
    })
  } catch {}
}

function DetalhesOS({ os: osInicial, onVoltar, onAtualizar, onElaborarRM }) {
  const [os, setOs] = useState(osInicial)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [confirmarEC, setConfirmarEC] = useState(false)
  const [dadosEC, setDadosEC] = useState({ nome_responsavel:'', tel_responsavel:'', protocolo:'' })
  const [editForm, setEditForm] = useState({ data: os.data||'', hora: os.hora||'', observacoes: os.observacoes||'', numero_ordem_tecban: os.numero_ordem_tecban||'' })
  const [selecionarLider, setSelecionarLider] = useState(false)
  const [lideres, setLideres] = useState([])
  const [liderEscolhido, setLiderEscolhido] = useState('')
  const [nomeLiderAtual, setNomeLiderAtual] = useState('')

  useEffect(() => {
    if (selecionarLider && lideres.length === 0) {
      supabase.from('perfis').select('id,nome').eq('perfil','lider').then(({ data }) => {
        setLideres(data || [])
      })
    }
  }, [selecionarLider])

  useEffect(() => {
    if (os.lider_id) {
      supabase.from('perfis').select('nome').eq('id', os.lider_id).single().then(({ data }) => {
        if (data) setNomeLiderAtual(data.nome)
      })
    }
  }, [os.lider_id])

  async function mudarStatus(novoStatus, extras) {
    setSalvando(true)
    await supabase.from('ordens_servico').update({ status: novoStatus, ...extras }).eq('id', os.id)
    await registrarHistorico(os.id, novoStatus, null, extras?.observacoes || null)
    setOs(o => ({ ...o, status: novoStatus, ...extras }))
    setSalvando(false)
    setConfirmarEC(false)
    setSelecionarLider(false)
  }

  async function salvarEdicao() {
    setSalvando(true)
    await supabase.from('ordens_servico').update({ data: editForm.data, hora: editForm.hora, observacoes: editForm.observacoes, numero_ordem_tecban: editForm.numero_ordem_tecban || null }).eq('id', os.id)
    setOs(o => ({ ...o, ...editForm }))
    setSalvando(false)
    setEditando(false)
  }

  const estilo = { width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{os.numero}</div>
        <span style={{ marginLeft:'auto', fontSize:11, background: STATUS_COR[os.status]||'#eee', color:'#1A2340', padding:'2px 8px', borderRadius:99 }}>
          {STATUS_LABEL[os.status]||os.status}
        </span>
      </div>

      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Rede</div>
          <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{os.contrato}</div>
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Tipo de Servico</div>
          <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{os.especialidade}</div>
          {os.ec && <>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>No PC / BDN / PA</div>
            <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{os.ec}</div>
          </>}
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Endereco</div>
          <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>{os.endereco}{os.cidade ? `, ${os.cidade}` : ''}{os.estado ? `/${os.estado}` : ''}</div>

          {!editando ? <>
            {os.data && <>
              <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Data / Hora</div>
              <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>
                {new Date(os.data+'T12:00:00').toLocaleDateString('pt-BR')}{os.hora ? ` as ${os.hora}` : ''}
              </div>
            </>}
            {os.observacoes && <>
              <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Observacoes</div>
              <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>{os.observacoes}</div>
            </>}
            <button onClick={() => setEditando(true)}
              style={{ fontSize:13, color:'#4A7FC1', background:'none', border:'1px solid #B5D4F4', borderRadius:8, padding:'6px 14px', cursor:'pointer' }}>
              Editar data / hora
            </button>
          </> : <>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Data</label>
              <input type="date" value={editForm.data} onChange={e=>setEditForm(f=>({...f,data:e.target.value}))} style={estilo} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Hora</label>
              <select value={editForm.hora} onChange={e=>setEditForm(f=>({...f,hora:e.target.value}))} style={estilo}>
                <option value="">Selecione...</option>
                {HORARIOS.map(h=><option key={h}>{h}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Observacoes</label>
              <textarea value={editForm.observacoes} onChange={e=>setEditForm(f=>({...f,observacoes:e.target.value}))}
                rows={3} style={{ ...estilo, resize:'none' }} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>No Ordem do Cliente (Tecban)</label>
              <input type="text" value={editForm.numero_ordem_tecban} onChange={e=>setEditForm(f=>({...f,numero_ordem_tecban:e.target.value}))}
                placeholder="Ex: I00000131527" style={estilo} />
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:4 }}>
              <button onClick={salvarEdicao} disabled={salvando}
                style={{ flex:1, padding:'10px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:salvando?0.7:1 }}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={() => setEditando(false)}
                style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </>}
        </div>

        {os.status === 'novo' && (
          <button onClick={() => mudarStatus('agendar_ec')} disabled={salvando}
            style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', marginBottom:8, opacity:salvando?0.7:1 }}>
            Agendar com EC
          </button>
        )}

        {os.status === 'agendar_ec' && (
          <button onClick={() => mudarStatus('aguardando_ec')} disabled={salvando}
            style={{ width:'100%', padding:13, background:'#3C3489', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #26215C', marginBottom:8, opacity:salvando?0.7:1 }}>
            Aguardando confirmacao do EC
          </button>
        )}

        {os.status === 'aguardando_ec' && !confirmarEC && (
          <button onClick={() => setConfirmarEC(true)}
            style={{ width:'100%', padding:13, background:'#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #0F4A32', marginBottom:8 }}>
            Confirmado com EC
          </button>
        )}

        {os.status === 'aguardando_ec' && confirmarEC && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #9FD9BE', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Dados da confirmacao</div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Nome do responsavel *</label>
              <input type="text" value={dadosEC.nome_responsavel} onChange={e=>setDadosEC(d=>({...d,nome_responsavel:e.target.value}))}
                placeholder="Nome de quem autorizou" style={estilo} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Telefone</label>
              <input type="tel" value={dadosEC.tel_responsavel} onChange={e=>setDadosEC(d=>({...d,tel_responsavel:e.target.value}))}
                placeholder="(11) 99999-9999" style={estilo} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Protocolo / No chamado</label>
              <input type="text" value={dadosEC.protocolo} onChange={e=>setDadosEC(d=>({...d,protocolo:e.target.value}))}
                placeholder="Ex: CHM-12345" style={estilo} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => mudarStatus('confirmado_ec', { observacoes: `Confirmado por: ${dadosEC.nome_responsavel} | Tel: ${dadosEC.tel_responsavel} | Protocolo: ${dadosEC.protocolo}` })}
                disabled={!dadosEC.nome_responsavel || salvando}
                style={{ flex:1, padding:'10px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!dadosEC.nome_responsavel||salvando)?0.5:1 }}>
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
              <button onClick={() => setConfirmarEC(false)}
                style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {os.status === 'confirmado_ec' && !selecionarLider && (
          <button onClick={() => setSelecionarLider(true)} disabled={salvando}
            style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', marginBottom:8, opacity:salvando?0.7:1 }}>
            Liberar para o Lider
          </button>
        )}

        {os.status === 'liberado_lider' && !selecionarLider && (
          <button onClick={() => setSelecionarLider(true)} disabled={salvando}
            style={{ width:'100%', padding:13, background:'#3C3489', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #26215C', marginBottom:8, opacity:salvando?0.7:1 }}>
            {nomeLiderAtual ? `Lider: ${nomeLiderAtual} · Trocar` : 'Trocar Lider'}
          </button>
        )}

        {(os.status === 'confirmado_ec' || os.status === 'liberado_lider') && selecionarLider && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Escolha o Lider responsavel</div>
            {lideres.length === 0 && <div style={{ color:'#4A7FC1', fontSize:13, marginBottom:12 }}>Carregando lideres...</div>}
            {lideres.map(l => (
              <div key={l.id} onClick={() => setLiderEscolhido(l.id)}
                style={{ padding:'12px 14px', borderRadius:10, border: liderEscolhido === l.id ? '2px solid #2D3A8C' : '1px solid #B5D4F4', marginBottom:8, cursor:'pointer', background: liderEscolhido === l.id ? '#E6F1FB' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:99, background:'#2D3A8C', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600 }}>
                  {iniciaisNome(l.nome)}
                </div>
                <div style={{ fontSize:15, fontWeight:500, color:'#1A2340' }}>{l.nome}</div>
                {liderEscolhido === l.id && <div style={{ marginLeft:'auto', color:'#2D3A8C', fontSize:18 }}>✓</div>}
              </div>
            ))}
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button onClick={() => mudarStatus('liberado_lider', { lider_id: liderEscolhido })}
                disabled={!liderEscolhido || salvando}
                style={{ flex:1, padding:'10px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!liderEscolhido||salvando)?0.5:1 }}>
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
              <button onClick={() => { setSelecionarLider(false); setLiderEscolhido('') }}
                style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {os.status === 'elaborar_rm' && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #F5CBA7', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#935116', marginBottom:12 }}>Relatorio do Tecnico</div>
            {os.hora_chegada && (
              <div style={{ fontSize:13, color:'#1A2340', marginBottom:6 }}>Chegada: <strong>{os.hora_chegada}</strong></div>
            )}
            {os.hora_inicio_servico && (
              <div style={{ fontSize:13, color:'#1A2340', marginBottom:6 }}>Inicio: <strong>{os.hora_inicio_servico}</strong></div>
            )}
            {os.hora_conclusao && (
              <div style={{ fontSize:13, color:'#1A2340', marginBottom:6 }}>Conclusao: <strong>{os.hora_conclusao}</strong></div>
            )}
            {os.teve_problema === false && (
              <div style={{ fontSize:13, color:'#1A6B4A', marginBottom:6 }}>Servico ocorreu dentro do esperado</div>
            )}
            {os.teve_problema === true && (
              <div style={{ fontSize:13, color:'#E67E22', marginBottom:6 }}>Houve problema no servico</div>
            )}
            {os.ocorrencia && (
              <div style={{ fontSize:13, color:'#1A2340', marginBottom:6, background:'#FEF9E7', borderRadius:8, padding:'8px 12px' }}>{os.ocorrencia}</div>
            )}
            <button onClick={() => onElaborarRM(os)}
              style={{ width:'100%', padding:13, background:'#935116', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #6B3A0F', marginTop:8 }}>
              Elaborar RM
            </button>
          </div>
        )}

        <HistoricoOS osId={os.id} />
      </div>
    </div>
  )
}


function FormNovaOS({ perfil, onVoltar, onSalvo }) {
  const [form, setForm] = useState({
    rede:'', tipo_servico:'', identificador:'', endereco:'', cidade:'', uf:'', data:'', hora:'', observacoes:'', numero_ordem_cliente:'', nome_agencia:''
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function set(campo, valor) { setForm(f => ({ ...f, [campo]: valor })) }

  async function salvar() {
    if (!form.rede || !form.tipo_servico || !form.endereco || !form.data) {
      setErro('Preencha rede, tipo de servico, endereco e data.')
      return
    }
    setSalvando(true)
    setErro('')
    const numero = 'OS-' + Date.now().toString().slice(-6)
    const { error } = await supabase.from('ordens_servico').insert({
      numero, contrato: form.rede, especialidade: form.tipo_servico,
      ec: form.identificador, endereco: form.endereco, cidade: form.cidade,
      estado: form.uf, data: form.data, hora: form.hora,
      observacoes: form.observacoes, status: 'novo', origem: 'manual', adm_id: perfil.id, numero_ordem_tecban: form.numero_ordem_cliente, nome_agencia: form.nome_agencia
    })
    setSalvando(false)
    if (error) { setErro('Erro ao salvar: ' + error.message); return }
    onSalvo()
  }

  const estilo = { width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>Nova OS Manual</div>
      </div>
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Rede *</label>
          <select value={form.rede} onChange={e=>set('rede',e.target.value)} style={estilo}>
            <option value="">Selecione a rede...</option>
            {REDES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Tipo de Servico *</label>
          <select value={form.tipo_servico} onChange={e=>set('tipo_servico',e.target.value)} style={estilo}>
            <option value="">Selecione o tipo...</option>
            {TIPOS_SERVICO.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>
            {form.rede ? LABEL_IDENTIFICADOR[form.rede] : 'No PC / BDN / PA'}
          </label>
          <input type="text" value={form.identificador} onChange={e=>set('identificador',e.target.value)}
            placeholder={form.rede === 'Bradesco' ? 'Ex: BDN-12345' : 'Ex: PC-98765'} style={estilo} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>No Ordem do Cliente</label>
          <input type="text" value={form.numero_ordem_cliente} onChange={e=>set('numero_ordem_cliente',e.target.value)}
            placeholder="Ex: I00000131527" style={estilo} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Nome do PC / Agencia</label>
          <input type="text" value={form.nome_agencia} onChange={e=>set('nome_agencia',e.target.value)}
            placeholder="Ex: DROG SOUL FARMA" style={estilo} />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Endereco *</label>
          <input type="text" value={form.endereco} onChange={e=>set('endereco',e.target.value)}
            placeholder="Rua, numero" style={estilo} />
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <div style={{ flex:2 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Cidade</label>
            <input type="text" value={form.cidade} onChange={e=>set('cidade',e.target.value)}
              placeholder="Cidade" style={estilo} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>UF</label>
            <select value={form.uf} onChange={e=>set('uf',e.target.value)} style={estilo}>
              <option value="">UF</option>
              {UFs.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Data *</label>
            <input type="date" value={form.data} onChange={e=>set('data',e.target.value)} style={estilo} />
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Hora</label>
            <select value={form.hora} onChange={e=>set('hora',e.target.value)} style={estilo}>
              <option value="">Selecione...</option>
              {HORARIOS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Observacoes</label>
          <textarea value={form.observacoes} onChange={e=>set('observacoes',e.target.value)}
            placeholder="Informacoes adicionais..." rows={3}
            style={{ ...estilo, resize:'none' }} />
        </div>
        {erro && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12, textAlign:'center' }}>{erro}</div>}
        <button onClick={salvar} disabled={salvando}
          style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', opacity:salvando?0.7:1 }}>
          {salvando ? 'Salvando...' : 'Criar OS'}
        </button>
      </div>
    </div>
  )
}

function PainelTecnico({ perfil, onLogout }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [osSelecionada, setOsSelecionada] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [etapa, setEtapa] = useState(null)
  const [motivoNegado, setMotivoNegado] = useState('')
  const [ocorrencia, setOcorrencia] = useState('')
  const [tevePro, setTevePro] = useState(null)
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const [osComCoords, setOsComCoords] = useState([])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        await supabase.from('perfis').update({ lat, lng, ultima_localizacao: new Date().toISOString() }).eq('id', perfil.id)
      })
    }
  }, [])

  function carregar() {
    supabase.from('ordens_servico')
      .select('*')
      .eq('tecnico_id', perfil.id)
      .in('status', ['em_campo', 'elaborar_rm'])
      .order('criado_em', { ascending: false })
      .then(({ data }) => { setLista(data || []); setCarregando(false) })
  }

  useEffect(() => { carregar() }, [])

  function abrirOS(os) {
    setOsSelecionada(os)
    setOcorrencia('')
    setTevePro(null)
    if (os.status === 'elaborar_rm') {
      setEtapa('elaborar_rm')
    } else if (os.hora_inicio_servico) {
      setEtapa('relatorio')
    } else if (os.hora_chegada) {
      setEtapa('autorizar')
    } else {
      setEtapa('aceitar_demanda')
    }
  }

  async function aceitar() {
    setSalvando(true)
    const agora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    await supabase.from('ordens_servico').update({ hora_chegada: agora }).eq('id', osSelecionada.id)
    await registrarHistorico(osSelecionada.id, 'em_campo', perfil.nome, 'Tecnico registrou chegada ao local')
    setOsSelecionada(o => ({ ...o, hora_chegada: agora }))
    setSalvando(false)
    setEtapa('autorizar')
  }

  async function iniciarServico() {
    setSalvando(true)
    const agora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    await supabase.from('ordens_servico').update({ hora_inicio_servico: agora }).eq('id', osSelecionada.id)
    setOsSelecionada(o => ({ ...o, hora_inicio_servico: agora }))
    setSalvando(false)
    setEtapa('relatorio')
  }

  async function concluir() {
    if (tevePro === null) return
    setSalvando(true)
    const agora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    await supabase.from('ordens_servico').update({
      status: 'elaborar_rm',
      teve_problema: tevePro,
      ocorrencia: ocorrencia || null,
      hora_conclusao: agora
    }).eq('id', osSelecionada.id)
    await registrarHistorico(osSelecionada.id, 'elaborar_rm', perfil.nome, ocorrencia || null)
    setSalvando(false)
    setOsSelecionada(null)
    setEtapa(null)
    setOcorrencia('')
    setTevePro(null)
    carregar()
  }

  async function rejeitar() {
    if (!motivoNegado.trim()) return
    setSalvando(true)
    await supabase.from('ordens_servico').update({
      status: 'liberado_lider',
      tecnico_id: null,
      motivo_nao_autorizado: 'Rejeitado pelo tecnico: ' + motivoNegado
    }).eq('id', osSelecionada.id)
    await registrarHistorico(osSelecionada.id, 'liberado_lider', perfil.nome, 'Rejeitado: ' + motivoNegado)
    setSalvando(false)
    setOsSelecionada(null)
    setEtapa(null)
    setMotivoNegado('')
    carregar()
  }

  async function naoAutorizado() {
    if (!motivoNegado.trim()) return
    setSalvando(true)
    await supabase.from('ordens_servico').update({
      status: 'confirmado_ec',
      tecnico_id: null,
      hora_chegada: null,
      motivo_nao_autorizado: motivoNegado
    }).eq('id', osSelecionada.id)
    await registrarHistorico(osSelecionada.id, 'confirmado_ec', perfil.nome, 'Nao autorizado: ' + motivoNegado)
    setSalvando(false)
    setOsSelecionada(null)
    setEtapa(null)
    setMotivoNegado('')
    carregar()
  }

  const emCampo = lista.filter(o => o.status === 'em_campo')
  const aguardando = lista.filter(o => o.status === 'elaborar_rm')

  if (osSelecionada) {
    const enderecoMaps = encodeURIComponent(`${osSelecionada.endereco || ''}${osSelecionada.cidade ? ', ' + osSelecionada.cidade : ''}${osSelecionada.estado ? ', ' + osSelecionada.estado : ''}`)
    const linkMaps = `https://www.google.com/maps/search/?api=1&query=${enderecoMaps}`

    return (
      <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
        <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
          <button onClick={() => { setOsSelecionada(null); setEtapa(null); setMotivoNegado(''); setOcorrencia(''); setTevePro(null) }}
            style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
          <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{osSelecionada.numero}</div>
          <span style={{ marginLeft:'auto', fontSize:11, background: STATUS_COR[osSelecionada.status]||'#eee', color:'#1A2340', padding:'2px 8px', borderRadius:99 }}>
            {STATUS_LABEL[osSelecionada.status]||osSelecionada.status}
          </span>
        </div>
        <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
          <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Rede</div>
            <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.contrato}</div>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Tipo de Servico</div>
            <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.especialidade}</div>
            {osSelecionada.ec && <>
              <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>No PC / BDN / PA</div>
              <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.ec}</div>
            </>}
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Endereco</div>
            <a href={linkMaps} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:14, color:'#2D3A8C', marginBottom:10, display:'block', textDecoration:'underline', cursor:'pointer' }}>
              Ver no Maps: {osSelecionada.endereco}{osSelecionada.cidade ? `, ${osSelecionada.cidade}` : ''}{osSelecionada.estado ? `/${osSelecionada.estado}` : ''}
            </a>
            {osSelecionada.data && <>
              <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Data / Hora</div>
              <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>
                {new Date(osSelecionada.data+'T12:00:00').toLocaleDateString('pt-BR')}{osSelecionada.hora ? ` as ${osSelecionada.hora}` : ''}
              </div>
            </>}
            {osSelecionada.observacoes && <>
              <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Observacoes</div>
              <div style={{ fontSize:14, color:'#1A2340', marginBottom:4 }}>{osSelecionada.observacoes}</div>
            </>}
            {osSelecionada.hora_chegada && (
              <div style={{ fontSize:12, color:'#1A6B4A', marginTop:8 }}>Chegada registrada as {osSelecionada.hora_chegada}</div>
            )}
          </div>

          {etapa === 'aceitar_demanda' && (
            <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Voce aceita essa demanda?</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setEtapa('aceitar')}
                  style={{ flex:1, padding:'12px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Aceitar
                </button>
                <button onClick={() => setEtapa('rejeitar')}
                  style={{ flex:1, padding:'12px', background:'#C0392B', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Rejeitar
                </button>
              </div>
            </div>
          )}

          {etapa === 'rejeitar' && (
            <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #F5B7B1', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#C0392B', marginBottom:12 }}>Motivo da rejeicao</div>
              <div style={{ marginBottom:12 }}>
                <textarea value={motivoNegado} onChange={e => setMotivoNegado(e.target.value)}
                  rows={3} placeholder="Descreva o motivo..."
                  style={{ width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box', resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={rejeitar} disabled={!motivoNegado.trim() || salvando}
                  style={{ flex:1, padding:'10px', background:'#C0392B', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!motivoNegado.trim()||salvando)?0.5:1 }}>
                  {salvando ? 'Enviando...' : 'Confirmar'}
                </button>
                <button onClick={() => { setEtapa('aceitar_demanda'); setMotivoNegado('') }}
                  style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* FIX: etapa 'aceitar' mostra botao de registrar chegada diretamente */}
          {etapa === 'aceitar' && (
            <button onClick={aceitar} disabled={salvando}
              style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', marginBottom:8, opacity:salvando?0.7:1 }}>
              {salvando ? 'Registrando...' : 'Registrar chegada ao local'}
            </button>
          )}

          {etapa === 'autorizar' && (
            <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>O servico foi autorizado?</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setEtapa('iniciar_servico')}
                  style={{ flex:1, padding:'12px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Sim, autorizado
                </button>
                <button onClick={() => setEtapa('nao_autorizado')}
                  style={{ flex:1, padding:'12px', background:'#C0392B', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Nao autorizado
                </button>
              </div>
            </div>
          )}

          {etapa === 'nao_autorizado' && (
            <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #F5B7B1', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#C0392B', marginBottom:12 }}>Servico nao autorizado</div>
              <div style={{ marginBottom:12 }}>
                <textarea value={motivoNegado} onChange={e => setMotivoNegado(e.target.value)}
                  rows={3} placeholder="Descreva o motivo..."
                  style={{ width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box', resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={naoAutorizado} disabled={!motivoNegado.trim() || salvando}
                  style={{ flex:1, padding:'10px', background:'#C0392B', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!motivoNegado.trim()||salvando)?0.5:1 }}>
                  {salvando ? 'Enviando...' : 'Confirmar'}
                </button>
                <button onClick={() => setEtapa('autorizar')}
                  style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                  Voltar
                </button>
              </div>
            </div>
          )}

          {etapa === 'iniciar_servico' && (
            <button onClick={iniciarServico} disabled={salvando}
              style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #1A2340', marginBottom:8, opacity:salvando?0.7:1 }}>
              {salvando ? 'Registrando...' : 'Iniciar servico'}
            </button>
          )}

          {etapa === 'relatorio' && (
            <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Como foi o servico?</div>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <button onClick={() => setTevePro(false)}
                  style={{ flex:1, padding:'12px', background: tevePro === false ? '#1A6B4A' : '#fff', color: tevePro === false ? '#fff' : '#1A6B4A', border:'2px solid #1A6B4A', borderRadius:10, fontSize:13, cursor:'pointer', fontWeight:500 }}>
                  Tudo certo
                </button>
                <button onClick={() => setTevePro(true)}
                  style={{ flex:1, padding:'12px', background: tevePro === true ? '#E67E22' : '#fff', color: tevePro === true ? '#fff' : '#E67E22', border:'2px solid #E67E22', borderRadius:10, fontSize:13, cursor:'pointer', fontWeight:500 }}>
                  Houve problema
                </button>
              </div>
              {tevePro === true && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Descreva o problema *</label>
                  <textarea value={ocorrencia} onChange={e => setOcorrencia(e.target.value)}
                    rows={3} placeholder="Descreva o que ocorreu..."
                    style={{ width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box', resize:'none' }} />
                </div>
              )}
              {tevePro === false && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Observacoes (opcional)</label>
                  <textarea value={ocorrencia} onChange={e => setOcorrencia(e.target.value)}
                    rows={3} placeholder="Alguma observacao sobre o servico..."
                    style={{ width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box', resize:'none' }} />
                </div>
              )}
              <button onClick={concluir}
                disabled={salvando || tevePro === null || (tevePro === true && !ocorrencia.trim())}
                style={{ width:'100%', padding:13, background:'#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #0F4A32', marginTop:4, opacity:(salvando || tevePro === null || (tevePro === true && !ocorrencia.trim())) ? 0.5 : 1 }}>
                {salvando ? 'Salvando...' : 'Concluir OS'}
              </button>
            </div>
          )}

          {etapa === 'elaborar_rm' && (
            <div style={{ background:'#FEF9E7', borderRadius:12, padding:'12px 16px', border:'0.5px solid #F5CBA7' }}>
              <div style={{ fontSize:13, color:'#935116', fontWeight:500 }}>OS concluida - aguardando Elaboracao de RM pelo ADM</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  async function abrirMapaTecnico() {
    const geocodadas = await Promise.all(lista.map(async os => {
      const end = `${os.endereco||''}, ${os.cidade||''}, ${os.estado||''}`
      const coords = await geocodificar(end)
      return coords ? { ...os, _lat: coords.lat, _lng: coords.lng } : os
    }))
    setOsComCoords(geocodadas)
    setMostrarMapa(true)
  }

  if (mostrarMapa) {
    const minha = perfil.lat ? [{ ...perfil, nome: perfil.nome }] : []
    return <MapaMonitoramento tecnicos={minha} osLista={osComCoords} onVoltar={() => setMostrarMapa(false)} titulo="Minha localizacao" />
  }

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <Header nome={perfil.nome} tipo="Tecnico · Grupo PG" onLogout={onLogout} />
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em' }}>Minhas OS</div>
          <button onClick={abrirMapaTecnico} style={{ fontSize:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontWeight:500 }}>Mapa</button>
        </div>
        <Caixa num={emCampo.length} label="No campo" corFundo="#EAF3DE" corTexto="#27500A" />
        <Caixa num={aguardando.length} label="Aguardando Elaborar RM" corFundo="#FEF9E7" corTexto="#935116" />
        {carregando && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:20 }}>Carregando...</div>}
        {!carregando && emCampo.length > 0 && <>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>Para atender</div>
          {emCampo.map(os => <CardOS key={os.id} os={os} onClick={() => abrirOS(os)} />)}
        </>}
        {!carregando && aguardando.length > 0 && <>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>Aguardando RM</div>
          {aguardando.map(os => <CardOS key={os.id} os={os} onClick={() => abrirOS(os)} />)}
        </>}
        {!carregando && lista.length === 0 && (
          <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma OS atribuida ainda</div>
        )}
      </div>
    </div>
  )
}


function PainelLider({ perfil, onLogout }) {
  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [osSelecionada, setOsSelecionada] = useState(null)
  const [tecnicos, setTecnicos] = useState([])
  const [tecnicoEscolhido, setTecnicoEscolhido] = useState('')
  const [delegando, setDelegando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const [osComCoords, setOsComCoords] = useState([])
  const [tecnicosComDist, setTecnicosComDist] = useState([])
  const [coordsOS, setCoordsOS] = useState(null)

  function carregar() {
    supabase.from('ordens_servico')
      .select('*')
      .eq('lider_id', perfil.id)
      .in('status', ['liberado_lider','em_campo','elaborar_rm','concluido'])
      .order('criado_em', { ascending: false })
      .then(({ data }) => { setLista(data || []); setCarregando(false) })
  }

  useEffect(() => { carregar() }, [])

  // Capturar localizacao do lider
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        await supabase.from('perfis').update({ lat, lng, ultima_localizacao: new Date().toISOString() }).eq('id', perfil.id)
      })
    }
  }, [])

  useEffect(() => {
    if (delegando && tecnicos.length === 0) {
      supabase.from('perfis').select('id,nome,lat,lng').eq('perfil','tecnico')
        .then(async ({ data }) => {
          const lista = data || []
          if (osSelecionada) {
            const end = `${osSelecionada.endereco||''}, ${osSelecionada.cidade||''}, ${osSelecionada.estado||''}`
            const coords = await geocodificar(end)
            setCoordsOS(coords)
            if (coords) {
              const comDist = lista.map(t => ({
                ...t,
                distancia: t.lat && t.lng ? haversine(t.lat, t.lng, coords.lat, coords.lng) : null
              })).sort((a,b) => {
                if (a.distancia === null) return 1
                if (b.distancia === null) return -1
                return a.distancia - b.distancia
              })
              setTecnicosComDist(comDist)
              setTecnicos(comDist)
              return
            }
          }
          setTecnicos(lista)
          setTecnicosComDist(lista)
        })
    }
  }, [delegando])

  async function delegar() {
    if (!tecnicoEscolhido) return
    setSalvando(true)
    await supabase.from('ordens_servico')
      .update({ status: 'em_campo', tecnico_id: tecnicoEscolhido })
      .eq('id', osSelecionada.id)
    const tec = tecnicos.find(t => t.id === tecnicoEscolhido)
    await registrarHistorico(osSelecionada.id, 'em_campo', perfil.nome, tec ? `Delegado para: ${tec.nome}` : null)
    setSalvando(false)
    setDelegando(false)
    setOsSelecionada(null)
    setTecnicoEscolhido('')
    setTecnicos([]) // reset para redelegar
    carregar()
  }

  const liberadas = lista.filter(o => o.status === 'liberado_lider')
  const emCampo = lista.filter(o => o.status === 'em_campo')
  const concluidas = lista.filter(o => o.status === 'concluido' || o.status === 'elaborar_rm')

  async function abrirMapaLider() {
    const geocodadas = await Promise.all(
      lista.filter(o => ['liberado_lider','em_campo'].includes(o.status)).map(async os => {
        const end = `${os.endereco||''}, ${os.cidade||''}, ${os.estado||''}`
        const coords = await geocodificar(end)
        return coords ? { ...os, _lat: coords.lat, _lng: coords.lng } : os
      })
    )
    setOsComCoords(geocodadas)
    setMostrarMapa(true)
  }

  if (mostrarMapa) {
    return <MapaMonitoramento tecnicos={[]} osLista={osComCoords} onVoltar={() => setMostrarMapa(false)} titulo="Mapa do time" />
  }

  if (osSelecionada) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={() => { setOsSelecionada(null); setDelegando(false); setTecnicoEscolhido(''); setTecnicos([]) }}
          style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{osSelecionada.numero}</div>
        <span style={{ marginLeft:'auto', fontSize:11, background: STATUS_COR[osSelecionada.status]||'#eee', color:'#1A2340', padding:'2px 8px', borderRadius:99 }}>
          {STATUS_LABEL[osSelecionada.status]||osSelecionada.status}
        </span>
      </div>
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Rede</div>
          <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.contrato}</div>
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Tipo de Servico</div>
          <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.especialidade}</div>
          {osSelecionada.ec && <>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>No PC / BDN / PA</div>
            <div style={{ fontSize:15, fontWeight:500, color:'#1A2340', marginBottom:10 }}>{osSelecionada.ec}</div>
          </>}
          <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Endereco</div>
          <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>{osSelecionada.endereco}{osSelecionada.cidade ? `, ${osSelecionada.cidade}` : ''}{osSelecionada.estado ? `/${osSelecionada.estado}` : ''}</div>
          {osSelecionada.data && <>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Data / Hora</div>
            <div style={{ fontSize:14, color:'#1A2340', marginBottom:10 }}>
              {new Date(osSelecionada.data+'T12:00:00').toLocaleDateString('pt-BR')}{osSelecionada.hora ? ` as ${osSelecionada.hora}` : ''}
            </div>
          </>}
          {osSelecionada.observacoes && <>
            <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:2 }}>Observacoes</div>
            <div style={{ fontSize:14, color:'#1A2340' }}>{osSelecionada.observacoes}</div>
          </>}
        </div>

        {osSelecionada.status === 'liberado_lider' && !delegando && (
          <button onClick={() => setDelegando(true)}
            style={{ width:'100%', padding:13, background:'#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #0F4A32', marginBottom:8 }}>
            Delegar para Tecnico
          </button>
        )}

        {osSelecionada.status === 'liberado_lider' && delegando && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Escolha o Tecnico</div>
            {tecnicos.length === 0 && <div style={{ color:'#4A7FC1', fontSize:13, marginBottom:12 }}>Carregando tecnicos...</div>}
            {coordsOS && <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:8 }}>Ordenado por proximidade ao local da OS</div>}
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {tecnicos.map(t => (
                <div key={t.id} onClick={() => setTecnicoEscolhido(t.id)}
                  style={{ padding:'12px 14px', borderRadius:10, border: tecnicoEscolhido === t.id ? '2px solid #1A6B4A' : '1px solid #B5D4F4', marginBottom:8, cursor:'pointer', background: tecnicoEscolhido === t.id ? '#D4F0E4' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:99, background:'#1A6B4A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600 }}>
                    {iniciaisNome(t.nome)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:500, color:'#1A2340' }}>{t.nome}</div>
                    {t.distancia !== null && t.distancia !== undefined
                      ? <div style={{ fontSize:11, color:'#1A6B4A' }}>{t.distancia < 1 ? `${Math.round(t.distancia*1000)} m` : `${t.distancia.toFixed(0)} km`} do local</div>
                      : <div style={{ fontSize:11, color:'#aaa' }}>Localizacao nao disponivel</div>
                    }
                  </div>
                  {tecnicoEscolhido === t.id && <div style={{ color:'#1A6B4A', fontSize:18 }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button onClick={delegar} disabled={!tecnicoEscolhido || salvando}
                style={{ flex:1, padding:'10px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!tecnicoEscolhido||salvando)?0.5:1 }}>
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
              <button onClick={() => { setDelegando(false); setTecnicoEscolhido(''); setTecnicos([]) }}
                style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {osSelecionada.status === 'em_campo' && !delegando && (
          <div>
            <div style={{ background:'#EAF3DE', borderRadius:12, padding:'12px 16px', border:'0.5px solid #C0DD97', marginBottom:8 }}>
              <div style={{ fontSize:13, color:'#27500A', fontWeight:500 }}>Tecnico no campo</div>
            </div>
            <button onClick={() => { setDelegando(true); setTecnicos([]) }}
              style={{ width:'100%', padding:13, background:'#3C3489', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #26215C' }}>
              Redelegar para outro Tecnico
            </button>
          </div>
        )}

        {osSelecionada.status === 'em_campo' && delegando && (
          <div style={{ background:'#fff', borderRadius:14, padding:16, border:'0.5px solid #B5D4F4', marginBottom:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Escolha o novo Tecnico</div>
            {tecnicos.length === 0 && <div style={{ color:'#4A7FC1', fontSize:13, marginBottom:12 }}>Carregando tecnicos...</div>}
            {coordsOS && <div style={{ fontSize:11, color:'#4A7FC1', marginBottom:8 }}>Ordenado por proximidade ao local da OS</div>}
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {tecnicos.map(t => (
                <div key={t.id} onClick={() => setTecnicoEscolhido(t.id)}
                  style={{ padding:'12px 14px', borderRadius:10, border: tecnicoEscolhido === t.id ? '2px solid #1A6B4A' : '1px solid #B5D4F4', marginBottom:8, cursor:'pointer', background: tecnicoEscolhido === t.id ? '#D4F0E4' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:99, background:'#1A6B4A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600 }}>
                    {iniciaisNome(t.nome)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:500, color:'#1A2340' }}>{t.nome}</div>
                    {t.distancia !== null && t.distancia !== undefined
                      ? <div style={{ fontSize:11, color:'#1A6B4A' }}>{t.distancia < 1 ? `${Math.round(t.distancia*1000)} m` : `${t.distancia.toFixed(0)} km`} do local</div>
                      : <div style={{ fontSize:11, color:'#aaa' }}>Localizacao nao disponivel</div>
                    }
                  </div>
                  {tecnicoEscolhido === t.id && <div style={{ color:'#1A6B4A', fontSize:18 }}>✓</div>}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button onClick={delegar} disabled={!tecnicoEscolhido || salvando}
                style={{ flex:1, padding:'10px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', opacity:(!tecnicoEscolhido||salvando)?0.5:1 }}>
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
              <button onClick={() => { setDelegando(false); setTecnicoEscolhido(''); setTecnicos([]) }}
                style={{ flex:1, padding:'10px', background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <Header nome={perfil.nome} tipo={`Lider · Grupo PG`} onLogout={onLogout} />
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em' }}>Minhas OS</div>
          <button onClick={abrirMapaLider} style={{ fontSize:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontWeight:500 }}>Mapa</button>
        </div>
        <Caixa num={liberadas.length} label="Aguardando delegar" corFundo="#E6F1FB" corTexto="#0C447C" />
        <Caixa num={emCampo.length} label="No campo" corFundo="#EAF3DE" corTexto="#27500A" />
        <Caixa num={concluidas.length} label="Concluidas" corFundo="#E8F5EE" corTexto="#0F6E56" />
        {carregando && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:20 }}>Carregando...</div>}
        {!carregando && liberadas.length > 0 && <>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>Para delegar</div>
          {liberadas.map(os => <CardOS key={os.id} os={os} onClick={() => setOsSelecionada(os)} />)}
        </>}
        {!carregando && emCampo.length > 0 && <>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>No campo</div>
          {emCampo.map(os => <CardOS key={os.id} os={os} onClick={() => setOsSelecionada(os)} />)}
        </>}
        {!carregando && lista.length === 0 && (
          <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma OS atribuida ainda</div>
        )}
      </div>
    </div>
  )
}



function ElaborarRM({ os, onVoltar, onConcluir }) {
  const pMap = {
    SP: { codigo: '108044', cnpj: '19.786.849/0001-60', uo: 'SAO' },
    PR: { codigo: '108044', cnpj: '19.786.849/0001-60', uo: 'CWB' },
    ES: { codigo: '108044', cnpj: '19.786.849/0001-60', uo: 'VIX' },
    SC: { codigo: '108044', cnpj: '19.786.849/0001-60', uo: 'FLN' },
    RJ: { codigo: '112142', cnpj: '19.786.849/0002-41', uo: 'RIO' },
    MG: { codigo: '113338', cnpj: '19.786.849/0003-22', uo: 'BHZ' },
  }
  const p = pMap[os.estado] || pMap['SP']
  const [form, setForm] = useState({ numero_ordem: os.numero_ordem_tecban || '', nr_serie: os.nr_serie_equipamento || '', data_conclusao: os.data || '' })
  const [itens, setItens] = useState([{ codigo: '', descricao: '', qtd: 1, operacao: '', valor_unitario: '', valor_total: 0 }])
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscandoIdx, setBuscandoIdx] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const estilo = { width:'100%', padding:'10px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box' }

  async function buscarServico(texto, idx) {
    setBuscandoIdx(idx)
    setBusca(texto)
    if (texto.length < 2) { setResultados([]); return }
    const { data } = await supabase.from('servicos_tecban').select('*')
      .or('codigo.ilike.%' + texto + '%,descricao.ilike.%' + texto + '%').limit(8)
    setResultados(data || [])
  }

  function selecionarServico(servico, idx) {
    const novos = [...itens]
    novos[idx] = { ...novos[idx], codigo: servico.codigo, descricao: servico.descricao, valor_unitario: servico.valor_unitario, valor_total: novos[idx].qtd * servico.valor_unitario, operacao: servico.operacao || '20' }
    setItens(novos)
    setResultados([])
    setBuscandoIdx(null)
    setBusca('')
  }

  function atualizarItem(idx, campo, valor) {
    const novos = [...itens]
    novos[idx][campo] = valor
    if (campo === 'qtd' || campo === 'valor_unitario') {
      novos[idx].valor_total = parseFloat(novos[idx].qtd || 0) * parseFloat(novos[idx].valor_unitario || 0)
    }
    setItens(novos)
  }

  function adicionarItem() { setItens([...itens, { codigo: '', descricao: '', qtd: 1, operacao: '', valor_unitario: '', valor_total: 0 }]) }
  function removerItem(idx) { setItens(itens.filter((_, i) => i !== idx)) }

  const total = itens.reduce((s, i) => s + (parseFloat(i.valor_total) || parseFloat(i.qtd||1) * parseFloat(i.valor_unitario||0)), 0)

  async function salvarRM() {
    if (!form.numero_ordem) { alert('Informe o No da Ordem Tecban'); return }
    setSalvando(true)
    await supabase.from('ordens_servico').update({
      numero_ordem_tecban: form.numero_ordem,
      nr_serie_equipamento: form.nr_serie,
      status: 'concluido'
    }).eq('id', os.id)
    const itensValidos = itens.filter(i => i.codigo).map(i => ({
      os_id: os.id, codigo_servico: i.codigo, descricao: i.descricao,
      quantidade: parseFloat(i.qtd), operacao: i.operacao,
      valor_unitario: parseFloat(i.valor_unitario),
    }))
    if (itensValidos.length > 0) await supabase.from('rm_itens').insert(itensValidos)
    await registrarHistorico(os.id, 'concluido', null, 'RM elaborada')
    setSalvando(false)
    onConcluir()
  }

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'0.5px solid #3D4FA0' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'#87CEEB', fontSize:20, cursor:'pointer', padding:0 }}>←</button>
        <div style={{ fontSize:15, fontWeight:500, color:'#fff' }}>Elaborar RM — {os.numero}</div>
      </div>
      <div style={{ flex:1, background:'#E6F1FB', padding:16, overflowY:'auto' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Dados da Ordem</div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>No da Ordem Tecban *</label>
            <input type="text" value={form.numero_ordem} onChange={e=>setForm(f=>({...f,numero_ordem:e.target.value}))} placeholder="Ex: I00000131527" style={estilo} />
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>No Serie Equipamento</label>
            <input type="text" value={form.nr_serie} onChange={e=>setForm(f=>({...f,nr_serie:e.target.value}))} placeholder="Ex: 28-59093340" style={estilo} />
          </div>
          <div style={{ marginBottom:4 }}>
            <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Data de Conclusao</label>
            <input type="date" value={form.data_conclusao} onChange={e=>setForm(f=>({...f,data_conclusao:e.target.value}))} style={estilo} />
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:4 }}>Prestador — UO: {p.uo}</div>
          <div style={{ fontSize:12, color:'#4A7FC1' }}>Codigo: {p.codigo} · CNPJ: {p.cnpj}</div>
        </div>

        <div style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, border:'0.5px solid #B5D4F4' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', marginBottom:12 }}>Itens de Servico</div>
          {itens.map((item, idx) => (
            <div key={idx} style={{ border:'1px solid #E6F1FB', borderRadius:10, padding:12, marginBottom:10, background:'#F8FBFF' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#2D3A8C' }}>Item {idx+1}</div>
                {itens.length > 1 && <button onClick={() => removerItem(idx)} style={{ background:'none', border:'none', color:'#E24B4A', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>}
              </div>
              <div style={{ marginBottom:8, position:'relative' }}>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Buscar servico</label>
                <input type="text"
                  value={buscandoIdx === idx ? busca : (item.codigo ? item.codigo + ' — ' + item.descricao : '')}
                  onChange={e => buscarServico(e.target.value, idx)}
                  onFocus={() => { setBuscandoIdx(idx); setBusca('') }}
                  placeholder="Digite codigo ou nome do servico..."
                  style={estilo} />
                {buscandoIdx === idx && resultados.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #B5D4F4', borderRadius:8, zIndex:100, maxHeight:200, overflowY:'auto', boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>
                    {resultados.map((r, ri) => (
                      <div key={ri} onClick={() => selecionarServico(r, idx)}
                        style={{ padding:'10px 12px', cursor:'pointer', borderBottom:'0.5px solid #E6F1FB', fontSize:13 }}>
                        <strong>{r.codigo}</strong> — {r.descricao}
                        <div style={{ fontSize:12, color:'#4A7FC1' }}>R$ {parseFloat(r.valor_unitario).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Qtd</label>
                  <input type="number" value={item.qtd} onChange={e=>atualizarItem(idx,'qtd',e.target.value)} style={{...estilo, textAlign:'center'}} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Operacao</label>
                  <input type="text" value={item.operacao} onChange={e=>atualizarItem(idx,'operacao',e.target.value)} placeholder="Ex: 20" style={estilo} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Vlr Unit</label>
                  <input type="number" value={item.valor_unitario} onChange={e=>atualizarItem(idx,'valor_unitario',e.target.value)} style={estilo} />
                </div>
              </div>
              {item.valor_total > 0 && (
                <div style={{ fontSize:13, color:'#1A6B4A', marginTop:8, textAlign:'right', fontWeight:600 }}>
                  Total: R$ {parseFloat(item.valor_total).toFixed(2)}
                </div>
              )}
            </div>
          ))}
          <button onClick={adicionarItem}
            style={{ width:'100%', padding:'10px', background:'#E6F1FB', color:'#2D3A8C', border:'1px dashed #B5D4F4', borderRadius:10, fontSize:14, cursor:'pointer', marginBottom:8 }}>
            + Adicionar item
          </button>
          <div style={{ fontSize:15, fontWeight:600, color:'#1A2340', textAlign:'right', padding:'8px 0', borderTop:'1px solid #E6F1FB' }}>
            Total Geral: R$ {total.toFixed(2)}
          </div>
        </div>

        <button onClick={salvarRM} disabled={salvando}
          style={{ width:'100%', padding:13, background:'#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #0F4A32', opacity:salvando?0.7:1 }}>
          {salvando ? 'Salvando...' : 'Salvar RM e Concluir OS'}
        </button>
      </div>
    </div>
  )
}


function MapaAdm({ onVoltar }) {
  const [tecnicos, setTecnicos] = useState([])
  const [osComCoords, setOsComCoords] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const [{ data: tecs }, { data: osData }] = await Promise.all([
        supabase.from('perfis').select('id,nome,lat,lng,ultima_localizacao').eq('perfil','tecnico'),
        supabase.from('ordens_servico').select('*').in('status', ['liberado_lider','em_campo','confirmado_ec'])
      ])
      const geocodadas = await Promise.all((osData||[]).map(async os => {
        const end = `${os.endereco||''}, ${os.cidade||''}, ${os.estado||''}`
        const coords = await geocodificar(end)
        return coords ? { ...os, _lat: coords.lat, _lng: coords.lng } : os
      }))
      setTecnicos(tecs || [])
      setOsComCoords(geocodadas)
      setCarregando(false)
    }
    carregar()
  }, [])

  if (carregando) return (
    <div style={{ minHeight:'100vh', background:'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#4A7FC1' }}>Carregando dados do mapa...</div>
    </div>
  )

  return <MapaMonitoramento tecnicos={tecnicos} osLista={osComCoords} onVoltar={onVoltar} titulo="Monitoramento de equipes" />
}

function PainelAdm({ perfil, onLogout }) {
  const [tela, setTela] = useState('home')
  const [telaParams, setTelaParams] = useState(null)
  const [contadores, setContadores] = useState({
    novo:0, agendar_ec:0, aguardando_ec:0, confirmado_ec:0, liberado_lider:0, em_campo:0, elaborar_rm:0, concluido:0
  })

  useEffect(() => { if (tela === 'home') carregarContadores() }, [tela])

  // Capturar localizacao do ADM
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        await supabase.from('perfis').update({ lat, lng, ultima_localizacao: new Date().toISOString() }).eq('id', perfil.id)
      })
    }
  }, [])

  async function carregarContadores() {
    const { data } = await supabase.from('ordens_servico').select('status')
    if (!data) return
    const c = { novo:0, agendar_ec:0, aguardando_ec:0, confirmado_ec:0, liberado_lider:0, em_campo:0, elaborar_rm:0, concluido:0 }
    data.forEach(os => { if (c[os.status] !== undefined) c[os.status]++ })
    setContadores(c)
  }

  function abrirLista(titulo, status) {
    setTelaParams({ titulo, status })
    setTela('lista')
  }

  async function abrirOS(osBasica) {
    // Busca dados atualizados do banco antes de abrir
    const { data } = await supabase.from('ordens_servico').select('*').eq('id', osBasica.id).single()
    setTelaParams(data || osBasica)
    setTela('detalhes')
  }

  if (tela === 'mapa') return <MapaAdm onVoltar={() => setTela('home')} />
  if (tela === 'nova_os') return <FormNovaOS perfil={perfil} onVoltar={() => setTela('home')} onSalvo={() => setTela('home')} />
  if (tela === 'lista') return <ListaOS titulo={telaParams.titulo} status={telaParams.status} onVoltar={() => setTela('home')} onVerOS={abrirOS} />
  if (tela === 'elaborar_rm') return <ElaborarRM os={telaParams} onVoltar={() => { setTelaParams(prev => prev); setTela('detalhes') }} onConcluir={() => setTela('home')} />
  if (tela === 'detalhes') return <DetalhesOS os={telaParams} onVoltar={() => setTela('lista')} onAtualizar={() => setTela('home')} onElaborarRM={(os) => { setTelaParams(os); setTela('elaborar_rm') }} />

  return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column' }}>
      <Header nome={perfil.nome} tipo="ADM · Grupo PG" onLogout={onLogout} />
      <div style={{ flex:1, background:'#E6F1FB', padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em' }}>Fila de trabalho</div>
          <button onClick={() => setTela('mapa')} style={{ fontSize:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontWeight:500 }}>Mapa</button>
        </div>
        <Caixa num={contadores.novo} label="Novas OS" corFundo="#FAEEDA" corTexto="#412402" onClick={() => abrirLista('Novas OS', 'novo')} />
        <Caixa num={contadores.agendar_ec + contadores.aguardando_ec} label="Em contato com EC" corFundo="#EEEDFE" corTexto="#26215C" onClick={() => abrirLista('Em contato com EC', ['agendar_ec','aguardando_ec'])} />
        <Caixa num={contadores.confirmado_ec} label="Confirmado com EC" corFundo="#D4F0E4" corTexto="#0F6E56" onClick={() => abrirLista('Confirmado com EC', 'confirmado_ec')} />
        <Caixa num={contadores.liberado_lider} label="Liberado p/ Lider" corFundo="#E6F1FB" corTexto="#0C447C" onClick={() => abrirLista('Liberado p/ Lider', 'liberado_lider')} />
        <div style={{ fontSize:11, fontWeight:500, color:'#4A7FC1', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 10px' }}>Em andamento</div>
        <Caixa num={contadores.em_campo} label="No campo" corFundo="#EAF3DE" corTexto="#27500A" onClick={() => abrirLista('No campo', 'em_campo')} />
        <Caixa num={contadores.elaborar_rm} label="Elaborar RM" corFundo="#F5CBA7" corTexto="#935116" onClick={() => abrirLista('Elaborar RM', 'elaborar_rm')} />
        <Caixa num={contadores.concluido} label="Concluidas" corFundo="#E8F5EE" corTexto="#0F6E56" onClick={() => abrirLista('Concluidas', 'concluido')} />
        <button onClick={() => setTela('nova_os')}
          style={{ width:'100%', padding:13, background:'#3C3489', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:500, cursor:'pointer', borderBottom:'3px solid #26215C', marginTop:8 }}>
          + Nova OS manual
        </button>
      </div>
    </div>
  )
}
