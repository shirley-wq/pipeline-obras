import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Módulo de Frota dentro do Pipeline (Shirley, 2026-09-14) - registro OPERACIONAL de uso de
// veículo (não é ponto oficial pra folha, isso continua no Ponto Mais). Reaproveita as tabelas
// frota_veiculos/frota_registros que já existiam no banco (migradas do frota-pg_v8.html em
// 2026-09-01, nunca usadas por nenhuma tela até agora) - ver [[project-pipeline-obras]].
//
// Mecânica: 1 viagem = 1 linha em frota_registros (type='bordo'), aberta no início (km_inicio,
// date, time) e fechada depois (km_fim, date_fim, time_fim, km_rodados, closed=true). Um
// colaborador só pode ter 1 viagem aberta por vez - trava pra não perder o controle de KM se
// esquecer de fechar o veículo anterior (pedido explícito da Shirley).

const TIPOS_ICONE = { carro: '🚗', furgao: '🚐', caminhonete: '🛻', moto: '🏍️', suv: '🚙', maquina: '🚜' }

function hojeIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function agoraHora() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function isoToBr(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function normalizarBusca(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
function fmtDuracao(inicioIso, fimIso) {
  if (!inicioIso || !fimIso) return null
  const min = Math.round((new Date(fimIso) - new Date(inicioIso)) / 60000)
  if (min < 0) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`
}

export default function Frota({ usuario, meuRH, obras, podeVerPainelGeral }) {
  const [veiculos, setVeiculos] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [viagemAberta, setViagemAberta] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [subaba, setSubaba] = useState('minhaViagem')

  const [buscaVeiculo, setBuscaVeiculo] = useState('')
  const [veiculoEscolhido, setVeiculoEscolhido] = useState(null)
  const [temObra, setTemObra] = useState(true)
  const [obraId, setObraId] = useState('')
  const [buscaObra, setBuscaObra] = useState('')
  const [motivoSemObra, setMotivoSemObra] = useState('')
  const [kmInicio, setKmInicio] = useState('')
  const [salvandoAbertura, setSalvandoAbertura] = useState(false)
  const [erroAbertura, setErroAbertura] = useState('')

  const [kmFim, setKmFim] = useState('')
  const [salvandoFechamento, setSalvandoFechamento] = useState(false)
  const [erroFechamento, setErroFechamento] = useState('')

  const [painelViagens, setPainelViagens] = useState([])
  const [carregandoPainel, setCarregandoPainel] = useState(false)

  const nomeCompleto = meuRH ? `${meuRH.nome} ${meuRH.sobrenome || ''}`.trim() : (usuario?.email || '')

  useEffect(() => {
    carregarTudo()
  }, [nomeCompleto])

  async function carregarTudo() {
    if (!nomeCompleto) return
    setCarregando(true)
    // Usa order + limit(1) em vez de maybeSingle() - maybeSingle() falha (e engole o erro) se
    // por qualquer motivo existir mais de uma viagem aberta ao mesmo tempo pro mesmo colaborador,
    // e a trava "não deixa abrir outra sem fechar a anterior" para de funcionar em silêncio
    // (achado real testando, Shirley, 2026-09-14). Assim sempre pega a mais recente das abertas.
    const [{ data: vs }, { data: abertas }] = await Promise.all([
      supabase.from('frota_veiculos').select('*').order('placa'),
      supabase.from('frota_registros').select('*').eq('collab', nomeCompleto).eq('type', 'bordo').eq('closed', false).order('criado_em', { ascending: false }).limit(1),
    ])
    setVeiculos(vs || [])
    setViagemAberta((abertas && abertas[0]) || null)
    setFavoritos(Array.isArray(meuRH?.veiculos_favoritos) ? meuRH.veiculos_favoritos : [])
    setCarregando(false)
  }

  async function toggleFavorito(placa) {
    if (!meuRH?.id) return
    const novos = favoritos.includes(placa) ? favoritos.filter(p => p !== placa) : [...favoritos, placa]
    setFavoritos(novos)
    await supabase.from('rh_colaboradores').update({ veiculos_favoritos: novos }).eq('id', meuRH.id)
  }

  async function abrirViagem() {
    setErroAbertura('')
    if (!veiculoEscolhido) { setErroAbertura('Escolha um veículo.'); return }
    if (!kmInicio || isNaN(Number(kmInicio))) { setErroAbertura('Informe o KM de saída.'); return }
    if (temObra && !obraId) { setErroAbertura('Escolha a obra, ou marque "Sem obra".'); return }
    if (!temObra && !motivoSemObra.trim()) { setErroAbertura('Descreva o motivo (compra de material, treino, etc.).'); return }
    setSalvandoAbertura(true)
    const registro = {
      type: 'bordo',
      subtype: temObra ? 'obra' : 'outro',
      plate: veiculoEscolhido.placa,
      collab: nomeCompleto,
      obra_id: temObra ? obraId : null,
      obs: temObra ? null : motivoSemObra.trim(),
      km_inicio: Number(kmInicio),
      date: hojeIso(),
      time: agoraHora(),
      closed: false,
    }
    const { data, error } = await supabase.from('frota_registros').insert(registro).select().single()
    setSalvandoAbertura(false)
    if (error) {
      // 23505 = trava do banco (frota_registros_uma_aberta_por_colab) barrou por já existir uma
      // viagem aberta - a tela ficava "travada" sem explicar por quê (Shirley, 2026-09-14).
      // Busca a viagem real e já troca de tela sozinho, em vez de só mostrar erro técnico.
      if (error.code === '23505') {
        const { data: aberta } = await supabase.from('frota_registros').select('*')
          .eq('collab', nomeCompleto).eq('type', 'bordo').eq('closed', false)
          .order('criado_em', { ascending: false }).limit(1)
        setViagemAberta((aberta && aberta[0]) || null)
        setErroAbertura('')
      } else {
        setErroAbertura('Erro ao salvar: ' + error.message)
      }
      return
    }
    setViagemAberta(data)
    setVeiculoEscolhido(null)
    setObraId('')
    setBuscaObra('')
    setMotivoSemObra('')
    setKmInicio('')
  }

  async function fecharViagem() {
    setErroFechamento('')
    if (!kmFim || isNaN(Number(kmFim))) { setErroFechamento('Informe o KM de chegada.'); return }
    const kmRodados = Number(kmFim) - Number(viagemAberta.km_inicio)
    if (kmRodados < 0) { setErroFechamento('KM de chegada não pode ser menor que o KM de saída (' + viagemAberta.km_inicio + ').'); return }
    setSalvandoFechamento(true)
    const campos = {
      km_fim: Number(kmFim),
      km_rodados: kmRodados,
      date_fim: hojeIso(),
      time_fim: agoraHora(),
      fechado_por: usuario?.email || null,
      closed: true,
    }
    const { error } = await supabase.from('frota_registros').update(campos).eq('id', viagemAberta.id)
    setSalvandoFechamento(false)
    if (error) { setErroFechamento('Erro ao salvar: ' + error.message); return }
    setViagemAberta(null)
    setKmFim('')
  }

  async function carregarPainel() {
    setCarregandoPainel(true)
    const { data } = await supabase.from('frota_registros').select('*')
      .eq('type', 'bordo').order('date', { ascending: false }).order('time', { ascending: false }).limit(60)
    setPainelViagens(data || [])
    setCarregandoPainel(false)
  }

  useEffect(() => {
    if (subaba === 'painel' && podeVerPainelGeral) carregarPainel()
  }, [subaba])

  if (carregando) return <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>Carregando...</div>

  const veiculosFiltrados = veiculos
    .filter(v => !buscaVeiculo || `${v.placa} ${v.modelo}`.toLowerCase().includes(buscaVeiculo.toLowerCase()))
    .sort((a, b) => {
      const favA = favoritos.includes(a.placa) ? 0 : 1
      const favB = favoritos.includes(b.placa) ? 0 : 1
      return favA - favB || a.placa.localeCompare(b.placa)
    })

  const obrasParaEscolher = (obras || []).filter(o => o.status !== 'NF EMITIDO' && o.status !== 'CANCELADO')
  const obrasFiltradas = obraId ? [] : obrasParaEscolher.filter(o => {
    if (!buscaObra) return true
    const termo = normalizarBusca(buscaObra)
    const campos = normalizarBusca([o.nome, o.numero_pc, o.cidade, o.sige].filter(Boolean).join(' '))
    return termo.trim().split(/\s+/).filter(Boolean).every(p => campos.includes(p))
  }).slice(0, 30)
  const obraEscolhida = obraId ? (obras || []).find(o => o.id === obraId) : null

  const inp = { width: '100%', padding: '9px 10px', border: '1px solid #CDD8E3', borderRadius: 8, fontSize: 13, color: '#1A2340', boxSizing: 'border-box' }

  return (
    <div style={{ padding: 12 }}>
      {podeVerPainelGeral && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button onClick={() => setSubaba('minhaViagem')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: subaba === 'minhaViagem' ? '#7C2D12' : '#F1F5F9', color: subaba === 'minhaViagem' ? '#fff' : '#1A2340', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            🚗 Minha viagem
          </button>
          <button onClick={() => setSubaba('painel')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: subaba === 'painel' ? '#7C2D12' : '#F1F5F9', color: subaba === 'painel' ? '#fff' : '#1A2340', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            📋 Painel geral
          </button>
        </div>
      )}

      {subaba === 'minhaViagem' && (
        <>
          {viagemAberta ? (
            <div style={{ background: '#FFF7ED', border: '2px solid #FDBA74', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ background: '#7C2D12', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  🔒 {TIPOS_ICONE[veiculos.find(v => v.placa === viagemAberta.plate)?.tipo] || '🚗'} Esse veículo ({viagemAberta.plate}) já está em uso com você
                </div>
                <div style={{ fontSize: 13, color: '#FED7AA', lineHeight: 1.5 }}>
                  Você deu início nessa viagem às <b>{viagemAberta.time}</b> ({isoToBr(viagemAberta.date)}), com <b>KM {viagemAberta.km_inicio}</b> de saída
                  {viagemAberta.obra_id ? (() => { const o = (obras || []).find(x => x.id === viagemAberta.obra_id); return o ? <> — obra <b>{o.nome}</b></> : '' })() : viagemAberta.obs ? <> — <b>{viagemAberta.obs}</b></> : ''}.
                  <br />Encerre essa viagem antes de poder escolher outro veículo.
                </div>
              </div>
              <label style={{ fontSize: 11, color: '#9A3412', fontWeight: 600, display: 'block', marginBottom: 3 }}>KM de chegada</label>
              <input type="number" value={kmFim} onChange={e => setKmFim(e.target.value)} placeholder={`Ex: ${Number(viagemAberta.km_inicio) + 10}`} style={{ ...inp, marginBottom: 8 }} />
              {erroFechamento && <div style={{ color: '#DC2626', fontSize: 12, marginBottom: 8 }}>{erroFechamento}</div>}
              <button onClick={fecharViagem} disabled={salvandoFechamento}
                style={{ width: '100%', padding: 12, background: salvandoFechamento ? '#94A3B8' : '#9A3412', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: salvandoFechamento ? 'default' : 'pointer' }}>
                {salvandoFechamento ? 'Salvando...' : '🏁 Encerrar viagem'}
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340', marginBottom: 10 }}>Escolher veículo</div>
              <input value={buscaVeiculo} onChange={e => setBuscaVeiculo(e.target.value)} placeholder="🔎 Buscar por placa ou modelo..."
                style={{ ...inp, marginBottom: 10 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
                {veiculosFiltrados.map(v => {
                  const selecionado = veiculoEscolhido?.placa === v.placa
                  const favorito = favoritos.includes(v.placa)
                  return (
                    <div key={v.placa} onClick={() => setVeiculoEscolhido(v)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: selecionado ? '2px solid #7C2D12' : '1px solid #E0E8F0', borderRadius: 8, cursor: 'pointer', background: selecionado ? '#FFF7ED' : '#fff' }}>
                      <span style={{ fontSize: 18 }}>{TIPOS_ICONE[v.tipo] || '🚗'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>{v.placa}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{v.modelo}{v.cor ? ` · ${v.cor}` : ''}</div>
                      </div>
                      <span onClick={e => { e.stopPropagation(); toggleFavorito(v.placa) }} style={{ fontSize: 18, cursor: 'pointer', color: favorito ? '#F59E0B' : '#CBD5E1' }}>★</span>
                    </div>
                  )
                })}
                {veiculosFiltrados.length === 0 && <div style={{ textAlign: 'center', color: '#888', fontSize: 12, padding: 12 }}>Nenhum veículo encontrado.</div>}
              </div>

              {veiculoEscolhido && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E0E8F0', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2340', marginBottom: 10 }}>Saindo com {veiculoEscolhido.placa}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span onClick={() => setTemObra(true)} style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: temObra ? '#7C2D12' : '#F1F5F9', color: temObra ? '#fff' : '#1A2340' }}>Vinculado a uma obra</span>
                    <span onClick={() => setTemObra(false)} style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, background: !temObra ? '#7C2D12' : '#F1F5F9', color: !temObra ? '#fff' : '#1A2340' }}>Sem obra</span>
                  </div>
                  {temObra ? (
                    obraEscolhida ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', border: '1px solid #CDD8E3', borderRadius: 8, marginBottom: 10, background: '#fff' }}>
                        <div style={{ flex: 1, fontSize: 13, color: '#1A2340' }}>
                          <b>{obraEscolhida.nome}</b>{obraEscolhida.numero_pc ? ` · PC ${obraEscolhida.numero_pc}` : ''}{obraEscolhida.cidade ? ` · ${obraEscolhida.cidade}` : ''}
                        </div>
                        <span onClick={() => { setObraId(''); setBuscaObra('') }} style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, cursor: 'pointer' }}>trocar</span>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 10 }}>
                        <input value={buscaObra} onChange={e => setBuscaObra(e.target.value)} placeholder="🔎 Buscar obra por nome, PC ou cidade..." style={inp} />
                        <div style={{ maxHeight: 180, overflowY: 'auto', border: buscaObra ? '1px solid #E0E8F0' : 'none', borderRadius: 8, marginTop: buscaObra ? 4 : 0 }}>
                          {buscaObra && obrasFiltradas.map(o => (
                            <div key={o.id} onClick={() => { setObraId(o.id); setBuscaObra('') }}
                              style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: 12, color: '#1A2340' }}>
                              <b>{o.nome}</b>{o.numero_pc ? ` · PC ${o.numero_pc}` : ''}{o.cidade ? ` · ${o.cidade}` : ''}
                            </div>
                          ))}
                          {buscaObra && obrasFiltradas.length === 0 && (
                            <div style={{ padding: '8px 10px', fontSize: 12, color: '#888' }}>Nenhuma obra encontrada.</div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <input value={motivoSemObra} onChange={e => setMotivoSemObra(e.target.value)} placeholder="Motivo (compra de material, treino, etc.)"
                      style={{ ...inp, marginBottom: 10 }} />
                  )}
                  <label style={{ fontSize: 11, color: '#4A7FC1', fontWeight: 600, display: 'block', marginBottom: 3 }}>KM de saída</label>
                  <input type="number" value={kmInicio} onChange={e => setKmInicio(e.target.value)} placeholder="Ex: 45200" style={{ ...inp, marginBottom: 10 }} />
                  {erroAbertura && (
                    <div style={{ background: '#FEF2F2', border: '2px solid #DC2626', borderRadius: 8, padding: '10px 12px', marginBottom: 10, color: '#991B1B', fontSize: 13, fontWeight: 700 }}>
                      ⚠️ {erroAbertura}
                    </div>
                  )}
                  <button onClick={abrirViagem} disabled={salvandoAbertura}
                    style={{ width: '100%', padding: 12, background: salvandoAbertura ? '#94A3B8' : '#1A6B4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: salvandoAbertura ? 'default' : 'pointer' }}>
                    {salvandoAbertura ? 'Salvando...' : '🚀 Iniciar viagem'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {subaba === 'painel' && podeVerPainelGeral && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340', marginBottom: 10 }}>Últimas viagens (todo mundo)</div>
          {carregandoPainel ? (
            <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>Carregando...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {painelViagens.map(r => {
                const obra = r.obra_id ? (obras || []).find(o => o.id === r.obra_id) : null
                return (
                  <div key={r.id} style={{ background: '#fff', border: r.closed ? '1px solid #E0E8F0' : '2px solid #FDBA74', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>{r.collab}</div>
                      {!r.closed && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#FFF7ED', color: '#9A3412' }}>EM ANDAMENTO</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      🚗 {r.plate} · saída {r.time} ({isoToBr(r.date)}) - KM {r.km_inicio}
                      {r.closed && <> · chegada {r.time_fim} - KM {r.km_fim} · {r.km_rodados} km rodados{fmtDuracao(`${r.date}T${r.time}`, `${r.date_fim}T${r.time_fim}`) ? ` · ${fmtDuracao(`${r.date}T${r.time}`, `${r.date_fim}T${r.time_fim}`)}` : ''}</>}
                    </div>
                    <div style={{ fontSize: 11, color: '#4A7FC1', marginTop: 2 }}>{obra ? obra.nome : r.obs ? `Sem obra — ${r.obs}` : '—'}</div>
                  </div>
                )
              })}
              {painelViagens.length === 0 && <div style={{ textAlign: 'center', color: '#888', fontSize: 12, padding: 12 }}>Nenhuma viagem registrada ainda.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
