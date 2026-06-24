import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const OBRAS_INICIAIS = [
  {tipo:'TRANSF PAE',nome:'PAB VIAÇÃO OSASCO LTDA',local:'OSASCO-SP',inicio:'02/04/2026',termino:'05/04/2026',status:'NF EMITIDO',valor:5126.03,sige:'13653',pedido:'4501792509',nf:'3101'},
  {tipo:'TRANSF PAE',nome:'PAB TRANSPPASS TRANSPORTE DE PASSAGEIROS LTDA',local:'SÃO PAULO-SP',inicio:'02/04/2026',termino:'06/04/2026',status:'NF EMITIDO',valor:7562.03,sige:'13652',pedido:'4501792506',nf:'3101'},
  {tipo:'TRANSF PAE',nome:'PAE - EC PINHEIROS SOCIOS',local:'SÃO PAULO-SP',inicio:'16/04/2026',termino:'21/04/2026',status:'NF EMITIDO',valor:11044.53,sige:'13920',pedido:'4501792505',nf:'3101'},
  {tipo:'DESC. PAB',nome:'PAB SECRETÁRIA DE ESTADO ADM PENITENCIÁRIA',local:'RIO DE JANEIRO-RJ',inicio:'09/02/2026',termino:'14/02/2026',status:'NF EMITIDO',valor:12720.96,sige:'13343',pedido:'4501792544',nf:'10'},
  {tipo:'TRANSF UN',nome:'BR_UN 583 - LIDO-URJ',local:'RIO DE JANEIRO-RJ',inicio:'07/02/2026',termino:'09/02/2026',status:'NF EMITIDO',valor:14059.62,sige:'13126',pedido:'4501807948',nf:'16'},
  {tipo:'TRANSF UN',nome:'BR_UN 1803-AV.PRES.VARGAS-URJ',local:'RIO DE JANEIRO-RJ',inicio:'09/01/2026',termino:'07/03/2026',status:'NF EMITIDO',valor:12860.74,sige:'12885',pedido:'4501807949',nf:'16'},
  {tipo:'DESC. PA',nome:'PA 111 - CANAA',local:'CANAA-MG',inicio:'30/04/2026',termino:'05/05/2026',status:'NF EMITIDO',valor:19840.11,sige:'13648',pedido:'4501792580',nf:'1'},
  {tipo:'DESC. PAB',nome:'PAB ALPARGATAS S.A.',local:'MONTES CLAROS-MG',inicio:'20/03/2026',termino:'12/04/2026',status:'NF EMITIDO',valor:11237.93,sige:'13654',pedido:'4501792508',nf:'17'},
  {tipo:'DESC. PA',nome:'PA 131 - ITAMARATI DE MINAS',local:'ITAMARATI DE MINAS-MG',inicio:'26/05/2026',termino:'31/05/2026',status:'NF EMITIDO',valor:8512.27,sige:'13649',pedido:'4501792579',nf:'17'},
  {tipo:'DESC. PAB',nome:'PAB WEG S.A. UND. SB CAMPO',local:'SÃO BERNARDO DO CAMPO-SP',inicio:'13/03/2026',termino:'13/03/2026',status:'NF EMITIDO',valor:647.07,sige:'13651',pedido:'4501864281',nf:'3181'},
  {tipo:'REFORMA',nome:'BRADESCO AG 354 CARAPICUÍBA',local:'CARAPICUÍBA-SP',inicio:'22/04/2026',termino:'24/04/2026',status:'NF EMITIDO',valor:3467,sige:'14221',pedido:'4501864279',nf:'3181'},
  {tipo:'REFORMA',nome:'BRADESCO AG 0593 ENDRES - GUARULHOS',local:'GUARULHOS-SP',inicio:'23/04/2026',termino:'28/04/2026',status:'NF EMITIDO',valor:5018.35,sige:'14222',pedido:'4501864280',nf:'3181'},
  {tipo:'DESC. PA',nome:'PA 083 - ICARAÍ DE MINAS - AG 1151',local:'ICARAÍ DE MINAS-MG',inicio:'26/05/2026',termino:'31/05/2026',status:'NF EMITIDO',valor:8493.50,sige:'14224',pedido:'4501863922',nf:'57'},
  {tipo:'DESC. PA',nome:'PA DIVINESIA',local:'DIVINESIA-MG',inicio:'08/06/2026',termino:'10/06/2026',status:'NF EMITIDO',valor:7477.04,sige:'14439',pedido:'4501863923',nf:'57'},
  {tipo:'DESC. PA',nome:'PA BICAS',local:'BICAS-MG',inicio:'08/06/2026',termino:'10/06/2026',status:'NF EMITIDO',valor:9796.19,sige:'14440',pedido:'4501863924',nf:'57'},
  {tipo:'TRANSF UN',nome:'BR_UN 2774-N.ALPHA.-USPARNAIBA',local:'SANTANA PARNAIBA-SP',inicio:'11/06/2026',termino:'12/06/2026',status:'NF EMITIDO',valor:5248.60,sige:'14227',pedido:'4501864924',nf:'3182'},
  {tipo:'TRANSF UN',nome:'BR_UN 302-RUDGE RAMOS-USBC',local:'SÃO BERNARDO DO CAMPO-SP',inicio:'14/06/2026',termino:'15/06/2026',status:'NF EMITIDO',valor:15389.86,sige:'14225',pedido:'4501864925',nf:'3182'},
  {tipo:'TRANSF UN',nome:'BR_UN 1056-PRIME SAO LUCAS-UBH',local:'BELO HORIZONTE-MG',inicio:'13/06/2026',termino:'18/06/2026',status:'NF EMITIDO',valor:8895.95,sige:'14228',pedido:'4501863920',nf:'57'},
  {tipo:'TRANSF UN',nome:'BR_UN 1696-PRIME PAMPULHA-UBH',local:'BELO HORIZONTE-MG',inicio:'11/06/2026',termino:'26/06/2026',status:'NF EMITIDO',valor:7331.51,sige:'14229',pedido:'4501863921',nf:'57'},
  {tipo:'TRANSF UN',nome:'BR_UN 870-PRIME CIDADE DE DEUS',local:'OSASCO-SP',inicio:'13/06/2026',termino:'27/06/2026',status:'NF EMITIDO',valor:4351.78,sige:'14226',pedido:'4501864926',nf:'3182'},
  {tipo:'DESC. PA',nome:'PA RIO VERMELHO',local:'RIO VERMELHO-MG',inicio:'08/06/2026',termino:'10/06/2026',status:'NF EMITIDO',valor:9540.07,sige:'14438',pedido:'4501866855',nf:'65'},
  {tipo:'TB FORTE',nome:'SC - SERVIÇOS EMERGENCIAIS (BASE + GARAGEM)',local:'RIO DE JANEIRO-RJ',status:'AG. PEDIDO',valor:10229.93,sige:'14525',obs:'Aguardando emissão de pedido'},
  {tipo:'TB FORTE',nome:'SC - SERVIÇOS EMERGENCIAIS (CUMEEIRA - TELHADO GARAGEM)',local:'RIO DE JANEIRO-RJ',status:'AG. PEDIDO',valor:1560,sige:'15310',obs:'Aguardando emissão de pedido'},
  {tipo:'DESC. PAB',nome:'PAB 012 - B2W LOJAS AMERICANAS - AG 1803',local:'RIO DE JANEIRO-RJ',status:'RM ENVIADA',valor:5728.20,sige:'14171',pedido:'ORDEM 1000077028'},
  {tipo:'TRANSF UN',nome:'BR_UN 1417 - MERC.S.SEBASTIAO-URJ',local:'RIO DE JANEIRO-RJ',status:'ENVIAR RM',valor:84.18,sige:'14535',obs:'Item cancelado — enviar RM'},
  {tipo:'LINK',nome:'PAB 016 - TILIBRA - AG. 0013',local:'BAURU-SP',status:'RM ENVIADA',valor:3293.12,sige:'14170',pedido:'ORDEM 1000079178'},
  {tipo:'DESC. PA',nome:'PA MARIO CAMPOS',local:'MARIO CAMPOS-MG',status:'RM ENVIADA',valor:8511.46,sige:'14582',pedido:'ORDEM 1000079423'},
  {tipo:'DESC. PA',nome:'PA PEDRA BONITA',local:'PEDRA BONITA-MG',status:'RM ENVIADA',valor:7892.25,sige:'14583',pedido:'ORDEM 1000079424'},
  {tipo:'DESC. PAB',nome:'PAB PREFEITURA DE RIO NEGRINHO',local:'RIO NEGRINHO-SC',status:'RM ENVIADA (ART)',valor:5620.61,sige:'14841',pedido:'ORDEM 1000079863',obs:'ART pendente'},
  {tipo:'DESC. PAB',nome:'PAB PREFEITURA DE CANOINHAS',local:'CANOINHAS-SC',status:'RM ENVIADA (ART)',valor:8688.98,sige:'14839',pedido:'ORDEM 1000079862',obs:'ART pendente'},
  {tipo:'TRANSF UN',nome:'BR_UN 926 - COLON.MURICI-USJPIN',local:'SÃO JOSÉ DOS PINHAIS-PR',status:'PRECISA DE ARQUIVO RM',valor:11574.87,sige:'14538',pedido:'ORDEM 1000079897',obs:'Pendência: arquivo RM de CWB'},
  {tipo:'TRANSF UN',nome:'BR_UN 6592 - PRIME AV.AMERIC-URJ',local:'RIO DE JANEIRO-RJ',status:'RM ENVIADA',valor:6315.62,sige:'14531',pedido:'ORDEM 1000079911'},
  {tipo:'TRANSF UN',nome:'BR_UN 2282 - R.BORGES LAGOA-USP',local:'SÃO PAULO-SP',status:'RM ENVIADA',valor:9321.36,sige:'14529',pedido:'ORDEM 1000079913'},
  {tipo:'TRANSF UN',nome:'BR_UN 498 - PC.BEN.CALIXTO-USP',local:'SÃO PAULO-SP',status:'RM ENVIADA',valor:6969.15,sige:'14528',pedido:'ORDEM 1000079903'},
  {tipo:'TRANSF UN',nome:'BR_UN 2938 - PLANALTO-UBH',local:'BELO HORIZONTE-MG',status:'RM ENVIADA',valor:8665.37,sige:'14783',pedido:'ORDEM 1000079901'},
  {tipo:'TRANSF UN',nome:'BR_UN 3435 - PROF.ALFR.BALENA-UBH',local:'BELO HORIZONTE-MG',status:'RM PRONTA AGUARDANDO ORDEM',valor:10208.43,sige:'14784',pedido:'ORDEM 1000079898',obs:'RM pronta — aguardando emissão de ordem'},
  {tipo:'TRANSF UN',nome:'BR_UN 2423 - JD ANÁLIA FRANCO-USP',local:'SÃO PAULO-SP',status:'RM ENVIADA',valor:7933.95,sige:'14684',pedido:'ORDEM 1000079902'},
  {tipo:'TRANSF UN',nome:'BR_UN 1088 - PRIME L.MACHADO-URJ',local:'RIO DE JANEIRO-RJ',status:'RM ENVIADA',valor:6223.47,sige:'14533',pedido:'ORDEM 1000079906'},
  {tipo:'TRANSF UN',nome:'BR_UN 6074 - PRIME MEIER-URJ',local:'RIO DE JANEIRO-RJ',status:'RM ENVIADA',valor:4188.21,sige:'14536',pedido:'ORDEM 1000079909'},
  {tipo:'TRANSF UN',nome:'BR_UN 2435 - PRIME CENTRAL-URJ',local:'RIO DE JANEIRO-RJ',status:'RM ENVIADA',valor:7758.51,sige:'14534',pedido:'ORDEM 1000079914'},
  {tipo:'DESC. PAB',nome:'PAB SADIA PONTA GROSSA',local:'PONTA GROSSA-PR',status:'BOOK PENDENTE',valor:13986.59,sige:'14874',obs:'Book de conclusão pendente + orçamento telhado'},
  {tipo:'TRANSF PAE',nome:'PAB HOSPITAL CENTRAL DA POLÍCIA MILITAR',local:'RIO DE JANEIRO-RJ',status:'BOOK PENDENTE',valor:9088.14,sige:'14912',obs:'Book Daniel — etapa 2: descarte, ART, croqui'},
  {tipo:'ENCER. AG',nome:'AG 6170 - PRIME BELVEDERE-UBH',local:'BELO HORIZONTE-MG',status:'BOOK PENDENTE',valor:32051.37,sige:'14537',obs:'Book + ART pendentes'},
  {tipo:'TRANSF PAE',nome:'PAB 300 - EDITORA FTD - GRUPO MARISTA - AG. 2514',local:'GUARULHOS-SP',status:'BOOK PENDENTE',valor:9829.31,obs:'Book Daniel — etapa 2: descarte, ART, croqui'},
  {tipo:'TRANSF PAE',nome:'PAB 007 - EMPRESA FOLHA DA MANHA - AG. 0296',local:'SÃO PAULO-SP',status:'BOOK PENDENTE',valor:15780.99,sige:'14581',obs:'Book Daniel — etapa 2: descarte, ART, croqui'},
  {tipo:'DESC. PAB',nome:'PAB IBQ IND. QUIMICA',local:'',status:'RM ENVIADA',valor:6884.66,obs:'ART + termos + relatório final pendentes'},
  {tipo:'TRANSF UN',nome:'BR_UN 2512 - PIABETA DISTR.M.MAGE',local:'',status:'ELABORAR BOOK',valor:8846.97,obs:'Book pós-obra a elaborar'},
  {tipo:'TRANSF UN',nome:'BR_UN 2187 - ITAIPU-UNITEROI',local:'',status:'ELABORAR BOOK',valor:9078.70,obs:'Book pós-obra a elaborar'},
  {tipo:'TRANSF UN',nome:'BR_UN 1625 - PC D PED II-UPCALDAS',local:'',status:'EM ANDAMENTO',valor:12814.82,obs:'Prev: 22/06 a 30/06'},
  {tipo:'TRANSF UN',nome:'BR_UN 0095 - NOVA CENTRAL-USP',local:'SÃO PAULO-SP',status:'EM ANDAMENTO',valor:3663.57,obs:'Prev: 22/06 a 30/06'},
  {tipo:'TRANSF UN',nome:'BR_UN 2646 - JD DO TREVO-UCAMPIN',local:'CAMPINAS-SP',status:'EM ANDAMENTO',valor:13974.82,obs:'Prev: 22/06 a 30/06'},
  {tipo:'TRANSF UN',nome:'BR_UN 2013 - ESTACIO-URJ',local:'RIO DE JANEIRO-RJ',status:'EM ANDAMENTO',valor:12084.82,obs:'Prev: 22/06 a 30/06'},
  {tipo:'TRANSF UN',nome:'BR_UN 2900 - BETANIA-UBH',local:'BELO HORIZONTE-MG',status:'EM ANDAMENTO',valor:9995.54,obs:'Prev: 22/06 a 30/06'},
  {tipo:'ENCER. AG',nome:'AG 1997 - V. BARCELONA-USCS',local:'SÃO CAETANO DO SUL-SP',status:'RM ENVIADA',valor:46661.56,obs:'ART + termos + book final pendentes'},
  {tipo:'DESC. PA',nome:'PA - ITAVERAVA',local:'MG',status:'ELABORAR BOOK',valor:9065,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - TRES MARIA',local:'MG',status:'ELABORAR BOOK',valor:11523.25,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - TOCOS DO MOJI',local:'MG',status:'ELABORAR BOOK',valor:10793.95,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - PIRANGUCU',local:'MG',status:'ELABORAR BOOK',valor:9449.92,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - SIMAO PEREIRA',local:'MG',status:'ELABORAR BOOK',valor:6631.47,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - CAMPO DO MEIO',local:'MG',status:'ELABORAR BOOK',valor:13796.72,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - RESERVA',local:'PR',status:'ELABORAR BOOK',valor:18018.92,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - IPIGUA',local:'SP',status:'ELABORAR BOOK',valor:12038.51,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - NIPOA',local:'SP',status:'ELABORAR BOOK',valor:12917.90,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - GUZOLÂNDIA',local:'SP',status:'ELABORAR BOOK',valor:7054.83,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - PAULISTAS',local:'MG',status:'ELABORAR BOOK',valor:9294.47,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - CAFELANDIA',local:'SP',status:'ELABORAR BOOK',valor:19601.48,obs:'Book pós-obra a elaborar'},
  {tipo:'DESC. PA',nome:'PA - SAO TOME',local:'',status:'ELABORAR BOOK',valor:11335.28,obs:'Book pós-obra a elaborar'},
  {tipo:'TRANSF EN',nome:'BR_EN AG 2337 - PC BATEL-UCTBA-PR',local:'CURITIBA-PR',status:'ELABORAR BOOK',valor:0,obs:'Book pós-obra a elaborar'},
  {tipo:'TRANSF EN',nome:'BR_EN AG 5755 - R.JOAO NEGRAO-UCTBA',local:'CURITIBA-PR',status:'PENDÊNCIA',valor:7580.54,obs:'PENDÊNCIA: colocar rodapé'},
  {tipo:'TRANSF EN',nome:'BR_EN AG 313 - V. LEOPOLDINA-USP',local:'SÃO PAULO-SP',status:'ELABORAR BOOK',valor:7696.74,obs:'Book pós-obra a elaborar'},
  {tipo:'TRANSF EN',nome:'BR_EN AG 1998 - CERRO CORA-USP',local:'SÃO PAULO-SP',status:'ELABORAR BOOK',valor:11862.05,obs:'Book pós-obra a elaborar'},
]

const STATUS_OPCOES = [
  'REALIZAR VISTORIA',
  'VISTORIA REALIZADA ELABORAR BOOK E ORÇAMENTO',
  'BOOK E ORÇAMENTOS ENVIADOS',
  'ORÇAMENTO APROVADO/REPROVADO',
  'OBRA EMITIR ART',
  'DCM E TERMOS ENTREGUES AO CAMPO',
  'TERMOS E DCMS ASSINADOS',
  'BDNS, MOBILIÁRIOS E EQUIPAMENTO REMOVIDOS',
  'FOTOS DO AMBIENTE VAZIO',
  'ELABORAR QRCODE OU BOOK DE CONCLUSÃO',
  'ELABORAR RM',
  'NF EMITIDO','PENDÊNCIA','CANCELADO',
]

const STATUS_COR = {
  'NF EMITIDO':{ bg:'#D1FAE5',text:'#065F46' },
  'RM ENVIADA':{ bg:'#DBEAFE',text:'#1E40AF' },
  'RM ENVIADA (ART)':{ bg:'#E0F2FE',text:'#0369A1' },
  'ELABORAR BOOK':{ bg:'#FEF9E7',text:'#856404' },
  'BOOK PENDENTE':{ bg:'#FEF3C7',text:'#92400E' },
  'EM ANDAMENTO':{ bg:'#EDE9FE',text:'#5B21B6' },
  'AG. PEDIDO':{ bg:'#FFF7ED',text:'#9A3412' },
  'ENVIAR RM':{ bg:'#FEE2E2',text:'#991B1B' },
  'RM PRONTA AGUARDANDO ORDEM':{ bg:'#F0FDF4',text:'#166534' },
  'PRECISA DE ARQUIVO RM':{ bg:'#FEE2E2',text:'#991B1B' },
  'PENDÊNCIA':{ bg:'#FEE2E2',text:'#991B1B' },
  'CANCELADO':{ bg:'#F1F5F9',text:'#64748B' },
}

const TIPO_COR = {
  'TRANSF UN':{ bg:'#DBEAFE',text:'#1E40AF' },
  'TRANSF EN':{ bg:'#EDE9FE',text:'#5B21B6' },
  'TRANSF PAE':{ bg:'#FCE7F3',text:'#9D174D' },
  'DESC. PA':{ bg:'#D1FAE5',text:'#065F46' },
  'DESC. PAB':{ bg:'#FEF3C7',text:'#92400E' },
  'ENCER. AG':{ bg:'#FEE2E2',text:'#991B1B' },
  'REFORMA':{ bg:'#F1F5F9',text:'#475569' },
  'TB FORTE':{ bg:'#F5F3FF',text:'#6D28D9' },
  'LINK':{ bg:'#E0F2FE',text:'#0369A1' },
}

function fmt(v){ return 'R$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) }

const STATUS_CONCLUIDO = ['NF EMITIDO', 'CANCELADO']

function diasNoPipeline(dc) {
  if (!dc) return null
  return Math.floor((Date.now() - new Date(dc).getTime()) / 86400000)
}

function alertaDias(dias, status) {
  if (dias === null || STATUS_CONCLUIDO.includes(status)) return null
  if (dias > 30) return { cor: '#991B1B', bg: '#FEE2E2', label: `${dias}d parado` }
  if (dias > 15) return { cor: '#92400E', bg: '#FEF3C7', label: `${dias}d no pipeline` }
  return null
}

function isoToBr(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function brToIso(br) {
  if (!br) return ''
  const [d, m, y] = br.split('/')
  return `${y}-${m}-${d}`
}

const TIPOS_ADESIVO = ['PUXE','EMPURRE','DESLIZE','CADEIRANTE','FAIXA BOLINHA','FAIXA JATEADO']

// Régua de 3 etapas para TRANSF UN com datas de visita
const ETAPAS_UN = [
  { titulo: 'Vistoria + BDN', desc: 'Vistoria local e projeto de movimentação de BDN', campo: 'data_etapa1' },
  { titulo: 'Fechaduras', desc: 'Troca de fechaduras (coincide com troca/substituição do BDN)', campo: 'data_etapa2' },
  { titulo: 'Obra Final', desc: 'Remoção porta giratória · Porta passa-objeto · Drywall/naval nos box · Adesivos', campo: 'data_etapa3' },
]

function ReguaEtapasUN({ obra }) {
  const primeiraVazia = ETAPAS_UN.findIndex(e => !obra[e.campo])
  const adesivosList = obra.adesivos ? obra.adesivos.split(',') : []
  return (
    <div style={{ display:'flex', gap:6, padding:'8px 0 4px' }}>
      {ETAPAS_UN.map((etapa, i) => {
        const data = obra[etapa.campo]
        const concluida = !!data
        const atual = primeiraVazia === i
        const cor = concluida ? '#1A6B4A' : atual ? '#2D3A8C' : '#9CA3AF'
        const bg = concluida ? '#D1FAE5' : atual ? '#EEF2FF' : '#F8FAFC'
        const borda = concluida ? '#BBF7D0' : atual ? '#C7D2FE' : '#E2E8F0'
        return (
          <div key={i} style={{ flex:1, background:bg, border:`1.5px solid ${borda}`, borderRadius:10, padding:'8px 6px', textAlign:'center' }}>
            <div style={{ fontSize:9, fontWeight:700, color:cor, textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>
              {i+1}ª Etapa
            </div>
            <div style={{ fontSize:10, fontWeight:600, color:'#1A2340', marginBottom:4, lineHeight:1.2 }}>
              {etapa.titulo}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color: concluida ? '#1A6B4A' : '#9CA3AF' }}>
              {data ? isoToBr(data) : '—'}
            </div>
            {i === 0 && adesivosList.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', marginTop:5 }}>
                {adesivosList.map(a => (
                  <span key={a} style={{ fontSize:8, background:'#2D3A8C', color:'#fff', borderRadius:4, padding:'1px 5px', fontWeight:600 }}>{a}</span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const ETAPAS_DESC = [
  'REALIZAR VISTORIA',
  'VISTORIA REALIZADA ELABORAR BOOK E ORÇAMENTO',
  'BOOK E ORÇAMENTOS ENVIADOS',
  'ORÇAMENTO APROVADO/REPROVADO',
  'OBRA EMITIR ART',
  'DCM E TERMOS ENTREGUES AO CAMPO',
  'TERMOS E DCMS ASSINADOS',
  'BDNS, MOBILIÁRIOS E EQUIPAMENTO REMOVIDOS',
  'FOTOS DO AMBIENTE VAZIO',
  'ELABORAR QRCODE OU BOOK DE CONCLUSÃO',
  'ELABORAR RM',
]
const ETAPAS_EN = ETAPAS_DESC
const ETAPAS_OUTRAS = ['Início','Em andamento','Conclusão','Faturamento']

function getEtapas(tipo) {
  if (tipo === 'TRANSF EN') return ETAPAS_EN
  if (['DESC. PA','DESC. PAB','TRANSF PAE','ENCER. AG'].includes(tipo)) return ETAPAS_DESC
  return ETAPAS_OUTRAS
}

function getEtapaAtual(status, tipo) {
  const etapas = getEtapas(tipo)
  const n = etapas.length
  // Busca direta pelo nome da etapa da régua
  const idx = etapas.findIndex(e => e.toLowerCase() === (status||'').toLowerCase())
  if (idx !== -1) return idx + 1
  // Compatibilidade com status antigos do banco
  const s = (status||'').toUpperCase()
  if (s.includes('NF EMITIDO') || s.includes('RM LIBERADA') || s.includes('EMITIR NF')) return n
  if (s.includes('ELABORAR RM') || s.includes('RM ENVIADA') || s.includes('RM PRONTA') || s.includes('ENVIAR RM') || s.includes('ARQUIVO RM')) return n
  if (s.includes('QRCODE') || s.includes('QR CODE') || s.includes('BOOK FINAL') || s.includes('BOOK POS') || s.includes('BOOK DE CONCLUSAO') || s.includes('ELABORAR BOOK') || s.includes('BOOK PENDENTE')) return 10
  if (s.includes('FOTOS') || s.includes('AMBIENTE VAZIO')) return 9
  if (s.includes('BDN') || s.includes('REMOVIDO') || s.includes('MOBILI')) return 8
  if (s.includes('TERMOS E DCMS') || s.includes('TERMO ASSIN') || s.includes('ASSINATURA')) return 7
  if (s.includes('DCM E TERMOS') || s.includes('ENTREGUES AO CAMPO')) return 6
  if (s.includes('OBRA') || s.includes('EMITIR ART') || s.includes('EXECUCAO') || s.includes('EM ANDAMENTO') || s.includes('AG. PEDIDO') || s.includes('OBRA INICIADA')) return 5
  if (s.includes('APROVADO') || s.includes('REPROVADO') || s.includes('APROVACAO') || s.includes('APROVAÇÃO')) return 4
  if (s.includes('ORÇAMENTOS ENVIADOS') || s.includes('ENVIADO') || s.includes('TECBAN') || s.includes('ENVIO')) return 3
  if (s.includes('ORCAMENTO LPU') || s.includes('ORÇAMENTO LPU') || s.includes('BOOK') || s.includes('CROQUI') || s.includes('VISTORIA REALIZADA')) return 2
  if (s.includes('VISTORIA') || s.includes('REALIZAR')) return 1
  return 1
}

function getGrupoObra(o) {
  const status = o.status || ''
  if (['PENDÊNCIA','PRECISA DE ARQUIVO RM','AG. PEDIDO','ENVIAR RM'].includes(status)) return 'pendencias'
  if (status === 'NF EMITIDO') return 'concluido'
  if (status === 'CANCELADO') return 'outros'
  if (['ELABORAR BOOK','BOOK PENDENTE'].includes(status)) return 'elaborar'
  if (['RM ENVIADA','RM ENVIADA (ART)','RM PRONTA AGUARDANDO ORDEM'].includes(status)) return 'rm'
  const n = getEtapas(o.tipo).length
  const etapa = getEtapaAtual(status, o.tipo)
  if (etapa >= n) return 'concluido'
  if (etapa >= n - 1) return 'rm'
  if (etapa >= n - 2) return 'elaborar'
  return 'em_andamento'
}

function Regua({ tipo, status, lembretes, onRemoverLembrete }) {
  const etapas = getEtapas(tipo)
  const atual = getEtapaAtual(status, tipo)
  const lista = Array.isArray(lembretes) ? lembretes : []
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'10px 0 6px', overflowX:'auto', gap:0 }}>
      {etapas.map((etapa, i) => {
        const num = i + 1
        const concluida = num < atual
        const ativa = num === atual
        const lembretesAqui = lista.filter(l => Number(l.etapa) === num)
        const cor = concluida ? '#1A6B4A' : ativa ? '#2D3A8C' : '#D1D5DB'
        return (
          <div key={i} style={{ flex:1, minWidth:48, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
            {i < etapas.length - 1 && (
              <div style={{ position:'absolute', top:11, left:'50%', right:'-50%', height:2, background: concluida ? '#1A6B4A' : '#E5E7EB', zIndex:0 }} />
            )}
            <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: cor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, border: ativa ? '2px solid #2D3A8C' : 'none', boxShadow: ativa ? '0 0 0 3px rgba(45,58,140,.2)' : 'none' }}>
                {concluida ? '✓' : num}
              </div>
              {lembretesAqui.length > 0 && (
                <div style={{ position:'absolute', top:-6, right:-6, width:14, height:14, borderRadius:'50%', background:'#EF4444', border:'2px solid #fff', zIndex:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fff', fontWeight:700 }}>
                  {lembretesAqui.length}
                </div>
              )}
            </div>
            <div style={{ fontSize:8, color: concluida ? '#1A6B4A' : ativa ? '#2D3A8C' : '#9CA3AF', marginTop:4, textAlign:'center', lineHeight:1.2, maxWidth:48 }}>{etapa}</div>
            {lembretesAqui.map((l, idx) => (
              <div key={idx} style={{ background:'#FEE2E2', color:'#991B1B', fontSize:7, fontWeight:700, borderRadius:4, padding:'2px 4px', marginTop:2, textAlign:'center', maxWidth:52, lineHeight:1.3, border:'1px solid #FECACA', wordBreak:'break-word' }}>
                ⚠ {l.texto}
                {onRemoverLembrete && (
                  <span onClick={e => { e.stopPropagation(); onRemoverLembrete(l) }}
                    style={{ display:'block', marginTop:2, color:'#991B1B', fontWeight:900, fontSize:9, cursor:'pointer', letterSpacing:.5 }}>
                    ✕ remover
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [obras, setObras] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')
  const [aberta, setAberta] = useState(null)
  const [modal, setModal] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')
  const [novaObs, setNovaObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [datas, setDatas] = useState({ data_etapa1:'', data_etapa2:'', data_etapa3:'' })
  const [dataObra, setDataObra] = useState({ inicio:'', termino:'' })
  const [dataArt, setDataArt] = useState('')
  const [emNegociacao, setEmNegociacao] = useState(false)
  const [lembretes, setLembretes] = useState([])
  const [novoLembreteEtapa, setNovoLembreteEtapa] = useState('')
  const [novoLembreteTexto, setNovoLembreteTexto] = useState('')
  const [editDados, setEditDados] = useState({ nome:'', local:'', valor:'', sige:'', pedido:'', nf:'' })
  const [adesivos, setAdesivos] = useState([])
  const [selecionadas, setSelecionadas] = useState(new Set())
  const [modalBulk, setModalBulk] = useState(false)
  const [statusBulk, setStatusBulk] = useState('')
  const [salvandoBulk, setSalvandoBulk] = useState(false)
  const [modalNovaObra, setModalNovaObra] = useState(false)
  const [menuAberto, setMenuAberto] = useState(null)
  const [novaObra, setNovaObra] = useState({ tipo:'', nome:'', local:'', valor:'', sige:'', pedido:'', nf:'', obs:'', data_cadastro: new Date().toISOString().split('T')[0] })
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [carregandoLogin, setCarregandoLogin] = useState(false)
  const [importando, setImportando] = useState(false)
  const [dataCadastroModal, setDataCadastroModal] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null)
      setCarregando(false)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user ?? null)
    })
  }, [])

  useEffect(() => { if (usuario) carregarObras() }, [usuario])

  async function carregarObras() {
    const { data, error } = await supabase.from('pipeline_obras').select('*').order('tipo').order('nome')
    if (error || !data || data.length === 0) {
      await importarDadosIniciais()
    } else {
      setObras(data)
    }
  }

  async function importarDadosIniciais() {
    setImportando(true)
    const { error } = await supabase.from('pipeline_obras').insert(OBRAS_INICIAIS)
    if (!error) {
      const { data } = await supabase.from('pipeline_obras').select('*').order('tipo').order('nome')
      setObras(data || [])
    }
    setImportando(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setCarregandoLogin(true)
    setErroLogin('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErroLogin('Email ou senha incorretos')
    setCarregandoLogin(false)
  }

  async function salvarNovaObra() {
    if (!novaObra.tipo || !novaObra.nome) return
    setSalvando(true)
    const { data, error } = await supabase.from('pipeline_obras').insert({
      tipo: novaObra.tipo,
      nome: novaObra.nome,
      local: novaObra.local || null,
      valor: parseFloat(novaObra.valor) || 0,
      sige: novaObra.sige || null,
      pedido: novaObra.pedido || null,
      nf: novaObra.nf || null,
      obs: novaObra.obs || null,
      status: 'VISTORIA',
      data_cadastro: novaObra.data_cadastro || new Date().toISOString().split('T')[0],
      atualizado_por: usuario.email,
      atualizado_em: new Date().toISOString(),
    }).select()
    if (!error && data) {
      setObras(prev => [...prev, data[0]].sort((a,b) => a.tipo.localeCompare(b.tipo)))
    }
    setSalvando(false)
    setModalNovaObra(false)
    setNovaObra({ tipo:'', nome:'', local:'', valor:'', sige:'', pedido:'', nf:'', obs:'', data_cadastro: new Date().toISOString().split('T')[0] })
  }

  async function excluirObra(id) {
    if (!window.confirm('Excluir esta obra?')) return
    await supabase.from('pipeline_obras').delete().eq('id', id)
    setObras(prev => prev.filter(o => o.id !== id))
    setMenuAberto(null)
  }

  async function salvarStatus() {
    if (!novoStatus) return
    setSalvando(true)
    const campos = {
      status: novoStatus,
      obs: novaObs || modal.obs || null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.email,
      nome: editDados.nome || modal.nome,
      local: editDados.local || null,
      valor: parseFloat(editDados.valor) || 0,
      sige: editDados.sige || null,
      pedido: editDados.pedido || null,
      nf: editDados.nf || null,
    }
    if (modal.tipo === 'TRANSF UN') {
      campos.data_etapa1 = datas.data_etapa1 || null
      campos.data_etapa2 = datas.data_etapa2 || null
      campos.data_etapa3 = datas.data_etapa3 || null
      campos.adesivos = adesivos.length > 0 ? adesivos.join(',') : null
    }
    if (modal.tipo !== 'TRANSF UN') {
      if (dataObra.inicio) campos.inicio = isoToBr(dataObra.inicio)
      if (dataObra.termino) campos.termino = isoToBr(dataObra.termino)
      if (dataArt) campos.data_art = dataArt
      campos.em_negociacao = emNegociacao
    }
    campos.lembretes = lembretes.length > 0 ? lembretes : null
    campos.data_cadastro = dataCadastroModal || modal.data_cadastro || null
    const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', modal.id)
    if (!error) {
      setObras(prev => prev.map(o => o.id === modal.id
        ? { ...o, ...campos }
        : o))
    }
    setSalvando(false)
    setModal(null)
    setNovoStatus('')
    setNovaObs('')
    setDatas({ data_etapa1:'', data_etapa2:'', data_etapa3:'' })
    setDataObra({ inicio:'', termino:'' })
    setDataArt('')
    setEmNegociacao(false)
    setLembretes([])
    setNovoLembreteEtapa('')
    setNovoLembreteTexto('')
    setAdesivos([])
    setEditDados({ nome:'', local:'', valor:'', sige:'', pedido:'', nf:'' })
    setDataCadastroModal('')
  }

  async function removerLembrete(obraId, lembrete) {
    const obra = obras.find(o => o.id === obraId)
    const novaLista = (Array.isArray(obra?.lembretes) ? obra.lembretes : []).filter(l => !(l.etapa === lembrete.etapa && l.texto === lembrete.texto))
    const campos = { lembretes: novaLista.length > 0 ? novaLista : null, atualizado_em: new Date().toISOString(), atualizado_por: usuario.email }
    const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', obraId)
    if (!error) setObras(prev => prev.map(o => o.id === obraId ? { ...o, lembretes: novaLista } : o))
  }

  async function salvarBulk() {
    if (!statusBulk || selecionadas.size === 0) return
    setSalvandoBulk(true)
    const ids = [...selecionadas]
    const campos = { status: statusBulk, atualizado_em: new Date().toISOString(), atualizado_por: usuario.email }
    const { error } = await supabase.from('pipeline_obras').update(campos).in('id', ids)
    if (!error) {
      setObras(prev => prev.map(o => selecionadas.has(o.id) ? { ...o, ...campos } : o))
    }
    setSalvandoBulk(false)
    setModalBulk(false)
    setSelecionadas(new Set())
    setStatusBulk('')
  }

  const estilo = { fontFamily:'system-ui,sans-serif', minHeight:'100vh', background:'#F0F4F8' }
  const inp = { width:'100%', padding:'11px 12px', fontSize:14, border:'1px solid #B5D4F4', borderRadius:10, background:'#fff', color:'#1A2340', outline:'none', boxSizing:'border-box', marginBottom:12 }

  if (carregando) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#87CEEB', fontSize:16 }}>Carregando...</div>
    </div>
  )

  if (!usuario) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#E6F1FB', borderRadius:20, padding:'40px 28px', width:'100%', maxWidth:360, boxShadow:'0 8px 32px rgba(0,0,0,.3)' }}>
        <div style={{ fontSize:24, fontWeight:700, color:'#2D3A8C', textAlign:'center', marginBottom:4 }}>GRUPO PG</div>
        <div style={{ fontSize:12, color:'#4A7FC1', textAlign:'center', marginBottom:28 }}>Pipeline de Obras</div>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={inp} />
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Senha" style={inp} />
          {erroLogin && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12, textAlign:'center' }}>{erroLogin}</div>}
          <button type="submit" disabled={carregandoLogin}
            style={{ width:'100%', padding:13, background:'#2D3A8C', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', borderBottom:'3px solid #1A2340', opacity:carregandoLogin?0.7:1 }}>
            {carregandoLogin ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )

  if (importando) return (
    <div style={{ minHeight:'100vh', background:'#2D3A8C', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#87CEEB', fontSize:14, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
        Importando dados da planilha...
      </div>
    </div>
  )

  const obrasFiltradas = obras.filter(o => {
    if (filtroTipo && o.tipo !== filtroTipo) return false
    if (filtroStatus && o.status !== filtroStatus) return false
    if (busca && !o.nome.toLowerCase().includes(busca.toLowerCase()) && !(o.local||'').toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroDe || filtroAte) {
      if (!o.inicio) return false
      const d = brToIso(o.inicio)
      if (filtroDe && d < filtroDe) return false
      if (filtroAte && d > filtroAte) return false
    }
    return true
  })

  const totalValor = obras.reduce((s,o) => s + Number(o.valor||0), 0)
  const emAndamento = obras.filter(o => o.status === 'EM ANDAMENTO').length
  const pendencias = obras.filter(o => ['PENDÊNCIA','PRECISA DE ARQUIVO RM','AG. PEDIDO','ENVIAR RM'].includes(o.status)).length
  const nfEmitido = obras.filter(o => o.status === 'NF EMITIDO').length

  const grupos = [
    { label:'⚠️ Pendências', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'pendencias') },
    { label:'🔧 Em andamento', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'em_andamento') },
    { label:'📋 Elaborar / Book pendente', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'elaborar') },
    { label:'📤 RM / Book final', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'rm') },
    { label:'✅ NF Emitido / Concluído', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'concluido') },
    { label:'📦 Outros', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'outros') },
  ].filter(g => g.obras.length > 0)

  function exportarCSV() {
    const cab = ['Tipo','Nome','Local','Status','Valor','SIGE','Pedido','NF','Início','Término','ART pronta','Em negociação','Observação','Post-its Régua','Data Entrada Pipeline','Dias no Pipeline','Atualizado por','Atualizado em']
    const esc = v => { const s = String(v ?? ''); return (s.includes(';') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s }
    const linhas = obrasFiltradas.map(o => {
      const d = diasNoPipeline(o.data_cadastro)
      return [
        o.tipo, o.nome, o.local||'', o.status,
        Number(o.valor||0).toFixed(2).replace('.',','),
        o.sige||'', o.pedido||'', o.nf||'',
        o.inicio||'', o.termino||'',
        o.data_art ? isoToBr(o.data_art) : '',
        o.em_negociacao ? 'Sim' : '',
        (o.obs||'').replace(/\n/g,' '),
        Array.isArray(o.lembretes) && o.lembretes.length > 0
          ? o.lembretes.map(l => `Etapa ${l.etapa}: ${l.texto}`).join(' | ')
          : '',
        o.data_cadastro ? isoToBr(o.data_cadastro) : '',
        d !== null ? String(d) : '',
        o.atualizado_por||'',
        o.atualizado_em ? new Date(o.atualizado_em).toLocaleString('pt-BR') : ''
      ].map(esc).join(';')
    })
    const csv = '﻿' + [cab.join(';'), ...linhas].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const d = new Date()
    a.download = `pipeline-${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={estilo}>
      {/* Header */}
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Pipeline de Obras</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:2 }}>Grupo PG — {obras.length} obras</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => setModalNovaObra(true)}
            style={{ background:'#1A6B4A', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', padding:'6px 12px', borderRadius:8 }}>
            + Nova
          </button>
          <button onClick={exportarCSV}
            style={{ background:'#0E4D73', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', padding:'6px 12px', borderRadius:8 }}>
            ↓ Excel
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:12, cursor:'pointer' }}>Sair</button>
        </div>
      </div>

      {/* Totalizadores */}
      <div style={{ background:'#2D3A8C', padding:'12px 16px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {[
          { n: 'R$' + (totalValor/1000).toFixed(0) + 'k', l:'Valor Total' },
          { n: emAndamento, l:'Andamento' },
          { n: pendencias, l:'Pendências', alert: pendencias > 0 },
          { n: nfEmitido, l:'NF Emitido' },
        ].map((t,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,.1)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color: t.alert ? '#FCA5A5' : '#fff' }}>{t.n}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.65)', marginTop:2 }}>{t.l}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background:'#fff', padding:'10px 16px', borderBottom:'1px solid #E0E8F0', display:'flex', gap:8, flexWrap:'wrap' }}>
        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flex:1, minWidth:100 }}>
          <option value="">Todos tipos</option>
          {[...new Set(obras.map(o=>o.tipo))].sort().map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flex:1, minWidth:100 }}>
          <option value="">Todos status</option>
          {[...new Set(obras.map(o=>o.status))].filter(Boolean).sort().map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..." style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:2, minWidth:120 }} />
        <div style={{ display:'flex', gap:6, alignItems:'center', width:'100%' }}>
          <span style={{ fontSize:11, color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>Início:</span>
          <input type="date" value={filtroDe} onChange={e=>setFiltroDe(e.target.value)}
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:1 }} />
          <span style={{ fontSize:11, color:'#64748B' }}>até</span>
          <input type="date" value={filtroAte} onChange={e=>setFiltroAte(e.target.value)}
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:1 }} />
          {(filtroDe || filtroAte) && (
            <button onClick={() => { setFiltroDe(''); setFiltroAte('') }}
              style={{ padding:'7px 10px', background:'#F1F5F9', border:'1px solid #CDD8E3', borderRadius:8, fontSize:11, color:'#64748B', cursor:'pointer', whiteSpace:'nowrap' }}>
              ✕ limpar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding:12 }}>
        {obrasFiltradas.length === 0 && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma obra encontrada</div>}
        {grupos.map(g => (
          <div key={g.label}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'#64748B', margin:'16px 0 8px', paddingBottom:4, borderBottom:'1px solid #E0E8F0' }}>
              {g.label} · {g.obras.length}
            </div>
            {g.obras.map(obra => {
              const sc = STATUS_COR[obra.status] || { bg:'#F1F5F9', text:'#475569' }
              const tc = TIPO_COR[obra.tipo] || { bg:'#F1F5F9', text:'#475569' }
              const estaAberta = aberta === obra.id
              const estaSelecionada = selecionadas.has(obra.id)
              const dias = diasNoPipeline(obra.data_cadastro)
              const alerta = alertaDias(dias, obra.status)
              return (
                <div key={obra.id} style={{ background: estaSelecionada ? '#EEF2FF' : '#fff', borderRadius:12, marginBottom:10, border: estaSelecionada ? '2px solid #2D3A8C' : alerta ? `2px solid ${alerta.cor}` : '1px solid #E0E8F0', overflow:'hidden' }}>
                  <div style={{ position:'relative' }}>
                  {usuario?.email === 'shirley@grupopg.com.br' && (
                    <button onClick={e => { e.stopPropagation(); setMenuAberto(menuAberto === obra.id ? null : obra.id) }}
                      style={{ position:'absolute', top:8, right:8, background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888', zIndex:2, lineHeight:1 }}>•••</button>
                  )}
                  {menuAberto === obra.id && (
                    <div style={{ position:'absolute', top:32, right:8, background:'#fff', border:'1px solid #E0E8F0', borderRadius:10, boxShadow:'0 4px 12px rgba(0,0,0,.15)', zIndex:10, minWidth:140 }}>
                      <div onClick={e => { e.stopPropagation(); excluirObra(obra.id) }}
                        style={{ padding:'12px 16px', fontSize:13, color:'#E24B4A', fontWeight:600, cursor:'pointer' }}>
                        🗑 Excluir obra
                      </div>
                    </div>
                  )}
                  <div style={{ padding:'12px 14px', cursor:'pointer' }} onClick={() => { setMenuAberto(null); setAberta(estaAberta ? null : obra.id) }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4, gap:8 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:8, flex:1, minWidth:0 }}>
                        <div onClick={e => { e.stopPropagation(); setSelecionadas(prev => { const n = new Set(prev); estaSelecionada ? n.delete(obra.id) : n.add(obra.id); return n }) }}
                          style={{ width:20, height:20, borderRadius:6, border:`2px solid ${estaSelecionada ? '#2D3A8C' : '#CDD8E3'}`, background: estaSelecionada ? '#2D3A8C' : '#fff',
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, cursor:'pointer' }}>
                          {estaSelecionada && <span style={{ color:'#fff', fontSize:11, fontWeight:700 }}>✓</span>}
                        </div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', flex:1, lineHeight:1.4 }}>{obra.nome}</div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#2D3A8C', whiteSpace:'nowrap' }}>{fmt(obra.valor)}</div>
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:tc.bg, color:tc.text }}>{obra.tipo}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:sc.bg, color:sc.text }}>{obra.status}</span>
                      {obra.em_negociacao && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FEF3C7', color:'#92400E' }}>Em negociação</span>}
                      {alerta && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:alerta.bg, color:alerta.cor }}>⚠ {alerta.label}</span>}
                      {obra.local ? <span style={{ fontSize:11, color:'#888' }}>{obra.local}</span> : null}
                    </div>
                  </div>

                  <div style={{ padding:'0 14px 8px' }}>
                    {obra.tipo === 'TRANSF UN'
                      ? <ReguaEtapasUN obra={obra} />
                      : <Regua tipo={obra.tipo} status={obra.status} lembretes={obra.lembretes} onRemoverLembrete={l => removerLembrete(obra.id, l)} />
                    }
                  </div>

                  {estaAberta && (
                    <div style={{ padding:'12px 14px', borderTop:'1px solid #F0F4F8', background:'#FAFBFF' }}>
                      {obra.obs && (
                        <div style={{ fontSize:11, background:'#FFF9E6', borderLeft:'3px solid #F5A623', padding:'6px 10px', borderRadius:4, color:'#7A5A00', marginBottom:10 }}>
                          📌 {obra.obs}
                        </div>
                      )}
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
                        {obra.data_cadastro && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Entrada pipeline</div><div style={{ fontSize:12, color: alerta ? alerta.cor : '#1A2340', fontWeight:600 }}>{isoToBr(obra.data_cadastro)}{dias !== null ? ` · ${dias}d` : ''}</div></div>}
                        {obra.sige && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>SIGE</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.sige}</div></div>}
                        {obra.pedido && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Pedido</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.pedido}</div></div>}
                        {obra.nf && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>NF</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.nf}</div></div>}
                        {obra.inicio && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Início</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.inicio}</div></div>}
                        {obra.termino && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Término</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.termino}</div></div>}
                        {obra.data_art && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>ART pronta</div><div style={{ fontSize:12, color:'#1A6B4A', fontWeight:600 }}>{isoToBr(obra.data_art)}</div></div>}
                      </div>
                      {obra.atualizado_por && (
                        <div style={{ fontSize:10, color:'#4A7FC1', marginBottom:8 }}>
                          Atualizado por {obra.atualizado_por} — {obra.atualizado_em ? new Date(obra.atualizado_em).toLocaleString('pt-BR') : ''}
                        </div>
                      )}
                      <button onClick={() => {
                        setModal(obra)
                        setNovoStatus(obra.status)
                        setNovaObs(obra.obs||'')
                        setDatas({ data_etapa1: obra.data_etapa1||'', data_etapa2: obra.data_etapa2||'', data_etapa3: obra.data_etapa3||'' })
                        setDataObra({ inicio: obra.inicio ? brToIso(obra.inicio) : '', termino: obra.termino ? brToIso(obra.termino) : '' })
                        setDataArt(obra.data_art || '')
                        setEmNegociacao(obra.em_negociacao || false)
                        setLembretes(Array.isArray(obra.lembretes) ? obra.lembretes : [])
                        setNovoLembreteEtapa('')
                        setNovoLembreteTexto('')
                        setAdesivos(obra.adesivos ? obra.adesivos.split(',') : [])
                        setEditDados({ nome: obra.nome||'', local: obra.local||'', valor: obra.valor!=null ? String(obra.valor) : '', sige: obra.sige||'', pedido: obra.pedido||'', nf: obra.nf||'' })
                        setDataCadastroModal(obra.data_cadastro || '')
                      }}
                        style={{ width:'100%', padding:'10px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Atualizar status
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>


      {/* Modal Nova Obra */}
      {modalNovaObra && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if(e.target === e.currentTarget) setModalNovaObra(false) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:16 }}>Nova Obra</div>
            {[
              { label:'Tipo *', field:'tipo', type:'select', options:['TRANSF UN','TRANSF EN','TRANSF PAE','DESC. PA','DESC. PAB','ENCER. AG','REFORMA','TB FORTE','LINK'] },
              { label:'Nome da obra *', field:'nome', type:'text', placeholder:'Ex: BR_UN 1234 - NOME-USP' },
              { label:'Local', field:'local', type:'text', placeholder:'Ex: SÃO PAULO-SP' },
              { label:'Valor (R$)', field:'valor', type:'number', placeholder:'Ex: 12500.00' },
              { label:'SIGE', field:'sige', type:'text', placeholder:'Ex: 14500' },
              { label:'Pedido', field:'pedido', type:'text', placeholder:'Ex: ORDEM 1000079999' },
              { label:'NF', field:'nf', type:'text', placeholder:'Ex: 3181' },
              { label:'Observação', field:'obs', type:'textarea', placeholder:'Detalhes, pendências...' },
            ].map(f => (
              <div key={f.field} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }}>
                    <option value="">Selecione...</option>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]:e.target.value}))}
                    rows={3} placeholder={f.placeholder}
                    style={{ width:'100%', padding:'10px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, resize:'none', boxSizing:'border-box', color:'#1A2340' }} />
                ) : (
                  <input type={f.type} value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]:e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom:14, background:'#F0F7FF', borderRadius:10, padding:12, border:'1px solid #BFDBFE' }}>
              <label style={{ fontSize:12, color:'#1E40AF', fontWeight:700, display:'block', marginBottom:4 }}>Data de entrada no pipeline</label>
              <input type="date" value={novaObra.data_cadastro}
                onChange={e => setNovaObra(p => ({...p, data_cadastro: e.target.value}))}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #BFDBFE', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>Padrão: hoje. Ajuste se a demanda chegou em outra data.</div>
            </div>
            <button onClick={salvarNovaObra} disabled={!novaObra.tipo || !novaObra.nome || salvando}
              style={{ width:'100%', padding:13, background: (!novaObra.tipo||!novaObra.nome||salvando) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:8 }}>
              {salvando ? 'Salvando...' : 'Criar Obra'}
            </button>
            <button onClick={() => setModalNovaObra(false)}
              style={{ width:'100%', padding:11, background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:12, fontSize:13, cursor:'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal Atualizar Status */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if(e.target === e.currentTarget) setModal(null) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:4 }}>{modal.nome}</div>
            <div style={{ fontSize:11, color:'#888', marginBottom:12 }}>{modal.tipo}</div>

            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Dados da obra</div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Nome</label>
                <input value={editDados.nome} onChange={e => setEditDados(d => ({...d, nome:e.target.value}))}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Local</label>
                  <input value={editDados.local} onChange={e => setEditDados(d => ({...d, local:e.target.value}))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Valor (R$)</label>
                  <input type="number" value={editDados.valor} onChange={e => setEditDados(d => ({...d, valor:e.target.value}))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>SIGE</label>
                  <input value={editDados.sige} onChange={e => setEditDados(d => ({...d, sige:e.target.value}))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Pedido</label>
                  <input value={editDados.pedido} onChange={e => setEditDados(d => ({...d, pedido:e.target.value}))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>NF</label>
                  <input value={editDados.nf} onChange={e => setEditDados(d => ({...d, nf:e.target.value}))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
              </div>
            </div>

            {modal.tipo === 'TRANSF UN' && (
              <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas de visita ao ponto</div>
                {ETAPAS_UN.map((etapa, i) => (
                  <div key={etapa.campo} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>
                      {i+1}ª Etapa — {etapa.titulo}
                    </label>
                    <div style={{ fontSize:10, color:'#888', marginBottom:4 }}>{etapa.desc}</div>
                    <input type="date" value={datas[etapa.campo]||''}
                      onChange={e => setDatas(d => ({...d, [etapa.campo]: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                    {i === 0 && (
                      <div style={{ marginTop:8 }}>
                        <div style={{ fontSize:10, color:'#64748B', fontWeight:600, marginBottom:6 }}>Adesivos necessários:</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {TIPOS_ADESIVO.map(tipo => {
                            const sel = adesivos.includes(tipo)
                            return (
                              <div key={tipo} onClick={() => setAdesivos(prev => sel ? prev.filter(a => a !== tipo) : [...prev, tipo])}
                                style={{ padding:'5px 11px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer',
                                  background: sel ? '#2D3A8C' : '#fff',
                                  color: sel ? '#fff' : '#4A7FC1',
                                  border: `1.5px solid ${sel ? '#2D3A8C' : '#B5D4F4'}` }}>
                                {tipo}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ background:'#F0F7FF', borderRadius:12, padding:14, marginBottom:16, border:'1px solid #BFDBFE' }}>
              <div style={{ fontSize:12, color:'#1E40AF', fontWeight:700, marginBottom:8 }}>Data de entrada no pipeline</div>
              <input type="date" value={dataCadastroModal}
                onChange={e => setDataCadastroModal(e.target.value)}
                style={{ width:'100%', padding:'8px 10px', border:'1px solid #BFDBFE', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              <div style={{ fontSize:10, color:'#64748B', marginTop:5 }}>Quando esta demanda entrou no pipeline (usada para calcular dias parado)</div>
            </div>

            {modal.tipo !== 'TRANSF UN' && (
              <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas da obra</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Início</label>
                    <input type="date" value={dataObra.inicio}
                      onChange={e => setDataObra(d => ({...d, inicio: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Término</label>
                    <input type="date" value={dataObra.termino}
                      onChange={e => setDataObra(d => ({...d, termino: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>ART pronta em</label>
                    <input type="date" value={dataArt}
                      onChange={e => setDataArt(e.target.value)}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                </div>
                <div onClick={() => setEmNegociacao(v => !v)}
                  style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'10px 12px', borderRadius:10,
                    background: emNegociacao ? '#FEF3C7' : '#fff', border:`1.5px solid ${emNegociacao ? '#F59E0B' : '#E0E8F0'}` }}>
                  <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${emNegociacao ? '#F59E0B' : '#CDD8E3'}`,
                    background: emNegociacao ? '#F59E0B' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {emNegociacao && <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color: emNegociacao ? '#92400E' : '#1A2340' }}>Orçamento reprovado — Em negociação</div>
                    <div style={{ fontSize:10, color:'#888' }}>Marque se o orçamento foi reprovado e está em negociação</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:8 }}>Etapa da régua:</div>
            {getEtapas(modal.tipo).map((op, i) => {
              const ativo = novoStatus === op
              return (
                <div key={op} onClick={() => setNovoStatus(op)}
                  style={{ padding:'11px 14px', borderRadius:10, border: ativo ? '2px solid #1A6B4A' : '1px solid #E0E8F0', marginBottom:8, cursor:'pointer', background: ativo ? '#D1FAE5' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:11, background: ativo ? '#1A6B4A' : '#E6F1FB', color: ativo ? '#fff' : '#2D3A8C', fontWeight:700, borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                  <span style={{ fontSize:13, color:'#1A2340', fontWeight: ativo ? 600 : 400 }}>{op}</span>
                  {ativo && <span style={{ marginLeft:'auto', fontSize:16 }}>●</span>}
                </div>
              )
            })}
            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, margin:'12px 0 6px' }}>Observação:</div>
            <textarea value={novaObs} onChange={e=>setNovaObs(e.target.value)} rows={3}
              placeholder="Pendências, próximos passos..."
              style={{ width:'100%', padding:'10px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, resize:'none', marginBottom:12, boxSizing:'border-box', color:'#1A2340' }} />

            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:12, color:'#991B1B', fontWeight:700, marginBottom:10 }}>📌 Post-its na régua</div>
              {lembretes.length > 0 && (
                <div style={{ marginBottom:10, display:'flex', flexDirection:'column', gap:6 }}>
                  {lembretes.map((l, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #FECACA', borderRadius:8, padding:'8px 10px' }}>
                      <span style={{ fontSize:10, background:'#EF4444', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>{l.etapa}</span>
                      <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>{l.texto}</span>
                      <span onClick={() => setLembretes(prev => prev.filter((_, i) => i !== idx))}
                        style={{ fontSize:14, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:6 }}>
                <select value={novoLembreteEtapa} onChange={e => setNovoLembreteEtapa(e.target.value)}
                  style={{ padding:'8px 6px', border:'1px solid #FECACA', borderRadius:8, fontSize:11, color:'#1A2340', background:'#fff', width:52, flexShrink:0 }}>
                  <option value="">Etapa</option>
                  {getEtapas(modal.tipo).map((_, i) => (
                    <option key={i} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <input value={novoLembreteTexto} onChange={e => setNovoLembreteTexto(e.target.value)}
                  placeholder="Ex: Emitir ART — Carol"
                  style={{ flex:1, padding:'8px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }} />
                <button onClick={() => {
                  if (!novoLembreteEtapa || !novoLembreteTexto.trim()) return
                  setLembretes(prev => [...prev, { etapa: Number(novoLembreteEtapa), texto: novoLembreteTexto.trim() }])
                  setNovoLembreteEtapa('')
                  setNovoLembreteTexto('')
                }} style={{ padding:'8px 12px', background:'#EF4444', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                  + Add
                </button>
              </div>
            </div>
            <button onClick={salvarStatus} disabled={!novoStatus || salvando}
              style={{ width:'100%', padding:13, background: (!novoStatus||salvando) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor: (!novoStatus||salvando) ? 'default' : 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => setModal(null)}
              style={{ width:'100%', padding:11, background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:12, fontSize:13, cursor:'pointer', marginTop:8 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Barra flutuante de seleção em lote */}
      {selecionadas.size > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:200, boxShadow:'0 -4px 20px rgba(0,0,0,.3)' }}>
          <div style={{ color:'#fff', fontSize:13, fontWeight:600 }}>
            {selecionadas.size} {selecionadas.size === 1 ? 'obra selecionada' : 'obras selecionadas'}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setSelecionadas(new Set())}
              style={{ padding:'8px 14px', background:'rgba(255,255,255,.15)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:500 }}>
              Limpar
            </button>
            <button onClick={() => setModalBulk(true)}
              style={{ padding:'8px 14px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:700 }}>
              Atualizar status
            </button>
          </div>
        </div>
      )}

      {/* Modal Atualizar Status em Lote */}
      {modalBulk && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:300, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if(e.target === e.currentTarget) setModalBulk(false) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'75vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:4 }}>Atualizar {selecionadas.size} obras</div>
            <div style={{ fontSize:11, color:'#888', marginBottom:16 }}>O status selecionado será aplicado a todas as obras marcadas</div>
            {STATUS_OPCOES.map((op, i) => {
              const ativo = statusBulk === op
              return (
                <div key={op} onClick={() => setStatusBulk(op)}
                  style={{ padding:'11px 14px', borderRadius:10, border: ativo ? '2px solid #1A6B4A' : '1px solid #E0E8F0', marginBottom:8, cursor:'pointer', background: ativo ? '#D1FAE5' : '#fff', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:11, background: ativo ? '#1A6B4A' : '#E6F1FB', color: ativo ? '#fff' : '#2D3A8C', fontWeight:700, borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                  <span style={{ fontSize:13, color:'#1A2340', fontWeight: ativo ? 600 : 400 }}>{op}</span>
                  {ativo && <span style={{ marginLeft:'auto', fontSize:16 }}>●</span>}
                </div>
              )
            })}
            <button onClick={salvarBulk} disabled={!statusBulk || salvandoBulk}
              style={{ width:'100%', padding:13, background: (!statusBulk||salvandoBulk) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor: (!statusBulk||salvandoBulk) ? 'default' : 'pointer', marginTop:8 }}>
              {salvandoBulk ? 'Salvando...' : `Salvar em ${selecionadas.size} obras`}
            </button>
            <button onClick={() => setModalBulk(false)}
              style={{ width:'100%', padding:11, background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:12, fontSize:13, cursor:'pointer', marginTop:8 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
