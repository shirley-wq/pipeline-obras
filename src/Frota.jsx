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

// Manutenção preventiva (Shirley, 2026-09-14) - a ideia é reduzir corretiva sabendo com
// antecedência quando cada item vence, por km e/ou por tempo (o que vencer primeiro). "reparo" e
// "outro" não entram por padrão na previsão recorrente (é registro de ocorrência, não plano
// preventivo), mas aceitam intervalo manual se quem registrar quiser.
const ITENS_MANUTENCAO = [
  { id: 'pneu', label: 'Pneus', icone: '🛞', kmSugerido: 40000, diasSugerido: null },
  { id: 'pastilha_freio', label: 'Pastilhas de freio', icone: '🛑', kmSugerido: 20000, diasSugerido: null },
  { id: 'oleo_motor', label: 'Óleo do motor', icone: '🛢️', kmSugerido: 10000, diasSugerido: 180 },
  { id: 'filtro_oleo', label: 'Filtro de óleo', icone: '🧯', kmSugerido: 10000, diasSugerido: 180 },
  { id: 'oleo_outros', label: 'Outros óleos (câmbio/direção)', icone: '🛢️', kmSugerido: 40000, diasSugerido: 365 },
  { id: 'bateria', label: 'Bateria', icone: '🔋', kmSugerido: null, diasSugerido: 730 },
  { id: 'reparo', label: 'Reparo de batida/dano', icone: '🛠️', kmSugerido: null, diasSugerido: null },
  { id: 'outro', label: 'Outro', icone: '🔧', kmSugerido: null, diasSugerido: null },
]

// Pior status entre "por km" e "por data" do último registro daquele item - o que vencer primeiro
// manda. Limites de "atenção" (15 dias / 1500 km antes) são um chute inicial, dá pra ajustar depois
// se a Shirley achar cedo/tarde demais.
function statusManutencao(reg, kmAtual) {
  if (!reg) return { status: 'sem_registro', diasRestantes: null, kmRestante: null }
  let diasRestantes = null, kmRestante = null
  if (reg.intervalo_dias) {
    const prevista = new Date(reg.data_realizada + 'T00:00:00')
    prevista.setDate(prevista.getDate() + reg.intervalo_dias)
    diasRestantes = Math.round((prevista - new Date()) / 86400000)
  }
  if (reg.intervalo_km && reg.km_realizada != null && kmAtual != null) {
    kmRestante = (Number(reg.km_realizada) + Number(reg.intervalo_km)) - Number(kmAtual)
  }
  if (diasRestantes === null && kmRestante === null) return { status: 'sem_previsao', diasRestantes, kmRestante }
  const classificar = (v, limiteAtencao) => (v == null ? null : v < 0 ? 'vencido' : v <= limiteAtencao ? 'atencao' : 'ok')
  const candidatos = [classificar(diasRestantes, 15), classificar(kmRestante, 1500)].filter(Boolean)
  const ordem = { vencido: 3, atencao: 2, ok: 1 }
  const status = candidatos.reduce((pior, atual) => (ordem[atual] > ordem[pior] ? atual : pior), 'ok')
  return { status, diasRestantes, kmRestante }
}

const COR_STATUS_MANUTENCAO = {
  vencido: { bg: '#FEF2F2', border: '#DC2626', texto: '#991B1B', label: 'VENCIDO' },
  atencao: { bg: '#FFFBEB', border: '#F59E0B', texto: '#92400E', label: 'PRÓXIMO DO VENCIMENTO' },
  ok: { bg: '#F0FDF4', border: '#16A34A', texto: '#166534', label: 'EM DIA' },
  sem_previsao: { bg: '#F8FAFC', border: '#CBD5E1', texto: '#64748B', label: 'SEM PREVISÃO CADASTRADA' },
  sem_registro: { bg: '#F8FAFC', border: '#CBD5E1', texto: '#64748B', label: 'NUNCA REGISTRADO' },
}

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
  const [veiculosEmUso, setVeiculosEmUso] = useState({}) // placa -> registro aberto (de qualquer pessoa)

  const [manutencoes, setManutencoes] = useState([])
  const [veiculoManutencaoAberto, setVeiculoManutencaoAberto] = useState(null)
  const [novoItemManutencao, setNovoItemManutencao] = useState(null) // { placa, item }
  const [formManutencao, setFormManutencao] = useState({ data: hojeIso(), km: '', intervaloKm: '', intervaloDias: '', observacoes: '', valor: '' })
  const [salvandoManutencao, setSalvandoManutencao] = useState(false)

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
    const [{ data: vs }, { data: abertas }, { data: todasAbertas }, { data: manuts }] = await Promise.all([
      supabase.from('frota_veiculos').select('*').order('placa'),
      supabase.from('frota_registros').select('*').eq('collab', nomeCompleto).eq('type', 'bordo').eq('closed', false).order('criado_em', { ascending: false }).limit(1),
      supabase.from('frota_registros').select('*').eq('type', 'bordo').eq('closed', false),
      supabase.from('frota_manutencoes').select('*').order('data_realizada', { ascending: false }).order('criado_em', { ascending: false }),
    ])
    setVeiculos(vs || [])
    setManutencoes(manuts || [])
    setViagemAberta((abertas && abertas[0]) || null)
    // Mapa placa -> quem está com ela agora (de todo mundo, não só eu) - pra avisar antes de
    // deixar escolher um carro que já está em uso por outra pessoa (Shirley, 2026-09-14: viu o
    // mesmo veículo aberto em 2 contas ao mesmo tempo).
    const mapaUso = {}
    ;(todasAbertas || []).forEach(r => { mapaUso[r.plate] = r })
    setVeiculosEmUso(mapaUso)
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
      // 23505 = alguma das duas travas do banco barrou (Shirley, 2026-09-14): ou eu mesmo já
      // tenho uma viagem aberta (frota_registros_uma_aberta_por_colab), ou esse veículo acabou de
      // ser pego por outra pessoa entre eu carregar a tela e clicar em Iniciar (raro, mas a UI já
      // desabilita veículo em uso - isso é só a rede de segurança final). Em vez de mostrar o erro
      // técnico cru, busca o que realmente aconteceu e explica.
      if (error.code === '23505' && error.message.includes('frota_registros_uma_aberta_por_colab')) {
        const { data: aberta } = await supabase.from('frota_registros').select('*')
          .eq('collab', nomeCompleto).eq('type', 'bordo').eq('closed', false)
          .order('criado_em', { ascending: false }).limit(1)
        setViagemAberta((aberta && aberta[0]) || null)
        setErroAbertura('')
      } else if (error.code === '23505' && error.message.includes('frota_registros_veiculo_em_uso')) {
        const { data: usoAtual } = await supabase.from('frota_registros').select('*')
          .eq('plate', veiculoEscolhido.placa).eq('type', 'bordo').eq('closed', false)
          .order('criado_em', { ascending: false }).limit(1)
        const u = usoAtual && usoAtual[0]
        setErroAbertura(u ? `Esse veículo acabou de ser pego por ${u.collab} (${u.time}). Escolha outro.` : 'Esse veículo já está em uso por outra pessoa. Escolha outro.')
        setVeiculoEscolhido(null)
        carregarTudo()
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
    // Mantém o KM atual do veículo sempre atualizado, pra previsão de manutenção por km funcionar
    // sem precisar recalcular varrendo o histórico de viagens toda hora (Shirley, 2026-09-14).
    await supabase.from('frota_veiculos').update({ km_atual: Number(kmFim) }).eq('placa', viagemAberta.plate)
    setViagemAberta(null)
    setKmFim('')
    carregarTudo()
  }

  // Último registro daquele item de manutenção pra aquela placa - manutencoes já vem ordenado por
  // data_realizada/criado_em desc, então o primeiro que bater é o mais recente.
  function ultimaManutencao(placa, item) {
    return manutencoes.find(m => m.placa === placa && m.item === item) || null
  }

  // Pior status entre os itens recorrentes daquele veículo - usado pro aviso grande de "leve pra
  // manutenção" e pro selo na lista de veículos. "reparo"/"outro" ficam de fora por não serem
  // recorrentes por padrão.
  function piorStatusVeiculo(placa) {
    const kmAtual = veiculos.find(v => v.placa === placa)?.km_atual ?? null
    const ordem = { vencido: 2, atencao: 1 }
    let pior = null
    ITENS_MANUTENCAO.forEach(it => {
      if (it.id === 'reparo' || it.id === 'outro') return
      const { status } = statusManutencao(ultimaManutencao(placa, it.id), kmAtual)
      if ((status === 'vencido' || status === 'atencao') && (!pior || ordem[status] > ordem[pior.status])) {
        pior = { status, item: it }
      }
    })
    return pior
  }

  function abrirFormManutencao(placa, item) {
    const def = ITENS_MANUTENCAO.find(i => i.id === item)
    const veic = veiculos.find(v => v.placa === placa)
    setNovoItemManutencao({ placa, item })
    setFormManutencao({
      data: hojeIso(),
      km: veic?.km_atual != null ? String(veic.km_atual) : '',
      intervaloKm: def?.kmSugerido != null ? String(def.kmSugerido) : '',
      intervaloDias: def?.diasSugerido != null ? String(def.diasSugerido) : '',
      observacoes: '',
      valor: '',
    })
  }

  async function salvarManutencao() {
    if (!novoItemManutencao || !formManutencao.data) return
    setSalvandoManutencao(true)
    const registro = {
      placa: novoItemManutencao.placa,
      item: novoItemManutencao.item,
      data_realizada: formManutencao.data,
      km_realizada: formManutencao.km ? Number(formManutencao.km) : null,
      intervalo_km: formManutencao.intervaloKm ? Number(formManutencao.intervaloKm) : null,
      intervalo_dias: formManutencao.intervaloDias ? Number(formManutencao.intervaloDias) : null,
      observacoes: formManutencao.observacoes.trim() || null,
      valor: formManutencao.valor ? Number(String(formManutencao.valor).replace(',', '.')) : null,
      registrado_por: usuario?.email || null,
    }
    const { error } = await supabase.from('frota_manutencoes').insert(registro)
    setSalvandoManutencao(false)
    if (error) { alert('Erro ao salvar: ' + error.message); return }
    setNovoItemManutencao(null)
    carregarTudo()
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setSubaba('minhaViagem')}
          style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: subaba === 'minhaViagem' ? '#7C2D12' : '#F1F5F9', color: subaba === 'minhaViagem' ? '#fff' : '#1A2340', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          🚗 Minha viagem
        </button>
        <button onClick={() => setSubaba('manutencao')}
          style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: subaba === 'manutencao' ? '#7C2D12' : '#F1F5F9', color: subaba === 'manutencao' ? '#fff' : '#1A2340', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          🔧 Manutenção
        </button>
        {podeVerPainelGeral && (
          <button onClick={() => setSubaba('painel')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: subaba === 'painel' ? '#7C2D12' : '#F1F5F9', color: subaba === 'painel' ? '#fff' : '#1A2340', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            📋 Painel geral
          </button>
        )}
      </div>

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
              {(() => {
                const pior = piorStatusVeiculo(viagemAberta.plate)
                if (!pior) return null
                const cor = COR_STATUS_MANUTENCAO[pior.status]
                return (
                  <div style={{ background: cor.bg, border: `3px solid ${cor.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: cor.texto, marginBottom: 4 }}>
                      {pior.status === 'vencido' ? '🚨' : '⚠️'} {pior.item.icone} {pior.item.label} {pior.status === 'vencido' ? 'VENCIDO' : 'PRÓXIMO DO VENCIMENTO'} nesse veículo!
                    </div>
                    <div style={{ fontSize: 12, color: cor.texto }}>Leve o carro pra manutenção assim que possível. Veja detalhes na aba "🔧 Manutenção".</div>
                  </div>
                )
              })()}
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
                  const emUso = veiculosEmUso[v.placa]
                  const piorManut = piorStatusVeiculo(v.placa)
                  return (
                    <div key={v.placa} onClick={() => { if (!emUso) setVeiculoEscolhido(v) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: emUso ? '12px' : '9px 12px', border: emUso ? '2px solid #F59E0B' : selecionado ? '2px solid #7C2D12' : '1px solid #E0E8F0', borderRadius: 8, cursor: emUso ? 'not-allowed' : 'pointer', background: emUso ? '#FFFBEB' : selecionado ? '#FFF7ED' : '#fff' }}>
                      <span style={{ fontSize: emUso ? 22 : 18 }}>{emUso ? '🔒' : (TIPOS_ICONE[v.tipo] || '🚗')}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2340' }}>{v.placa}</div>
                        {emUso ? (
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3412' }}>Em uso por {emUso.collab} desde {emUso.time}</div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#64748B' }}>{v.modelo}{v.cor ? ` · ${v.cor}` : ''}</div>
                        )}
                      </div>
                      {piorManut && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: COR_STATUS_MANUTENCAO[piorManut.status].border, color: '#fff', whiteSpace: 'nowrap' }}>
                          {piorManut.status === 'vencido' ? '🚨 MANUTENÇÃO VENCIDA' : '⚠️ MANUTENÇÃO PRÓXIMA'}
                        </span>
                      )}
                      {!emUso && (
                        <span onClick={e => { e.stopPropagation(); toggleFavorito(v.placa) }} style={{ fontSize: 18, cursor: 'pointer', color: favorito ? '#F59E0B' : '#CBD5E1' }}>★</span>
                      )}
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

      {subaba === 'manutencao' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>Manutenção preventiva por veículo</div>
            {podeVerPainelGeral && (
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A6B4A', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '4px 10px' }}>
                Total gasto em manutenção: R$ {manutencoes.reduce((s, m) => s + (Number(m.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {veiculos.map(v => {
              const pior = piorStatusVeiculo(v.placa)
              const corResumo = pior ? COR_STATUS_MANUTENCAO[pior.status] : null
              const aberto = veiculoManutencaoAberto === v.placa
              const totalVeiculo = manutencoes.filter(m => m.placa === v.placa).reduce((s, m) => s + (Number(m.valor) || 0), 0)
              return (
                <div key={v.placa} style={{ background: '#fff', border: `1px solid ${pior ? corResumo.border : '#E0E8F0'}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div onClick={() => setVeiculoManutencaoAberto(aberto ? null : v.placa)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: pior ? corResumo.bg : '#fff' }}>
                    <span style={{ fontSize: 18 }}>{TIPOS_ICONE[v.tipo] || '🚗'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>{v.placa} <span style={{ fontWeight: 400, color: '#64748B' }}>· {v.modelo}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {v.km_atual != null && <>KM atual: {v.km_atual}</>}
                        {podeVerPainelGeral && totalVeiculo > 0 && <>{v.km_atual != null ? ' · ' : ''}Gasto: R$ {totalVeiculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>}
                      </div>
                    </div>
                    {pior && (
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: corResumo.border, color: '#fff', whiteSpace: 'nowrap' }}>
                        {pior.status === 'vencido' ? '🚨 VENCIDO' : '⚠️ PRÓXIMO'}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{aberto ? '▲' : '▼'}</span>
                  </div>
                  {aberto && (
                    <div style={{ padding: '4px 14px 10px' }}>
                      {ITENS_MANUTENCAO.map(it => {
                        const reg = ultimaManutencao(v.placa, it.id)
                        const { status, diasRestantes, kmRestante } = statusManutencao(reg, v.km_atual)
                        const cor = COR_STATUS_MANUTENCAO[status]
                        return (
                          <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 16 }}>{it.icone}</span>
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2340' }}>{it.label}</div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>
                                {reg ? (
                                  <>
                                    Última: {isoToBr(reg.data_realizada)}{reg.km_realizada != null ? ` (KM ${reg.km_realizada})` : ''}
                                    {diasRestantes != null && <> · {diasRestantes < 0 ? `${-diasRestantes} dias atrasado` : `faltam ${diasRestantes} dias`}</>}
                                    {kmRestante != null && <> · {kmRestante < 0 ? `${-kmRestante} km atrasado` : `faltam ${kmRestante} km`}</>}
                                  </>
                                ) : 'Nunca registrado'}
                              </div>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: cor.bg, color: cor.texto, border: `1px solid ${cor.border}`, whiteSpace: 'nowrap' }}>{cor.label}</span>
                            <button onClick={() => abrirFormManutencao(v.placa, it.id)}
                              style={{ fontSize: 11, fontWeight: 700, padding: '5px 9px', border: 'none', borderRadius: 6, background: '#1A6B4A', color: '#fff', cursor: 'pointer' }}>
                              Registrar
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {veiculos.length === 0 && <div style={{ textAlign: 'center', color: '#888', fontSize: 12, padding: 12 }}>Nenhum veículo cadastrado.</div>}
          </div>

          {novoItemManutencao && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 360, maxWidth: '100%' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2340', marginBottom: 12 }}>
                  Registrar {ITENS_MANUTENCAO.find(i => i.id === novoItemManutencao.item)?.label} — {novoItemManutencao.placa}
                </div>
                <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>Data realizada</label>
                <input type="date" value={formManutencao.data} onChange={e => setFormManutencao(f => ({ ...f, data: e.target.value }))} style={{ ...inp, marginBottom: 8 }} />
                <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>KM no momento (opcional)</label>
                <input type="number" value={formManutencao.km} onChange={e => setFormManutencao(f => ({ ...f, km: e.target.value }))} style={{ ...inp, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>Próxima em quantos KM</label>
                    <input type="number" value={formManutencao.intervaloKm} onChange={e => setFormManutencao(f => ({ ...f, intervaloKm: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>Próxima em quantos dias</label>
                    <input type="number" value={formManutencao.intervaloDias} onChange={e => setFormManutencao(f => ({ ...f, intervaloDias: e.target.value }))} style={inp} />
                  </div>
                </div>
                <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>Valor gasto (R$, opcional)</label>
                <input type="number" step="0.01" value={formManutencao.valor} onChange={e => setFormManutencao(f => ({ ...f, valor: e.target.value }))} placeholder="Ex: 350.00" style={{ ...inp, marginBottom: 8 }} />
                <label style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }}>Observações</label>
                <textarea value={formManutencao.observacoes} onChange={e => setFormManutencao(f => ({ ...f, observacoes: e.target.value }))} rows={2} style={{ ...inp, marginBottom: 12, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setNovoItemManutencao(null)}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #CDD8E3', background: '#fff', color: '#1A2340', fontWeight: 700, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button onClick={salvarManutencao} disabled={salvandoManutencao}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: salvandoManutencao ? '#94A3B8' : '#1A6B4A', color: '#fff', fontWeight: 700, cursor: salvandoManutencao ? 'default' : 'pointer' }}>
                    {salvandoManutencao ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
