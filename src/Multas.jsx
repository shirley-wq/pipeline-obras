import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { acharViagem } from './semParar'

// Multas da frota (Shirley, 2026-09-23). As multas vêm em nome da empresa (PJ): se o condutor
// não for indicado dentro do prazo, a empresa recebe uma SEGUNDA multa (NIC - não indicação do
// condutor) e ninguém leva os pontos. Por isso o centro desta tela é o PRAZO DE INDICAÇÃO, e o
// condutor é achado sozinho pelas viagens (placa + data/hora da infração) - a regra fica com o
// escritório, o colaborador não precisa entender nada.

const GRAVIDADES = {
  leve: { label: 'Leve', pontos: 3, valor: 88.38 },
  media: { label: 'Média', pontos: 4, valor: 130.16 },
  grave: { label: 'Grave', pontos: 5, valor: 195.23 },
  gravissima: { label: 'Gravíssima', pontos: 7, valor: 293.47 },
}
// Prazo padrão para indicar o condutor, contado da notificação. É só sugestão editável - sempre
// vale a data impressa na notificação.
const DIAS_PRAZO_INDICACAO = 30

const STATUS = {
  aguardando_indicacao: { label: 'Indicar condutor', cor: '#DC2626', bg: '#FEF2F2' },
  indicado: { label: 'Condutor indicado', cor: '#2563EB', bg: '#EFF6FF' },
  recurso: { label: 'Em recurso', cor: '#7C3AED', bg: '#F5F3FF' },
  aguardando_pagamento: { label: 'Aguardando pagamento', cor: '#D97706', bg: '#FFFBEB' },
  pago: { label: 'Pago', cor: '#16A34A', bg: '#F0FDF4' },
  cancelada: { label: 'Cancelada', cor: '#64748B', bg: '#F8FAFC' },
}

function hojeIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function somarDias(iso, dias) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function diasAte(iso) {
  if (!iso) return null
  return Math.round((new Date(iso + 'T12:00:00') - new Date(hojeIso() + 'T12:00:00')) / 86400000)
}
function isoToBr(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
const brl = v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

function formVazio() {
  return {
    placa: '', auto_infracao: '', orgao: '', data_infracao: '', hora_infracao: '', local: '', descricao: '',
    codigo_infracao: '', gravidade: '', pontos: '', valor: '', data_notificacao: hojeIso(),
    prazo_indicacao: somarDias(hojeIso(), DIAS_PRAZO_INDICACAO), vencimento: '', condutor: '', condutor_origem: '',
    viagem_id: null, obra_id: null, observacoes: '', desconto_colaborador: false,
  }
}

export default function Multas({ usuario, veiculos, obras }) {
  const [multas, setMultas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroTabela, setErroTabela] = useState('')
  const [filtro, setFiltro] = useState('abertas') // abertas | pago | todas
  const [form, setForm] = useState(null)
  const [buscandoCondutor, setBuscandoCondutor] = useState(false)
  const [msgCondutor, setMsgCondutor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [condutoresConhecidos, setCondutoresConhecidos] = useState([])

  async function carregar() {
    const [{ data, error }, { data: colabs }] = await Promise.all([
      supabase.from('frota_multas').select('*').order('data_infracao', { ascending: false }),
      supabase.from('frota_registros').select('collab').eq('type', 'bordo').order('criado_em', { ascending: false }).limit(500),
    ])
    if (error) {
      setErroTabela(/relation|does not exist|schema cache|Could not find/i.test(error.message)
        ? 'A tabela de multas ainda não existe no banco. Rode o script frota_multas.sql no Supabase.'
        : 'Erro ao carregar multas: ' + error.message)
    } else setErroTabela('')
    setMultas(data || [])
    setCondutoresConhecidos([...new Set((colabs || []).map(c => c.collab).filter(Boolean))].sort())
    setCarregando(false)
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { carregar() }, [])

  // Acha quem estava com o carro na hora da infração (mesma regra do cruzamento do Sem Parar)
  async function identificarCondutor(f) {
    setMsgCondutor('')
    if (!f.placa || !f.data_infracao) return
    setBuscandoCondutor(true)
    const { data: vgs } = await supabase.from('frota_registros')
      .select('id, plate, collab, obra_id, obs, date, time, date_fim, time_fim, closed')
      .eq('type', 'bordo').eq('plate', f.placa).lte('date', f.data_infracao)
      .or(`date_fim.gte.${f.data_infracao},closed.eq.false`)
    setBuscandoCondutor(false)
    const hora = f.hora_infracao ? `${f.hora_infracao}:00`.slice(0, 8) : '12:00:00'
    const vg = acharViagem({ data: f.data_infracao, hora }, vgs || [])
    if (vg) {
      const obra = vg.obra_id ? (obras || []).find(o => o.id === vg.obra_id) : null
      setForm(x => ({ ...x, condutor: vg.collab, condutor_origem: 'viagem', viagem_id: vg.id, obra_id: vg.obra_id ? String(vg.obra_id) : null }))
      setMsgCondutor(`✓ Achado pela viagem: ${vg.collab} saiu às ${(vg.time || '').slice(0, 5)} de ${isoToBr(vg.date)}${obra ? ` — obra ${obra.nome}` : vg.obs ? ` — ${vg.obs}` : ''}.${f.hora_infracao ? '' : ' Sem a hora da infração, confira.'}`)
    } else {
      setForm(x => (x.condutor_origem === 'viagem' ? { ...x, condutor: '', condutor_origem: '', viagem_id: null, obra_id: null } : x))
      setMsgCondutor('Nenhuma viagem registrada com esse carro nesse horário. Informe o condutor manualmente.')
    }
  }

  function atualizarEBuscar(campo, valor) {
    const f = { ...form, [campo]: valor }
    setForm(f)
    identificarCondutor(f)
  }

  function abrirNova() {
    setErro(''); setMsgCondutor('')
    setForm(formVazio())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function abrirEdicao(m) {
    setErro(''); setMsgCondutor('')
    const t = x => (x == null ? '' : String(x))
    setForm({
      ...formVazio(), id: m.id, placa: t(m.placa), auto_infracao: t(m.auto_infracao), orgao: t(m.orgao),
      data_infracao: t(m.data_infracao), hora_infracao: t(m.hora_infracao).slice(0, 5), local: t(m.local),
      descricao: t(m.descricao), codigo_infracao: t(m.codigo_infracao), gravidade: t(m.gravidade), pontos: t(m.pontos),
      valor: t(m.valor), data_notificacao: t(m.data_notificacao), prazo_indicacao: t(m.prazo_indicacao),
      vencimento: t(m.vencimento), condutor: t(m.condutor), condutor_origem: t(m.condutor_origem),
      viagem_id: m.viagem_id, obra_id: m.obra_id, observacoes: t(m.observacoes), desconto_colaborador: !!m.desconto_colaborador,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function salvar() {
    const f = form
    setErro('')
    if (!f.placa) { setErro('Escolha o veículo.'); return }
    if (!f.data_infracao) { setErro('Informe a data da infração.'); return }
    const num = x => (x === '' || x == null ? null : Number(String(x).replace(',', '.')))
    const condutor = f.condutor.trim()
    const reg = {
      placa: f.placa, auto_infracao: f.auto_infracao.trim().toUpperCase() || null, orgao: f.orgao.trim() || null,
      data_infracao: f.data_infracao, hora_infracao: f.hora_infracao || null, local: f.local.trim() || null,
      descricao: f.descricao.trim() || null, codigo_infracao: f.codigo_infracao.trim() || null,
      gravidade: f.gravidade || null, pontos: num(f.pontos), valor: num(f.valor),
      data_notificacao: f.data_notificacao || null, prazo_indicacao: f.prazo_indicacao || null, vencimento: f.vencimento || null,
      condutor: condutor || null, condutor_origem: condutor ? (f.condutor_origem || 'manual') : null,
      viagem_id: condutor ? (f.viagem_id || null) : null, obra_id: condutor ? (f.obra_id || null) : null,
      observacoes: f.observacoes.trim() || null, desconto_colaborador: !!f.desconto_colaborador,
    }
    setSalvando(true)
    const { error } = f.id
      ? await supabase.from('frota_multas').update(reg).eq('id', f.id)
      : await supabase.from('frota_multas').insert({ ...reg, registrado_por: usuario?.email || null })
    setSalvando(false)
    if (error) {
      setErro(error.code === '23505' ? 'Esse número de auto de infração já foi lançado.' : 'Erro ao salvar: ' + error.message)
      return
    }
    setForm(null)
    carregar()
  }

  async function mudarStatus(m, status) {
    const campos = { status }
    if (status === 'indicado') campos.indicado_em = hojeIso()
    if (status === 'pago') {
      const v = window.prompt('Valor pago (R$):', m.valor != null ? String(m.valor).replace('.', ',') : '')
      if (v === null) return
      campos.pago_em = hojeIso()
      campos.valor_pago = v.trim() ? Number(v.replace(/\./g, '').replace(',', '.')) : m.valor
    }
    const { error } = await supabase.from('frota_multas').update(campos).eq('id', m.id)
    if (error) { alert('Erro ao salvar: ' + error.message); return }
    carregar()
  }

  const inp = { width: '100%', padding: '9px 10px', border: '1px solid #CDD8E3', borderRadius: 8, fontSize: 13, color: '#1A2340', boxSizing: 'border-box' }
  const lbl = { fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 3 }
  const set = (k, v) => setForm(x => ({ ...x, [k]: v }))
  const btn = (bg, cor) => ({ padding: '5px 10px', background: bg, color: cor, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' })

  if (carregando) return <div style={{ padding: 30, textAlign: 'center', color: '#888' }}>Carregando...</div>
  if (erroTabela) return <div style={{ padding: 14, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, color: '#991B1B', fontSize: 13, fontWeight: 600 }}>⚠️ {erroTabela}</div>

  const fechadas = s => s === 'pago' || s === 'cancelada'
  const aIndicar = multas.filter(m => m.status === 'aguardando_indicacao')
  const urgentes = aIndicar.filter(m => { const d = diasAte(m.prazo_indicacao); return d != null && d <= 5 })
  const lista = multas
    .filter(m => (filtro === 'todas' ? true : filtro === 'pago' ? fechadas(m.status) : !fechadas(m.status)))
    .sort((a, b) => {
      if (filtro !== 'abertas') return 0
      const pa = a.status === 'aguardando_indicacao' ? 0 : 1
      const pb = b.status === 'aguardando_indicacao' ? 0 : 1
      return pa - pb || (a.prazo_indicacao || '9').localeCompare(b.prazo_indicacao || '9')
    })
  const totalAberto = multas.filter(m => !fechadas(m.status)).reduce((s, m) => s + Number(m.valor || 0), 0)
  const anoAtual = hojeIso().slice(0, 4)
  const totalPagoAno = multas.filter(m => m.status === 'pago' && (m.pago_em || '').startsWith(anoAtual))
    .reduce((s, m) => s + Number(m.valor_pago ?? m.valor ?? 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>Multas</div>
        {!form && (
          <button onClick={abrirNova} style={{ padding: '8px 14px', background: '#7C2D12', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            + Lançar multa
          </button>
        )}
      </div>

      {urgentes.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '2px solid #DC2626', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#991B1B', fontSize: 13, fontWeight: 700 }}>
          🚨 {urgentes.length} multa{urgentes.length > 1 ? 's' : ''} com prazo de indicação vencendo em até 5 dias (ou já vencido). Sem indicar o condutor, a empresa recebe outra multa (NIC).
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '7px 12px' }}>Indicar condutor: {aIndicar.length}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, padding: '7px 12px' }}>Em aberto: {brl(totalAberto)}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '7px 12px' }}>Pago em {anoAtual}: {brl(totalPagoAno)}</div>
      </div>

      {form && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E0E8F0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340', marginBottom: 10 }}>{form.id ? 'Editar multa' : 'Lançar multa'}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={lbl}>Veículo</label>
              <select value={form.placa} onChange={e => atualizarEBuscar('placa', e.target.value)} style={inp}>
                <option value="">— escolher —</option>
                {veiculos.map(v => <option key={v.placa} value={v.placa}>{v.placa}{v.modelo ? ` · ${v.modelo}` : ''}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={lbl}>Data da infração</label>
              <input type="date" value={form.data_infracao} onChange={e => atualizarEBuscar('data_infracao', e.target.value)} style={inp} />
            </div>
            <div style={{ flex: '1 1 90px' }}>
              <label style={lbl}>Hora</label>
              <input type="time" value={form.hora_infracao} onChange={e => atualizarEBuscar('hora_infracao', e.target.value)} style={inp} />
            </div>
          </div>

          <div style={{ background: form.condutor_origem === 'viagem' ? '#F0FDF4' : '#fff', border: `1px solid ${form.condutor_origem === 'viagem' ? '#86EFAC' : '#E0E8F0'}`, borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <label style={lbl}>👤 Condutor</label>
            <input list="condutores-frota" value={form.condutor} onChange={e => setForm(x => ({ ...x, condutor: e.target.value, condutor_origem: 'manual', viagem_id: null }))} placeholder="Nome do colaborador" style={inp} />
            <datalist id="condutores-frota">{condutoresConhecidos.map(c => <option key={c} value={c} />)}</datalist>
            {buscandoCondutor && <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Procurando nas viagens...</div>}
            {!buscandoCondutor && msgCondutor && <div style={{ fontSize: 11, color: form.condutor_origem === 'viagem' ? '#166534' : '#B45309', fontWeight: 600, marginTop: 4 }}>{msgCondutor}</div>}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={lbl}>Nº do auto de infração</label>
              <input value={form.auto_infracao} onChange={e => set('auto_infracao', e.target.value)} style={inp} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={lbl}>Órgão</label>
              <input value={form.orgao} onChange={e => set('orgao', e.target.value)} placeholder="Ex: DETRAN-SP, PRF" style={inp} />
            </div>
          </div>
          <label style={lbl}>Infração (descrição)</label>
          <input value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Velocidade até 20% acima da máxima" style={{ ...inp, marginBottom: 8 }} />
          <label style={lbl}>Local</label>
          <input value={form.local} onChange={e => set('local', e.target.value)} style={{ ...inp, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px' }}>
              <label style={lbl}>Gravidade</label>
              <select value={form.gravidade} onChange={e => {
                const g = GRAVIDADES[e.target.value]
                setForm(x => ({ ...x, gravidade: e.target.value, pontos: g && !x.pontos ? String(g.pontos) : x.pontos, valor: g && !x.valor ? String(g.valor) : x.valor }))
              }} style={inp}>
                <option value="">—</option>
                {Object.entries(GRAVIDADES).map(([k, g]) => <option key={k} value={k}>{g.label} ({g.pontos} pts)</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 70px' }}>
              <label style={lbl}>Pontos</label>
              <input type="number" value={form.pontos} onChange={e => set('pontos', e.target.value)} style={inp} />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={lbl}>Valor (R$)</label>
              <input type="number" step="0.01" value={form.valor} onChange={e => set('valor', e.target.value)} style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 120px' }}>
              <label style={lbl}>Notificação recebida em</label>
              <input type="date" value={form.data_notificacao} onChange={e => setForm(x => ({ ...x, data_notificacao: e.target.value, prazo_indicacao: x.id ? x.prazo_indicacao : somarDias(e.target.value, DIAS_PRAZO_INDICACAO) }))} style={inp} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ ...lbl, color: '#991B1B' }}>Prazo p/ indicar condutor</label>
              <input type="date" value={form.prazo_indicacao} onChange={e => set('prazo_indicacao', e.target.value)} style={{ ...inp, borderColor: '#FCA5A5' }} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={lbl}>Vencimento do boleto</label>
              <input type="date" value={form.vencimento} onChange={e => set('vencimento', e.target.value)} style={inp} />
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 8 }}>O prazo vem sugerido ({DIAS_PRAZO_INDICACAO} dias após a notificação). Confira e use a data impressa na notificação.</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', marginBottom: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.desconto_colaborador} onChange={e => set('desconto_colaborador', e.target.checked)} />
            Será descontada do colaborador
          </label>
          <label style={lbl}>Observações</label>
          <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={2} style={{ ...inp, marginBottom: 10, resize: 'vertical' }} />
          {erro && <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>⚠️ {erro}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setForm(null)} style={{ flex: 1, padding: 10, background: '#F1F5F9', color: '#1A2340', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={salvar} disabled={salvando} style={{ flex: 2, padding: 10, background: salvando ? '#94A3B8' : '#7C2D12', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: salvando ? 'default' : 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['abertas', 'Em aberto'], ['pago', 'Pagas/canceladas'], ['todas', 'Todas']].map(([k, r]) => (
          <span key={k} onClick={() => setFiltro(k)} style={{ padding: '5px 11px', borderRadius: 14, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: filtro === k ? '#7C2D12' : '#F1F5F9', color: filtro === k ? '#fff' : '#1A2340' }}>{r}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lista.map(m => {
          const st = STATUS[m.status] || STATUS.aguardando_indicacao
          const d = m.status === 'aguardando_indicacao' ? diasAte(m.prazo_indicacao) : null
          const obra = m.obra_id ? (obras || []).find(o => String(o.id) === String(m.obra_id)) : null
          return (
            <div key={m.id} style={{ background: '#fff', border: `1px solid ${d != null && d <= 5 ? '#DC2626' : '#E0E8F0'}`, borderLeft: `4px solid ${st.cor}`, borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2340' }}>
                    🚗 {m.placa} · {isoToBr(m.data_infracao)}{m.hora_infracao ? ` ${String(m.hora_infracao).slice(0, 5)}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {[m.descricao, m.gravidade && GRAVIDADES[m.gravidade]?.label, m.pontos != null && `${m.pontos} pts`, m.orgao].filter(Boolean).join(' · ') || 'Sem descrição'}
                  </div>
                  <div style={{ fontSize: 11, color: m.condutor ? '#4A7FC1' : '#B45309', marginTop: 2 }}>
                    👤 {m.condutor || 'Condutor não identificado'}{m.condutor_origem === 'viagem' ? ' (pela viagem)' : ''}{obra ? ` · 🏗️ ${obra.nome}` : ''}{m.desconto_colaborador ? ' · 💸 desconto do colaborador' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2340' }}>{brl(m.status === 'pago' ? (m.valor_pago ?? m.valor) : m.valor)}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: st.bg, color: st.cor, whiteSpace: 'nowrap' }}>{st.label.toUpperCase()}</span>
                </div>
              </div>
              {d != null && (
                <div style={{ fontSize: 12, fontWeight: 700, color: d < 0 ? '#991B1B' : d <= 5 ? '#DC2626' : '#92400E', marginTop: 6 }}>
                  {d < 0 ? `⛔ Prazo de indicação venceu há ${-d} dia${d === -1 ? '' : 's'} (${isoToBr(m.prazo_indicacao)})`
                    : d === 0 ? '⏰ Último dia para indicar o condutor (hoje)'
                      : `⏰ Indicar condutor até ${isoToBr(m.prazo_indicacao)} — faltam ${d} dia${d === 1 ? '' : 's'}`}
                </div>
              )}
              {!fechadas(m.status) && m.status !== 'aguardando_indicacao' && m.vencimento && (
                <div style={{ fontSize: 11, color: '#92400E', marginTop: 4 }}>Boleto vence em {isoToBr(m.vencimento)}</div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {m.status === 'aguardando_indicacao' && (
                  <button onClick={() => mudarStatus(m, 'indicado')} disabled={!m.condutor} title={m.condutor ? '' : 'Informe o condutor antes (Editar)'}
                    style={{ ...btn(m.condutor ? '#2563EB' : '#CBD5E1', '#fff'), cursor: m.condutor ? 'pointer' : 'default' }}>✓ Condutor indicado</button>
                )}
                {['indicado', 'recurso'].includes(m.status) && <button onClick={() => mudarStatus(m, 'aguardando_pagamento')} style={btn('#D97706', '#fff')}>Boleto chegou</button>}
                {!fechadas(m.status) && <button onClick={() => mudarStatus(m, 'pago')} style={btn('#16A34A', '#fff')}>💰 Pago</button>}
                {!fechadas(m.status) && m.status !== 'recurso' && <button onClick={() => mudarStatus(m, 'recurso')} style={btn('#F5F3FF', '#6D28D9')}>Recurso</button>}
                {m.status === 'recurso' && <button onClick={() => { if (window.confirm('Marcar como cancelada (recurso aceito)?')) mudarStatus(m, 'cancelada') }} style={btn('#F1F5F9', '#475569')}>Recurso aceito</button>}
                <button onClick={() => abrirEdicao(m)} style={btn('#F1F5F9', '#1A2340')}>Editar</button>
              </div>
            </div>
          )
        })}
        {lista.length === 0 && <div style={{ textAlign: 'center', color: '#888', fontSize: 12, padding: 16 }}>{multas.length === 0 ? 'Nenhuma multa lançada ainda.' : 'Nada nesse filtro.'}</div>}
      </div>
    </div>
  )
}
