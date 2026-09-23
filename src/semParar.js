// Leitura da fatura Sem Parar (PDF) - Shirley, 2026-09-23.
// Recebe as linhas já agrupadas por altura (mesmo formato de extraiLinhasPdf do App.jsx:
// páginas -> linhas { y, items: [{ str, x, y }] }) e devolve os lançamentos de pedágio,
// estacionamento e estabelecimento (abastecimento) por placa, mais os totais que a própria
// fatura declara - usados pra conferir se a leitura bateu antes de gravar qualquer coisa.

const RE_DATA = /^\d{2}\/\d{2}\/\d{2}$/
const RE_HORA = /^\d{2}:\d{2}:\d{2}$/
const RE_DATA_HORA = /^(\d{2}\/\d{2}\/\d{2}) - (\d{2}:\d{2}:\d{2})$/
const RE_VALOR = /^-?[\d.]+,\d{2}( [DC])?$/

function valorNum(s) {
  const m = String(s || '').match(/(-?[\d.]+,\d{2})\s*([DC])?/)
  if (!m) return null
  const n = Number(m[1].replace(/\./g, '').replace(',', '.'))
  return m[2] === 'C' ? -n : n
}
function dataIso(ddmmaa) {
  const [d, m, a] = ddmmaa.split('/')
  return `20${a}-${m}-${d}`
}
const txt = row => row.items.map(i => i.str).join(' ')

export function parseFaturaSemParar(paginas) {
  const out = { fatura: null, emissao: null, vencimento: null, total: null, lancamentos: [], declarado: {}, avisos: [], resumo: {} }
  let placa = null
  let secao = null // 'pedagio' | 'estacionamento' | 'estabelecimento' | null
  let ultimo = null

  for (const rows of paginas) {
    ultimo = null // texto quebrado nunca continua na página seguinte (topo da página é cabeçalho)
    for (const row of rows) {
      const t = txt(row)
      const it = row.items
      if (!out.fatura) { const m = t.match(/N[ºo°] da Fatura:\s*(\d{6,})/i); if (m) out.fatura = m[1] }
      if (!out.emissao) { const m = t.match(/Data de Emiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{2})/); if (m) out.emissao = dataIso(m[1]) }
      if (!out.vencimento) { const m = t.match(/Data de Vencimento:\s*(\d{2}\/\d{2}\/\d{2})/); if (m) out.vencimento = dataIso(m[1]) }
      if (out.total == null) { const m = t.match(/^TOTAL\s+([\d.]+,\d{2}\s*[DC])$/); if (m) out.total = valorNum(m[1]) }

      // Totais declarados no quadro "Valores não Tributáveis" (última página)
      for (let k = 0; k < it.length - 2; k++) {
        const rot = it[k].str
        const mapa = { Passagens: 'pedagio', Estacionamento: 'estacionamento', Estabelecimentos: 'estabelecimento' }
        if (mapa[rot] && /^\d+$/.test(it[k + 1].str) && RE_VALOR.test(it[k + 2].str)) {
          out.declarado[mapa[rot]] = { qtd: Number(it[k + 1].str), valor: valorNum(it[k + 2].str) }
        }
      }

      // Quadro "Resumo da sua Fatura" (1 linha por placa): contando do fim - total, qtd vale,
      // vale, qtd estabelecimento, estabelecimento, qtd estacionamento, estacionamento, qtd
      // passagens, passagens. É a referência para conferir o abastecimento: o quadro fiscal
      // do fim da fatura mostra o abastecimento já compensado pelo crédito "ABASTECE" (R$ 0,00).
      if (!secao && it.length >= 10 && /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(it[0].str) && /^\d{6,}$/.test(it[1].str) && RE_VALOR.test(it[it.length - 1].str)) {
        const tk = it.map(i => i.str)
        const n = tk.length
        out.resumo[tk[0]] = {
          pedagio: { valor: valorNum(tk[n - 9]), qtd: Number(tk[n - 8]) },
          estacionamento: { valor: valorNum(tk[n - 7]), qtd: Number(tk[n - 6]) },
          estabelecimento: { valor: valorNum(tk[n - 5]), qtd: Number(tk[n - 4]) },
        }
        continue
      }

      const mDesc = t.match(/^Descritivo:\s*([A-Z]{3}\d[A-Z0-9]\d{2})\b/)
      if (mDesc) { placa = mDesc[1]; secao = null; ultimo = null; continue }
      if (/Detalhamento das Passagens por Ped[áa]gios/i.test(t)) { secao = 'pedagio'; ultimo = null; continue }
      if (/Detalhamento das Estadias em Estacionamentos/i.test(t)) { secao = 'estacionamento'; ultimo = null; continue }
      if (/^Estabelecimentos$/i.test(t.trim())) { secao = 'estabelecimento'; ultimo = null; continue }
      if (/^Detalhamento (de|das) (Plano|Cr[ée]ditos|Outras)/i.test(t) || /^Resumo da sua Fatura/.test(t)) { secao = null; ultimo = null; continue }
      if (/^TOTAL /.test(t)) { ultimo = null; continue }
      if (!secao || !placa) continue

      const v = it.length ? it[it.length - 1].str : ''
      if (secao === 'pedagio' && it.length >= 5 && RE_DATA.test(it[0].str) && RE_HORA.test(it[1].str) && RE_VALOR.test(v)) {
        const meio = it.slice(2, -1)
        const conc = meio.filter(i => i.x < 300).map(i => i.str).join(' ')
        const resto = meio.filter(i => i.x >= 300)
        const cat = resto.length && /^\d{1,2}$/.test(resto[resto.length - 1].str) ? resto.pop().str : null
        ultimo = {
          placa, tipo: 'pedagio', data: dataIso(it[0].str), hora: it[1].str,
          concessionaria: conc || null, local: resto.map(i => i.str).join(' '), categoria: cat, valor: valorNum(v),
        }
        out.lancamentos.push(ultimo)
        continue
      }
      if (secao === 'estacionamento' && it.length >= 4 && RE_DATA_HORA.test(it[0].str) && RE_VALOR.test(v)) {
        const e = it[0].str.match(RE_DATA_HORA)
        const s = it[1].str.match(RE_DATA_HORA)
        const meio = it.slice(1, -1).filter(i => !RE_DATA_HORA.test(i.str) && !/^\d{2}h\d{2}m\d{2}s$/.test(i.str))
        ultimo = {
          placa, tipo: 'estacionamento', data: dataIso(e[1]), hora: e[2],
          data_saida: s ? dataIso(s[1]) : null, hora_saida: s ? s[2] : null,
          local: meio.map(i => i.str).join(' '), valor: valorNum(v),
        }
        out.lancamentos.push(ultimo)
        continue
      }
      if (secao === 'estabelecimento' && it.length >= 4 && RE_DATA.test(it[0].str) && RE_HORA.test(it[1].str) && RE_VALOR.test(v)) {
        const meio = it.slice(2, -1)
        const qtd = meio.find(i => /\d+,\d+\s*L$/.test(i.str))
        ultimo = {
          placa, tipo: 'estabelecimento', data: dataIso(it[0].str), hora: it[1].str,
          local: meio.filter(i => i !== qtd).map(i => i.str).join(' '),
          litros: qtd ? valorNum(qtd.str.replace(/\s*L$/, '')) : null, valor: valorNum(v),
        }
        out.lancamentos.push(ultimo)
        continue
      }
      // Continuação de texto quebrado em 2 linhas (nome da praça/local longo)
      // (só na coluna do nome: praça do pedágio fica entre x~300-470; local do estacionamento, x~220-510)
      const colOk = i => (ultimo.tipo === 'pedagio' ? i.x >= 300 && i.x < 470 : i.x >= 200 && i.x < 510)
      if (ultimo && it.length <= 2 && it.every(i => colOk(i) && !RE_VALOR.test(i.str) && !/^P[áa]gina/.test(i.str))) {
        ultimo.local = `${ultimo.local} ${it.map(i => i.str).join(' ')}`.trim()
      }
    }
  }

  // Abastecimento: confere pelo quadro-resumo por placa (o quadro fiscal traz o valor líquido
  // do crédito "ABASTECE", que zera o total).
  const placasResumo = Object.values(out.resumo)
  if (placasResumo.length) {
    out.declarado.estabelecimento = {
      qtd: placasResumo.reduce((s, r) => s + (r.estabelecimento.qtd || 0), 0),
      valor: Math.round(placasResumo.reduce((s, r) => s + (r.estabelecimento.valor || 0), 0) * 100) / 100,
    }
  }

  // Conferência: soma lida x total declarado pela fatura
  for (const tipo of ['pedagio', 'estacionamento', 'estabelecimento']) {
    const lidos = out.lancamentos.filter(l => l.tipo === tipo)
    const soma = Math.round(lidos.reduce((s, l) => s + l.valor, 0) * 100) / 100
    const dec = out.declarado[tipo]
    out.declarado[tipo] = { ...(dec || {}), lidoQtd: lidos.length, lidoValor: soma }
    if (dec && (dec.qtd !== lidos.length || Math.abs(dec.valor - soma) > 0.01)) {
      out.avisos.push(`${tipo}: fatura diz ${dec.qtd} lançamentos / R$ ${dec.valor.toFixed(2)}, li ${lidos.length} / R$ ${soma.toFixed(2)}`)
    }
  }
  if (!out.fatura) out.avisos.push('Não achei o número da fatura - confira se o PDF é mesmo uma fatura Sem Parar.')
  return out
}

// Lê o PDF no navegador (pdfjs já é dependência do app - o worker é configurado no App.jsx).
export async function lerPdfSemParar(arquivo) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const buf = await arquivo.arrayBuffer()
  const doc = await getDocument({ data: new Uint8Array(buf) }).promise
  const paginas = []
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent()
    const items = content.items
      // eslint-disable-next-line no-control-regex
      .map(it => ({ str: String(it.str || '').replace(/[\x00-\x1F\x7F]/g, '').trim(), x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) }))
      .filter(it => it.str)
    const rows = []
    items.forEach(it => {
      let row = rows.find(r => Math.abs(r.y - it.y) <= 2)
      if (!row) { row = { y: it.y, items: [] }; rows.push(row) }
      row.items.push(it)
    })
    rows.sort((a, b) => b.y - a.y)
    rows.forEach(r => r.items.sort((a, b) => a.x - b.x))
    paginas.push(rows)
  }
  return parseFaturaSemParar(paginas)
}

// Acha a viagem (frota_registros type='bordo') em que o carro estava na hora do lançamento:
// mesma placa e data/hora entre a saída e a chegada. Viagem ainda aberta vale até agora.
// Estacionamento usa a hora de ENTRADA. Devolve null se ninguém tinha registrado viagem.
export function acharViagem(lanc, viagensDaPlaca) {
  if (!viagensDaPlaca || !lanc.data) return null
  const ts = `${lanc.data}T${(lanc.hora || '00:00:00').slice(0, 8)}`
  for (const v of viagensDaPlaca) {
    const ini = `${v.date}T${(v.time || '00:00').slice(0, 5)}:00`
    const fim = v.closed && v.date_fim ? `${v.date_fim}T${(v.time_fim || '23:59').slice(0, 5)}:59` : '9999-12-31T23:59:59'
    if (ts >= ini && ts <= fim) return v
  }
  return null
}
