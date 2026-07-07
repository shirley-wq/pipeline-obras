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
  'VISTORIA',
  'ELABORAR BOOK E ORÇAMENTO',
  'ORÇAMENTO APROVADO',
  'DCM E LAUDOS ENTREGUES',
  'TROCA DE FECHADURAS',
  'ELABORAR ART',
  'LAUDOS ASSINADOS',
  'REMOÇÃO PORTA GIRATÓRIA / DRYWALL / VIDRO',
  'FOTOS DO AMBIENTE',
  'BOOK DE CONCLUSÃO',
  'QR CODE',
  'AGUARDANDO OS TECBAN',
  'ELABORAR RM',
  'ENVIAR RM',
  'EMITIR NF',
  'NF EMITIDO',
  'CANCELADO',
]

const STATUS_COR = {
  'NF EMITIDO':{ bg:'#D1FAE5',text:'#065F46' },
  'EMITIR NF':{ bg:'#DBEAFE',text:'#1E40AF' },
  'ENVIAR RM':{ bg:'#FEE2E2',text:'#991B1B' },
  'ELABORAR RM':{ bg:'#FEF3C7',text:'#92400E' },
  'TROCA DE FECHADURAS':{ bg:'#FEF3C7',text:'#92400E' },
  'REMOÇÃO PORTA GIRATÓRIA / DRYWALL / VIDRO':{ bg:'#FCE7F3',text:'#9D174D' },
  'AGUARDANDO PEDIDO':{ bg:'#FFF7ED',text:'#9A3412' },
  'BOOK DE CONCLUSÃO':{ bg:'#EDE9FE',text:'#5B21B6' },
  'QR CODE':{ bg:'#EDE9FE',text:'#5B21B6' },
  'AGUARDANDO OS TECBAN':{ bg:'#CCFBF1',text:'#0F766E' },
  'FOTOS DO AMBIENTE':{ bg:'#F0FDF4',text:'#166534' },
  'LAUDOS ASSINADOS':{ bg:'#F0F9FF',text:'#0369A1' },
  'CANCELADO':{ bg:'#F1F5F9',text:'#64748B' },
}

const TIPOS_ENTREGAVEIS = ['DESC. PAB', 'DESC. PA', 'ENCER. AG']
const ENTREGAVEIS_BOOK = [
  'Termo de Antena',
  'Termo de Ar Condicionado',
  'Termo de Descarte',
  'TERMO DE RECEBIMENTO DEFINITIVO',
  'ART Assinada',
  'QR Code Concluído',
]

const COLABORADORES = [
  'Adriano Silva de Jesus',
  'Aguinaldo da Silva Matos',
  'Aline do Nascimento Roza',
  'Anderson Santos',
  'Bruna Carvalho de Oliveira',
  'Bruno Correia dos Santos Silva',
  'Carlos Carvalho dos Santos',
  'Carlos Leandro Santos',
  'Carolina Carvalho dos Santos',
  'Daniel de Lima Machado',
  'Daniela Leite Ferreira',
  'Edimar Venceslau Gomes',
  'Edkleber Felipe dos Santos',
  'Fabio Henrique Fontes',
  'Flavio de Oliveira Santos',
  'Franciarley Freire Pereira Miranda',
  'Gabriel Martins dos Santos Benassi',
  'Genivaldo Rodrigues Lima',
  'Glauce Lourenço Teixeira',
  'Harlen Rodrigues Barbosa da Silva',
  'Hyago Felipe Souza Menezes',
  'Ivo Ferreira Marinho',
  'Jair Arruda de Araújo',
  'Leonardo Adelino Feitosa',
  'Lorena Silva Dezzane',
  'Lucas Correa de Moraes',
  'Lucas Santana Souza da Paz',
  'Ramon Parra Muro',
  'Shirley de Carvalho Santos',
  'Stephanie de Paulo Pereira Miranda',
  'Victhor Mazella Costa Oliveira',
  'Victor Jose Pereira Guabirapa',
  'Wesley de Souza Rodrigues',
  'Willian do Sacramento Elias',
]

const TERCEIRIZADO_PREFIXO = 'Terceirizado: '

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
const STATUS_FATURAR = ['EMITIR NF']

function uf(local) {
  if (!local) return '—'
  const p = local.trim().split('-')
  return p.length > 1 ? p[p.length - 1].trim() : local.trim()
}

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
const ITENS_ESPECIAIS_UN = ['BALCÃO DE ENVELOPE','GUARDA VOLUMES','ESCADA DO SEGURANÇA']

const BASES_GRUPOPG = [
  { nome: 'Contagem', label: 'Contagem — MG', endereco: 'Contagem, MG, Brasil', lat: -19.9317, lon: -44.0536 },
  { nome: 'Butantã', label: 'Butantã — SP', endereco: 'Butantã, São Paulo, SP, Brasil', lat: -23.5665, lon: -46.7172 },
  { nome: 'Recreio dos Bandeirantes', label: 'Recreio dos Bandeirantes — RJ', endereco: 'Recreio dos Bandeirantes, Rio de Janeiro, RJ, Brasil', lat: -23.0085, lon: -43.4627 },
  { nome: 'São José dos Pinhais', label: 'São José dos Pinhais — PR', endereco: 'São José dos Pinhais, PR, Brasil', lat: -25.5328, lon: -49.2056 },
]

const UF_COORDS = {
  'SP':{ lat:-23.5505, lon:-46.6333 }, 'RJ':{ lat:-22.9068, lon:-43.1729 },
  'MG':{ lat:-19.9167, lon:-43.9345 }, 'PR':{ lat:-25.4297, lon:-49.2711 },
  'RS':{ lat:-30.0346, lon:-51.2177 }, 'SC':{ lat:-27.5954, lon:-48.5480 },
  'BA':{ lat:-12.9714, lon:-38.5014 }, 'ES':{ lat:-20.3155, lon:-40.3128 },
  'GO':{ lat:-16.6864, lon:-49.2643 }, 'DF':{ lat:-15.7801, lon:-47.9292 },
  'MT':{ lat:-15.6014, lon:-56.0979 }, 'MS':{ lat:-20.4697, lon:-54.6201 },
  'PE':{ lat:-8.0476, lon:-34.8770  }, 'CE':{ lat:-3.7172,  lon:-38.5433  },
  'PA':{ lat:-1.4558,  lon:-48.4902 }, 'AM':{ lat:-3.1190,  lon:-60.0217  },
  'MA':{ lat:-2.5297,  lon:-44.3028 }, 'PB':{ lat:-7.1195,  lon:-34.8450  },
  'RN':{ lat:-5.7945,  lon:-35.2110 }, 'AL':{ lat:-9.6658,  lon:-35.7350  },
  'SE':{ lat:-10.9472, lon:-37.0731 }, 'PI':{ lat:-5.0892,  lon:-42.8019  },
  'TO':{ lat:-10.1753, lon:-48.2982 }, 'RO':{ lat:-8.7612,  lon:-63.9004  },
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = x => x * Math.PI / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

function baseProxima(local) {
  const str = (local||'').toUpperCase().trim()
  const match = str.match(/[-\s]([A-Z]{2})$/)
  const ufStr = match ? match[1] : ''
  const coords = UF_COORDS[ufStr]
  if (!coords) return { base: BASES_GRUPOPG[0], km: null }
  let nearest = BASES_GRUPOPG[0], minKm = haversineKm(coords.lat, coords.lon, BASES_GRUPOPG[0].lat, BASES_GRUPOPG[0].lon)
  BASES_GRUPOPG.slice(1).forEach(b => {
    const km = haversineKm(coords.lat, coords.lon, b.lat, b.lon)
    if (km < minKm) { minKm = km; nearest = b }
  })
  return { base: nearest, km: minKm }
}

function gerarBriefing(obra) {
  const { base, km } = baseProxima(obra.local)
  const destino = encodeURIComponent((obra.local||'').replace('-', ', ') + ', Brasil')
  const origem = encodeURIComponent(base.endereco)
  const mapsUrl = `https://www.google.com/maps/dir/${origem}/${destino}`
  const hoje = new Date().toLocaleDateString('pt-BR')

  const etapasUN = [
    { label: '1ª Visita — Vistoria + BDN', data: obra.data_etapa1, resp: obra.resp_etapa1 },
    { label: '2ª Visita — Troca de Fechaduras', data: obra.data_etapa2, resp: obra.resp_etapa2 },
    { label: '3ª Visita — Obra Final', data: obra.data_etapa3, resp: obra.resp_etapa3 },
  ]

  const rowEtapa = e => `<tr style="border-bottom:1px solid #e5e7eb">
    <td style="padding:8px 12px;font-size:14px">${e.data ? '✅' : '⏳'} ${e.label}</td>
    <td style="padding:8px 12px;font-size:14px;font-weight:${e.data?'700':'400'};color:${e.data?'#065F46':'#9CA3AF'}">${e.data ? new Date(e.data+'T12:00').toLocaleDateString('pt-BR') : 'Pendente'}</td>
    <td style="padding:8px 12px;font-size:13px;color:#475569">${e.resp ? '👤 '+e.resp : ''}</td>
  </tr>`

  const vidrosHtml = Array.isArray(obra.vidros) && obra.vidros.length > 0
    ? obra.vidros.map(v => `<li>🪟 ${v}</li>`).join('') : '<li style="color:#9CA3AF">Nenhum</li>'

  const divisoriasHtml = Array.isArray(obra.divisorias) && obra.divisorias.length > 0
    ? obra.divisorias.map(d => `<li>🧱 ${d.tipo} — ${d.m2} m²</li>`).join('') : '<li style="color:#9CA3AF">Nenhuma</li>'

  const adesivosBadges = obra.adesivos
    ? obra.adesivos.split(',').map(a => `<span style="background:#1E40AF;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">${a}</span>`).join(' ')
    : '<span style="color:#9CA3AF">Nenhum</span>'

  const itensHtml = Array.isArray(obra.itens_especiais) && obra.itens_especiais.length > 0
    ? obra.itens_especiais.map(i => `<span style="background:#D1FAE5;color:#065F46;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">✓ ${i}</span>`).join(' ')
    : '<span style="color:#9CA3AF">Nenhum</span>'

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Briefing de Campo — ${obra.nome}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#1A2340;background:#f8fafc}
    .card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
    h1{font-size:18px;margin:0 0 4px;color:#1A2340} h2{font-size:13px;font-weight:700;color:#2D3A8C;margin:0 0 12px;text-transform:uppercase;letter-spacing:.5px}
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700}
    table{width:100%;border-collapse:collapse} ul{margin:6px 0;padding-left:20px;line-height:2}
    .tag{font-size:11px;background:#EFF6FF;color:#1E40AF;padding:2px 8px;border-radius:6px;font-weight:600}
    @media print{body{background:#fff;padding:12px}.no-print{display:none!important}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <div>
      <div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:1px">Grupopg — Briefing de Campo</div>
      <h1>${obra.nome}</h1>
      <div style="font-size:13px;color:#475569">${obra.local || ''} &nbsp;·&nbsp; <span class="tag">${obra.tipo}</span>${obra.sige ? ` &nbsp;·&nbsp; SIGE: <b>${obra.sige}</b>` : ''}</div>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:10px 20px;background:#2D3A8C;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">🖨 Imprimir / PDF</button>
  </div>

  <div class="card" style="background:#EFF6FF;border:1px solid #BFDBFE">
    <h2>📍 Base mais próxima</h2>
    <div style="font-size:16px;font-weight:700;color:#1E40AF;margin-bottom:4px">${base.label}</div>
    ${km ? `<div style="font-size:13px;color:#475569;margin-bottom:10px">~${km} km em linha reta até ${(obra.local||'').replace('-',' - ')}</div>` : ''}
    <a href="${mapsUrl}" target="_blank" style="display:inline-block;background:#2D3A8C;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">🗺 Ver rota no Google Maps</a>
    <div style="font-size:10px;color:#9CA3AF;margin-top:6px">* distância em linha reta — consultar rota real no Maps</div>
  </div>

  <div class="card">
    <h2>📅 Etapas de campo</h2>
    <table>${etapasUN.map(rowEtapa).join('')}</table>
  </div>

  <div class="card">
    <h2>🔧 Material previsto para o dia da obra</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-bottom:4px">VIDROS A TROCAR</div>
        <ul style="margin:0;padding-left:18px;font-size:14px;line-height:2">${vidrosHtml}</ul>
      </div>
      <div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-bottom:4px">FECHAMENTO (DRYWALL / NAVAL)</div>
        <ul style="margin:0;padding-left:18px;font-size:14px;line-height:2">${divisoriasHtml}</ul>
      </div>
    </div>
    ${obra.biombo_fila > 0 ? `<div style="margin-top:12px;font-size:14px">📦 <b>Biombo de fila:</b> ${obra.biombo_fila} unidade(s)</div>` : ''}
  </div>

  <div class="card">
    <h2>🏷 Adesivos necessários</h2>
    <div>${adesivosBadges}</div>
  </div>

  <div class="card">
    <h2>🏢 Itens existentes na agência</h2>
    <div>${itensHtml}</div>
  </div>

  ${obra.obs ? `<div class="card" style="border-left:4px solid #F5A623;background:#FFFBEB">
    <h2>📌 Observações</h2>
    <div style="font-size:14px;color:#7A5A00">${obra.obs}</div>
  </div>` : ''}

  <div style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:20px">Gerado em ${hoje} · Pipeline de Obras — Grupopg</div>
  </body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}

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
  'VISTORIA',
  'ELABORAR BOOK E ORÇAMENTO',
  'ORÇAMENTO APROVADO',
  'DCM E LAUDOS ENTREGUES',
  'TROCA DE FECHADURAS',
  'ELABORAR ART',
  'LAUDOS ASSINADOS',
  'REMOÇÃO PORTA GIRATÓRIA / DRYWALL / VIDRO',
  'FOTOS DO AMBIENTE',
  'BOOK DE CONCLUSÃO',
  'QR CODE',
  'AGUARDANDO OS TECBAN',
  'ELABORAR RM',
  'ENVIAR RM',
]
const ETAPAS_EN = ETAPAS_DESC
const ETAPAS_OUTRAS = ['Início','Em andamento','Conclusão','EMITIR NF','Faturamento']

const STATUS_ETAPA1_DONE = ['EM ANDAMENTO','VISTORIA REALIZADA ELABORAR BOOK E ORÇAMENTO','BOOK E ORÇAMENTOS ENVIADOS','ORÇAMENTO APROVADO/REPROVADO','OBRA EMITIR ART','DCM E TERMOS ENTREGUES AO CAMPO','TERMOS E DCMS ASSINADOS','BDNS, MOBILIÁRIOS E EQUIPAMENTO REMOVIDOS','FOTOS DO AMBIENTE VAZIO','ELABORAR QRCODE OU BOOK DE CONCLUSÃO','ELABORAR BOOK','BOOK PENDENTE','BOOK DE CONCLUSÃO','QR CODE','AGUARDANDO OS TECBAN','ELABORAR RM','RM ENVIADA','RM ENVIADA (ART)','RM PRONTA AGUARDANDO ORDEM','EMITIR NF','NF EMITIDO','Em andamento','Conclusão','Faturamento']
const STATUS_ETAPA2_DONE = ['AGUARDANDO OS TECBAN','ELABORAR RM','RM ENVIADA','RM ENVIADA (ART)','RM PRONTA AGUARDANDO ORDEM','EMITIR NF','NF EMITIDO','Conclusão','Faturamento']
const STATUS_ETAPA3_DONE = ['NF EMITIDO','Faturamento']

function ReguaStatus({ status, lembretes, onRemoverLembrete }) {
  const etapas = [
    { titulo: 'Vistoria / Início', done: STATUS_ETAPA1_DONE.includes(status) },
    { titulo: 'Book / Elaboração', done: STATUS_ETAPA2_DONE.includes(status) },
    { titulo: 'RM / Faturamento', done: STATUS_ETAPA3_DONE.includes(status) },
  ]
  const primeiraVazia = etapas.findIndex(e => !e.done)
  return (
    <div>
      <div style={{ display:'flex', gap:6, padding:'8px 0 4px' }}>
        {etapas.map((etapa, i) => {
          const concluida = etapa.done
          const atual = primeiraVazia === i
          const cor = concluida ? '#1A6B4A' : atual ? '#2D3A8C' : '#9CA3AF'
          const bg = concluida ? '#D1FAE5' : atual ? '#EEF2FF' : '#F8FAFC'
          const borda = concluida ? '#BBF7D0' : atual ? '#C7D2FE' : '#E2E8F0'
          return (
            <div key={i} style={{ flex:1, background:bg, border:`1.5px solid ${borda}`, borderRadius:10, padding:'8px 6px', textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:700, color:cor, textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>{i+1}ª Etapa</div>
              <div style={{ fontSize:10, fontWeight:600, color:'#1A2340', lineHeight:1.2 }}>{etapa.titulo}</div>
              <div style={{ fontSize:11, fontWeight:700, color: concluida ? '#1A6B4A' : '#9CA3AF', marginTop:3 }}>{concluida ? '✓' : '—'}</div>
            </div>
          )
        })}
      </div>
      {Array.isArray(lembretes) && lembretes.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
          {lembretes.map((l, idx) => (
            <div key={idx} style={{ display:'flex', alignItems:'center', gap:4, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, padding:'3px 7px' }}>
              <span style={{ fontSize:9, background:'#EF4444', color:'#fff', borderRadius:'50%', width:14, height:14, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{l.etapa}</span>
              <span style={{ fontSize:10, color:'#1A2340' }}>{l.texto}</span>
              {onRemoverLembrete && <span onClick={() => onRemoverLembrete(l)} style={{ fontSize:11, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getEtapas() {
  return ETAPAS_DESC
}

function getEtapaAtual(status) {
  const etapas = getEtapas()
  const n = etapas.length
  const idx = etapas.findIndex(e => e.toLowerCase() === (status||'').toLowerCase())
  if (idx !== -1) return idx + 1
  // Compatibilidade com status antigos ainda no banco
  const s = (status||'').toUpperCase()
  if (s.includes('NF EMITIDO') || s.includes('EMITIR NF') || s.includes('FATURAMENTO') || s.includes('CONCLUS')) return n + 1
  if (s.includes('RM ENVIADA') || s.includes('RM PRONTA') || s.includes('ARQUIVO RM')) return n
  if (s.includes('ELABORAR RM') || s.includes('ENVIAR RM')) return n - 1
  if (s.includes('QRCODE') || s.includes('QR CODE') || s.includes('BOOK DE CONCLUS') || s.includes('BOOK FINAL') || s.includes('BOOK POS')) return n - 2
  if (s.includes('FOTOS') || s.includes('AMBIENTE VAZIO') || s.includes('BDN') || s.includes('REMOVIDO')) return n - 3
  if (s.includes('TERMOS') || s.includes('ASSINADOS') || s.includes('ASSINATURA')) return n - 4
  if (s.includes('DCM') || s.includes('ENTREGUES') || s.includes('EMITIR ART') || s.includes('AG. PEDIDO') || s.includes('EM ANDAMENTO')) return n - 5
  if (s.includes('APROVADO') || s.includes('REPROVADO')) return 3
  if (s.includes('BOOK') || s.includes('ORÇAMENTO') || s.includes('ORCAMENTO') || s.includes('CROQUI') || s.includes('VISTORIA REALIZADA')) return 2
  if (s.includes('VISTORIA') || s.includes('REALIZAR')) return 1
  return 1
}

function SeletorEquipe({ titulo, selecionados, onChangeSelecionados, terceirizado, onChangeTerceirizado, terceirizadoTexto, onChangeTerceirizadoTexto }) {
  const [mostrarLista, setMostrarLista] = useState(false)
  const resumo = [...selecionados, ...(terceirizado ? [TERCEIRIZADO_PREFIXO + (terceirizadoTexto.trim() || '(não informado)')] : [])]
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8, marginBottom:4 }}>
        <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600 }}>{titulo}</div>
        <span onClick={() => setMostrarLista(v => !v)} style={{ fontSize:11, color:'#2D3A8C', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          {mostrarLista ? '▲ Ocultar lista' : '▼ Selecionar equipe'}
        </span>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color: resumo.length > 0 ? '#065F46' : '#9CA3AF', marginBottom: mostrarLista ? 8 : 0 }}>
        {resumo.length > 0 ? `👤 ${resumo.join(', ')}` : 'Ninguém selecionado ainda'}
      </div>
      {mostrarLista && (
        <div style={{ border:'1px solid #E0E8F0', borderRadius:8, padding:8 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6 }}>
            {COLABORADORES.map(nome => (
              <label key={nome} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', minWidth:0 }}>
                <input type="checkbox" checked={selecionados.includes(nome)}
                  onChange={e => onChangeSelecionados(e.target.checked ? [...selecionados, nome] : selecionados.filter(n => n !== nome))} />
                <span style={{ fontSize:12, color:'#1A2340', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={nome}>{nome}</span>
              </label>
            ))}
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', borderTop:'1px solid #F0F4F8', paddingTop:8, marginTop:8 }}>
            <input type="checkbox" checked={terceirizado} onChange={e => onChangeTerceirizado(e.target.checked)} />
            <span style={{ fontSize:13, color:'#1A2340', fontWeight:600 }}>Terceirizado</span>
          </label>
          {terceirizado && (
            <input value={terceirizadoTexto} onChange={e => onChangeTerceirizadoTexto(e.target.value)}
              placeholder="Nome da empresa/pessoa terceirizada"
              style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginTop:8 }} />
          )}
        </div>
      )}
    </div>
  )
}

function getGrupoObra(o) {
  const status = o.status || ''
  if (status === 'AGUARDANDO OS TECBAN') return 'pendencias'
  if (status === 'NF EMITIDO') return 'concluido'
  if (status === 'CANCELADO') return 'outros'
  if (['ELABORAR RM','ENVIAR RM'].includes(status)) return 'rm'
  if (['LAUDOS ASSINADOS','FOTOS DO AMBIENTE','BOOK DE CONCLUSÃO','QR CODE'].includes(status)) return 'elaborar'
  return 'em_andamento'
}

function Regua({ tipo, status, lembretes, onRemoverLembrete }) {
  const etapas = getEtapas()
  const atual = getEtapaAtual(status)
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
  const [resps, setResps] = useState({ resp_etapa1:'', resp_etapa2:'', resp_etapa3:'' })
  const [dataObra, setDataObra] = useState({ inicio:'', termino:'' })
  const [dataArt, setDataArt] = useState('')
  const [emNegociacao, setEmNegociacao] = useState(false)
  const [lembretes, setLembretes] = useState([])
  const [entregaveis, setEntregaveis] = useState([])
  const [novoLembreteEtapa, setNovoLembreteEtapa] = useState('')
  const [novoLembreteTexto, setNovoLembreteTexto] = useState('')
  const [editDados, setEditDados] = useState({ nome:'', local:'', valor:'', sige:'', pedido:'', nf:'' })
  const [adesivos, setAdesivos] = useState([])
  const [vidros, setVidros] = useState([])
  const [novoVidro, setNovoVidro] = useState('')
  const [divisorias, setDivisorias] = useState([])
  const [novaDivTipo, setNovaDivTipo] = useState('DRYWALL')
  const [novaDivM2, setNovaDivM2] = useState('')
  const [itensEspeciais, setItensEspeciais] = useState([])
  const [biomboFila, setBiomboFila] = useState('')
  const [dataVistoria, setDataVistoria] = useState('')
  const [colabsVistoria, setColabsVistoria] = useState([])
  const [terceirizadoVistoria, setTerceirizadoVistoria] = useState(false)
  const [terceirizadoVistoriaTexto, setTerceirizadoVistoriaTexto] = useState('')
  const [dataObraInicio, setDataObraInicio] = useState('')
  const [colabsObra, setColabsObra] = useState([])
  const [terceirizadoObra, setTerceirizadoObra] = useState(false)
  const [terceirizadoObraTexto, setTerceirizadoObraTexto] = useState('')
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
  const [aba, setAba] = useState('pipeline')
  const [faturarDados, setFaturarDados] = useState({})
  const [filtroHistTipo, setFiltroHistTipo] = useState('')
  const [filtroHistRegiao, setFiltroHistRegiao] = useState('')
  const [filtroHistDe, setFiltroHistDe] = useState('')
  const [filtroHistAte, setFiltroHistAte] = useState('')

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
      criado_por: usuario.email,
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
      valor: editDados.valor !== '' ? parseFloat(String(editDados.valor).replace(',', '.')) || 0 : null,
      sige: editDados.sige || null,
      pedido: editDados.pedido || null,
      nf: editDados.nf || null,
    }
    if (modal.tipo === 'TRANSF UN') {
      campos.data_etapa1 = datas.data_etapa1 || null
      campos.data_etapa2 = datas.data_etapa2 || null
      campos.data_etapa3 = datas.data_etapa3 || null
      campos.resp_etapa1 = resps.resp_etapa1 || null
      campos.resp_etapa2 = resps.resp_etapa2 || null
      campos.resp_etapa3 = resps.resp_etapa3 || null
      campos.adesivos = adesivos.length > 0 ? adesivos.join(',') : null
      campos.vidros = vidros.length > 0 ? vidros : null
      campos.divisorias = divisorias.length > 0 ? divisorias : null
      campos.itens_especiais = itensEspeciais.length > 0 ? itensEspeciais : null
      campos.biombo_fila = biomboFila !== '' ? parseInt(biomboFila) || 0 : null
    }
    if (modal.tipo !== 'TRANSF UN') {
      if (dataObra.inicio) campos.inicio = isoToBr(dataObra.inicio)
      if (dataObra.termino) campos.termino = isoToBr(dataObra.termino)
      if (dataArt) campos.data_art = dataArt
      campos.em_negociacao = emNegociacao
    }
    campos.lembretes = lembretes.length > 0 ? lembretes : null
    if (TIPOS_ENTREGAVEIS.includes(modal.tipo)) {
      campos.entregaveis = entregaveis.length > 0 ? entregaveis : null
    }
    campos.data_vistoria = dataVistoria || null
    const listaVistoria = [...colabsVistoria, ...(terceirizadoVistoria ? [TERCEIRIZADO_PREFIXO + (terceirizadoVistoriaTexto.trim() || '(não informado)')] : [])]
    campos.colaboradores_vistoria = listaVistoria.length > 0 ? listaVistoria : null
    campos.data_obra_inicio = modal.tipo === 'TRANSF UN' ? (dataObraInicio || null) : (dataObra.inicio || null)
    const listaObra = [...colabsObra, ...(terceirizadoObra ? [TERCEIRIZADO_PREFIXO + (terceirizadoObraTexto.trim() || '(não informado)')] : [])]
    campos.colaboradores_obra = listaObra.length > 0 ? listaObra : null
    campos.data_cadastro = dataCadastroModal || modal.data_cadastro || null
    const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', modal.id)
    if (error) {
      alert('Erro ao salvar: ' + error.message)
      setSalvando(false)
      return
    }
    setObras(prev => prev.map(o => o.id === modal.id
      ? { ...o, ...campos }
      : o))
    setSalvando(false)
    setModal(null)
    setNovoStatus('')
    setNovaObs('')
    setDatas({ data_etapa1:'', data_etapa2:'', data_etapa3:'' })
    setDataObra({ inicio:'', termino:'' })
    setDataArt('')
    setEmNegociacao(false)
    setLembretes([])
    setEntregaveis([])
    setNovoLembreteEtapa('')
    setNovoLembreteTexto('')
    setAdesivos([])
    setEditDados({ nome:'', local:'', valor:'', sige:'', pedido:'', nf:'' })
    setDataCadastroModal('')
    setDataVistoria('')
    setColabsVistoria([])
    setTerceirizadoVistoria(false)
    setTerceirizadoVistoriaTexto('')
    setDataObraInicio('')
    setColabsObra([])
    setTerceirizadoObra(false)
    setTerceirizadoObraTexto('')
  }

  async function marcarFaturado(id) {
    const d = faturarDados[id] || {}
    const campos = {
      status: 'NF EMITIDO',
      nf: d.nf || null,
      vencimento: d.vencimento || null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.email,
      ...(d.valor !== undefined && d.valor !== '' ? { valor: parseFloat(String(d.valor).replace(',','.')) || 0 } : {})
    }
    const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', id)
    if (!error) {
      setObras(prev => prev.map(o => o.id === id ? { ...o, ...campos } : o))
      setFaturarDados(prev => { const n = {...prev}; delete n[id]; return n })
    }
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
    if (o.status === 'NF EMITIDO') return false
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

  const obrasFaturar = obras.filter(o => STATUS_FATURAR.includes(o.status) && !(Array.isArray(o.lembretes) && o.lembretes.length > 0))

  const obrasHistorico = obras.filter(o => {
    if (o.status !== 'NF EMITIDO') return false
    if (filtroHistTipo && o.tipo !== filtroHistTipo) return false
    if (filtroHistRegiao && uf(o.local) !== filtroHistRegiao) return false
    if (filtroHistDe || filtroHistAte) {
      const d = o.atualizado_em ? o.atualizado_em.split('T')[0] : ''
      if (filtroHistDe && d < filtroHistDe) return false
      if (filtroHistAte && d > filtroHistAte) return false
    }
    return true
  })

  const obrasAtivas = obras.filter(o => o.status !== 'NF EMITIDO')
  const totalValor = obrasAtivas.reduce((s,o) => s + Number(o.valor||0), 0)
  const emAndamento = obrasAtivas.filter(o => o.status === 'EM ANDAMENTO').length
  const pendencias = obrasAtivas.filter(o => ['PENDÊNCIA','PRECISA DE ARQUIVO RM','AG. PEDIDO','ENVIAR RM'].includes(o.status)).length
  const totalFaturar = obrasFaturar.reduce((s,o) => s + Number(o.valor||0), 0)

  const grupos = [
    { label:'⚠️ Pendências', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'pendencias') },
    { label:'🔧 Em andamento', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'em_andamento') },
    { label:'📋 Elaborar / Book pendente', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'elaborar') },
    { label:'📤 RM / Book final', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'rm') },
    { label:'✅ NF Emitido / Concluído', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'concluido') },
    { label:'📦 Outros', obras: obrasFiltradas.filter(o => getGrupoObra(o) === 'outros') },
  ].filter(g => g.obras.length > 0)

  function exportarCSV() {
    const cab = ['Tipo','Nome','Local','Status','Valor','SIGE','Pedido','NF','Início','Término','ART pronta','Em negociação','Observação','Post-its Régua','Data Entrada Pipeline','Dias no Pipeline','Vidros','Divisórias','Itens Especiais','Biombo de Fila','Atualizado por','Atualizado em']
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
        Array.isArray(o.vidros) && o.vidros.length > 0 ? o.vidros.join(' | ') : '',
        Array.isArray(o.divisorias) && o.divisorias.length > 0 ? o.divisorias.map(d => `${d.tipo} ${d.m2}m²`).join(' | ') : '',
        Array.isArray(o.itens_especiais) && o.itens_especiais.length > 0 ? o.itens_especiais.join(' | ') : '',
        o.biombo_fila != null ? String(o.biombo_fila) : '',
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
          { n: 'R$' + (totalValor/1000).toFixed(0) + 'k', l:'Em Andamento' },
          { n: emAndamento, l:'Execução' },
          { n: pendencias, l:'Pendências', alert: pendencias > 0 },
          { n: 'R$' + (totalFaturar/1000).toFixed(0) + 'k', l:'A Faturar', highlight: obrasFaturar.length > 0 },
        ].map((t,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,.1)', borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:700, color: t.alert ? '#FCA5A5' : t.highlight ? '#FDE68A' : '#fff' }}>{t.n}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.65)', marginTop:2 }}>{t.l}</div>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div style={{ background:'#fff', borderBottom:'2px solid #E0E8F0', display:'flex' }}>
        {[
          { id:'pipeline', label:'Pipeline', count: obrasFiltradas.length },
          { id:'faturar', label:'Disponível para Faturar', count: obrasFaturar.length, cor:'#1A6B4A' },
          { id:'historico', label:'Histórico', count: obras.filter(o=>o.status==='NF EMITIDO').length },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            style={{ flex:1, padding:'12px 8px', border:'none', borderBottom: aba===a.id ? `3px solid ${a.cor||'#2D3A8C'}` : '3px solid transparent',
              background:'none', cursor:'pointer', fontSize:12, fontWeight: aba===a.id ? 700 : 500,
              color: aba===a.id ? (a.cor||'#2D3A8C') : '#64748B' }}>
            {a.label}
            <span style={{ marginLeft:5, fontSize:10, background: aba===a.id ? (a.cor||'#2D3A8C') : '#E0E8F0',
              color: aba===a.id ? '#fff' : '#64748B', borderRadius:10, padding:'1px 6px', fontWeight:700 }}>
              {a.count}
            </span>
          </button>
        ))}
      </div>

      {/* ====== ABA: DISPONÍVEL PARA FATURAR ====== */}
      {aba === 'faturar' && (
        <div style={{ padding:12 }}>
          {obrasFaturar.length === 0 ? (
            <div style={{ textAlign:'center', color:'#1A6B4A', marginTop:40, fontSize:14 }}>Nenhuma obra pronta para faturar</div>
          ) : (
            <>
              <div style={{ fontSize:11, color:'#1A6B4A', fontWeight:700, marginBottom:10, padding:'8px 12px', background:'#D1FAE5', borderRadius:8 }}>
                {obrasFaturar.length} obra(s) · Total: R$ {totalFaturar.toLocaleString('pt-BR',{minimumFractionDigits:2})}
              </div>
              {obrasFaturar.map(o => {
                const tc = TIPO_COR[o.tipo] || { bg:'#F1F5F9', text:'#475569' }
                const sc = STATUS_COR[o.status] || { bg:'#F1F5F9', text:'#475569' }
                return (
                  <div key={o.id} style={{ background:'#fff', border:'1px solid #D1FAE5', borderRadius:12, marginBottom:10, padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', flex:1, lineHeight:1.4 }}>{o.nome}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#1A6B4A', whiteSpace:'nowrap' }}>{fmt(o.valor)}</div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:tc.bg, color:tc.text }}>{o.tipo}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:sc.bg, color:sc.text }}>{o.status}</span>
                      {o.local && <span style={{ fontSize:11, color:'#64748B' }}>{o.local}</span>}
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:10, fontSize:11, color:'#475569' }}>
                      {o.sige && <span>SIGE: <b>{o.sige}</b></span>}
                      {o.pedido && <span>Pedido: <b>{o.pedido}</b></span>}
                      {o.nf && <span>NF: <b>{o.nf}</b></span>}
                    </div>
                    {o.obs && <div style={{ fontSize:11, background:'#FFF9E6', borderLeft:'3px solid #F5A623', padding:'5px 8px', borderRadius:4, color:'#7A5A00', marginBottom:10 }}>📌 {o.obs}</div>}
                    <div style={{ background:'#F0F4F8', borderRadius:10, padding:10, marginBottom:10 }}>
                      <div style={{ fontSize:11, color:'#2D3A8C', fontWeight:700, marginBottom:8 }}>Dados para faturamento</div>
                      <div style={{ marginBottom:8 }}>
                        <label style={{ fontSize:10, color:'#64748B', fontWeight:600, display:'block', marginBottom:3 }}>Valor (R$)</label>
                        <input
                          value={(faturarDados[o.id]||{}).valor !== undefined ? (faturarDados[o.id]||{}).valor : (o.valor||'')}
                          onChange={e => setFaturarDados(prev => ({...prev, [o.id]: {...(prev[o.id]||{}), valor: e.target.value}}))}
                          placeholder="0,00"
                          style={{ width:'100%', padding:'8px 10px', border:'1.5px solid #BFDBFE', borderRadius:8, fontSize:14, fontWeight:700, color:'#1A6B4A', boxSizing:'border-box' }} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <div>
                          <label style={{ fontSize:10, color:'#64748B', fontWeight:600, display:'block', marginBottom:3 }}>Nº da NF *</label>
                          <input value={(faturarDados[o.id]||{}).nf||''} onChange={e => setFaturarDados(prev => ({...prev, [o.id]: {...(prev[o.id]||{}), nf: e.target.value}}))}
                            placeholder="Ex: 3185"
                            style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize:10, color:'#64748B', fontWeight:600, display:'block', marginBottom:3 }}>Vencimento</label>
                          <input type="date" value={(faturarDados[o.id]||{}).vencimento||''} onChange={e => setFaturarDados(prev => ({...prev, [o.id]: {...(prev[o.id]||{}), vencimento: e.target.value}}))}
                            style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={async () => {
                        const campos = { status:'ELABORAR RM', atualizado_em: new Date().toISOString(), atualizado_por: usuario.email }
                        const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', o.id)
                        if (!error) setObras(prev => prev.map(ob => ob.id === o.id ? { ...ob, ...campos } : ob))
                      }}
                        style={{ flex:1, padding:'10px', background:'#fff', color:'#2D3A8C', border:'1.5px solid #2D3A8C', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        ↩ Devolver ao Pipeline
                      </button>
                      <button onClick={() => marcarFaturado(o.id)}
                        disabled={!(faturarDados[o.id]||{}).nf}
                        style={{ flex:1, padding:'10px', background: (faturarDados[o.id]||{}).nf ? '#1A6B4A' : '#ccc', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor: (faturarDados[o.id]||{}).nf ? 'pointer' : 'default' }}>
                        ✓ Marcar como Faturado
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ====== ABA: HISTÓRICO ====== */}
      {aba === 'historico' && (
        <div style={{ padding:12 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            <select value={filtroHistTipo} onChange={e=>setFiltroHistTipo(e.target.value)}
              style={{ flex:1, minWidth:100, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
              <option value="">Todos tipos</option>
              {[...new Set(obras.filter(o=>o.status==='NF EMITIDO').map(o=>o.tipo))].sort().map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={filtroHistRegiao} onChange={e=>setFiltroHistRegiao(e.target.value)}
              style={{ flex:1, minWidth:80, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
              <option value="">Todas regiões</option>
              {[...new Set(obras.filter(o=>o.status==='NF EMITIDO').map(o=>uf(o.local)))].filter(r=>r!=='—').sort().map(r=><option key={r}>{r}</option>)}
            </select>
            <input type="date" value={filtroHistDe} onChange={e=>setFiltroHistDe(e.target.value)}
              style={{ flex:1, minWidth:120, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340' }} />
            <input type="date" value={filtroHistAte} onChange={e=>setFiltroHistAte(e.target.value)}
              style={{ flex:1, minWidth:120, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340' }} />
            {(filtroHistTipo||filtroHistRegiao||filtroHistDe||filtroHistAte) && (
              <button onClick={()=>{setFiltroHistTipo('');setFiltroHistRegiao('');setFiltroHistDe('');setFiltroHistAte('')}}
                style={{ padding:'7px 10px', background:'#F1F5F9', border:'1px solid #CDD8E3', borderRadius:8, fontSize:11, color:'#64748B', cursor:'pointer' }}>✕ limpar</button>
            )}
          </div>
          <div style={{ fontSize:11, color:'#065F46', fontWeight:700, marginBottom:10, padding:'8px 12px', background:'#D1FAE5', borderRadius:8 }}>
            {obrasHistorico.length} obra(s) faturada(s) · Total: R$ {obrasHistorico.reduce((s,o)=>s+Number(o.valor||0),0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
          </div>
          {obrasHistorico.length === 0 ? (
            <div style={{ textAlign:'center', color:'#888', marginTop:40, fontSize:14 }}>Nenhuma obra encontrada</div>
          ) : obrasHistorico.map(o => {
            const tc = TIPO_COR[o.tipo] || { bg:'#F1F5F9', text:'#475569' }
            return (
              <div key={o.id} style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, marginBottom:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:5 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', flex:1, lineHeight:1.4 }}>{o.nome}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#065F46', whiteSpace:'nowrap' }}>{fmt(o.valor)}</div>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:5 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:tc.bg, color:tc.text }}>{o.tipo}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#D1FAE5', color:'#065F46' }}>NF EMITIDO</span>
                  {o.local && <span style={{ fontSize:11, color:'#64748B' }}>{o.local}</span>}
                </div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:11, color:'#475569' }}>
                  {o.sige && <span>SIGE: <b>{o.sige}</b></span>}
                  {o.pedido && <span>Pedido: <b>{o.pedido}</b></span>}
                  {o.nf && <span>NF: <b>{o.nf}</b></span>}
                  {o.vencimento && <span style={{ color:'#92400E' }}>Vence: <b>{isoToBr(o.vencimento)}</b></span>}
                  {o.atualizado_em && <span style={{ color:'#1A6B4A' }}>Faturado: <b>{new Date(o.atualizado_em).toLocaleDateString('pt-BR')}</b></span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ====== ABA: PIPELINE ====== */}
      {aba === 'pipeline' && <>

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
                  {['shirley@grupopg.com.br', 'bruna@grupopg.com.br'].includes(usuario?.email) && (
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
                    <Regua status={obra.status} lembretes={obra.lembretes} onRemoverLembrete={l => removerLembrete(obra.id, l)} />
                  </div>
                  {TIPOS_ENTREGAVEIS.includes(obra.tipo) && (() => {
                    const lista = Array.isArray(obra.entregaveis) ? obra.entregaveis : []
                    const feitos = lista.length
                    const total = ENTREGAVEIS_BOOK.length
                    const tudo = feitos === total
                    return (
                      <div style={{ padding:'0 14px 8px' }}>
                        <div style={{ fontSize:10, color: tudo ? '#065F46' : '#92400E', fontWeight:700, marginBottom:4 }}>
                          📋 Entregáveis: {feitos}/{total}{tudo ? ' — Completo ✓' : ''}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                          {ENTREGAVEIS_BOOK.map(item => (
                            <span key={item} style={{ fontSize:9, padding:'2px 6px', borderRadius:5,
                              background: lista.includes(item) ? '#D1FAE5' : '#FEE2E2',
                              color: lista.includes(item) ? '#065F46' : '#991B1B', fontWeight:600 }}>
                              {lista.includes(item) ? '✓' : '○'} {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {estaAberta && (
                    <div style={{ padding:'12px 14px', borderTop:'1px solid #F0F4F8', background:'#FAFBFF' }}>

                      {obra.tipo === 'TRANSF UN' && (
                        <div style={{ background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:12, padding:12, marginBottom:12 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'#2D3A8C', marginBottom:10 }}>Visitas ao ponto</div>
                          <div style={{ display:'flex', gap:8 }}>
                            {ETAPAS_UN.map((etapa, i) => {
                              const data = obra[etapa.campo]
                              return (
                                <div key={i} style={{ flex:1, background: data ? '#D1FAE5' : '#fff', border:`1.5px solid ${data ? '#BBF7D0' : '#C7D2FE'}`, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                                  <div style={{ fontSize:9, fontWeight:700, color: data ? '#1A6B4A' : '#2D3A8C', textTransform:'uppercase', marginBottom:3 }}>{i+1}ª Etapa</div>
                                  <div style={{ fontSize:10, fontWeight:600, color:'#1A2340', marginBottom:5, lineHeight:1.2 }}>{etapa.titulo}</div>
                                  <div style={{ fontSize:13, fontWeight:700, color: data ? '#1A6B4A' : '#9CA3AF' }}>{data ? isoToBr(data) : '—'}</div>
                                  {obra[`resp_etapa${i+1}`] && <div style={{ fontSize:9, color:'#475569', marginTop:3 }}>👤 {obra[`resp_etapa${i+1}`]}</div>}
                                  {i === 0 && obra.adesivos && (
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', marginTop:6 }}>
                                      {obra.adesivos.split(',').map(a => (
                                        <span key={a} style={{ fontSize:8, background:'#2D3A8C', color:'#fff', borderRadius:4, padding:'1px 5px', fontWeight:600 }}>{a}</span>
                                      ))}
                                    </div>
                                  )}
                                  {i === 0 && Array.isArray(obra.vidros) && obra.vidros.length > 0 && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#0369A1', fontWeight:700, marginBottom:2 }}>VIDROS:</div>
                                      {obra.vidros.map((v, vi) => (
                                        <div key={vi} style={{ fontSize:8, color:'#1E40AF', background:'#EFF6FF', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>🪟 {v}</div>
                                      ))}
                                    </div>
                                  )}
                                  {i === 0 && Array.isArray(obra.divisorias) && obra.divisorias.length > 0 && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#166534', fontWeight:700, marginBottom:2 }}>DIVISÓRIA:</div>
                                      {obra.divisorias.map((d, di) => (
                                        <div key={di} style={{ fontSize:8, color:'#166534', background:'#F0FDF4', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>🧱 {d.tipo} {d.m2}m²</div>
                                      ))}
                                    </div>
                                  )}
                                  {i === 0 && (Array.isArray(obra.itens_especiais) && obra.itens_especiais.length > 0 || obra.biombo_fila) && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#065F46', fontWeight:700, marginBottom:2 }}>ITENS:</div>
                                      {Array.isArray(obra.itens_especiais) && obra.itens_especiais.map((it, ii) => (
                                        <div key={ii} style={{ fontSize:8, color:'#065F46', background:'#D1FAE5', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>✓ {it}</div>
                                      ))}
                                      {obra.biombo_fila > 0 && (
                                        <div style={{ fontSize:8, color:'#065F46', background:'#D1FAE5', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>📦 Biombo de fila: {obra.biombo_fila}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {obra.obs && (
                        <div style={{ fontSize:11, background:'#FFF9E6', borderLeft:'3px solid #F5A623', padding:'6px 10px', borderRadius:4, color:'#7A5A00', marginBottom:10 }}>
                          📌 {obra.obs}
                        </div>
                      )}
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:10 }}>
                        {obra.data_cadastro && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Entrada pipeline</div><div style={{ fontSize:12, color: alerta ? alerta.cor : '#1A2340', fontWeight:600 }}>{isoToBr(obra.data_cadastro)}{dias !== null ? ` · ${dias}d` : ''}</div>{obra.criado_por && <div style={{ fontSize:10, color:'#888' }}>por {obra.criado_por}</div>}</div>}
                        {obra.data_vistoria && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Vistoria</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:600 }}>{isoToBr(obra.data_vistoria)}</div>{Array.isArray(obra.colaboradores_vistoria) && obra.colaboradores_vistoria.length > 0 && <div style={{ fontSize:10, color:'#888' }}>{obra.colaboradores_vistoria.join(', ')}</div>}</div>}
                        {obra.data_obra_inicio && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Início da obra</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:600 }}>{isoToBr(obra.data_obra_inicio)}</div>{Array.isArray(obra.colaboradores_obra) && obra.colaboradores_obra.length > 0 && <div style={{ fontSize:10, color:'#888' }}>{obra.colaboradores_obra.join(', ')}</div>}</div>}
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
                      <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => {
                        setModal(obra)
                        setNovoStatus(obra.status)
                        setNovaObs(obra.obs||'')
                        setDatas({ data_etapa1: obra.data_etapa1||'', data_etapa2: obra.data_etapa2||'', data_etapa3: obra.data_etapa3||'' })
                        setResps({ resp_etapa1: obra.resp_etapa1||'', resp_etapa2: obra.resp_etapa2||'', resp_etapa3: obra.resp_etapa3||'' })
                        setDataObra({ inicio: obra.inicio ? brToIso(obra.inicio) : '', termino: obra.termino ? brToIso(obra.termino) : '' })
                        setDataArt(obra.data_art || '')
                        setEmNegociacao(obra.em_negociacao || false)
                        setLembretes(Array.isArray(obra.lembretes) ? obra.lembretes : [])
                        setEntregaveis(Array.isArray(obra.entregaveis) ? obra.entregaveis : [])
                        setNovoLembreteEtapa('')
                        setNovoLembreteTexto('')
                        setAdesivos(obra.adesivos ? obra.adesivos.split(',') : [])
                        setVidros(Array.isArray(obra.vidros) ? obra.vidros : [])
                        setNovoVidro('')
                        setDivisorias(Array.isArray(obra.divisorias) ? obra.divisorias : [])
                        setNovaDivTipo('DRYWALL')
                        setNovaDivM2('')
                        setItensEspeciais(Array.isArray(obra.itens_especiais) ? obra.itens_especiais : [])
                        setBiomboFila(obra.biombo_fila != null ? String(obra.biombo_fila) : '')
                        setEditDados({ nome: obra.nome||'', local: obra.local||'', valor: obra.valor!=null ? String(obra.valor) : '', sige: obra.sige||'', pedido: obra.pedido||'', nf: obra.nf||'' })
                        setDataCadastroModal(obra.data_cadastro || '')
                        setDataVistoria(obra.data_vistoria || '')
                        const listaVistoria = Array.isArray(obra.colaboradores_vistoria) ? obra.colaboradores_vistoria : []
                        const terceiroVistoria = listaVistoria.find(c => c.startsWith(TERCEIRIZADO_PREFIXO))
                        setColabsVistoria(listaVistoria.filter(c => !c.startsWith(TERCEIRIZADO_PREFIXO)))
                        setTerceirizadoVistoria(!!terceiroVistoria)
                        setTerceirizadoVistoriaTexto(terceiroVistoria ? terceiroVistoria.slice(TERCEIRIZADO_PREFIXO.length) : '')
                        setDataObraInicio(obra.data_obra_inicio || '')
                        const listaObra = Array.isArray(obra.colaboradores_obra) ? obra.colaboradores_obra : []
                        const terceiroObra = listaObra.find(c => c.startsWith(TERCEIRIZADO_PREFIXO))
                        setColabsObra(listaObra.filter(c => !c.startsWith(TERCEIRIZADO_PREFIXO)))
                        setTerceirizadoObra(!!terceiroObra)
                        setTerceirizadoObraTexto(terceiroObra ? terceiroObra.slice(TERCEIRIZADO_PREFIXO.length) : '')
                      }}
                        style={{ flex:1, padding:'10px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        Atualizar status
                      </button>
                      {obra.tipo === 'TRANSF UN' && (
                        <button onClick={() => gerarBriefing(obra)}
                          style={{ padding:'10px 12px', background:'#0E4D73', color:'#fff', border:'none', borderRadius:10, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
                          📋
                        </button>
                      )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>


      </> /* fim aba pipeline */}

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

            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Data da vistoria</label>
              <input type="date" value={dataVistoria} onChange={e => setDataVistoria(e.target.value)}
                style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginBottom:8 }} />
              <SeletorEquipe titulo="Vistoria" selecionados={colabsVistoria} onChangeSelecionados={setColabsVistoria}
                terceirizado={terceirizadoVistoria} onChangeTerceirizado={setTerceirizadoVistoria}
                terceirizadoTexto={terceirizadoVistoriaTexto} onChangeTerceirizadoTexto={setTerceirizadoVistoriaTexto} />
            </div>

            {modal.tipo === 'TRANSF UN' && (
              <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Data de início da obra</label>
                <input type="date" value={dataObraInicio} onChange={e => setDataObraInicio(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginBottom:8 }} />
                <SeletorEquipe titulo="Início da obra" selecionados={colabsObra} onChangeSelecionados={setColabsObra}
                  terceirizado={terceirizadoObra} onChangeTerceirizado={setTerceirizadoObra}
                  terceirizadoTexto={terceirizadoObraTexto} onChangeTerceirizadoTexto={setTerceirizadoObraTexto} />
              </div>
            )}

            {TIPOS_ENTREGAVEIS.includes(modal.tipo) && (
              <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#065F46', fontWeight:700, marginBottom:10 }}>
                  📋 Entregáveis do Book ({entregaveis.length}/{ENTREGAVEIS_BOOK.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ENTREGAVEIS_BOOK.map(item => (
                    <label key={item} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                      <input type="checkbox" checked={entregaveis.includes(item)}
                        onChange={e => setEntregaveis(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item))} />
                      <span style={{ fontSize:13, color: entregaveis.includes(item) ? '#065F46' : '#1A2340', fontWeight: entregaveis.includes(item) ? 600 : 400 }}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {modal.tipo === 'TRANSF UN' && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas de visita ao ponto</div>
                {ETAPAS_UN.map((etapa, i) => (
                  <div key={etapa.campo} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>
                      {i+1}ª Etapa — {etapa.titulo}
                    </label>
                    <div style={{ fontSize:10, color:'#888', marginBottom:4 }}>{etapa.desc}</div>
                    <div style={{ display:'flex', gap:8, marginBottom: i === 0 ? 0 : undefined }}>
                      <input type="date" value={datas[etapa.campo]||''}
                        onChange={e => setDatas(d => ({...d, [etapa.campo]: e.target.value}))}
                        style={{ flex:1, padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                      <input value={resps[`resp_etapa${i+1}`]||''}
                        onChange={e => setResps(r => ({...r, [`resp_etapa${i+1}`]: e.target.value}))}
                        placeholder="Responsável"
                        style={{ flex:1, padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                    </div>
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
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, color:'#64748B', fontWeight:600, marginBottom:6 }}>Vidros a trocar (informe o tamanho):</div>
                          {vidros.length > 0 && (
                            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:6 }}>
                              {vidros.map((v, idx) => (
                                <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:8, padding:'5px 10px' }}>
                                  <span style={{ fontSize:12, color:'#1E40AF', flex:1 }}>🪟 {v}</span>
                                  <span onClick={() => setVidros(prev => prev.filter((_, i) => i !== idx))}
                                    style={{ fontSize:13, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display:'flex', gap:6 }}>
                            <input value={novoVidro} onChange={e => setNovoVidro(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && novoVidro.trim()) { setVidros(prev => [...prev, novoVidro.trim()]); setNovoVidro('') }}}
                              placeholder="Ex: 1,20 x 0,90 m — porta AA"
                              style={{ flex:1, padding:'7px 10px', border:'1px solid #BFDBFE', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                            <button onClick={() => { if (novoVidro.trim()) { setVidros(prev => [...prev, novoVidro.trim()]); setNovoVidro('') }}}
                              style={{ padding:'7px 14px', background:'#2D3A8C', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              + Adicionar
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, color:'#64748B', fontWeight:600, marginBottom:6 }}>Fechamento em drywall / divisória naval:</div>
                          {divisorias.length > 0 && (
                            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:6 }}>
                              {divisorias.map((d, idx) => (
                                <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:8, padding:'5px 10px' }}>
                                  <span style={{ fontSize:12, color:'#166534', flex:1 }}>🧱 {d.tipo} — {d.m2} m²</span>
                                  <span onClick={() => setDivisorias(prev => prev.filter((_, i) => i !== idx))}
                                    style={{ fontSize:13, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <select value={novaDivTipo} onChange={e => setNovaDivTipo(e.target.value)}
                              style={{ padding:'7px 8px', border:'1px solid #BBF7D0', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                              <option>DRYWALL</option>
                              <option>DIVISÓRIA NAVAL</option>
                            </select>
                            <input value={novaDivM2} onChange={e => setNovaDivM2(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && novaDivM2.trim()) { setDivisorias(prev => [...prev, { tipo: novaDivTipo, m2: novaDivM2.trim() }]); setNovaDivM2('') }}}
                              placeholder="m² (ex: 12,5)"
                              style={{ flex:1, padding:'7px 10px', border:'1px solid #BBF7D0', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                            <button onClick={() => { if (novaDivM2.trim()) { setDivisorias(prev => [...prev, { tipo: novaDivTipo, m2: novaDivM2.trim() }]); setNovaDivM2('') }}}
                              style={{ padding:'7px 14px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              + Add
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10, color:'#64748B', fontWeight:600, marginBottom:6 }}>Itens existentes na agência:</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                            {ITENS_ESPECIAIS_UN.map(item => {
                              const sel = itensEspeciais.includes(item)
                              return (
                                <div key={item} onClick={() => setItensEspeciais(prev => sel ? prev.filter(i => i !== item) : [...prev, item])}
                                  style={{ padding:'5px 11px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer',
                                    background: sel ? '#1A6B4A' : '#fff',
                                    color: sel ? '#fff' : '#1A6B4A',
                                    border: `1.5px solid ${sel ? '#1A6B4A' : '#BBF7D0'}` }}>
                                  {sel ? '✓ ' : ''}{item}
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <label style={{ fontSize:11, color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>Qtd. Biombo de fila:</label>
                            <input type="number" min="0" value={biomboFila} onChange={e => setBiomboFila(e.target.value)}
                              placeholder="0"
                              style={{ width:70, padding:'6px 10px', border:'1.5px solid #BBF7D0', borderRadius:8, fontSize:13, fontWeight:700, color:'#1A2340', textAlign:'center', boxSizing:'border-box' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modal.tipo !== 'TRANSF UN' && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas da obra</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Início</label>
                    <input type="date" value={dataObra.inicio} onChange={e => setDataObra(d => ({...d, inicio: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Término</label>
                    <input type="date" value={dataObra.termino} onChange={e => setDataObra(d => ({...d, termino: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>ART pronta em</label>
                    <input type="date" value={dataArt} onChange={e => setDataArt(e.target.value)}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <SeletorEquipe titulo="Quem foi na obra" selecionados={colabsObra} onChangeSelecionados={setColabsObra}
                    terceirizado={terceirizadoObra} onChangeTerceirizado={setTerceirizadoObra}
                    terceirizadoTexto={terceirizadoObraTexto} onChangeTerceirizadoTexto={setTerceirizadoObraTexto} />
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

            <div style={{ background:'#F0F7FF', borderRadius:12, padding:14, marginBottom:16, border:'1px solid #BFDBFE' }}>
              <div style={{ fontSize:12, color:'#1E40AF', fontWeight:700, marginBottom:8 }}>Data de entrada no pipeline</div>
              <input type="date" value={dataCadastroModal}
                onChange={e => setDataCadastroModal(e.target.value)}
                style={{ width:'100%', padding:'8px 10px', border:'1px solid #BFDBFE', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              <div style={{ fontSize:10, color:'#64748B', marginTop:5 }}>Quando esta demanda entrou no pipeline (usada para calcular dias parado)</div>
            </div>

            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:8 }}>Etapa da régua:</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginBottom:8 }}>
              {getEtapas().map((op, i) => {
                const ativo = novoStatus === op
                return (
                  <div key={op} onClick={() => setNovoStatus(op)}
                    style={{ padding:'10px 12px', borderRadius:10, border: ativo ? '2px solid #1A6B4A' : '1px solid #E0E8F0', cursor:'pointer', background: ativo ? '#D1FAE5' : '#fff', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, background: ativo ? '#1A6B4A' : '#E6F1FB', color: ativo ? '#fff' : '#2D3A8C', fontWeight:700, borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</span>
                    <span style={{ fontSize:12, color:'#1A2340', fontWeight: ativo ? 600 : 400, lineHeight:1.25 }}>{op}</span>
                    {ativo && <span style={{ marginLeft:'auto', fontSize:14, flexShrink:0 }}>●</span>}
                  </div>
                )
              })}
            </div>
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
                  {getEtapas().map((_, i) => (
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
