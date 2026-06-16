import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const OBRAS_INICIAIS = [
  {tipo:'TRANSF PAE',nome:'PAB VIAÇAO OSASCO LTDA',local:'OSASCO-SP',inicio:'02/04/2026',termino:'05/04/2026',status:'NF EMITIDO',valor:5126.03,sige:'13653',pedido:'4501792509',nf:'3101'},
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
  {tipo:'DESC. PA',nome:'PA 083 - ICARAI DE MINAS - AG 1151',local:'ICARAÍ DE MINAS-MG',inicio:'26/05/2026',termino:'31/05/2026',status:'NF EMITIDO',valor:8493.50,sige:'14224',pedido:'4501863922',nf:'57'},
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
  'VISTORIA','BOOK E CROQUI','ORÇAMENTO LPU','ENVIO ORÇAMENTO TECBAN','ORÇAMENTO APROVADO',
  'OBRA INICIADA','ASSINATURA DE TERMOS','ELABORAR QRCODE','ELABORAR ART','BOOK FINAL POS OBRA',
  'ELABORAR RM','EMITIR NF','PENDÊNCIA','CANCELADO'
]

const STATUS_COR = {
  'VISTORIA':{ bg:'#F0FDF4',text:'#166534' },
  'BOOK E CROQUI':{ bg:'#DBEAFE',text:'#1E40AF' },
  'ORÇAMENTO LPU':{ bg:'#EDE9FE',text:'#5B21B6' },
  'ENVIO ORÇAMENTO TECBAN':{ bg:'#FEF3C7',text:'#92400E' },
  'ORÇAMENTO APROVADO':{ bg:'#D1FAE5',text:'#065F46' },
  'OBRA INICIADA':{ bg:'#EDE9FE',text:'#5B21B6' },
  'ASSINATURA DE TERMOS':{ bg:'#F0FDF4',text:'#166534' },
  'ELABORAR QRCODE':{ bg:'#FEF9E7',text:'#856404' },
  'ELABORAR ART':{ bg:'#FFF7ED',text:'#9A3412' },
  'BOOK FINAL POS OBRA':{ bg:'#FEF3C7',text:'#92400E' },
  'ELABORAR RM':{ bg:'#DBEAFE',text:'#1E40AF' },
  'EMITIR NF':{ bg:'#D1FAE5',text:'#065F46' },
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

const CHECKLIST_PADRAO = [
  { id:'book_vistoria',    texto:'Verificar book de vistoria', obrigatorio:true },
  { id:'parede',           texto:'Verificar: tem parede de drywall / divisória naval / não precisa fazer parede?', obrigatorio:false },
  { id:'carpete',          texto:'Remover carpete?', obrigatorio:false },
  { id:'piso_tatil_rem',   texto:'Remover piso tátil?', obrigatorio:false },
  { id:'piso_tatil_apl',   texto:'Reaplicar piso tátil?', obrigatorio:false },
  { id:'adesivos',         texto:'Aplicar adesivos nos vidros?', obrigatorio:false },
  { id:'cacamba',          texto:'Necessário caçamba?', obrigatorio:false },
  { id:'carro_transporte', texto:'Necessário carro de transporte?', obrigatorio:false },
  { id:'dcm_impressos',    texto:'Termos de DCM estão impressos?', obrigatorio:true },
  { id:'termos_conclusao', texto:'Termos de conclusão de obra disponíveis para assinatura', obrigatorio:true, link:true },
  { id:'epis',             texto:'Levou EPIs?', obrigatorio:true },
]

const STATUS_APROVADO_IDX = 5

function statusAprovado(status) {
  const s = status?.toUpperCase() || ''
  const aprovados = ['ORÇAMENTO APROVADO','OBRA INICIADA','ASSINATURA DE TERMOS','ELABORAR QRCODE','ELABORAR ART','BOOK FINAL POS OBRA','ELABORAR RM','EMITIR NF','EM ANDAMENTO','BOOK PENDENTE','ELABORAR BOOK','RM ENVIADA','RM PRONTA','NF EMITIDO']
  return aprovados.some(a => s.includes(a))
}

const ETAPAS_UN_EN = ['Vistoria','Book+Croqui','Orç. LPU','Envio Orç. Tecban','Orç. Aprovado','Obra Iniciada','Assin. Termos','QR Code','Elaborar ART','Book Final','Elaborar RM','Emitir NF']
const ETAPAS_DESC = ['Vistoria','Book+Croqui','Orç. LPU','Envio Orç. Tecban','Orç. Aprovado','Obra Iniciada','Assin. Termos','QR Code','Elaborar ART','Book Final','Elaborar RM','Emitir NF']
const ETAPAS_OUTRAS = ['Vistoria','Book+Croqui','Orç. LPU','Envio Orç. Tecban','Orç. Aprovado','Obra Iniciada','Assin. Termos','QR Code','Elaborar ART','Book Final','Elaborar RM','Emitir NF']

function getEtapas(tipo) {
  if (['TRANSF UN','TRANSF EN'].includes(tipo)) return ETAPAS_UN_EN
  if (['DESC. PA','DESC. PAB','TRANSF PAE','ENCER. AG'].includes(tipo)) return ETAPAS_DESC
  return ETAPAS_OUTRAS
}

function getEtapaAtual(status, tipo) {
  const s = status.toUpperCase()
  if (s.includes('EMITIR NF') || s.includes('NF EMITIDO')) return 12
  if (s.includes('ELABORAR RM') || s.includes('RM ENVIADA') || s.includes('RM PRONTA')) return 11
  if (s.includes('BOOK FINAL') || s.includes('ELABORAR BOOK')) return 10
  if (s.includes('ELABORAR ART') || s.includes('ART PENDENTE')) return 9
  if (s.includes('QRCODE') || s.includes('QR CODE')) return 8
  if (s.includes('ASSINATURA') || s.includes('TERMO')) return 7
  if (s.includes('OBRA INICIADA') || s.includes('EM ANDAMENTO')) return 6
  if (s.includes('ORÇAMENTO APROVADO') || s.includes('APROVADO') || s.includes('APROVAÇÃO')) return 5
  if (s.includes('ENVIO ORÇAMENTO') || s.includes('ENVIO TECBAN')) return 4
  if (s.includes('ORÇAMENTO LPU') || s.includes('ORCAMENTO')) return 3
  if (s.includes('BOOK E CROQUI') || s.includes('CROQUI')) return 2
  if (s.includes('VISTORIA')) return 1
  return 1
}

function Regua({ tipo, status }) {
  const etapas = getEtapas(tipo)
  const atual = getEtapaAtual(status, tipo)
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'10px 0 6px', overflowX:'auto', gap:0 }}>
      {etapas.map((etapa, i) => {
        const num = i + 1
        const concluida = num < atual
        const ativa = num === atual
        const pendente = num > atual
        const cor = concluida ? '#1A6B4A' : ativa ? '#2D3A8C' : '#D1D5DB'
        return (
          <div key={i} style={{ flex:1, minWidth:48, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
            {i < etapas.length - 1 && (
              <div style={{ position:'absolute', top:11, left:'50%', right:'-50%', height:2, background: concluida ? '#1A6B4A' : '#E5E7EB', zIndex:0 }} />
            )}
            <div style={{ width:24, height:24, borderRadius:'50%', background: cor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, position:'relative', zIndex:1, flexShrink:0, border: ativa ? '2px solid #2D3A8C' : 'none', boxShadow: ativa ? '0 0 0 3px rgba(45,58,140,.2)' : 'none' }}>
              {concluida ? '✓' : num}
            </div>
            <div style={{ fontSize:8, color: concluida ? '#1A6B4A' : ativa ? '#2D3A8C' : '#9CA3AF', marginTop:4, textAlign:'center', lineHeight:1.2, maxWidth:48 }}>{etapa}</div>
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
  const [aberta, setAberta] = useState(null)
  const [modal, setModal] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')
  const [novaObs, setNovaObs] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [emNegociacao, setEmNegociacao] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [modalNovaObra, setModalNovaObra] = useState(false)
  const [menuAberto, setMenuAberto] = useState(null)
  const [novaObra, setNovaObra] = useState({ tipo:'', nome:'', local:'', valor:'', sige:'', pedido:'', obs:'' })
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [carregandoLogin, setCarregandoLogin] = useState(false)
  const [importando, setImportando] = useState(false)
  const [checklistAberto, setChecklistAberto] = useState(null)
  const [novoItemChecklist, setNovoItemChecklist] = useState('')
  const [salvandoChecklist, setSalvandoChecklist] = useState(false)

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
      obs: novaObra.obs || null,
      status: 'VISTORIA',
      atualizado_por: usuario.email,
      atualizado_em: new Date().toISOString(),
    }).select()
    if (!error && data) {
      setObras(prev => [...prev, data[0]].sort((a,b) => a.tipo.localeCompare(b.tipo)))
    }
    setSalvando(false)
    setModalNovaObra(false)
    setNovaObra({ tipo:'', nome:'', local:'', valor:'', sige:'', pedido:'', obs:'' })
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
    const updateData = {
      status: novoStatus,
      obs: novaObs || modal.obs || null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.email,
    }
    if (novoStatus === 'ORÇAMENTO APROVADO' && dataInicio) {
      updateData.data_inicio = dataInicio
    }
    if (novoValor !== '' && !isNaN(parseFloat(novoValor))) {
      updateData.valor = parseFloat(novoValor)
    }
    updateData.em_negociacao = emNegociacao
    const { error } = await supabase.from('pipeline_obras').update(updateData).eq('id', modal.id)
    if (!error) {
      setObras(prev => prev.map(o => o.id === modal.id
        ? { ...o, status: novoStatus, obs: novaObs || o.obs, atualizado_por: usuario.email, atualizado_em: new Date().toISOString(), data_inicio: updateData.data_inicio || o.data_inicio, valor: updateData.valor ?? o.valor, em_negociacao: emNegociacao }
        : o))
    }
    setSalvando(false)
    setModal(null)
    setNovoStatus('')
    setNovaObs('')
    setDataInicio('')
    setNovoValor('')
    setEmNegociacao(false)
    setAberta(null)
  }

  function getChecklist(obra) {
    if (!obra.checklist) return CHECKLIST_PADRAO.map(i => ({ ...i, feito: false }))
    const salvo = typeof obra.checklist === 'string' ? JSON.parse(obra.checklist) : obra.checklist
    const base = CHECKLIST_PADRAO.map(i => ({ ...i, feito: salvo.find(s => s.id === i.id)?.feito || false }))
    const extras = salvo.filter(s => !CHECKLIST_PADRAO.find(p => p.id === s.id))
    return [...base, ...extras]
  }

  async function toggleItem(obra, itemId) {
    const lista = getChecklist(obra)
    const nova = lista.map(i => i.id === itemId ? { ...i, feito: !i.feito } : i)
    const novaObras = obras.map(o => o.id === obra.id ? { ...o, checklist: nova } : o)
    setObras(novaObras)
    await supabase.from('pipeline_obras').update({ checklist: nova }).eq('id', obra.id)
  }

  async function adicionarItemChecklist(obra) {
    if (!novoItemChecklist.trim()) return
    const lista = getChecklist(obra)
    const novo = { id: 'extra_' + Date.now(), texto: novoItemChecklist.trim(), obrigatorio: false, feito: false, extra: true }
    const nova = [...lista, novo]
    setObras(obras.map(o => o.id === obra.id ? { ...o, checklist: nova } : o))
    await supabase.from('pipeline_obras').update({ checklist: nova }).eq('id', obra.id)
    setNovoItemChecklist('')
  }

  async function removerItemExtra(obra, itemId) {
    const lista = getChecklist(obra).filter(i => i.id !== itemId)
    setObras(obras.map(o => o.id === obra.id ? { ...o, checklist: lista } : o))
    await supabase.from('pipeline_obras').update({ checklist: lista }).eq('id', obra.id)
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
    return true
  })

  const totalValor = obras.reduce((s,o) => s + Number(o.valor||0), 0)
  const emAndamento = obras.filter(o => ['OBRA INICIADA','ENVIO ORÇAMENTO TECBAN','ORÇAMENTO APROVADO','ASSINATURA DE TERMOS','ELABORAR QRCODE','ELABORAR ART'].includes(o.status)).length
  const pendencias = obras.filter(o => ['PENDÊNCIA'].includes(o.status)).length
  const nfEmitido = obras.filter(o => o.status === 'EMITIR NF').length

  const STATUS_TODOS = ['VISTORIA','BOOK E CROQUI','ORÇAMENTO LPU','ENVIO ORÇAMENTO TECBAN','ORÇAMENTO APROVADO','OBRA INICIADA','ASSINATURA DE TERMOS','ELABORAR QRCODE','ELABORAR ART','BOOK FINAL POS OBRA','ELABORAR RM','EMITIR NF','PENDÊNCIA','CANCELADO']
  const grupos = [
    { label:'🔴 Pendências', obras: obrasFiltradas.filter(o => o.status === 'PENDÊNCIA') },
    { label:'🟡 Em andamento', obras: obrasFiltradas.filter(o => ['OBRA INICIADA','ASSINATURA DE TERMOS','ENVIO ORÇAMENTO TECBAN','ORÇAMENTO APROVADO'].includes(o.status)) },
    { label:'📚 Elaborar Book / ART / QR Code', obras: obrasFiltradas.filter(o => ['ELABORAR QRCODE','ELABORAR ART','BOOK FINAL POS OBRA'].includes(o.status)) },
    { label:'📤 Elaborar RM', obras: obrasFiltradas.filter(o => o.status === 'ELABORAR RM') },
    { label:'✅ NF Emitido', obras: obrasFiltradas.filter(o => o.status === 'EMITIR NF') },
    { label:'📋 Vistoria / Book / Orçamento', obras: obrasFiltradas.filter(o => ['VISTORIA','BOOK E CROQUI','ORÇAMENTO LPU'].includes(o.status)) },
    { label:'⚫ Outros', obras: obrasFiltradas.filter(o => !STATUS_TODOS.includes(o.status)) },
  ].filter(g => g.obras.length > 0)

  return (
    <div style={estilo}>
      {/* Header */}
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Pipeline de Obras</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:2 }}>Grupo PG · {obras.length} obras</div>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:12, cursor:'pointer' }}>Sair</button>
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
          {STATUS_OPCOES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..." style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:2, minWidth:120 }} />
      </div>

      {/* Lista */}
      <div style={{ padding:12 }}>
        {obrasFiltradas.length === 0 && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma obra encontrada</div>}
        {grupos.map(g => (
          <div key={g.label}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'#64748B', margin:'16px 0 8px', paddingBottom:4, borderBottom:'1px solid #E0E8F0' }}>
              {g.label} — {g.obras.length}
            </div>
            {g.obras.map(obra => {
              const sc = STATUS_COR[obra.status] || { bg:'#F1F5F9', text:'#475569' }
              const tc = TIPO_COR[obra.tipo] || { bg:'#F1F5F9', text:'#475569' }
              const estaAberta = aberta === obra.id
              return (
                <div key={obra.id} style={{ background:'#fff', borderRadius:12, marginBottom:10, border:'1px solid #E0E8F0', overflow:'hidden', position:'relative' }}>
                  {usuario?.email === 'shirley@grupopg.com.br' && (
                    <div style={{ position:'absolute', top:8, right:8, zIndex:10 }}>
                      <button onClick={e => { e.stopPropagation(); setMenuAberto(menuAberto === obra.id ? null : obra.id) }}
                        style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#999', lineHeight:1, padding:'0 6px' }}>⋮</button>
                      {menuAberto === obra.id && (
                        <div style={{ position:'absolute', top:30, right:0, background:'#fff', border:'1px solid #E0E8F0', borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,.18)', zIndex:20, minWidth:150 }}>
                          <div onClick={e => { e.stopPropagation(); excluirObra(obra.id) }}
                            style={{ padding:'12px 16px', fontSize:13, color:'#E24B4A', fontWeight:600, cursor:'pointer' }}>
                            🗑 Excluir obra
                          </div>
                        </div>
                      )}
                    </div>
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
                      <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', flex:1, lineHeight:1.4 }}>{obra.nome}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#2D3A8C', whiteSpace:'nowrap' }}>{fmt(obra.valor)}</div>
                    </div>
                    {(obra.data_inicio || obra.em_negociacao) && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                        {obra.data_inicio && (
                          <span style={{ fontSize:12, background:'#2D3A8C', color:'#fff', padding:'3px 10px', borderRadius:8, fontWeight:600 }}>
                            📅 Início: {new Date(obra.data_inicio+'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {obra.em_negociacao && (
                          <span style={{ fontSize:12, background:'#E24B4A', color:'#fff', padding:'3px 10px', borderRadius:8, fontWeight:600 }}>
                            🔴 Orç. em negociação
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:tc.bg, color:tc.text }}>{obra.tipo}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:sc.bg, color:sc.text }}>{obra.status}</span>
                      {obra.local ? <span style={{ fontSize:11, color:'#888' }}>{obra.local}</span> : null}
                    </div>
                  </div>

                  <div style={{ padding:'0 14px 8px' }}>
                    <Regua tipo={obra.tipo} status={obra.status} />
                  </div>

                  {estaAberta && (
                    <div style={{ padding:'12px 14px', borderTop:'1px solid #F0F4F8', background:'#FAFBFF' }}>
                      {obra.obs && (
                        <div style={{ fontSize:11, background:'#FFF9E6', borderLeft:'3px solid #F5A623', padding:'6px 10px', borderRadius:4, color:'#7A5A00', marginBottom:10 }}>
                          ⚠️ {obra.obs}
                        </div>
                      )}
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
                        {obra.sige && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>SIGE</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.sige}</div></div>}
                        {obra.pedido && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Pedido</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.pedido}</div></div>}
                        {obra.nf && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>NF</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.nf}</div></div>}
                        {obra.data_inicio && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Data Início</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{new Date(obra.data_inicio+'T12:00:00').toLocaleDateString('pt-BR')}</div></div>}
                        {obra.inicio && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Início</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.inicio}</div></div>}
                        {obra.termino && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Término</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.termino}</div></div>}
                      </div>
                      {obra.atualizado_por && (
                        <div style={{ fontSize:10, color:'#4A7FC1', marginBottom:8 }}>
                          Atualizado por {obra.atualizado_por} · {obra.atualizado_em ? new Date(obra.atualizado_em).toLocaleString('pt-BR') : ''}
                        </div>
                      )}
                      {statusAprovado(obra.status) && (() => {
                        const lista = getChecklist(obra)
                        const pendentes = lista.filter(i => !i.feito).length
                        const obrigPendentes = lista.filter(i => i.obrigatorio && !i.feito).length
                        const checkAberto = checklistAberto === obra.id
                        return (
                          <div style={{ marginBottom:12 }}>
                            <div onClick={() => setChecklistAberto(checkAberto ? null : obra.id)}
                              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background: obrigPendentes > 0 ? '#FEE2E2' : pendentes > 0 ? '#FEF9E6' : '#D1FAE5', borderRadius:10, cursor:'pointer', border:`1px solid ${obrigPendentes > 0 ? '#FCA5A5' : pendentes > 0 ? '#FCD34D' : '#6EE7B7'}` }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <span style={{ fontSize:14 }}>{obrigPendentes > 0 ? '🔴' : pendentes > 0 ? '🟡' : '✅'}</span>
                                <span style={{ fontSize:12, fontWeight:600, color: obrigPendentes > 0 ? '#991B1B' : pendentes > 0 ? '#92400E' : '#065F46' }}>
                                  Checklist pré-obra
                                </span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                {pendentes > 0 && <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background: obrigPendentes > 0 ? '#FCA5A5' : '#FCD34D', color: obrigPendentes > 0 ? '#991B1B' : '#92400E' }}>{pendentes} pendente{pendentes>1?'s':''}</span>}
                                {pendentes === 0 && <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#6EE7B7', color:'#065F46' }}>Tudo ok</span>}
                                <span style={{ fontSize:16, color:'#888' }}>{checkAberto ? '▲' : '▼'}</span>
                              </div>
                            </div>
                            {checkAberto && (
                              <div style={{ border:'1px solid #E0E8F0', borderTop:'none', borderRadius:'0 0 10px 10px', background:'#FAFBFF', padding:'8px 12px' }}>
                                {lista.map(item => (
                                  <div key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom:'1px solid #F0F4F8' }}>
                                    <div onClick={() => toggleItem(obra, item.id)}
                                      style={{ width:20, height:20, borderRadius:5, border: item.feito ? 'none' : `1.5px solid ${item.obrigatorio ? '#FCA5A5' : '#B5D4F4'}`, background: item.feito ? '#1A6B4A' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginTop:1 }}>
                                      {item.feito && <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>}
                                    </div>
                                    <div style={{ flex:1 }}>
                                      <span style={{ fontSize:12, color: item.feito ? '#888' : '#1A2340', textDecoration: item.feito ? 'line-through' : 'none' }}>
                                        {item.texto}
                                        {item.link && !item.feito && (
                                          <a href="https://drive.google.com" target="_blank" rel="noreferrer"
                                            style={{ marginLeft:6, fontSize:11, color:'#2D3A8C', textDecoration:'underline' }}>
                                            Acessar termos ↗
                                          </a>
                                        )}
                                      </span>
                                      {item.obrigatorio && !item.feito && (
                                        <span style={{ display:'block', fontSize:10, color:'#E24B4A', marginTop:2 }}>⚠ Obrigatório</span>
                                      )}
                                    </div>
                                    {item.extra && (
                                      <span onClick={() => removerItemExtra(obra, item.id)} style={{ fontSize:16, color:'#ccc', cursor:'pointer', flexShrink:0 }}>×</span>
                                    )}
                                  </div>
                                ))}
                                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                                  <input value={novoItemChecklist} onChange={e => setNovoItemChecklist(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && adicionarItemChecklist(obra)}
                                    placeholder="Adicionar item extra..."
                                    style={{ flex:1, padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340' }} />
                                  <button onClick={() => adicionarItemChecklist(obra)}
                                    style={{ padding:'8px 14px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      <button onClick={() => { setModal(obra); setNovoStatus(obra.status); setNovaObs(obra.obs||''); setEmNegociacao(obra.em_negociacao || false) }}
                        style={{ width:'100%', padding:'10px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Atualizar status
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Botão Nova Obra */}
      <div style={{ padding:'0 12px 16px' }}>
        <button onClick={() => setModalNovaObra(true)}
          style={{ width:'100%', padding:13, background:'#3C3489', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', borderBottom:'3px solid #26215C' }}>
          + Nova Obra
        </button>
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

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if(e.target === e.currentTarget) setModal(null) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:4 }}>{modal.nome}</div>
            <div style={{ fontSize:11, color:'#888', marginBottom:16 }}>{modal.tipo} · {fmt(modal.valor)}</div>
            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:8 }}>Novo status:</div>
            {STATUS_OPCOES.map(op => {
              const sc = STATUS_COR[op] || { bg:'#F1F5F9', text:'#475569' }
              const ativo = novoStatus === op
              return (
                <div key={op} onClick={() => setNovoStatus(op)}
                  style={{ padding:'11px 14px', borderRadius:10, border: ativo ? '2px solid #2D3A8C' : '1px solid #E0E8F0', marginBottom:8, cursor:'pointer', background: ativo ? '#E6F1FB' : '#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, color:'#1A2340', fontWeight: ativo ? 600 : 400 }}>{op}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:sc.bg, color:sc.text }}>{op}</span>
                </div>
              )
            })}
            {novoStatus === 'ORÇAMENTO APROVADO' && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:6 }}>Data de início da obra:</div>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:6 }}>
                Atualizar valor da obra (R$): <span style={{ fontSize:11, color:'#888', fontWeight:400 }}>atual: {fmt(modal.valor)}</span>
              </div>
              <input type="text" value={novoValor} onChange={e => setNovoValor(e.target.value.replace(',','.'))}
                placeholder={`Deixe vazio para manter ${fmt(modal.valor)}`}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, background: emNegociacao ? '#FEE2E2' : '#fff' }}>
                <input type="checkbox" checked={emNegociacao} onChange={e => setEmNegociacao(e.target.checked)}
                  style={{ width:18, height:18, cursor:'pointer', accentColor:'#E24B4A' }} />
                <span style={{ fontSize:13, color: emNegociacao ? '#991B1B' : '#1A2340', fontWeight: emNegociacao ? 600 : 400 }}>
                  🔴 Orçamento devolvido para negociação
                </span>
              </label>
            </div>
            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, margin:'12px 0 6px' }}>Observação:</div>
            <textarea value={novaObs} onChange={e=>setNovaObs(e.target.value)} rows={3}
              placeholder="Pendências, próximos passos..."
              style={{ width:'100%', padding:'10px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, resize:'none', marginBottom:12, boxSizing:'border-box', color:'#1A2340' }} />
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
    </div>
  )
}
