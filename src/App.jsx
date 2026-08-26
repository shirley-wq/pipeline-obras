import React, { useState, useEffect, useMemo, useRef } from 'react'
import * as XLSX from 'xlsx'
import * as XLSXStyle from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfjsWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import { supabase } from './supabase'

GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

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
  'AGUARDANDO PEDIDO DA TECBAN',
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
  'AGUARDANDO PEDIDO DA TECBAN':{ bg:'#CCFBF1',text:'#0F766E' },
  'FOTOS DO AMBIENTE':{ bg:'#F0FDF4',text:'#166534' },
  'LAUDOS ASSINADOS':{ bg:'#F0F9FF',text:'#0369A1' },
  'CANCELADO':{ bg:'#F1F5F9',text:'#64748B' },
}

const TIPOS_ENTREGAVEIS = ['DESC. PAB', 'DESC. PA', 'ENCER. AG', 'TRANSF UN', 'TRANSF EN']
const ENTREGAVEIS_BOOK = [
  'Termo de Antena',
  'Termo de Ar Condicionado',
  'Termo de Descarte',
  'TERMO DE RECEBIMENTO DEFINITIVO',
  'ART Assinada',
  'QR Code Concluído',
]
const ENTREGAVEIS_TRANSFORMACAO = [
  'Termo de Transformação UN/EN',
  'ART Assinada',
  'Check-list Fácil Baixado',
]
function entregaveisObrigatorios(tipo) {
  return (tipo === 'TRANSF UN' || tipo === 'TRANSF EN') ? ENTREGAVEIS_TRANSFORMACAO : ENTREGAVEIS_BOOK
}
const ENTREGAVEIS_VISTORIA = [
  'Book Checklist Fácil',
  'ORÇAMENTO PRA UN/EN',
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
  'Fabio Esteves',
  'Fabio Henrique Fontes',
  'Flavio de Oliveira Santos',
  'Franciarley Freire Pereira Miranda',
  'Gabriel Martins dos Santos Benassi',
  'Genivaldo Rodrigues Lima',
  'Glauce Lourenço Teixeira',
  'Guilherme de Carvalho Santos',
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
// UF real da obra: tenta extrair do "local" (cidade-UF); se não der, cai pro campo uf
// cadastrado separado; só marca "S/UF" quando nenhum dos dois existe de verdade.
function estadoDaObra(o) {
  const parsed = uf(o.local)
  if (parsed !== '—') return parsed
  return (o.uf && o.uf.trim()) || 'S/UF'
}

// CNPJs próprios do Grupo PG usados pra faturar a Tecban - SP fatura o próprio estado
// e qualquer outro que não seja RJ/MG (é o "coringa"); RJ e MG só faturam o próprio estado.
const CNPJS_GRUPOPG = {
  SP: '19.786.849/0001-60',
  RJ: '19.786.849/0002-41',
  MG: '19.786.849/0003-22',
}
function cnpjEsperadoParaUF(ufSigla) {
  if (ufSigla === 'RJ') return CNPJS_GRUPOPG.RJ
  if (ufSigla === 'MG') return CNPJS_GRUPOPG.MG
  return CNPJS_GRUPOPG.SP
}
// Caminho inverso do de cima - a partir do CNPJ fornecedor de um grupo de faturamento, descobre de
// qual estado é (pra mostrar na linha resumida do grupo, Shirley 2026-08-26).
function ufDoCnpjFornecedor(cnpj) {
  const par = Object.entries(CNPJS_GRUPOPG).find(([, c]) => c === cnpj)
  return par ? par[0] : ''
}

// Conferência do pedido a partir dos campos já salvos na obra (não dos campos do formulário
// em edição) - usada pra decidir se uma obra "disponível pra faturar" está 100% conferida
// ou se tem alguma divergência precisando de correção antes de faturar de verdade.
function conferePedidoObra(obra) {
  const temValor = obra.pedido_valor !== null && obra.pedido_valor !== undefined
  const temOs = !!(obra.pedido_os && String(obra.pedido_os).trim())
  const temCnpj = !!(obra.pedido_cnpj && String(obra.pedido_cnpj).trim())
  const temConferencia = temValor || temOs || temCnpj
  const valorBate = temValor && Math.abs(Number(obra.pedido_valor) - Number(obra.valor || 0)) < 0.01
  const osBate = temOs && String(obra.pedido_os).trim() === String(obra.os_tecban || '').trim()
  const ufObra = uf(obra.local).toUpperCase()
  const cnpjEsperado = cnpjEsperadoParaUF(ufObra)
  const cnpjBate = temCnpj && obra.pedido_cnpj === cnpjEsperado
  const completo = temValor && temOs && temCnpj && valorBate && osBate && cnpjBate
  const precisaCorrecao = temConferencia && ((temValor && !valorBate) || (temOs && !osBate) || (temCnpj && !cnpjBate))
  return { temValor, temOs, temCnpj, temConferencia, valorBate, osBate, cnpjBate, completo, precisaCorrecao }
}

// Agrupa obras 100% conferidas por CNPJ fornecedor (Grupo PG, pela UF) + CNPJ tomador (Tecban,
// vindo do pedido) pra faturar várias de uma vez com uma única NF - máximo de 15 serviços por
// grupo (Shirley, 2026-08-25); quando um par de CNPJs passa disso, quebra em mais de um grupo.
const MAX_SERVICOS_POR_GRUPO_FATURAMENTO = 15
function agruparParaFaturamento(obrasProntas) {
  const porChave = {}
  obrasProntas.forEach(o => {
    const ufObra = uf(o.local).toUpperCase()
    const cnpjFornecedor = cnpjEsperadoParaUF(ufObra)
    const cnpjTomador = o.pedido_tecban_cnpj || ''
    const chave = `${cnpjFornecedor}|${cnpjTomador}`
    if (!porChave[chave]) porChave[chave] = []
    porChave[chave].push(o)
  })
  const grupos = []
  Object.entries(porChave).forEach(([chave, lista]) => {
    const [cnpjFornecedor, cnpjTomador] = chave.split('|')
    for (let i = 0; i < lista.length; i += MAX_SERVICOS_POR_GRUPO_FATURAMENTO) {
      const fatia = lista.slice(i, i + MAX_SERVICOS_POR_GRUPO_FATURAMENTO)
      grupos.push({
        chave: `${chave}#${Math.floor(i / MAX_SERVICOS_POR_GRUPO_FATURAMENTO)}`,
        cnpjFornecedor,
        cnpjTomador,
        nomeTecban: fatia[0].pedido_tecban_nome || '',
        obras: fatia,
        total: fatia.reduce((s, o) => s + (Number(o.valor) || 0), 0),
      })
    }
  })
  return grupos
}

// Texto pronto pra colar no corpo da NF no site da prefeitura (Shirley, 2026-08-26) - sem endereço
// da obra: o endereço do tomador usado ali é sempre o endereço "padrão" da unidade, não o da obra,
// então o texto só lista pedido + valor de cada serviço do grupo, mais o INSS (sempre 11% sobre o
// valor total da NF) e o vencimento já preenchido no campo do grupo.
function montaTextoNF(g, vencimentoIso) {
  const pedidos = g.obras.map(o => o.pedido || '(sem pedido)').join(', ')
  const valores = g.obras.map(o => `${fmt(o.valor)} ${o.pedido || o.nome}`).join('\n')
  const inss = g.total * 0.11
  const vencimentoTexto = vencimentoIso ? isoToBr(vencimentoIso) : '(preencher vencimento)'
  return `PEDIDOS: ${pedidos}\nVALORES:\n${valores}\nINSS - RETER 11% COM BASE NO VALOR TOTAL DA NF: ${fmt(inss)}\nVENCIMENTO ${vencimentoTexto}`
}

function montaLocal(cidade, ufSigla) {
  const c = (cidade||'').trim(), u = (ufSigla||'').trim()
  if (c && u) return `${c}-${u}`
  return c || u || null
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
// Maiuscula automática em campos de texto livre escritos por pessoas (nome, endereço, motivos,
// observações etc.) - pedido da Shirley, 2026-08-20, pra padronizar como fica escrito nos
// relatórios. Não usar em busca/nomes vindos de datalist de colaboradores (autocomplete quebra).
const up = v => v.toUpperCase()
// data_inicio_obra_texto foi digitado como texto livre "DD/MM/AAAA" até 2026-08-19 (fonte comum de
// erro - qualquer formato levemente diferente falhava calado e sumia do Cenário). Virou <input
// type="date"> a partir de agora (ISO direto), mas registros antigos continuam em texto BR - esse
// helper aceita os dois formatos e sempre devolve ISO (ou null se não reconhecer nenhum dos dois).
function paraIsoDataObraTexto(v) {
  const s = (v || '').trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return brToIso(s)
  return null
}

function somaAnos(iso, anos) {
  if (!iso) return null
  const d = new Date(iso + 'T12:00:00')
  d.setFullYear(d.getFullYear() + anos)
  return d.toISOString().slice(0, 10)
}

function somaDias(iso, dias) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

function hojeIso() {
  // Usa os getters locais (não toISOString, que é UTC) - passado das 21h no horário de
  // Brasília (UTC-3), toISOString já mostra o dia seguinte, adiantando "hoje" incorretamente.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function proximaFeriasEstimativa(dataAdmissao) {
  if (!dataAdmissao) return null
  const hoje = new Date()
  const d = new Date(dataAdmissao + 'T12:00:00')
  d.setFullYear(hoje.getFullYear())
  if (d < hoje) d.setFullYear(hoje.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

function statusVencimento(iso) {
  if (!iso) return null
  const hoje = hojeIso()
  const em30isoStr = somaDias(hoje, 30)
  if (iso < hoje) return { cor:'#991B1B', bg:'#FEE2E2', label:'Vencido', pendencia:true }
  if (iso <= em30isoStr) return { cor:'#92400E', bg:'#FEF3C7', label:'Vence em breve', pendencia:false }
  return { cor:'#065F46', bg:'#D1FAE5', label:'Em dia', pendencia:false }
}

const NR_VALIDADE_ANOS = { nr6: null, nr10: 2, nr33: 1, nr35: 2, nr12: null }
const RUBRICAS_DESCONTO = [
  { motivo:'PENSAO', label:'Pensão', codigo:'900' },
  { motivo:'VALE_TRANSPORTE', label:'Vale Transporte', codigo:'217' },
  { motivo:'AUXILIO_VIAGEM', label:'Auxílio Viagem', codigo:'271' },
  { motivo:'EMPRESTIMO', label:'Empréstimo', codigo:'268' },
  { motivo:'ODONTO', label:'Odonto', codigo:'222' },
  { motivo:'MULTA', label:'Multa', codigo:'259' },
  { motivo:'VALE_PRESENTE', label:'Vale Presente', codigo:'290' },
  { motivo:'OUTROS', label:'Outros Descontos', codigo:'258' },
  { motivo:'REEMBOLSO_TELEFONIA', label:'Reembolso Telefonia', codigo:null },
]
function rubricaLabel(motivo) {
  const r = RUBRICAS_DESCONTO.find(r => r.motivo === motivo)
  if (!r) return motivo
  return r.codigo ? `${r.label} (${r.codigo})` : r.label
}
const NR_CAMPOS = [['NR6','nr6'],['NR10','nr10'],['NR33','nr33'],['NR35','nr35'],['NR12','nr12']]

function precisaNR(email, perfisLogin) {
  if (!email) return true
  const p = (perfisLogin || []).find(x => x.email === email)
  return !p || p.papel === 'operacional'
}

function interpretaStatusDoc(valor, anosValidade, precisa) {
  if (precisa === false) return { cor:'#64748B', bg:'#F1F5F9', label:'Não se aplica', pendencia:false }
  if (!valor) return { cor:'#64748B', bg:'#F1F5F9', label:'Não informado', pendencia:true }
  const v = String(valor).trim().toUpperCase()
  if (v === 'NÃO TEM' || v === 'NAO TEM') return { cor:'#991B1B', bg:'#FEE2E2', label:'Não tem', pendencia:true }
  if (v === 'FAZENDO CURSO') return { cor:'#92400E', bg:'#FEF3C7', label:'Fazendo curso', pendencia:false }
  if (v === 'SEM PRAZO' || v === 'NÃO FAZ' || v === 'NAO FAZ') return { cor:'#065F46', bg:'#D1FAE5', label: v === 'SEM PRAZO' ? 'Sem prazo' : 'Não faz', pendencia:false }
  if (v === '****' || v === 'PENDENTE') return { cor:'#64748B', bg:'#F1F5F9', label:'Não informado', pendencia:true }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    if (anosValidade == null) return { cor:'#065F46', bg:'#D1FAE5', label:`Feito em ${isoToBr(v)} (sem validade)`, pendencia:false }
    const venc = somaAnos(v, anosValidade)
    const st = statusVencimento(venc)
    return { ...st, label:`${isoToBr(venc)} · ${st.label}` }
  }
  return { cor:'#64748B', bg:'#F1F5F9', label:valor, pendencia:false }
}

function mesAtualIso() {
  return new Date().toISOString().slice(0, 7)
}

function mesLabel(iso) {
  if (!iso) return null
  const [y, m] = iso.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[Number(m) - 1]}/${y}`
}

function somaMeses(mesIso, n) {
  const [y, m] = mesIso.split('-').map(Number)
  const total = (y * 12 + (m - 1)) + n
  const novoAno = Math.floor(total / 12)
  const novoMes = (total % 12) + 1
  return `${novoAno}-${String(novoMes).padStart(2, '0')}`
}

function mesesDoAnoAteAgora(ano) {
  const mesAtual = mesAtualIso()
  const meses = []
  for (let m = 1; m <= 12; m++) {
    const iso = `${ano}-${String(m).padStart(2,'0')}`
    if (iso <= mesAtual) meses.push(iso)
  }
  return meses
}

function mesesPendentes(confirmados, ano) {
  const lista = Array.isArray(confirmados) ? confirmados : []
  return mesesDoAnoAteAgora(ano).filter(m => !lista.includes(m))
}

function listaPendenciasRH(c, perfisLogin) {
  const pendencias = []

  if (!c.data_aso) {
    pendencias.push('ASO: sem exame registrado')
  } else {
    const st = statusVencimento(somaAnos(c.data_aso, 1))
    if (st.pendencia) pendencias.push(`ASO vencido (${isoToBr(somaAnos(c.data_aso, 1))})`)
  }

  if (!c.data_vencimento_cnh) {
    pendencias.push('CNH: sem registro')
  } else {
    const st = statusVencimento(c.data_vencimento_cnh)
    if (st.pendencia) pendencias.push(`CNH vencida (${isoToBr(c.data_vencimento_cnh)})`)
  }

  const precisa = precisaNR(c.email, perfisLogin)
  if (precisa) {
    NR_CAMPOS.forEach(([label, campo]) => {
      const st = interpretaStatusDoc(c[campo], NR_VALIDADE_ANOS[campo], true)
      if (st.pendencia) pendencias.push(`${label}: ${st.label.toLowerCase()}`)
    })
  }

  if (!c.ferias_periodo_atual) pendencias.push('Sem período de férias de referência')

  mesesPendentes(c.ponto_assinado_meses, 2026).forEach(m => pendencias.push(`Ponto ${mesLabel(m)} não assinado`))
  mesesPendentes(c.holerite_adiantamento_meses, 2026).forEach(m => pendencias.push(`Holerite adiantamento ${mesLabel(m)} não assinado`))
  mesesPendentes(c.holerite_pagamento_meses, 2026).forEach(m => pendencias.push(`Holerite pagamento ${mesLabel(m)} não assinado`))

  return pendencias
}

function contarPendenciasRH(c, perfisLogin) {
  return listaPendenciasRH(c, perfisLogin).length
}

// ====== Fechamento de ponto — parser do espelho bruto (xlsx) ======

function horaParaMinutos(hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function extraiPrimeiroTempo(valor) {
  // Linha TOTAIS vem tipo "27:34 Not.: 04:00" — só interessa o primeiro valor.
  if (!valor) return 0
  const m = String(valor).match(/^(\d+):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

function parseDataDia(dataStr) {
  const m = String(dataStr || '').match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

function parsePontoEspelho(rows) {
  const colaboradores = []
  let i = 0
  while (i < rows.length) {
    if (rows[i][0] !== 'Colaborador') { i++; continue }
    const nome = String(rows[i][1] || '').trim()
    const header = (rows[i + 1] || []).map(h => String(h || '').trim())
    const idx = {}
    header.forEach((h, k) => { idx[h] = k })
    const he1Chave = header.find(h => h.startsWith('Horas extras fator 1'))
    const he2Chave = header.find(h => h.startsWith('Horas extras fator 2'))

    const dias = []
    let j = i + 2
    while (j < rows.length && rows[j][0] !== 'TOTAIS' && rows[j][0] !== 'Colaborador') {
      const r = rows[j]
      dias.push({
        data: r[idx['Data']] || '',
        dataObj: parseDataDia(r[idx['Data']]),
        entrada1: r[idx['1ª Entrada']] || '',
        saida1: r[idx['1ª Saída']] || '',
        entrada2: r[idx['2ª Entrada']] || '',
        saida2: r[idx['2ª Saída']] || '',
        entrada3: idx['3ª Entrada'] != null ? (r[idx['3ª Entrada']] || '') : '',
        saida3: idx['3ª Saída'] != null ? (r[idx['3ª Saída']] || '') : '',
        credito: r[idx['Crédito']] || '00:00',
        debito: r[idx['Débito']] || '00:00',
        hIntervalo: r[idx['H. intervalo']] || '00:00',
        horasNormais: r[idx['Horas normais']] || '00:00',
        he1: r[idx[he1Chave]] || '00:00',
        he2: r[idx[he2Chave]] || '00:00',
        adicionalNoturno: r[idx['Adicional noturno']] || '00:00',
        motivo: r[idx['Motivo/Observação']] || '',
      })
      j++
    }
    const totaisRow = rows[j] && rows[j][0] === 'TOTAIS' ? rows[j] : null
    colaboradores.push({
      nome,
      dias,
      totais: totaisRow ? {
        credito: extraiPrimeiroTempo(totaisRow[idx['Crédito']]),
        debito: extraiPrimeiroTempo(totaisRow[idx['Débito']]),
        hIntervalo: extraiPrimeiroTempo(totaisRow[idx['H. intervalo']]),
        horasNormais: extraiPrimeiroTempo(totaisRow[idx['Horas normais']]),
        he1: extraiPrimeiroTempo(totaisRow[idx[he1Chave]]),
        he2: extraiPrimeiroTempo(totaisRow[idx[he2Chave]]),
        adicionalNoturno: extraiPrimeiroTempo(totaisRow[idx['Adicional noturno']]),
      } : null,
    })
    i = j + 1
  }
  return colaboradores
}

function ultimaSaidaComInfo(dia) {
  // Turno que vira a noite (ex: entrada 13:34, saída 02:37) tem a saída já no dia seguinte,
  // não no mesmo dia da linha da planilha - precisa marcar isso pra não computar descanso errado.
  const pares = [[dia.entrada1, dia.saida1], [dia.entrada2, dia.saida2], [dia.entrada3, dia.saida3]]
  let melhor = null
  pares.forEach(([entrada, saida]) => {
    if (!saida) return
    const saidaMin = horaParaMinutos(saida)
    const cruzouMeiaNoite = !!entrada && saidaMin < horaParaMinutos(entrada)
    const ordem = cruzouMeiaNoite ? saidaMin + 24 * 60 : saidaMin
    if (!melhor || ordem > melhor.ordem) melhor = { minutos: saidaMin, cruzouMeiaNoite, ordem }
  })
  return melhor
}

function calcularViolacoesInterjornada(dias, base) {
  const violacoes = []
  // Regra dos 100% (déficit de interjornada que termina em sábado/domingo/feriado) só vale
  // pra SAO e RIO. Na base BHZ (MG) a HE já é sempre 80% pra qualquer situação - não tem
  // bucket de 100% separado (confirmado pela Shirley em 2026-08-03).
  const aplica100 = base === 'SAO' || base === 'RIO'
  for (let k = 0; k < dias.length - 1; k++) {
    const saidaInfo = ultimaSaidaComInfo(dias[k])
    const entradaAmanha = dias[k + 1].entrada1
    if (!saidaInfo || !entradaAmanha) continue
    const gap = saidaInfo.cruzouMeiaNoite
      ? horaParaMinutos(entradaAmanha) - saidaInfo.minutos
      : (24 * 60 - saidaInfo.minutos) + horaParaMinutos(entradaAmanha)
    if (gap < 0) continue
    if (gap < 11 * 60) violacoes.push({
      de: dias[k].data, para: dias[k + 1].data, gapMinutos: gap,
      // Se o retorno (fim da interjornada violada) cai em sábado/domingo/feriado, o déficit
      // vai pro bucket de 100% (mesma taxa que já vale pra hora trabalhada nesses dias);
      // caindo em dia de semana normal, segue a taxa de hora extra normal da base (HE1/HE2).
      cai100: aplica100 && ehFimDeSemanaOuFeriado(dias[k + 1]),
    })
  }
  return violacoes
}

function ehFimDeSemanaOuFeriado(dia) {
  // Sinal mais confiavel que o texto do motivo: em dia sem expediente normal escalado
  // (fim de semana ou feriado, mesmo um feriado que nao tem a palavra "FERIADO" no texto,
  // tipo "DATA MAGNA DO ESTADO DE SAO PAULO"), o sistema de ponto zera "Horas normais" e
  // joga 100% do que foi trabalhado como hora extra.
  const trabalhouSoComoExtra = horaParaMinutos(dia.horasNormais) === 0 && (horaParaMinutos(dia.he1) + horaParaMinutos(dia.he2)) > 0
  if (trabalhouSoComoExtra) return true
  if ((dia.motivo || '').toUpperCase().includes('FERIADO')) return true
  if (dia.dataObj) { const d = dia.dataObj.getDay(); if (d === 0 || d === 6) return true }
  return false
}

function calcularViolacoesIntrajornada(dias, temDiaReferencia) {
  const violacoes = []
  dias.forEach((dia, idx) => {
    // dias[0] só é o último dia do período anterior (repetido no arquivo como referência,
    // ver excluiPrimeiroDiaDosTotais) pra quem já trabalhava no fechamento passado. Quem
    // começou justo no 1º dia deste período (ex: admissão no dia 26) não tem essa linha
    // repetida - dias[0] já é o primeiro dia real, e não pode ser descartado.
    if (idx === 0 && temDiaReferencia) return
    // Em fim de semana/feriado o relogio de ponto nao separa a pausa (roda corrido),
    // entao H.Intervalo=00:00 nesses dias nao e prova confiavel de intrajornada violada.
    if (ehFimDeSemanaOuFeriado(dia)) return
    const trabalhado = horaParaMinutos(dia.horasNormais) + horaParaMinutos(dia.he1) + horaParaMinutos(dia.he2)
    if (trabalhado <= 0) return
    const minimoExigido = trabalhado > 6 * 60 ? 60 : (trabalhado > 4 * 60 ? 15 : 0)
    if (minimoExigido === 0) return
    const intervalo = horaParaMinutos(dia.hIntervalo)
    if (intervalo < minimoExigido) violacoes.push({ data: dia.data, intervalo, minimoExigido })
  })
  return violacoes
}

function minutosParaHoras(min) {
  const h = Math.floor(Math.abs(min) / 60), m = Math.abs(min) % 60
  return `${min < 0 ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ===== Parser de holerite em PDF (layout PG Construtora / GRUPO PG) =====
// O extrator de texto do PDF devolve os itens em ordem "por coluna" (todos os
// códigos, depois todas as descrições, depois...), não em ordem de leitura -
// por isso reconstruímos as linhas pela posição (x,y) de cada item, em vez de
// tentar ler o texto corrido. Cada funcionário aparece 2x na mesma página (via
// funcionário/via empresa, idênticas) - separado pela linha de traços "---".
function toNumeroBR(s) {
  if (s == null) return null
  const t = String(s).trim().replace(/\./g, '').replace(',', '.')
  const n = parseFloat(t)
  return isNaN(n) ? null : n
}

// Alguns caracteres/glifos do PDF não são mapeados certinho pelo extrator
// (ver aviso "TT: undefined function" no console) e podem virar caracteres de
// controle inválidos no meio do texto - o Postgres rejeita isso ao salvar
// jsonb ("unsupported Unicode escape sequence"). Tira esses caracteres assim
// que o texto é lido, antes de qualquer outro processamento.
function limpaTextoPdf(s) {
  return String(s || '').replace(/[\x00-\x1F\x7F]/g, '').trim()
}

async function extraiLinhasPdf(arrayBuffer) {
  const doc = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const paginas = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const items = content.items
      .map(it => ({ str: limpaTextoPdf(it.str), x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) }))
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
  return paginas
}

function linhaTokens(row) { return row.items.map(i => i.str.trim()).filter(Boolean) }

function parsePaginaHolerite(rows) {
  const fimIdx = rows.findIndex(r => r.items.some(i => i.str.startsWith('---')))
  const via1 = fimIdx === -1 ? rows : rows.slice(0, fimIdx)
  const idxNomeLabel = via1.findIndex(r => r.items.some(i => i.str === 'Nome do Funcionário'))
  if (idxNomeLabel === -1) return null
  const infoRow = via1[idxNomeLabel + 1]
  const cargoRow = via1[idxNomeLabel + 2]
  if (!infoRow) return null
  const infoTokens = linhaTokens(infoRow)
  const empCodigo = infoTokens[0]
  let nome = ''
  for (let i = 1; i < infoTokens.length; i++) {
    if (/^\d{5,6}$/.test(infoTokens[i])) break
    nome += (nome ? ' ' : '') + infoTokens[i]
  }
  const cargoTokens = cargoRow ? linhaTokens(cargoRow) : []
  const admIdx = cargoTokens.indexOf('Admissão:')
  const cargo = admIdx > 0 ? cargoTokens.slice(0, admIdx).join(' ') : cargoTokens.join(' ')
  const admissao = admIdx >= 0 ? cargoTokens[admIdx + 1] : null

  const idxHeaderTabela = via1.findIndex(r => r.items.some(i => i.str === 'Código') && r.items.some(i => i.str === 'Descrição'))
  if (idxHeaderTabela === -1) return null
  // A posição do RÓTULO do cabeçalho ("Descrição" etc.) não corresponde a onde o
  // dado de cada linha realmente começa (o texto da descrição começa bem mais à
  // esquerda que a palavra "Descrição" do cabeçalho) - por isso não dá pra usar a
  // posição do cabeçalho pra separar colunas. Em vez disso, cada linha é lida por
  // conteúdo/ordem: 1º token numérico curto = código, próximo token com letra =
  // descrição, e dos números que sobram o primeiro é a referência; os demais são
  // vencimento ou desconto, decidido pela posição em relação ao meio do intervalo
  // entre as colunas "Vencimentos" e "Descontos" do cabeçalho (essas sim distantes
  // o bastante uma da outra pra não errar).
  const colX = {}
  via1[idxHeaderTabela].items.forEach(i => { colX[i.str] = i.x })
  const limiarVencDesc = (colX['Vencimentos'] != null && colX['Descontos'] != null)
    ? (colX['Vencimentos'] + colX['Descontos']) / 2
    : 430

  const idxTotalVenc = via1.findIndex((r, idx) => idx > idxHeaderTabela && r.items.some(i => i.str === 'Total de Vencimentos'))
  const fimTabela = idxTotalVenc === -1 ? via1.length : idxTotalVenc
  const rubricas = []
  for (let r = idxHeaderTabela + 1; r < fimTabela; r++) {
    const row = via1[r]
    if (!row) continue
    const tokens = row.items.filter(it => it.str !== 'Assinatura do Funcionário' && !it.str.startsWith('___'))
    if (tokens.length === 0) continue
    let i = 0
    let codigo = ''
    if (/^\d+$/.test(tokens[0].str)) { codigo = tokens[0].str; i = 1 }
    let descricao = ''
    if (tokens[i] && /[A-Za-zÀ-ÿ]/.test(tokens[i].str)) { descricao = tokens[i].str; i++ }
    const restantes = tokens.slice(i)
    let referencia = '', vencimento = null, desconto = null
    if (restantes.length > 0) {
      referencia = restantes[0].str
      for (let k = 1; k < restantes.length; k++) {
        const valor = toNumeroBR(restantes[k].str)
        if (restantes[k].x < limiarVencDesc) vencimento = valor
        else desconto = valor
      }
    }
    if (codigo || descricao) rubricas.push({ codigo, descricao, referencia, vencimento, desconto })
  }

  let totalVencimentos = null, totalDescontos = null
  if (idxTotalVenc !== -1) {
    const totalVencX = via1[idxTotalVenc].items.find(i => i.str === 'Total de Vencimentos')?.x
    const totalDescX = via1[idxTotalVenc].items.find(i => i.str === 'Total de Descontos')?.x
    const totaisRow = via1[idxTotalVenc + 1]
    if (totaisRow) {
      totaisRow.items.forEach(it => {
        if (!/\d/.test(it.str)) return
        if (totalVencX != null && Math.abs(it.x - totalVencX) < 40) totalVencimentos = toNumeroBR(it.str)
        else if (totalDescX != null && Math.abs(it.x - totalDescX) < 40) totalDescontos = toNumeroBR(it.str)
      })
    }
  }

  let valorLiquido = null
  const idxLiquido = via1.findIndex((r, idx) => idx > idxTotalVenc && r.items.some(i => i.str.includes('Valor Líquido')))
  if (idxLiquido >= 0) {
    const toks = via1[idxLiquido].items.filter(i => i.x > 460 && /\d/.test(i.str))
    if (toks.length) valorLiquido = toNumeroBR(toks[toks.length - 1].str)
  }

  let salarioBase = null
  const idxSalBase = via1.findIndex((r, idx) => idx > idxTotalVenc && r.items.some(i => i.str === 'Salário Base'))
  if (idxSalBase >= 0 && via1[idxSalBase + 1]) salarioBase = toNumeroBR(linhaTokens(via1[idxSalBase + 1])[0])

  return { empCodigo, nome, cargo, admissao, rubricas, totalVencimentos, totalDescontos, valorLiquido, salarioBase }
}

async function parseHoleritePdf(arrayBuffer) {
  const paginas = await extraiLinhasPdf(arrayBuffer)
  const funcionarios = []
  let atual = null
  paginas.forEach(rows => {
    const parsed = parsePaginaHolerite(rows)
    if (!parsed) return
    if (atual && atual.empCodigo === parsed.empCodigo && atual.nome === parsed.nome) {
      atual.rubricas.push(...parsed.rubricas)
      if (parsed.valorLiquido != null) atual.valorLiquido = parsed.valorLiquido
      if (parsed.totalVencimentos != null) atual.totalVencimentos = parsed.totalVencimentos
      if (parsed.totalDescontos != null) atual.totalDescontos = parsed.totalDescontos
      if (parsed.salarioBase != null) atual.salarioBase = parsed.salarioBase
    } else {
      if (atual) funcionarios.push(atual)
      atual = parsed
    }
  })
  if (atual) funcionarios.push(atual)
  return funcionarios
}

function somaRubricas(rubricas, palavraChave) {
  return rubricas.filter(r => r.descricao.toUpperCase().includes(palavraChave))
    .reduce((acc, r) => ({
      minutos: acc.minutos + horaParaMinutos(r.referencia),
      valor: acc.valor + (r.vencimento || 0),
    }), { minutos: 0, valor: 0 })
}

// Comparação de nome pra casar holerite <-> cadastro do RH, tolerando as
// variações mais comuns entre a folha de pagamento e o cadastro (conectivo
// de/da/do que um lado tem e o outro não - ex: "Souza da Paz" x "Souza Paz" -
// e apelido/forma reduzida do primeiro nome - ex: "Carol" x "Carolina").
// Continua exigindo TODOS os outros nomes (sobrenomes) iguais, pra não gerar
// falso positivo entre pessoas diferentes. Só usado no casamento de holerite -
// as outras importações (ponto/descontos) continuam com comparação exata,
// por decisão explícita da Shirley (ver memória de 2026-07-31).
function tokenizaNomeFlexivel(nome) {
  return String(nome || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split(/\s+/)
    .filter(t => t && !['DE', 'DA', 'DO', 'DAS', 'DOS'].includes(t))
}
function nomesDeColaboradorBatem(nomeA, nomeB) {
  const a = tokenizaNomeFlexivel(nomeA)
  const b = tokenizaNomeFlexivel(nomeB)
  if (a.length !== b.length || a.length === 0) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue
    if (i === 0 && a[i].length >= 4 && b[i].length >= 4 && (a[i].startsWith(b[i]) || b[i].startsWith(a[i]))) continue
    return false
  }
  return true
}

function parsePeriodoEspelho(rows) {
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const m = String(rows[i][0] || '').match(/(\d{2})\/(\d{2})\/(\d{4})\s*(?:a|até)\s*(\d{2})\/(\d{2})\/(\d{4})/i)
    if (m) return { inicio: `${m[3]}-${m[2]}-${m[1]}`, fim: `${m[6]}-${m[5]}-${m[4]}` }
  }
  return { inicio: null, fim: null }
}

function extraiDataSemDiaSemana(dataStr) {
  // dia.data vem tipo "Qui, 25/06/2026" (com o dia da semana embutido) - isoToBr não
  // reproduz esse prefixo, então a comparação de datas precisa ignorá-lo dos dois lados.
  const m = String(dataStr || '').match(/(\d{2}\/\d{2}\/\d{4})/)
  return m ? m[1] : dataStr
}

function processarEspelhoPonto(arrayBuffer, base) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  const colaboradores = parsePontoEspelho(rows)
  const periodo = parsePeriodoEspelho(rows)
  const inicioReferenciaTexto = periodo.inicio ? isoToBr(periodo.inicio) : null
  return {
    periodo,
    colaboradores: colaboradores.map(c => {
      // Só existe linha repetida do dia anterior (referência) pra quem já trabalhava no
      // fechamento passado. Quem começou no 1º dia deste período não tem essa linha extra.
      const temDiaReferencia = !!inicioReferenciaTexto && extraiDataSemDiaSemana(c.dias[0]?.data) === inicioReferenciaTexto
      return {
        ...c,
        temDiaReferencia,
        totais: temDiaReferencia ? excluiPrimeiroDiaDosTotais(c.totais, c.dias[0]) : c.totais,
        violacoesInterjornada: calcularViolacoesInterjornada(c.dias, base),
        violacoesIntrajornada: calcularViolacoesIntrajornada(c.dias, temDiaReferencia),
      }
    }),
  }
}

function somaValoresDesconto(valores) {
  if (valores.length === 0) return ''
  if (valores.length === 1) return valores[0]
  const temPercentual = valores.some(v => String(v).includes('%'))
  if (temPercentual) return valores.join(' + ') // não dá pra somar número com percentual
  const soma = valores.reduce((s, v) => s + (Number(String(v).replace(',', '.')) || 0), 0)
  return soma.toFixed(2).replace('.', ',')
}

function excluiPrimeiroDiaDosTotais(totais, primeiroDia) {
  // O espelho de ponto sempre repete, como 1a linha, o ultimo dia do periodo anterior
  // (ja fechado e pago no mes passado) - por isso esse dia nao entra nos totais deste mes,
  // so continua valendo pra conferencia de interjornada/intrajornada.
  if (!totais || !primeiroDia) return totais
  return {
    credito: totais.credito - horaParaMinutos(primeiroDia.credito),
    debito: totais.debito - horaParaMinutos(primeiroDia.debito),
    hIntervalo: totais.hIntervalo - horaParaMinutos(primeiroDia.hIntervalo),
    horasNormais: totais.horasNormais - horaParaMinutos(primeiroDia.horasNormais),
    he1: totais.he1 - horaParaMinutos(primeiroDia.he1),
    he2: totais.he2 - horaParaMinutos(primeiroDia.he2),
    adicionalNoturno: totais.adicionalNoturno - horaParaMinutos(primeiroDia.adicionalNoturno),
  }
}

const META_BASE_FOLHA = {
  BHZ: { cidade: 'BELO HORIZONTE', he1Pct: '80%', he2Pct: '80%' },
  RIO: { cidade: 'RIO DE JANEIRO', he1Pct: '50%', he2Pct: '100%' },
  SAO: { cidade: 'SÃO PAULO', he1Pct: '60%', he2Pct: '100%' },
}
const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function minutosParaHorasVirgula(min) {
  return minutosParaHoras(min).replace(':', ',')
}

function normalizaNomeColaborador(nome) {
  return String(nome || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// ====== Descontos — parser da planilha "DESCONTOS.xlsx" (abas por mês, ex. "JULHO_2026") ======

function extraiAnoDaAbaDescontos(nomeAba) {
  const m = String(nomeAba || '').match(/(\d{4})/)
  return m ? Number(m[1]) : null
}

function parseDescontosPlanilha(rows, nomeAba) {
  const ano = extraiAnoDaAbaDescontos(nomeAba)
  if (!ano) return { lancamentos: [], erro: `Não consegui identificar o ano pelo nome da aba "${nomeAba}".` }
  const header = (rows[0] || []).map(h => String(h || '').trim())
  // Colunas 0/1/2 são FUNCIONÁRIOS/UNIDADE/MOTIVO; a partir da 3 vêm os meses, na sequência
  // (podem virar o ano, ex. NOVEMBRO -> DEZEMBRO -> JANEIRO/ano seguinte).
  const colunasMes = []
  let anoAtual = ano
  let mesAnterior = null
  for (let col = 3; col < header.length; col++) {
    const idxMes = MESES_PT.findIndex(m => m.toUpperCase() === header[col].toUpperCase())
    if (idxMes === -1) continue
    if (mesAnterior !== null && idxMes < mesAnterior) anoAtual++
    mesAnterior = idxMes
    colunasMes.push({ col, mes: `${anoAtual}-${String(idxMes + 1).padStart(2, '0')}` })
  }
  const lancamentos = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const nomeBruto = String(row[0] || '').trim()
    if (!nomeBruto) continue
    const motivoBruto = String(row[2] || '').trim().toUpperCase().replace(/\s+/g, '_')
    const motivo = RUBRICAS_DESCONTO.some(x => x.motivo === motivoBruto) ? motivoBruto : 'OUTROS'
    colunasMes.forEach(cm => {
      const bruto = row[cm.col]
      if (bruto === '' || bruto === undefined || bruto === null) return
      const numero = typeof bruto === 'number' ? bruto : Number(String(bruto).replace(',', '.'))
      lancamentos.push({
        nomeBruto, motivoBruto, motivo, mes: cm.mes,
        valor: Number.isFinite(numero) ? numero : null,
        textoOriginal: Number.isFinite(numero) ? null : String(bruto),
      })
    })
  }
  return { lancamentos, erro: null }
}

function classificaLancamentoDesconto(l, rhColaboradores) {
  if (l.valor === null) return { ...l, status: 'invalido' }
  const nomeNorm = normalizaNomeColaborador(l.nomeBruto)
  const rh = rhColaboradores.find(c => normalizaNomeColaborador(`${c.nome} ${c.sobrenome || ''}`) === nomeNorm)
  if (!rh) return { ...l, status: 'nao_encontrado' }
  const jaExiste = Array.isArray(rh.descontos) && rh.descontos.some(d => d.motivo === l.motivo && d.mes === l.mes)
  return { ...l, status: jaExiste ? 'duplicado' : 'novo', colaboradorId: rh.id, colaboradorNome: `${rh.nome} ${rh.sobrenome || ''}`.trim() }
}

function montaLinhaFechamentoFolha(colaboradorPonto, rhColaboradores, mesReferencia, base) {
  const nomeNormalizado = normalizaNomeColaborador(colaboradorPonto.nome)
  const rh = rhColaboradores.find(c => normalizaNomeColaborador(`${c.nome} ${c.sobrenome || ''}`) === nomeNormalizado)
  const descontosDoMes = rh && Array.isArray(rh.descontos) ? rh.descontos.filter(d => d.mes === mesReferencia) : []

  const deficitInterjornada100 = colaboradorPonto.violacoesInterjornada.filter(v => v.cai100).reduce((s, v) => s + (11 * 60 - v.gapMinutos), 0)
  const deficitInterjornadaNormal = colaboradorPonto.violacoesInterjornada.filter(v => !v.cai100).reduce((s, v) => s + (11 * 60 - v.gapMinutos), 0)
  const deficitIntrajornada = colaboradorPonto.violacoesIntrajornada.reduce((s, v) => s + (v.minimoExigido - v.intervalo), 0)

  const valoresRubrica = RUBRICAS_DESCONTO.map(r => {
    const doMotivo = descontosDoMes.filter(d => d.motivo === r.motivo)
    return somaValoresDesconto(doMotivo.map(d => d.valor))
  })

  // BHZ não tem bucket de 100% (HE lá é sempre 80%, sem variar por dia da semana) - a
  // interjornada violada some pra uma coluna só em vez de separar 100%/dia útil.
  const colunasInterjornada = (base === 'SAO' || base === 'RIO')
    ? [
        deficitInterjornada100 > 0 ? minutosParaHorasVirgula(deficitInterjornada100) : '',
        deficitInterjornadaNormal > 0 ? minutosParaHorasVirgula(deficitInterjornadaNormal) : '',
      ]
    : [deficitInterjornadaNormal > 0 ? minutosParaHorasVirgula(deficitInterjornadaNormal) : '']

  return {
    nome: colaboradorPonto.nome,
    encontrouRH: !!rh,
    linha: [
      colaboradorPonto.totais ? minutosParaHorasVirgula(colaboradorPonto.totais.he1) : '',
      colaboradorPonto.totais ? minutosParaHorasVirgula(colaboradorPonto.totais.he2) : '',
      colaboradorPonto.totais ? minutosParaHorasVirgula(colaboradorPonto.totais.adicionalNoturno) : '',
      ...colunasInterjornada,
      deficitIntrajornada > 0 ? minutosParaHorasVirgula(deficitIntrajornada) : '',
      ...valoresRubrica,
    ],
  }
}

const TIPOS_ADESIVO = ['PUXE','EMPURRE','DESLIZE','CADEIRANTE','FAIXA BOLINHA','FAIXA JATEADO']
const ITENS_ESPECIAIS_UN = ['BALCÃO DE ENVELOPE','GUARDA VOLUMES','ESCADA DO SEGURANÇA']

const TIPOS_CUSTO_TERCEIRIZADO = ['GESSO','PINTURA','VIDRO','OUTRO']
const CATEGORIAS_DESPESA_PESSOAL = ['Hospedagem','Refeição','Material de construção','Pedágio','Combustível','Desgaste de veículo','ART','Estacionamento','Caçamba e Descarte']
const CATEGORIA_DESPESA_COR = {
  'Hospedagem': '#2563EB',
  'Refeição': '#B45309',
  'Material de construção': '#7C3AED',
  'Pedágio': '#0F766E',
  'Combustível': '#B91C1C',
  'Desgaste de veículo': '#4B5563',
  'ART': '#0369A1',
  'Estacionamento': '#A16207',
  'Caçamba e Descarte': '#166534',
}
const MESES_FILTRO = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CONSUMO_MEDIO_KM_L = 8
const PRECO_MEDIO_LITRO = 6.00

function somaValores(lista) {
  return (Array.isArray(lista) ? lista : []).reduce((soma, item) => soma + (Number(item.valor) || 0), 0)
}

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
    { label: 'Vistoria — Vistoria + BDN', data: obra.data_etapa1, resp: obra.resp_etapa1 },
    { label: '1ª Etapa — Troca de Fechaduras', data: obra.data_etapa2, resp: obra.resp_etapa2 },
    { label: '2ª Etapa — Obra Final', data: obra.data_etapa3, resp: obra.resp_etapa3 },
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
    ${obra.porta_giratoria > 0 ? `<div style="margin-top:12px;font-size:14px">🚪 <b>Porta giratória:</b> ${obra.porta_giratoria} unidade(s)</div>` : ''}
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
// Pra Tecban só existem 2 etapas de verdade (Troca de Fechadura e Obra) - Vistoria não conta como
// etapa numerada pra eles. Mantém as 3 partes internamente (campo/dado não muda), só ajusta o
// rótulo mostrado: i=0 vira "Vistoria" solto, i=1/2 viram "1ª Etapa"/"2ª Etapa" (Shirley, 2026-08-20).
function rotuloEtapaUN(i) {
  return i === 0 ? 'Vistoria' : `${i}ª Etapa`
}

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
              {rotuloEtapaUN(i)}
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
  'AGUARDANDO PEDIDO DA TECBAN',
  'ELABORAR RM',
  'RM ENVIADA',
]
const ETAPAS_EN = ETAPAS_DESC
const ETAPAS_OUTRAS = ['Início','Em andamento','Conclusão','EMITIR NF','Faturamento']
// Processo de instalação/manutenção de ATM da rede Banco24Horas (alinhado com a Shirley em 2026-08-07)
// - bem mais simples que a régua de TRANSF UN/DESC PA (sem orçamento/ART/DCM - é só ir ao ponto e instalar).
const ETAPAS_ATM_B24H = ['OS ABERTA', 'AGENDAMENTO', 'OPERAÇÃO EM CAMPO', 'RELATÓRIO AO CLIENTE', 'BOOK FOTOGRÁFICO', 'ELABORAR RM', 'RM ENVIADA', 'AGUARDANDO PEDIDO DA TECBAN', 'EMITIR NF', 'NF EMITIDO']
// Mesmo processo do Banco24Horas vale pra Agibank e Crefisa (confirmado pela Shirley em 2026-08-07).

// Movimentação de BDN (caixa eletrônico) na Bradesco - mesma família de tipos do ATM, mas processo
// diferente do Banco24Horas: a OS oficial da Bradesco demora e só chega DEPOIS da operação (trava
// antes de elaborar a RM), e ainda tem uma 2ª espera (o "pedido") depois da RM, antes de faturar.
// Vistoria e operação em campo cada uma tem seu próprio book de checklist. Vale pra instalação,
// desativação, substituição e remanejamento de BDN - todos o mesmo processo (alinhado 2026-08-07).
const ETAPAS_BDN_BRADESCO = ['OS ABERTA', 'VISTORIA', 'AGENDAMENTO', 'OPERAÇÃO EM CAMPO', 'AGUARDANDO OS', 'ELABORAR RM', 'RM ENVIADA', 'AGUARDANDO PEDIDO', 'EMITIR NF', 'NF EMITIDO']
// Tipos de obra que são "movimentação de BDN" (não confundir com TRANSF UN/DESC PA, que são a
// transformação da agência em si - podem coexistir na mesma agência, com OS/contrato separados).
const TIPOS_BDN = ['INSTALAÇÃO ATM', 'DESATIVAÇÃO ATM', 'SUBSTITUIÇÃO ATM', 'REMANEJAMENTO ATM', 'SINALIZAÇÃO ATM', 'MANUTENÇÃO ATM', 'PINTURA ATM']
// Instalação, Desativação, Substituição (troca) e Remanejamento de Banco24Horas não têm fase de
// vistoria no processo real (Shirley, 2026-08-13) - diferente de Bradesco, que tem vistoria própria.
// Sinalização também não tem vistoria (Shirley, 2026-08-26) - entrou na lista pra sumir o campo
// "Data da vistoria" e, no lugar, ganhar a tela de "Data e hora de início da obra" (data da
// operação), igual as demais desse grupo.
const SEM_VISTORIA_BANCO24H = ['INSTALAÇÃO ATM', 'DESATIVAÇÃO ATM', 'SUBSTITUIÇÃO ATM', 'REMANEJAMENTO ATM', 'SINALIZAÇÃO ATM']
// Tela "Consulta ARS e agendamento" + "Dia da obra - visitas de campo" (ARS, EC, registros de
// atividade) estendida de Banco24Horas pra AgiBank/Crefisa também (Shirley, 2026-08-19) - essas redes
// SEGUEM tendo vistoria própria (diferente de Banco24Horas), então SEM_VISTORIA_BANCO24H continua
// controlando só a régua de vistoria; esta função controla só a tela extra de operação de campo.
const REDES_OPERACAO_CAMPO = ['BANCO24HORAS', 'AGIBANK', 'CREFISA', 'BRADESCO']
// Bradesco não tem ARS nenhum (Shirley, 2026-08-20) - só contato + data confirmada, sem o
// checkbox/tabela de critério de segurança nem autorização de mudança.
const REDES_SEM_ARS = ['BRADESCO']
function temTelaOperacaoCampo(rede, tipo) {
  return REDES_OPERACAO_CAMPO.includes(rede) && SEM_VISTORIA_BANCO24H.includes(tipo)
}
// TRANSF UN também ganhou (2026-08-20) o registro de visitas extras/retornos ao ponto (ex: troca de
// vidro depois da 3ª etapa) - mesma mecânica do "Dia da obra" do ATM, mas sem o gate de Relatório ao
// Cliente (que não existe pra TRANSF UN) nem os campos de ARS. Manutenção ATM, Sinalização ATM e
// Pintura ATM ganharam o mesmo registro simples de visitas (2026-08-25, Shirley) - sem checklist
// ARS, só data + equipe + descrição livre (atividade "Outros"), igual TRANSF UN.
function temVisitasDeCampo(rede, tipo) {
  return temTelaOperacaoCampo(rede, tipo) || tipo === 'TRANSF UN' || tipo === 'MANUTENÇÃO ATM' || tipo === 'SINALIZAÇÃO ATM' || tipo === 'PINTURA ATM'
}
// Eventos de uma obra pra um dia especifico do Cenario - usado tanto pra montar os cards por
// estado quanto pra filtrar a lista de baixo quando um card e clicado (Shirley, 2026-08-19: antes o
// clique no card so filtrava por estado, ignorando o dia selecionado, e mostrava a pipeline inteira
// daquele estado - pendencias de qualquer dia - em vez de so o previsto pra aquele dia).
function eventosCenarioObra(o, dia) {
  const ehBDN = TIPOS_BDN.includes(o.tipo)
  const tipoCurto = (o.tipo || '').replace(/\s*ATM\s*$/i, '').trim()
  const eventos = []
  if (o.data_vistoria === dia) eventos.push({ categoria: ehBDN ? `Vistoria de ${tipoCurto}` : 'Vistoria', familia: ehBDN ? 'movimentacao' : 'obra' })
  if (o.tipo === 'TRANSF UN') {
    // TRANSF UN não usa mais um campo solto de "data de início" - lê direto as datas reais da 1ª
    // Etapa (Troca de Fechaduras) e 2ª Etapa (Obra Final), cada uma seu próprio evento no dia certo
    // (Shirley, 2026-08-20).
    if (o.data_etapa2 === dia) eventos.push({ categoria: '1ª Etapa (Fechaduras)', familia: 'obra' })
    if (o.data_etapa3 === dia) eventos.push({ categoria: '2ª Etapa (Obra Final)', familia: 'obra' })
  } else {
    // Qualquer rede/tipo com tela de operação de campo usa a "Data e hora de início da obra
    // (confirmada com o cliente)" de lá - o campo genérico "Início" de Datas da obra foi escondido
    // pra essas combinações (redundante), então não pode mais ser a fonte (Shirley, 2026-08-20).
    const dataExec = temTelaOperacaoCampo(o.rede, o.tipo)
      ? paraIsoDataObraTexto(o.data_inicio_obra_texto)
      : (o.data_obra_inicio || null)
    if (dataExec === dia) eventos.push({ categoria: ehBDN ? tipoCurto : 'Obra', familia: ehBDN ? 'movimentacao' : 'obra' })
  }
  if (temVisitasDeCampo(o.rede, o.tipo)) {
    const registros = Array.isArray(o.registros_operacao_campo) ? o.registros_operacao_campo : []
    registros.forEach(r => {
      if (r.data !== dia) return
      ;(r.atividades || []).forEach(a => eventos.push({ categoria: `Visita: ${a.atividade}`, familia: ehBDN ? 'movimentacao' : 'obra' }))
    })
  }
  return eventos
}
// Próxima atividade agendada de uma obra (a mais próxima de hoje pra frente), pra mostrar no card
// da lista com data (e hora, quando existir) em evidência - mesmas fontes de data do Cenário acima,
// só que varrendo todas as datas futuras em vez de checar um dia específico (Shirley, 2026-08-25).
function proximaAtividadeObra(o) {
  const hoje = hojeIso()
  const candidatos = []
  const ehBDN = TIPOS_BDN.includes(o.tipo)
  const tipoCurto = (o.tipo || '').replace(/\s*ATM\s*$/i, '').trim()
  if (o.data_vistoria) candidatos.push({ data: o.data_vistoria, hora: null, label: ehBDN ? `Vistoria de ${tipoCurto}` : 'Vistoria' })
  if (o.tipo === 'TRANSF UN') {
    if (o.data_etapa2) candidatos.push({ data: o.data_etapa2, hora: null, label: '1ª Etapa (Fechaduras)' })
    if (o.data_etapa3) candidatos.push({ data: o.data_etapa3, hora: null, label: '2ª Etapa (Obra Final)' })
  } else {
    const usaConfirmada = temTelaOperacaoCampo(o.rede, o.tipo)
    const dataExec = usaConfirmada ? paraIsoDataObraTexto(o.data_inicio_obra_texto) : (o.data_obra_inicio || null)
    if (dataExec) candidatos.push({ data: dataExec, hora: usaConfirmada ? (o.hora_inicio_obra_texto || null) : null, label: ehBDN ? tipoCurto : 'Obra' })
  }
  if (temVisitasDeCampo(o.rede, o.tipo)) {
    const registros = Array.isArray(o.registros_operacao_campo) ? o.registros_operacao_campo : []
    registros.forEach(r => {
      if (!r.data) return
      ;(r.atividades || []).forEach(a => candidatos.push({ data: r.data, hora: null, label: `Visita: ${a.atividade}` }))
    })
  }
  if (!candidatos.length) return null
  // Mostra sempre a data mais próxima de hoje (passada ou futura) - não só futura -, igual o
  // Entrada Pipeline nunca some (Shirley, 2026-08-26): quando a obra já passou da execução, mostra
  // a última data registrada; quando ainda não chegou lá, mostra a data agendada mais próxima.
  const comDistancia = candidatos.map(c => ({ ...c, dist: Math.abs(Math.floor((new Date(c.data) - new Date(hoje)) / 86400000)) }))
  comDistancia.sort((a, b) => a.dist === b.dist ? (a.hora || '').localeCompare(b.hora || '') : a.dist - b.dist)
  return comDistancia[0]
}
// Itens do ARS que descrevem onde/como a máquina fica fixada - mais de um pode se aplicar
// ao mesmo tempo (ex: "encostada em pilar" + "fixação química").
const ITENS_SEGURANCA_BANCO24H = ['Máquina encostada em parede de alvenaria', 'Encostada em pilar', 'Em cima de viga', 'Fixação concretada', 'Fixação química', 'Fixação projeto T', 'Construção de meia parede']
// Atividades possíveis no dia da obra (rede Banco24Horas) - podem acontecer em visitas separadas.
// As 5 obrigatórias travam a liberação do "Relatório ao Cliente" (ver operacaoCampoCompleta). Vistoria
// e Outros são registráveis mas opcionais - não emperram esse gate (Shirley, 2026-08-19).
const ATIVIDADES_OPERACAO_CAMPO_OBRIGATORIAS = ['Base', 'Instalação', 'Habilitação', 'Construção de parede', 'Instalação de sinalização']
// Desativação tem um "o que foi feito" diferente de Instalação (Shirley, 2026-08-19) - não faz
// sentido Base/Habilitação/etc, e sim desmontar o ponto e devolver o local ao estado original.
const ATIVIDADES_OPERACAO_CAMPO_DESATIVACAO_OBRIGATORIAS = ['Remoção de ATM', 'Recomposição de piso', 'Pintura de parede']
// Bradesco (BDN) tem "o que foi feito" próprio - abertura de cofre e remoção/instalação do BDN, com
// troca de fechadura quando coincide com a TRANSF UN da mesma agência (Shirley, 2026-08-20).
const ATIVIDADES_OPERACAO_CAMPO_BRADESCO_OBRIGATORIAS = ['Abertura de cofre', 'Remoção/Instalação de BDN']
// Sinalização pode ser instalação OU remoção da placa/sinalização em si (Shirley, 2026-08-26) -
// nenhuma obrigatória (não trava relatório), mas com "o que foi feito" próprio, igual Desativação.
const ATIVIDADES_OPERACAO_CAMPO_SINALIZACAO = ['Instalação da sinalização', 'Remoção da sinalização']
function atividadesOperacaoCampoObrigatorias(rede, tipo) {
  if (tipo === 'TRANSF UN' || tipo === 'MANUTENÇÃO ATM' || tipo === 'SINALIZAÇÃO ATM' || tipo === 'PINTURA ATM') return []
  if (rede === 'BRADESCO') return ATIVIDADES_OPERACAO_CAMPO_BRADESCO_OBRIGATORIAS
  return tipo === 'DESATIVAÇÃO ATM' ? ATIVIDADES_OPERACAO_CAMPO_DESATIVACAO_OBRIGATORIAS : ATIVIDADES_OPERACAO_CAMPO_OBRIGATORIAS
}
function atividadesOperacaoCampo(rede, tipo) {
  // TRANSF UN, Manutenção ATM e Pintura ATM: só "Outros" (visita avulsa, descrita em texto livre) -
  // Shirley, 2026-08-20 (TRANSF UN), 2026-08-25 (demais), sem lista fechada de motivo ainda (mesmo
  // padrão de deixar crescer com o tempo). Sinalização ganhou lista própria em 2026-08-26 (ver acima).
  if (tipo === 'SINALIZAÇÃO ATM') return [...ATIVIDADES_OPERACAO_CAMPO_SINALIZACAO, 'Outros']
  if (tipo === 'TRANSF UN' || tipo === 'MANUTENÇÃO ATM' || tipo === 'PINTURA ATM') return ['Outros']
  if (rede === 'BRADESCO') return [...ATIVIDADES_OPERACAO_CAMPO_BRADESCO_OBRIGATORIAS, 'Troca de fechadura', 'Vistoria', 'Outros']
  return tipo === 'DESATIVAÇÃO ATM'
    ? [...ATIVIDADES_OPERACAO_CAMPO_DESATIVACAO_OBRIGATORIAS, 'Outros']
    : [...ATIVIDADES_OPERACAO_CAMPO_OBRIGATORIAS, 'Vistoria', 'Outros']
}
// Motivos de impedimento pra Base já definidos (Shirley, 2026-08-13). Motivos das outras atividades
// ainda não foram levantados - usar texto livre até ela trazer a lista fechada.
const MOTIVOS_IMPEDIMENTO_BASE = ['Não autorizado o tipo de fixação', 'Local incompatível — laje', 'Local incompatível — interfere elétrica ou hidráulica', 'Piso em concreto armado usinado']
// Motivo de impedimento da Sinalização (Shirley, 2026-08-26) - indica se a atividade precisou de
// demolição/reconstituição de piso, em vez de ocorrer conforme previsto (sem isso).
const MOTIVOS_IMPEDIMENTO_SINALIZACAO = ['Demolição e reconstituição de piso', 'Outro']
// Motivos de impedimento do Bradesco (BDN) - lista fechada pra qualquer atividade dessa rede, ao
// contrário de Base (só se aplica àquela atividade específica) - Shirley, 2026-08-20.
const MOTIVOS_IMPEDIMENTO_BRADESCO = ['Sem senha do cofre (Taurus/robô)', 'Atraso de transporte', 'Outro']

// Envio do relatório da obra pra Tecban (Shirley, 2026-08-18, endereço ajustado no mesmo dia pra
// Implantacao.B24horas em vez de gestaopagamentos2026 - esse é o endereço que a Shirley pediu pra
// usar pro relatório individual por obra, mesmo endereço que o Fabio já usa pro report diário).
const EMAIL_RM_TECBAN = 'Implantacao.B24horas@tecban.com.br'
const EMAIL_CC_OPERACAO_GRUPOPG = 'operacao@grupopg.com.br'
// E-mail de solicitação de correção de pedido divergente (Shirley, 2026-08-20) - endereço diferente
// do relatório ao cliente acima, é o time de pagamentos/gestão de pedidos da Tecban.
const EMAIL_CORRECAO_PEDIDO_TECBAN = 'gestaopagamentos2026@tecban.com.br'
const EMAIL_CC_CORRECAO_PEDIDO = 'rayan.miranda@servicosintegradostecban.com.br'
// Envio de e-mail à Tecban passa por uma Edge Function no Supabase (não fala direto com o Apps
// Script) - assim o segredo do webhook nunca fica exposto no código do navegador (Shirley/Claude,
// 2026-08-25). A Edge Function confere a sessão de quem chama antes de repassar o pedido.
const EDGE_FUNCTION_TECBAN_URL = 'https://chlccnbyntjrbxptrmgf.supabase.co/functions/v1/enviar-email-tecban'
// Fase de teste - só quem está nessa lista vê o botão de enviar (Shirley, 2026-08-18; lista
// ampliada em 2026-08-25 pra incluir toda a equipe de escritório que confere pedido).
const EMAILS_ENVIO_RELATORIO = ['shirley@grupopg.com.br', 'fabioesteves@grupopg.com.br', 'daniela.ferreira@grupopg.com.br', 'glauce@grupopg.com.br', 'carol.carvalho@grupopg.com.br', 'bruna@grupopg.com.br', 'anderson@grupopg.com.br']
// Totalizadores de valor (R$) no topo do dashboard restritos a essas 3 pessoas (Shirley,
// 2026-08-18) - mais restrito que podeVerValores, que continua valendo pras outras telas
// (Disponível pra Faturar, Histórico, Despesas, valor por obra).
const EMAILS_VER_VALORES_TOPO = ['shirley@grupopg.com.br', 'aline.roza@grupopg.com.br', 'leandro@grupopg.com.br']
// Custos terceirizados/despesas de pessoal (dentro de cada obra) e a aba "Despesas" restritos a
// essas 4 pessoas (Shirley, 2026-08-20) - antes abertos pra todo mundo com podeVerValores
// (admin/administrativo/financeiro), o que incluía toda a equipe de escritório.
const EMAILS_CUSTOS_DESPESAS = ['shirley@grupopg.com.br', 'aline.roza@grupopg.com.br', 'leandro@grupopg.com.br', 'anderson@grupopg.com.br']
// Cores dos cards do "Cenário por estado" no dashboard (2026-08-18) - só decoração, cicla por estado.
const CENARIO_CORES = ['#2D3A8C', '#0F766E', '#C2410C', '#7C3AED', '#0369A1', '#BE185D', '#4D7C0F']

// ===== Importação de obras novas de movimentação a partir do relatório "ReportPersonalizado" do SIGE =====
// (alinhado com a Shirley em 2026-08-12, mesma família de regras da importação de 06-07/08)
const REDE_24H_VARIANTES_SIGE = ['BANCO24HORAS', 'BANCXO24HORAS', 'B24HS', 'BANCO24OHRAS', 'BRANCO24HORAS', 'BANC24HORAS', 'B24HORAS', 'BANCO 24 HORAS']
function normalizaRedeImportacaoSige(bruto) {
  const s = String(bruto || '').toUpperCase().trim()
  if (!s) return null
  if (REDE_24H_VARIANTES_SIGE.includes(s)) return 'BANCO24HORAS'
  if (s === 'AGINBANK') return 'AGIBANK'
  return s
}
// null = exclui (OBRAS/PINTURA/INFRA), undefined = não reconhecido (exclui e reporta separado).
// "VISTORIA" isolada vira INSTALAÇÃO ATM (decisão da Shirley 2026-08-12 - a fase de vistoria tem
// Código de SIGE próprio, separado da obra de movimentação; tratar como instalação evita duplicar
// depois quando a movimentação de verdade também virar obra).
function classificaTipoMovimentacaoSige(bruto) {
  const s = String(bruto || '').toUpperCase()
  if (s.includes('VISTOR')) return 'INSTALAÇÃO ATM'
  if (s.includes('OBRA')) return null
  if (s.includes('PINTURA')) return null
  if (s.includes('INFRA') || s.includes('ELETR') || s.includes('ELÉTR')) return null
  // "DESINSTALAÇÃO" contém "INSTAL" como substring - precisa ser pego aqui, antes do check
  // genérico de INSTAL lá embaixo, senão cai errado em INSTALAÇÃO ATM (Shirley, 2026-08-19).
  if (s.includes('DESATIV') || s.includes('DESINSTAL')) return 'DESATIVAÇÃO ATM'
  if (s.includes('SUBST') || s.includes('SUSBT') || s.includes('SUBSIT')) return 'SUBSTITUIÇÃO ATM'
  if (s.includes('REMANEJ')) return 'REMANEJAMENTO ATM'
  if (s.includes('SINALIZ')) return 'SINALIZAÇÃO ATM'
  if (s.includes('MANUTEN')) return 'MANUTENÇÃO ATM'
  if (s.includes('INSTAL') || s.includes('INSTA') || s.includes('REINSTAL')) return 'INSTALAÇÃO ATM'
  return undefined
}
const STATUS_MOVIMENTACAO_NAO_BRADESCO_SIGE = {
  'BOOK DE VISTORIA ENVIADO': 'BOOK FOTOGRÁFICO', 'EMITIR NF': 'EMITIR NF', 'RM ENVIADA': 'RM ENVIADA',
  'AGENDADO': 'AGENDAMENTO', 'ELABORAR RM': 'ELABORAR RM', 'AGUARDANDO AGENDAMENTO': 'OS ABERTA',
  'PEDIDO ERRADO PEDIMOS CORREÇÃO': 'AGUARDANDO PEDIDO DA TECBAN', 'AGUARDANDO N DA ORDEM': 'AGUARDANDO PEDIDO DA TECBAN',
  'ORÇAMENTO ENVIADO AGUARDANDO APROVAÇÃO': 'OS ABERTA', 'FATURADO': 'NF EMITIDO',
}
const STATUS_MOVIMENTACAO_BRADESCO_SIGE = {
  'BOOK DE VISTORIA ENVIADO': 'VISTORIA', 'EMITIR NF': 'EMITIR NF', 'RM ENVIADA': 'RM ENVIADA',
  'AGENDADO': 'AGENDAMENTO', 'ELABORAR RM': 'ELABORAR RM', 'AGUARDANDO AGENDAMENTO': 'OS ABERTA',
  'PEDIDO ERRADO PEDIMOS CORREÇÃO': 'AGUARDANDO PEDIDO', 'AGUARDANDO N DA ORDEM': 'AGUARDANDO OS',
  'ORÇAMENTO ENVIADO AGUARDANDO APROVAÇÃO': 'OS ABERTA', 'FATURADO': 'NF EMITIDO',
}
function excelSerialParaIso(serial) {
  const n = Number(serial)
  if (!n || isNaN(n)) return null
  return new Date((n - 25569) * 86400 * 1000).toISOString().slice(0, 10)
}

const STATUS_ETAPA1_DONE = ['EM ANDAMENTO','VISTORIA REALIZADA ELABORAR BOOK E ORÇAMENTO','BOOK E ORÇAMENTOS ENVIADOS','ORÇAMENTO APROVADO/REPROVADO','OBRA EMITIR ART','DCM E TERMOS ENTREGUES AO CAMPO','TERMOS E DCMS ASSINADOS','BDNS, MOBILIÁRIOS E EQUIPAMENTO REMOVIDOS','FOTOS DO AMBIENTE VAZIO','ELABORAR QRCODE OU BOOK DE CONCLUSÃO','ELABORAR BOOK','BOOK PENDENTE','BOOK DE CONCLUSÃO','QR CODE','AGUARDANDO PEDIDO DA TECBAN','ELABORAR RM','RM ENVIADA','RM ENVIADA (ART)','RM PRONTA AGUARDANDO ORDEM','EMITIR NF','NF EMITIDO','Em andamento','Conclusão','Faturamento']
const STATUS_ETAPA2_DONE = ['AGUARDANDO PEDIDO DA TECBAN','ELABORAR RM','RM ENVIADA','RM ENVIADA (ART)','RM PRONTA AGUARDANDO ORDEM','EMITIR NF','NF EMITIDO','Conclusão','Faturamento']
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

function getEtapas(rede, tipo) {
  if (TIPOS_BDN.includes(tipo)) {
    if (rede === 'BRADESCO') return ETAPAS_BDN_BRADESCO
    return ETAPAS_ATM_B24H // Banco24Horas/Agibank/Crefisa - mesmo processo. Demais bancos (Banestes,
    // Banconordeste) ainda não alinhados com a Shirley - usa esse como default por ora.
  }
  return ETAPAS_DESC
}

function getEtapaAtual(status, rede, tipo) {
  const etapas = getEtapas(rede, tipo)
  const n = etapas.length
  const idx = etapas.findIndex(e => e.toLowerCase() === (status||'').toLowerCase())
  if (idx !== -1) return idx + 1
  if (TIPOS_BDN.includes(tipo)) return 1
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

function SidebarRH({ ativa, onChange, totalColaboradores, totalHolerites }) {
  const itens = [
    { id:'colaboradores', label:'Colaboradores', count: totalColaboradores },
    { id:'fechamento', label:'Fechamento de Ponto', count:null },
    { id:'holerites', label:'Pagamentos realizados', count: totalHolerites },
    { id:'horas_extras', label:'Holerites', count:null },
  ]
  return (
    <div style={{ width:170, flexShrink:0, background:'#fff', borderRight:'1px solid #E0E8F0', minHeight:'70vh' }}>
      {itens.map(s => (
        <div key={s.id} onClick={() => onChange(s.id)}
          style={{ padding:'12px 14px', fontSize:12, fontWeight: ativa===s.id ? 700 : 500, cursor:'pointer',
            color: ativa===s.id ? '#5B21B6' : '#475569', background: ativa===s.id ? '#F5F3FF' : 'transparent',
            borderLeft: ativa===s.id ? '3px solid #7C3AED' : '3px solid transparent', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>{s.label}</span>
          {s.count != null && (
            <span style={{ fontSize:10, background: ativa===s.id ? '#7C3AED' : '#E0E8F0', color: ativa===s.id ? '#fff' : '#64748B', borderRadius:10, padding:'1px 6px', fontWeight:700 }}>
              {s.count}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function SeletorEquipe({ titulo, selecionados, onChangeSelecionados, terceirizado, onChangeTerceirizado, terceirizadoTexto, onChangeTerceirizadoTexto, bloqueado, mensagemBloqueio }) {
  const [busca, setBusca] = useState('')
  if (bloqueado) {
    return (
      <div>
        <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>{titulo}</div>
        <div style={{ fontSize:12, color:'#92400E', background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'8px 10px' }}>
          🔒 {mensagemBloqueio || 'Bloqueado'}
        </div>
      </div>
    )
  }
  const normaliza = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const sugestoes = busca.trim()
    ? COLABORADORES.filter(nome => !selecionados.includes(nome) && normaliza(nome).includes(normaliza(busca.trim())))
    : []
  function adicionar(nome) {
    onChangeSelecionados([...selecionados, nome])
    setBusca('')
  }
  return (
    <div>
      <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>{titulo}</div>
      {(selecionados.length > 0 || terceirizado) && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
          {selecionados.map(nome => (
            <div key={nome} style={{ display:'flex', alignItems:'center', gap:6, background:'#D1FAE5', border:'1px solid #A7F3D0', borderRadius:20, padding:'4px 6px 4px 12px' }}>
              <span style={{ fontSize:12, color:'#065F46', fontWeight:600 }}>👤 {nome}</span>
              <span onClick={() => onChangeSelecionados(selecionados.filter(n => n !== nome))}
                style={{ fontSize:12, color:'#065F46', cursor:'pointer', fontWeight:700, background:'#fff', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</span>
            </div>
          ))}
          {terceirizado && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:20, padding:'4px 12px' }}>
              <span style={{ fontSize:12, color:'#3730A3', fontWeight:600 }}>🔧 {TERCEIRIZADO_PREFIXO}{terceirizadoTexto.trim() || '(não informado)'}</span>
            </div>
          )}
        </div>
      )}
      <div style={{ position:'relative' }}>
        <input value={busca} onChange={e => setBusca(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && sugestoes.length > 0) adicionar(sugestoes[0]) }}
          placeholder="Digite o nome da pessoa..."
          style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
        {busca.trim() && (
          <div style={{ border:'1px solid #E0E8F0', borderRadius:8, marginTop:4, maxHeight:180, overflowY:'auto' }}>
            {sugestoes.length > 0 ? sugestoes.map(nome => (
              <div key={nome} onClick={() => adicionar(nome)}
                style={{ padding:'8px 10px', fontSize:13, color:'#1A2340', cursor:'pointer', borderBottom:'1px solid #F0F4F8' }}
                onMouseDown={e => e.preventDefault()}>
                👤 {nome}
              </div>
            )) : (
              <div style={{ padding:'8px 10px', fontSize:12, color:'#9CA3AF' }}>Nenhum nome encontrado</div>
            )}
          </div>
        )}
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginTop:8 }}>
        <input type="checkbox" checked={terceirizado} onChange={e => onChangeTerceirizado(e.target.checked)} />
        <span style={{ fontSize:13, color:'#1A2340', fontWeight:600 }}>Terceirizado</span>
      </label>
      {terceirizado && (
        <input value={terceirizadoTexto} onChange={e => onChangeTerceirizadoTexto(up(e.target.value))}
          placeholder="Nome da empresa/pessoa terceirizada"
          style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginTop:8 }} />
      )}
    </div>
  )
}

function ColaboradorRHRow({ c, onUpdate, onRemove, emailsLogin, perfisLogin }) {
  const [expandido, setExpandido] = useState(false)
  const [novaIdadeFilho, setNovaIdadeFilho] = useState('')
  const [novoUniformeItem, setNovoUniformeItem] = useState('')
  const [novoUniformeQtd, setNovoUniformeQtd] = useState('1')
  const [novoUniformeData, setNovoUniformeData] = useState('')
  const [novoEpiItem, setNovoEpiItem] = useState('')
  const [novoEpiData, setNovoEpiData] = useState('')
  const [novoEpiValidade, setNovoEpiValidade] = useState('')
  const [novoDescontoMotivo, setNovoDescontoMotivo] = useState('MULTA')
  const [novoDescontoMes, setNovoDescontoMes] = useState(mesAtualIso())
  const [novoDescontoErro, setNovoDescontoErro] = useState('')
  const [novoDescontoValor, setNovoDescontoValor] = useState('')
  const [novoDescontoObs, setNovoDescontoObs] = useState('')
  const [novoDescontoParcelas, setNovoDescontoParcelas] = useState('1')
  const [novoDescontoValorOriginal, setNovoDescontoValorOriginal] = useState('')
  const [novoDescontoRenainf, setNovoDescontoRenainf] = useState('')
  const [novoDescontoRenainfOriginal, setNovoDescontoRenainfOriginal] = useState('')
  const [ocultarMultasDesconto, setOcultarMultasDesconto] = useState(false)

  const vencimentoAso = somaAnos(c.data_aso, 1)
  const statusAso = statusVencimento(vencimentoAso)
  const statusCnh = statusVencimento(c.data_vencimento_cnh)
  const previsaoFerias = proximaFeriasEstimativa(c.data_admissao)
  const filhos = Array.isArray(c.filhos) ? c.filhos : []
  const uniformes = Array.isArray(c.uniformes) ? c.uniformes : []
  const epis = Array.isArray(c.epis) ? c.epis : []
  const descontos = Array.isArray(c.descontos) ? c.descontos : []

  const precisa = precisaNR(c.email, perfisLogin)
  const statusNr6 = interpretaStatusDoc(c.nr6, NR_VALIDADE_ANOS.nr6, precisa)
  const statusNr10 = interpretaStatusDoc(c.nr10, NR_VALIDADE_ANOS.nr10, precisa)
  const statusNr33 = interpretaStatusDoc(c.nr33, NR_VALIDADE_ANOS.nr33, precisa)
  const statusNr35 = interpretaStatusDoc(c.nr35, NR_VALIDADE_ANOS.nr35, precisa)
  const statusNr12 = interpretaStatusDoc(c.nr12, NR_VALIDADE_ANOS.nr12, precisa)
  const pontoPendentes = mesesPendentes(c.ponto_assinado_meses, 2026)
  const holeriteAdiantPendentes = mesesPendentes(c.holerite_adiantamento_meses, 2026)
  const holeritePagtoPendentes = mesesPendentes(c.holerite_pagamento_meses, 2026)

  const listaPendencias = listaPendenciasRH(c, perfisLogin)
  const pendencias = listaPendencias.length

  return (
    <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, marginBottom:8, padding:'10px 14px' }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:8 }}>
        <input defaultValue={`${c.nome}${c.sobrenome ? ' ' + c.sobrenome : ''}`} onBlur={e => {
          const nomeCompleto = e.target.value.trim()
          const atual = `${c.nome}${c.sobrenome ? ' ' + c.sobrenome : ''}`
          if (nomeCompleto && nomeCompleto !== atual) {
            const partes = nomeCompleto.split(/\s+/)
            onUpdate({ nome: partes[0], sobrenome: partes.slice(1).join(' ') || null })
          }
        }} style={{ flex:2, minWidth:180, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', fontWeight:600, boxSizing:'border-box' }} />
        <select value={c.base_cadastrado || ''} onChange={e => onUpdate({ base_cadastrado: e.target.value || null })}
          style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', background:'#fff' }}>
          <option value="">Base cadastrado —</option>
          {BASES_GRUPOPG.map(b => <option key={b.nome} value={b.nome}>{b.label}</option>)}
        </select>
        <select value={c.base_atua || ''} onChange={e => onUpdate({ base_atua: e.target.value || null })}
          style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', background:'#fff' }}>
          <option value="">Base onde atua —</option>
          {BASES_GRUPOPG.map(b => <option key={b.nome} value={b.nome}>{b.label}</option>)}
        </select>
        <select value={c.email || ''} onChange={e => onUpdate({ email: e.target.value || null })}
          style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color: c.email ? '#1A2340' : '#991B1B', background:'#fff' }}>
          <option value="">E-mail de login —</option>
          {emailsLogin.map(em => <option key={em} value={em}>{em}</option>)}
        </select>
        <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#64748B', cursor:'pointer' }}>
          <input type="checkbox" checked={c.ativo !== false} onChange={e => onUpdate({ ativo: e.target.checked })} />
          Ativo
        </label>
        {pendencias > 0
          ? <span title={listaPendencias.join(' · ')} style={{ fontSize:11, fontWeight:700, padding:'4px 9px', borderRadius:20, background:'#FEE2E2', color:'#991B1B', cursor:'help' }}>⚠ {pendencias} pendência{pendencias>1?'s':''}</span>
          : <span style={{ fontSize:11, fontWeight:700, padding:'4px 9px', borderRadius:20, background:'#D1FAE5', color:'#065F46' }}>✓ Em dia</span>}
        <button onClick={() => setExpandido(v => !v)}
          style={{ padding:'5px 10px', background: expandido ? '#EDE9FE' : '#F1F5F9', border:'1px solid #E0E8F0', borderRadius:6, fontSize:11, fontWeight:600, color:'#5B21B6', cursor:'pointer' }}>
          {expandido ? '▲ Menos detalhes' : '▼ Mais detalhes'}
        </button>
        <span onClick={onRemove} style={{ fontSize:13, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
      </div>

      {pendencias > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
          {listaPendencias.map((p, idx) => (
            <span key={idx} style={{ fontSize:10.5, fontWeight:600, padding:'3px 8px', borderRadius:6, background:'#FEE2E2', color:'#991B1B' }}>{p}</span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end', paddingTop:8, borderTop:'1px solid #F1F5F9' }}>
        <div>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Admissão</label>
          <input type="date" value={c.data_admissao || ''} onChange={e => onUpdate({ data_admissao: e.target.value || null })}
            style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
        </div>
        <div>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Próximas férias (estimativa)</label>
          <div style={{ fontSize:12, color:'#1A2340', fontWeight:600, padding:'6px 0' }}>{previsaoFerias ? isoToBr(previsaoFerias) : '—'}</div>
        </div>
        <div style={{ flex:1, minWidth:160 }}>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Período de férias (planilha/ref.)</label>
          <input defaultValue={c.ferias_periodo_atual || ''} onBlur={e => e.target.value !== (c.ferias_periodo_atual||'') && onUpdate({ ferias_periodo_atual: e.target.value || null })}
            style={{ width:'100%', padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Último ASO</label>
          <input type="date" value={c.data_aso || ''} onChange={e => onUpdate({ data_aso: e.target.value || null })}
            style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
        </div>
        <div>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Vencimento ASO (+1 ano)</label>
          {vencimentoAso
            ? <div style={{ fontSize:11, fontWeight:700, padding:'4px 8px', borderRadius:6, background:statusAso.bg, color:statusAso.cor, display:'inline-block' }}>{isoToBr(vencimentoAso)} · {statusAso.label}</div>
            : <div style={{ fontSize:12, color:'#888', padding:'6px 0' }}>—</div>}
          {c.aso_vencimento_mes && <div style={{ fontSize:10, color:'#888', marginTop:2 }}>Ref. RH: {c.aso_vencimento_mes}</div>}
        </div>
        <div>
          <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Vencimento CNH</label>
          <input type="date" value={c.data_vencimento_cnh || ''} onChange={e => onUpdate({ data_vencimento_cnh: e.target.value || null })}
            style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
          {statusCnh && <div style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6, background:statusCnh.bg, color:statusCnh.cor, display:'inline-block', marginTop:4 }}>{statusCnh.label}</div>}
        </div>
      </div>

      {expandido && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #F1F5F9', display:'flex', flexDirection:'column', gap:12 }}>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Data de nascimento</label>
              <input type="date" value={c.data_nascimento || ''} onChange={e => onUpdate({ data_nascimento: e.target.value || null })}
                style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            </div>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Nº calçado</label>
              <input value={c.numero_calcado || ''} onBlur={e => e.target.value !== (c.numero_calcado||'') && onUpdate({ numero_calcado: e.target.value || null })}
                style={{ width:70, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            </div>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Nº calça</label>
              <input value={c.numero_calca || ''} onBlur={e => e.target.value !== (c.numero_calca||'') && onUpdate({ numero_calca: e.target.value || null })}
                style={{ width:70, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            </div>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:3 }}>Nº camisa</label>
              <input value={c.numero_camisa || ''} onBlur={e => e.target.value !== (c.numero_camisa||'') && onUpdate({ numero_camisa: e.target.value || null })}
                style={{ width:70, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>Filhos ({filhos.length})</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              {filhos.map((idade, idx) => (
                <div key={idx} style={{ display:'flex', alignItems:'center', gap:4, background:'#F0F4F8', borderRadius:6, padding:'4px 8px' }}>
                  <span style={{ fontSize:12, color:'#1A2340' }}>{idade} anos</span>
                  <span onClick={() => onUpdate({ filhos: filhos.filter((_, i) => i !== idx) })} style={{ fontSize:12, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <input type="number" min="0" value={novaIdadeFilho} onChange={e => setNovaIdadeFilho(e.target.value)}
                placeholder="Idade do filho" style={{ width:110, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <button onClick={() => {
                if (novaIdadeFilho === '') return
                onUpdate({ filhos: [...filhos, Number(novaIdadeFilho)] })
                setNovaIdadeFilho('')
              }} style={{ padding:'6px 12px', background:'#5B21B6', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Adicionar</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#1A2340', cursor:'pointer' }}>
              <input type="checkbox" checked={!!c.celular_empresa} onChange={e => onUpdate({ celular_empresa: e.target.checked })} />
              Celular da empresa
            </label>
            {c.celular_empresa && (
              <input type="date" value={c.data_celular_empresa || ''} onChange={e => onUpdate({ data_celular_empresa: e.target.value || null })}
                style={{ padding:'5px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            )}
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#1A2340', cursor:'pointer' }}>
              <input type="checkbox" checked={!!c.computador_empresa} onChange={e => onUpdate({ computador_empresa: e.target.checked })} />
              Computador da empresa
            </label>
            {c.computador_empresa && (
              <input type="date" value={c.data_computador_empresa || ''} onChange={e => onUpdate({ data_computador_empresa: e.target.value || null })}
                style={{ padding:'5px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
            )}
            <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#1A2340', cursor:'pointer' }}>
              <input type="checkbox" checked={!!c.conta_telefone_empresa} onChange={e => onUpdate({ conta_telefone_empresa: e.target.checked })} />
              Conta de telefone paga pela empresa
            </label>
          </div>

          <div>
            <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>Uniformes entregues ({uniformes.length})</label>
            {uniformes.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:6 }}>
                {uniformes.map((u, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'4px 8px' }}>
                    <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>{u.item} — qtd {u.quantidade}{u.data ? ` — ${isoToBr(u.data)}` : ''}</span>
                    <span onClick={() => onUpdate({ uniformes: uniformes.filter((_, i) => i !== idx) })} style={{ fontSize:12, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <input value={novoUniformeItem} onChange={e => setNovoUniformeItem(e.target.value)}
                placeholder="Item (ex: Camisa)" style={{ flex:1, minWidth:120, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input type="number" min="1" value={novoUniformeQtd} onChange={e => setNovoUniformeQtd(e.target.value)}
                placeholder="Qtd" style={{ width:60, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input type="date" value={novoUniformeData} onChange={e => setNovoUniformeData(e.target.value)}
                style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <button onClick={() => {
                if (!novoUniformeItem.trim()) return
                onUpdate({ uniformes: [...uniformes, { item: novoUniformeItem.trim(), quantidade: Number(novoUniformeQtd) || 1, data: novoUniformeData || null }] })
                setNovoUniformeItem(''); setNovoUniformeQtd('1'); setNovoUniformeData('')
              }} style={{ padding:'6px 12px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Adicionar</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>EPIs entregues ({epis.length})</label>
            {epis.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:6 }}>
                {epis.map((ep, idx) => {
                  const statusEp = statusVencimento(ep.validade)
                  return (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'4px 8px' }}>
                      <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                        {ep.item}{ep.data ? ` — entregue ${isoToBr(ep.data)}` : ''}{ep.validade ? ` — validade ${isoToBr(ep.validade)}` : ''}
                      </span>
                      {statusEp && <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:5, background:statusEp.bg, color:statusEp.cor }}>{statusEp.label}</span>}
                      <span onClick={() => onUpdate({ epis: epis.filter((_, i) => i !== idx) })} style={{ fontSize:12, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <input value={novoEpiItem} onChange={e => setNovoEpiItem(e.target.value)}
                placeholder="Item (ex: Capacete)" style={{ flex:1, minWidth:120, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input type="date" value={novoEpiData} onChange={e => setNovoEpiData(e.target.value)}
                placeholder="Entrega" style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input type="date" value={novoEpiValidade} onChange={e => setNovoEpiValidade(e.target.value)}
                placeholder="Validade" style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <button onClick={() => {
                if (!novoEpiItem.trim()) return
                onUpdate({ epis: [...epis, { item: novoEpiItem.trim(), data: novoEpiData || null, validade: novoEpiValidade || null }] })
                setNovoEpiItem(''); setNovoEpiData(''); setNovoEpiValidade('')
              }} style={{ padding:'6px 12px', background:'#B45309', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Adicionar</button>
            </div>
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:5 }}>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>💰 Descontos/benefícios ({descontos.length})</label>
              <label style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#64748B', cursor:'pointer' }}>
                <input type="checkbox" checked={ocultarMultasDesconto} onChange={e => setOcultarMultasDesconto(e.target.checked)} />
                Ocultar multas
              </label>
            </div>
            {descontos.length > 0 && (() => {
              const descontosVisiveis = descontos
                .map((d, idx) => ({ d, idx }))
                .filter(({ d }) => !ocultarMultasDesconto || d.motivo !== 'MULTA')
              if (descontosVisiveis.length === 0) {
                return <div style={{ fontSize:11, color:'#94A3B8', marginBottom:6 }}>Só tem multa lançada, e está oculta.</div>
              }
              return (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:6 }}>
                  {descontosVisiveis.map(({ d, idx }) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'5px 10px' }}>
                      <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                        {rubricaLabel(d.motivo)} — {mesLabel(d.mes)} — {d.valor}{d.observacao ? ` (${d.observacao})` : ''}
                        {d.renainf ? ` · RENAINF ${d.renainf}` : ''}{d.renainf_original ? ` (orig. ${d.renainf_original})` : ''}
                      </span>
                      <span onClick={() => onUpdate({ descontos: descontos.filter((_, i) => i !== idx) })} style={{ fontSize:12, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>
                    </div>
                  ))}
                </div>
              )
            })()}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <select value={novoDescontoMotivo} onChange={e => setNovoDescontoMotivo(e.target.value)}
                style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', background:'#fff' }}>
                {RUBRICAS_DESCONTO.map(r => <option key={r.motivo} value={r.motivo}>{r.codigo ? `${r.label} (${r.codigo})` : r.label}</option>)}
              </select>
              {novoDescontoMotivo === 'MULTA' && (
                <>
                  <input value={novoDescontoRenainf} onChange={e => setNovoDescontoRenainf(e.target.value)}
                    title="Número RENAINF dessa multa"
                    placeholder="Nº RENAINF" style={{ width:130, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
                  <input value={novoDescontoRenainfOriginal} onChange={e => setNovoDescontoRenainfOriginal(e.target.value)}
                    title="Número RENAINF da multa que originou essa (ex: multa dobrada da empresa por não indicar o condutor)"
                    placeholder="Nº RENAINF original (se houver)" style={{ width:180, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
                </>
              )}
              {(() => {
                const [anoSel, mesSel] = (novoDescontoMes || mesAtualIso()).split('-')
                const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                const anoBase = new Date().getFullYear()
                const anos = [anoBase - 1, anoBase, anoBase + 1, anoBase + 2]
                return (
                  <>
                    <select value={mesSel} onChange={e => setNovoDescontoMes(`${anoSel}-${e.target.value}`)}
                      title="Mês da 1ª parcela" style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', background:'#fff' }}>
                      {nomesMeses.map((nome, i) => <option key={nome} value={String(i + 1).padStart(2, '0')}>{nome}</option>)}
                    </select>
                    <select value={anoSel} onChange={e => setNovoDescontoMes(`${e.target.value}-${mesSel}`)}
                      title="Ano da 1ª parcela" style={{ padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', background:'#fff' }}>
                      {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </>
                )
              })()}
              <input value={novoDescontoValorOriginal} onChange={e => setNovoDescontoValorOriginal(e.target.value)}
                title="Valor cheio da multa, antes do desconto - só pra registro, não é o que é parcelado"
                placeholder="Valor original (opcional)" style={{ width:150, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input value={novoDescontoValor} onChange={e => setNovoDescontoValor(e.target.value)}
                placeholder="Valor c/ desconto (ex: 116,94 ou 27,8%)" style={{ width:190, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input type="number" min="1" value={novoDescontoParcelas} onChange={e => setNovoDescontoParcelas(e.target.value)}
                title="Número de parcelas - divide o valor com desconto e já cria uma linha por mês" placeholder="Parcelas"
                style={{ width:80, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340' }} />
              <input value={novoDescontoObs} onChange={e => setNovoDescontoObs(e.target.value)}
                placeholder="Obs (opcional)" style={{ flex:1, minWidth:120, padding:'6px 8px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
              <button onClick={() => {
                if (!novoDescontoMes || !novoDescontoValor.trim()) {
                  setNovoDescontoErro(!novoDescontoMes ? 'Preenche o mês (confere se o ano também foi selecionado, não só o mês)' : 'Preenche o valor')
                  return
                }
                setNovoDescontoErro('')
                const valorDigitado = novoDescontoValor.trim()
                const numParcelas = Math.max(1, parseInt(novoDescontoParcelas) || 1)
                const obsBase = novoDescontoObs.trim()
                const valorOriginal = novoDescontoValorOriginal.trim()
                const prefixoOriginal = valorOriginal ? `Valor original R$ ${valorOriginal}` : ''
                const juntaObs = (...partes) => partes.filter(Boolean).join(' — ') || null
                const renainf = novoDescontoRenainf.trim() || null
                const renainfOriginal = novoDescontoRenainfOriginal.trim() || null
                if (numParcelas <= 1 || valorDigitado.includes('%')) {
                  onUpdate({ descontos: [...descontos, { motivo: novoDescontoMotivo, mes: novoDescontoMes, valor: valorDigitado, observacao: juntaObs(prefixoOriginal, obsBase), renainf, renainf_original: renainfOriginal }] })
                } else {
                  // divide o valor com desconto em centavos pra não perder/sobrar centavo
                  // por arredondamento - a última parcela absorve a diferença. O valor
                  // ORIGINAL (cheio, sem desconto) só entra na observação, de registro -
                  // quem é parcelado é sempre o valor já com desconto.
                  const centavosTotais = Math.round((Number(valorDigitado.replace(',', '.')) || 0) * 100)
                  const centavosPorParcela = Math.floor(centavosTotais / numParcelas)
                  let restante = centavosTotais
                  const novasLinhas = []
                  for (let p = 0; p < numParcelas; p++) {
                    const centavos = p === numParcelas - 1 ? restante : centavosPorParcela
                    restante -= centavos
                    novasLinhas.push({
                      motivo: novoDescontoMotivo,
                      mes: somaMeses(novoDescontoMes, p),
                      valor: (centavos / 100).toFixed(2).replace('.', ','),
                      observacao: juntaObs(prefixoOriginal, `${numParcelas}x (parcela ${p + 1}/${numParcelas})`, obsBase),
                      renainf, renainf_original: renainfOriginal,
                    })
                  }
                  onUpdate({ descontos: [...descontos, ...novasLinhas] })
                }
                setNovoDescontoMes(''); setNovoDescontoValorOriginal(''); setNovoDescontoValor(''); setNovoDescontoObs(''); setNovoDescontoParcelas('1'); setNovoDescontoRenainf(''); setNovoDescontoRenainfOriginal('')
              }} style={{ padding:'6px 12px', background:'#9A3412', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Adicionar</button>
            </div>
            {novoDescontoErro && <div style={{ fontSize:11, color:'#991B1B', marginTop:4 }}>⚠ {novoDescontoErro}</div>}
          </div>

          <div>
            <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>
              NRs (certificações de segurança) {!precisa && <span style={{ textTransform:'none', color:'#64748B' }}>— não se aplica (papel de login não é operacional)</span>}
            </label>
            {precisa && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { label:'NR6', campo:'nr6', status:statusNr6 },
                  { label:'NR10', campo:'nr10', status:statusNr10 },
                  { label:'NR33', campo:'nr33', status:statusNr33 },
                  { label:'NR35', campo:'nr35', status:statusNr35 },
                  { label:'NR12', campo:'nr12', status:statusNr12 },
                ].map(nr => {
                  const valor = c[nr.campo]
                  const ehData = valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)
                  return (
                    <div key={nr.campo} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                      <span style={{ fontSize:10, color:'#888', fontWeight:600 }}>{nr.label}</span>
                      <select value={!ehData ? (valor || '') : ''} disabled={ehData}
                        onChange={e => onUpdate({ [nr.campo]: e.target.value || null })}
                        style={{ width:118, padding:'4px 4px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:10.5, color:'#1A2340', background: ehData ? '#F1F5F9' : '#fff' }}>
                        <option value="">— sem info —</option>
                        <option value="NÃO TEM">Não tem</option>
                        <option value="FAZENDO CURSO">Fazendo curso</option>
                        <option value="SEM PRAZO">Sem prazo</option>
                        <option value="NÃO FAZ">Não faz</option>
                      </select>
                      <div style={{ display:'flex', gap:3, alignItems:'center' }}>
                        <input type="date" value={ehData ? valor : ''} onChange={e => onUpdate({ [nr.campo]: e.target.value || null })}
                          style={{ width:98, padding:'4px 4px', border:'1px solid #E0E8F0', borderRadius:6, fontSize:10.5, color:'#1A2340' }} />
                        {ehData && <span onClick={() => onUpdate({ [nr.campo]: null })} style={{ fontSize:12, color:'#EF4444', cursor:'pointer', fontWeight:700 }}>✕</span>}
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:5, background:nr.status.bg, color:nr.status.cor, textAlign:'center' }}>{nr.status.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>
                Cartão de ponto assinado — 2026 {pontoPendentes.length > 0 ? <span style={{ color:'#991B1B' }}>({pontoPendentes.length} mês(es) pendente(s))</span> : <span style={{ color:'#065F46' }}>(em dia)</span>}
                {pontoPendentes.length > 0 && (
                  <span onClick={() => onUpdate({ ponto_assinado_meses: mesesDoAnoAteAgora(2026) })}
                    style={{ marginLeft:8, color:'#2D3A8C', cursor:'pointer', textTransform:'none', fontWeight:700 }}>marcar todos até agora</span>
                )}
              </label>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {mesesDoAnoAteAgora(2026).map(m => {
                  const confirmado = Array.isArray(c.ponto_assinado_meses) && c.ponto_assinado_meses.includes(m)
                  return (
                    <span key={m} onClick={() => {
                      const lista = Array.isArray(c.ponto_assinado_meses) ? c.ponto_assinado_meses : []
                      onUpdate({ ponto_assinado_meses: confirmado ? lista.filter(x => x !== m) : [...lista, m] })
                    }} title={confirmado ? 'Clique para desmarcar' : 'Clique para marcar como assinado'}
                      style={{ cursor:'pointer', fontSize:10.5, fontWeight:700, padding:'4px 8px', borderRadius:6, background: confirmado ? '#D1FAE5' : '#FEE2E2', color: confirmado ? '#065F46' : '#991B1B' }}>
                      {mesLabel(m).split('/')[0]} {confirmado ? '✓' : '✕'}
                    </span>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>
                Holerite adiantamento — 2026 {holeriteAdiantPendentes.length > 0 ? <span style={{ color:'#991B1B' }}>({holeriteAdiantPendentes.length} mês(es) pendente(s))</span> : <span style={{ color:'#065F46' }}>(em dia)</span>}
                {holeriteAdiantPendentes.length > 0 && (
                  <span onClick={() => onUpdate({ holerite_adiantamento_meses: mesesDoAnoAteAgora(2026) })}
                    style={{ marginLeft:8, color:'#2D3A8C', cursor:'pointer', textTransform:'none', fontWeight:700 }}>marcar todos até agora</span>
                )}
              </label>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {mesesDoAnoAteAgora(2026).map(m => {
                  const confirmado = Array.isArray(c.holerite_adiantamento_meses) && c.holerite_adiantamento_meses.includes(m)
                  return (
                    <span key={m} onClick={() => {
                      const lista = Array.isArray(c.holerite_adiantamento_meses) ? c.holerite_adiantamento_meses : []
                      onUpdate({ holerite_adiantamento_meses: confirmado ? lista.filter(x => x !== m) : [...lista, m] })
                    }} title={confirmado ? 'Clique para desmarcar' : 'Clique para marcar como assinado'}
                      style={{ cursor:'pointer', fontSize:10.5, fontWeight:700, padding:'4px 8px', borderRadius:6, background: confirmado ? '#D1FAE5' : '#FEE2E2', color: confirmado ? '#065F46' : '#991B1B' }}>
                      {mesLabel(m).split('/')[0]} {confirmado ? '✓' : '✕'}
                    </span>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize:10, color:'#888', textTransform:'uppercase', display:'block', marginBottom:5 }}>
                Holerite pagamento — 2026 {holeritePagtoPendentes.length > 0 ? <span style={{ color:'#991B1B' }}>({holeritePagtoPendentes.length} mês(es) pendente(s))</span> : <span style={{ color:'#065F46' }}>(em dia)</span>}
                {holeritePagtoPendentes.length > 0 && (
                  <span onClick={() => onUpdate({ holerite_pagamento_meses: mesesDoAnoAteAgora(2026) })}
                    style={{ marginLeft:8, color:'#2D3A8C', cursor:'pointer', textTransform:'none', fontWeight:700 }}>marcar todos até agora</span>
                )}
              </label>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {mesesDoAnoAteAgora(2026).map(m => {
                  const confirmado = Array.isArray(c.holerite_pagamento_meses) && c.holerite_pagamento_meses.includes(m)
                  return (
                    <span key={m} onClick={() => {
                      const lista = Array.isArray(c.holerite_pagamento_meses) ? c.holerite_pagamento_meses : []
                      onUpdate({ holerite_pagamento_meses: confirmado ? lista.filter(x => x !== m) : [...lista, m] })
                    }} title={confirmado ? 'Clique para desmarcar' : 'Clique para marcar como assinado'}
                      style={{ cursor:'pointer', fontSize:10.5, fontWeight:700, padding:'4px 8px', borderRadius:6, background: confirmado ? '#D1FAE5' : '#FEE2E2', color: confirmado ? '#065F46' : '#991B1B' }}>
                      {mesLabel(m).split('/')[0]} {confirmado ? '✓' : '✕'}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function getGrupoObra(o) {
  const status = o.status || ''
  if (status === 'AGUARDANDO PEDIDO DA TECBAN') return 'pendencias'
  if (status === 'NF EMITIDO') return 'concluido'
  if (status === 'CANCELADO') return 'outros'
  if (['ELABORAR RM','ENVIAR RM'].includes(status)) return 'rm'
  if (['LAUDOS ASSINADOS','FOTOS DO AMBIENTE','BOOK DE CONCLUSÃO','QR CODE'].includes(status)) return 'elaborar'
  return 'em_andamento'
}

function Regua({ tipo, rede, status, lembretes, onRemoverLembrete }) {
  const etapas = getEtapas(rede, tipo)
  const atual = getEtapaAtual(status, rede, tipo)
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
              <div key={idx} title={l.autor ? `Colocado por ${l.autor}` : undefined} style={{ background:'#FEE2E2', color:'#991B1B', fontSize:7, fontWeight:700, borderRadius:4, padding:'2px 4px', marginTop:2, textAlign:'center', maxWidth:52, lineHeight:1.3, border:'1px solid #FECACA', wordBreak:'break-word' }}>
                ⚠ {l.texto}
                {l.autor && <div style={{ fontWeight:400, fontSize:6, marginTop:1, opacity:.8 }}>{l.autor}</div>}
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
  const [papel, setPapel] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [obras, setObras] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroRede, setFiltroRede] = useState('')
  const [mostrarCenario, setMostrarCenario] = useState(true)
  const [rhSubaba, setRhSubaba] = useState('colaboradores')
  const [filtroCenarioUF, setFiltroCenarioUF] = useState('')
  const cenarioScrollRef = useRef(null)
  const [cenarioData, setCenarioData] = useState(hojeIso())
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')
  const [filtroResponsavel, setFiltroResponsavel] = useState('')
  const [aberta, setAberta] = useState(null)
  const [modal, setModal] = useState(null)
  const [novoStatus, setNovoStatus] = useState('')
  const [novaObs, setNovaObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [datas, setDatas] = useState({ data_etapa1:'', data_etapa2:'', data_etapa3:'' })
  const [resps, setResps] = useState({ resp_etapa1:'', resp_etapa2:'', resp_etapa3:'' })
  const [equipeEtapa3, setEquipeEtapa3] = useState([])
  const [terceirizadoEtapa3, setTerceirizadoEtapa3] = useState(false)
  const [terceirizadoEtapa3Texto, setTerceirizadoEtapa3Texto] = useState('')
  const [dataObra, setDataObra] = useState({ inicio:'', termino:'' })
  const [dataArt, setDataArt] = useState('')
  const [emNegociacao, setEmNegociacao] = useState(false)
  const [lembretes, setLembretes] = useState([])
  const [entregaveis, setEntregaveis] = useState([])
  const [entregaveisNA, setEntregaveisNA] = useState([])
  const [entregaveisVistoria, setEntregaveisVistoria] = useState([])
  const [novoLembreteEtapa, setNovoLembreteEtapa] = useState('')
  const [novoLembreteTexto, setNovoLembreteTexto] = useState('')
  const [editDados, setEditDados] = useState({ tipo:'', nome:'', endereco:'', cidade:'', uf:'', valor:'', sige:'', numero_pc:'', pedido:'', nf:'', os_tecban:'', pedido_valor:'', pedido_os:'', pedido_cnpj:'', pedido_tecban_cnpj:'', pedido_tecban_nome:'' })
  const [adesivos, setAdesivos] = useState([])
  const [vidros, setVidros] = useState([])
  const [novoVidro, setNovoVidro] = useState('')
  const [divisorias, setDivisorias] = useState([])
  const [novaDivTipo, setNovaDivTipo] = useState('DRYWALL')
  const [novaDivM2, setNovaDivM2] = useState('')
  const [itensEspeciais, setItensEspeciais] = useState([])
  const [biomboFila, setBiomboFila] = useState('')
  const [portaGiratoria, setPortaGiratoria] = useState('')
  const [dataVistoria, setDataVistoria] = useState('')
  const [colabsVistoria, setColabsVistoria] = useState([])
  const [terceirizadoVistoria, setTerceirizadoVistoria] = useState(false)
  const [terceirizadoVistoriaTexto, setTerceirizadoVistoriaTexto] = useState('')
  const [arsVerificado, setArsVerificado] = useState(false)
  const [ecNome, setEcNome] = useState('')
  const [ecTelefone, setEcTelefone] = useState('')
  const [dataInicioObraTexto, setDataInicioObraTexto] = useState('')
  const [horaInicioObraTexto, setHoraInicioObraTexto] = useState('')
  const [segurancaItens, setSegurancaItens] = useState([])
  const [segurancaItensCampo, setSegurancaItensCampo] = useState([])
  const [barreiraDissuasao, setBarreiraDissuasao] = useState(false)
  const [barreiraDissuasaoCampo, setBarreiraDissuasaoCampo] = useState(false)
  const [autorizacaoMudanca, setAutorizacaoMudanca] = useState('')
  const [agendamentoData, setAgendamentoData] = useState('')
  const [registrosOperacaoCampo, setRegistrosOperacaoCampo] = useState([])
  const [novoRegistroData, setNovoRegistroData] = useState('')
  const [novoRegistroHora, setNovoRegistroHora] = useState('')
  const [novoRegistroEquipe, setNovoRegistroEquipe] = useState([])
  const [novoRegistroTerceirizado, setNovoRegistroTerceirizado] = useState(false)
  const [novoRegistroTerceirizadoTexto, setNovoRegistroTerceirizadoTexto] = useState('')
  const [novoRegistroAtividades, setNovoRegistroAtividades] = useState({})
  const [editandoVisitaIdx, setEditandoVisitaIdx] = useState(null)
  const [mostrarEnvioRelatorio, setMostrarEnvioRelatorio] = useState(false)
  const [fotosRelatorio, setFotosRelatorio] = useState([])
  const [enviandoRelatorio, setEnviandoRelatorio] = useState(false)
  const [erroEnvioRelatorio, setErroEnvioRelatorio] = useState('')
  const [mostrarEnvioCorrecaoPedido, setMostrarEnvioCorrecaoPedido] = useState(false)
  const [enviandoCorrecaoPedido, setEnviandoCorrecaoPedido] = useState(false)
  const [erroEnvioCorrecaoPedido, setErroEnvioCorrecaoPedido] = useState('')
  const [colabsObra, setColabsObra] = useState([])
  const [terceirizadoObra, setTerceirizadoObra] = useState(false)
  const [terceirizadoObraTexto, setTerceirizadoObraTexto] = useState('')
  const [responsavelEscritorio, setResponsavelEscritorio] = useState('')
  const [auxiliarEscritorio, setAuxiliarEscritorio] = useState('')
  const [custosTerceirizados, setCustosTerceirizados] = useState([])
  const [novoCustoTipo, setNovoCustoTipo] = useState('GESSO')
  const [novoCustoValor, setNovoCustoValor] = useState('')
  const [novoCustoObs, setNovoCustoObs] = useState('')
  const [despesasPessoal, setDespesasPessoal] = useState([])
  const [novaDespesaData, setNovaDespesaData] = useState('')
  const [novaDespesaCategoria, setNovaDespesaCategoria] = useState('Hospedagem')
  const [novaDespesaValor, setNovaDespesaValor] = useState('')
  const [novaDespesaObs, setNovaDespesaObs] = useState('')
  const [novaDespesaKm, setNovaDespesaKm] = useState('')
  const [novaDespesaOrigem, setNovaDespesaOrigem] = useState('')
  const [novaDespesaDestino, setNovaDespesaDestino] = useState('')
  const [calculandoRota, setCalculandoRota] = useState(false)
  const [erroRota, setErroRota] = useState('')
  const [selecionadas, setSelecionadas] = useState(new Set())
  const [modalBulk, setModalBulk] = useState(false)
  const [statusBulk, setStatusBulk] = useState('')
  const [salvandoBulk, setSalvandoBulk] = useState(false)
  const [modalNovaObra, setModalNovaObra] = useState(false)
  const [menuAberto, setMenuAberto] = useState(null)
  const [novaObra, setNovaObra] = useState({ tipo:'', rede:'', numero_pc:'', numero_pa:'', nome:'', endereco:'', cidade:'', uf:'', valor:'', sige:'', pedido:'', nf:'', obs:'', data_cadastro: new Date().toISOString().split('T')[0] })
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [carregandoLogin, setCarregandoLogin] = useState(false)
  const [importando, setImportando] = useState(false)
  const [dataCadastroModal, setDataCadastroModal] = useState('')
  const [aba, setAba] = useState('pipeline')
  const [faturarDados, setFaturarDados] = useState({})
  const [grupoFaturarDados, setGrupoFaturarDados] = useState({})
  const [filtroHistTipo, setFiltroHistTipo] = useState('')
  const [filtroHistRegiao, setFiltroHistRegiao] = useState('')
  const [filtroHistDe, setFiltroHistDe] = useState('')
  const [filtroHistAte, setFiltroHistAte] = useState('')
  const [rhColaboradores, setRhColaboradores] = useState([])
  const [emailsLogin, setEmailsLogin] = useState([])
  const [perfisLogin, setPerfisLogin] = useState([])
  const [meuRH, setMeuRH] = useState(null)
  const [carregandoMeuRH, setCarregandoMeuRH] = useState(false)
  const [minhasJantas, setMinhasJantas] = useState([])
  const [novaJantaData, setNovaJantaData] = useState('')
  const [novaJantaTipo, setNovaJantaTipo] = useState('viagem_pernoite')
  const [novaJantaMotivo, setNovaJantaMotivo] = useState('')
  const [jantasTodas, setJantasTodas] = useState([])
  const [novoRhNomeCompleto, setNovoRhNomeCompleto] = useState('')
  const [filtroRhNome, setFiltroRhNome] = useState('')
  const [novoRhBaseCadastrado, setNovoRhBaseCadastrado] = useState('')
  const [novoRhBaseAtua, setNovoRhBaseAtua] = useState('')
  const [pontoResultado, setPontoResultado] = useState(null)
  const [pontoNomeArquivo, setPontoNomeArquivo] = useState('')
  const [pontoProcessando, setPontoProcessando] = useState(false)
  const [pontoErro, setPontoErro] = useState('')
  const [pontoAbertoNome, setPontoAbertoNome] = useState(null)
  const [pontoBase, setPontoBase] = useState('')
  const [pontoSalvando, setPontoSalvando] = useState(false)
  const [pontoSalvo, setPontoSalvo] = useState(false)
  const [pontoSalvos, setPontoSalvos] = useState([])
  const [pontoCarregandoSalvo, setPontoCarregandoSalvo] = useState(false)
  const [holeriteBase, setHoleriteBase] = useState('SAO')
  const [holeriteMes, setHoleriteMes] = useState('')
  const [holeriteArquivoSaldo, setHoleriteArquivoSaldo] = useState(null)
  const [holeriteArquivoAdiant, setHoleriteArquivoAdiant] = useState(null)
  const [holeriteProcessando, setHoleriteProcessando] = useState(false)
  const [holeriteErro, setHoleriteErro] = useState('')
  const [holeritePreview, setHoleritePreview] = useState(null)
  const [holeriteSalvando, setHoleriteSalvando] = useState(false)
  const [holeritesSalvos, setHoleritesSalvos] = useState([])
  const [filtroHoleriteMes, setFiltroHoleriteMes] = useState('')
  const [filtroHoleriteBase, setFiltroHoleriteBase] = useState('')
  const [filtroHoleriteNome, setFiltroHoleriteNome] = useState('')
  const [modalCorrigirPC, setModalCorrigirPC] = useState(false)
  const [corrigirPCArquivo, setCorrigirPCArquivo] = useState(null)
  const [corrigirPCProcessando, setCorrigirPCProcessando] = useState(false)
  const [corrigirPCErro, setCorrigirPCErro] = useState('')
  const [corrigirPCPreview, setCorrigirPCPreview] = useState(null)
  const [corrigirPCSalvando, setCorrigirPCSalvando] = useState(false)
  const [modalImportarNovas, setModalImportarNovas] = useState(false)
  const [importarNovasArquivo, setImportarNovasArquivo] = useState(null)
  const [importarNovasProcessando, setImportarNovasProcessando] = useState(false)
  const [importarNovasErro, setImportarNovasErro] = useState('')
  const [importarNovasPreview, setImportarNovasPreview] = useState(null)
  const [importarNovasSalvando, setImportarNovasSalvando] = useState(false)
  const [horasExtrasColaboradorId, setHorasExtrasColaboradorId] = useState('')
  const [horasExtrasNomeDigitado, setHorasExtrasNomeDigitado] = useState('')
  const [horasExtrasMesDe, setHorasExtrasMesDe] = useState('')
  const [horasExtrasMesAte, setHorasExtrasMesAte] = useState('')
  const [horasExtrasMesExpandido, setHorasExtrasMesExpandido] = useState(null)
  const [despesasModo, setDespesasModo] = useState('mes')
  const [despesasMes, setDespesasMes] = useState(new Date().getMonth() + 1)
  const [despesasAno, setDespesasAno] = useState(new Date().getFullYear())
  const [despesaObraAberta, setDespesaObraAberta] = useState(null)
  const [descontosNomeArquivo, setDescontosNomeArquivo] = useState('')
  const [descontosProcessando, setDescontosProcessando] = useState(false)
  const [descontosErro, setDescontosErro] = useState('')
  const [descontosPorAba, setDescontosPorAba] = useState(null)
  const [descontosAbas, setDescontosAbas] = useState([])
  const [descontosAbaEscolhida, setDescontosAbaEscolhida] = useState('')
  const [descontosImportando, setDescontosImportando] = useState(false)
  const [descontosResultado, setDescontosResultado] = useState(null)

  const descontosPreviewInfo = useMemo(() => {
    if (!descontosPorAba || !descontosAbaEscolhida) return { lancamentos: [], erro: null }
    const rows = descontosPorAba[descontosAbaEscolhida] || []
    const { lancamentos, erro } = parseDescontosPlanilha(rows, descontosAbaEscolhida)
    if (erro) return { lancamentos: [], erro }
    return { lancamentos: lancamentos.map(l => classificaLancamentoDesconto(l, rhColaboradores)), erro: null }
  }, [descontosPorAba, descontosAbaEscolhida, rhColaboradores])

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

  useEffect(() => {
    if (!usuario) { setPapel(null); return }
    supabase.from('perfis_usuarios').select('papel').eq('id', usuario.id).single()
      .then(({ data, error }) => setPapel(error ? 'operacional' : (data?.papel || 'operacional')))
  }, [usuario])

  useEffect(() => {
    if (papel === 'admin' || papel === 'rh' || papel === 'financeiro') {
      carregarRH()
      carregarEmailsLogin()
      carregarJantasTodas()
      carregarFechamentosSalvos()
      carregarHolerites()
    }
  }, [papel])

  useEffect(() => {
    if (papel && usuario) { carregarMeuRH(); carregarMinhasJantas() }
  }, [papel, usuario])

  async function carregarRH() {
    const { data } = await supabase.from('rh_colaboradores').select('*').order('nome')
    setRhColaboradores(data || [])
  }

  async function carregarHolerites() {
    const { data } = await supabase.from('holerites_mensais').select('*').order('mes', { ascending: false }).order('colaborador_nome')
    setHoleritesSalvos(data || [])
  }

  async function processarHolerites() {
    if (!holeriteArquivoSaldo) { setHoleriteErro('Selecione ao menos o PDF do saldo (holerite final do mês).'); return }
    setHoleriteProcessando(true)
    setHoleriteErro('')
    try {
      const bufSaldo = await holeriteArquivoSaldo.arrayBuffer()
      const funcSaldo = await parseHoleritePdf(bufSaldo)
      let funcAdiant = []
      if (holeriteArquivoAdiant) {
        const bufAdiant = await holeriteArquivoAdiant.arrayBuffer()
        funcAdiant = await parseHoleritePdf(bufAdiant)
      }
      if (funcSaldo.length === 0) {
        setHoleriteErro('Não consegui identificar nenhum funcionário nesse PDF - confere se é o arquivo certo.')
        setHoleriteProcessando(false)
        return
      }
      const combinados = funcSaldo.map(f => {
        const adiant = funcAdiant.find(a => a.nome === f.nome)
        const colaborador = rhColaboradores.find(c => nomesDeColaboradorBatem(`${c.nome} ${c.sobrenome || ''}`, f.nome))
        return {
          ...f,
          colaboradorId: colaborador?.id || null,
          liquidoAdiantamento: adiant?.valorLiquido || 0,
          liquidoMes: (f.valorLiquido || 0) + (adiant?.valorLiquido || 0),
          he: somaRubricas(f.rubricas, 'HORAS EXTRAS'),
          inter: somaRubricas(f.rubricas, 'INTER JORNADA'),
          intra: somaRubricas(f.rubricas, 'INTRAJORNADA'),
          noturno: somaRubricas(f.rubricas, 'ADICIONAL NOTURNO'),
        }
      })
      setHoleritePreview(combinados)
    } catch (e) {
      setHoleriteErro('Erro ao ler o PDF: ' + e.message)
    }
    setHoleriteProcessando(false)
  }

  async function confirmarImportacaoHolerites() {
    if (!holeritePreview || !holeriteMes || !holeriteBase) return
    setHoleriteSalvando(true)
    const linhas = holeritePreview.map(f => ({
      colaborador_id: f.colaboradorId,
      colaborador_nome: f.nome,
      base: holeriteBase,
      mes: holeriteMes,
      funcao: f.cargo || null,
      admissao: f.admissao ? brToIso(f.admissao) : null,
      salario_base: f.salarioBase,
      total_vencimentos: f.totalVencimentos,
      total_descontos: f.totalDescontos,
      total_liquido_saldo: f.valorLiquido,
      total_liquido_adiantamento: f.liquidoAdiantamento || null,
      total_liquido_mes: f.liquidoMes,
      rubricas: f.rubricas,
      arquivo_origem: holeriteArquivoSaldo?.name || null,
      importado_por: usuario?.email || null,
    }))
    const { error } = await supabase.from('holerites_mensais').upsert(linhas, { onConflict: 'colaborador_nome,base,mes' })
    if (error) {
      setHoleriteErro('Erro ao salvar: ' + error.message)
    } else {
      setHoleritePreview(null)
      setHoleriteArquivoSaldo(null)
      setHoleriteArquivoAdiant(null)
      carregarHolerites()
    }
    setHoleriteSalvando(false)
  }

  async function carregarEmailsLogin() {
    const { data } = await supabase.from('perfis_usuarios').select('email, papel').order('email')
    setEmailsLogin((data || []).map(d => d.email))
    setPerfisLogin(data || [])
  }

  async function carregarMeuRH() {
    setCarregandoMeuRH(true)
    const { data } = await supabase.from('rh_colaboradores').select('*').eq('email', usuario.email).maybeSingle()
    setMeuRH(data || null)
    setCarregandoMeuRH(false)
  }

  async function carregarMinhasJantas() {
    const { data } = await supabase.from('solicitacoes_janta').select('*').eq('colaborador_email', usuario.email).order('data', { ascending: false })
    setMinhasJantas(data || [])
  }

  async function solicitarJanta() {
    if (!novaJantaData || !novaJantaMotivo.trim()) return
    const nomeCompleto = meuRH ? `${meuRH.nome} ${meuRH.sobrenome || ''}`.trim() : usuario.email
    const { data, error } = await supabase.from('solicitacoes_janta').insert({
      colaborador_email: usuario.email,
      colaborador_nome: nomeCompleto,
      data: novaJantaData,
      motivo_tipo: novaJantaTipo,
      motivo_texto: novaJantaMotivo.trim(),
    }).select().single()
    if (!error && data) {
      setMinhasJantas(prev => [data, ...prev])
      setNovaJantaData(''); setNovaJantaMotivo(''); setNovaJantaTipo('viagem_pernoite')
    }
  }

  async function carregarJantasTodas() {
    const { data } = await supabase.from('solicitacoes_janta').select('*').order('solicitado_em', { ascending: false })
    setJantasTodas(data || [])
  }

  async function carregarFechamentosSalvos() {
    const { data } = await supabase.from('fechamento_ponto').select('base, periodo_inicio, periodo_fim')
      .order('periodo_inicio', { ascending: false })
    const vistos = new Set()
    const unicos = []
    ;(data || []).forEach(r => {
      const chave = `${r.base}|${r.periodo_inicio}|${r.periodo_fim}`
      if (!vistos.has(chave)) { vistos.add(chave); unicos.push(r) }
    })
    setPontoSalvos(unicos)
  }

  async function abrirFechamentoSalvo(base, periodoInicio, periodoFim) {
    setPontoCarregandoSalvo(true)
    setPontoErro('')
    const { data, error } = await supabase.from('fechamento_ponto').select('*')
      .eq('base', base).eq('periodo_inicio', periodoInicio).eq('periodo_fim', periodoFim)
      .order('colaborador_nome')
    if (error || !data) {
      setPontoErro('Não consegui abrir esse fechamento salvo.')
      setPontoCarregandoSalvo(false)
      return
    }
    setPontoBase(base)
    setPontoNomeArquivo('')
    setPontoResultado({
      periodo: { inicio: periodoInicio, fim: periodoFim },
      colaboradores: data.map(r => ({
        nome: r.colaborador_nome,
        totais: {
          horasNormais: r.horas_normais_min,
          he1: r.he1_min,
          he2: r.he2_min,
          adicionalNoturno: r.adicional_noturno_min,
          credito: r.credito_min,
          debito: r.debito_min,
        },
        violacoesInterjornada: r.violacoes_interjornada || [],
        violacoesIntrajornada: r.violacoes_intrajornada || [],
      })),
    })
    setPontoSalvo(true)
    setPontoCarregandoSalvo(false)
  }

  function exportarPontoExcel() {
    if (!pontoResultado) return
    const { periodo, colaboradores } = pontoResultado
    const cabecalho = ['Colaborador', 'Horas normais', 'HE1', 'HE2', 'Adicional noturno', 'Crédito', 'Débito', 'Violações interjornada', 'Detalhe interjornada', 'Violações intrajornada', 'Detalhe intrajornada']
    const linhas = colaboradores.map(c => [
      c.nome,
      minutosParaHoras(c.totais?.horasNormais || 0),
      minutosParaHoras(c.totais?.he1 || 0),
      minutosParaHoras(c.totais?.he2 || 0),
      minutosParaHoras(c.totais?.adicionalNoturno || 0),
      minutosParaHoras(c.totais?.credito || 0),
      minutosParaHoras(c.totais?.debito || 0),
      c.violacoesInterjornada.length,
      c.violacoesInterjornada.map(v => `${v.de} → ${v.para} (${minutosParaHoras(v.gapMinutos)})${v.cai100 ? ' [100%]' : ''}`).join('; '),
      c.violacoesIntrajornada.length,
      c.violacoesIntrajornada.map(v => `${v.data} (${minutosParaHoras(v.intervalo)})`).join('; '),
    ])
    const ws = XLSXStyle.utils.aoa_to_sheet([cabecalho, ...linhas])

    const estiloHeader = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2D3A8C' } }, alignment: { horizontal: 'center' } }
    cabecalho.forEach((_, col) => {
      const ref = XLSX.utils.encode_cell({ r: 0, c: col })
      if (ws[ref]) ws[ref].s = estiloHeader
    })
    colaboradores.forEach((c, i) => {
      const linha = i + 1
      const refInter = XLSX.utils.encode_cell({ r: linha, c: 7 })
      const refIntra = XLSX.utils.encode_cell({ r: linha, c: 9 })
      const estiloViolado = { font: { bold: true, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: 'FEE2E2' } } }
      const estiloOk = { font: { color: { rgb: '065F46' } }, fill: { fgColor: { rgb: 'D1FAE5' } } }
      if (ws[refInter]) ws[refInter].s = c.violacoesInterjornada.length > 0 ? estiloViolado : estiloOk
      if (ws[refIntra]) ws[refIntra].s = c.violacoesIntrajornada.length > 0 ? estiloViolado : estiloOk
    })
    ws['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 45 }, { wch: 12 }, { wch: 45 }]

    const wb = XLSXStyle.utils.book_new()
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Fechamento')
    const nomeArquivo = `Fechamento_Ponto_${pontoBase || 'base'}_${periodo.inicio || ''}_a_${periodo.fim || ''}.xlsx`
    XLSXStyle.writeFile(wb, nomeArquivo)
  }

  function exportarFechamentoFolha() {
    if (!pontoResultado || !pontoBase || !pontoResultado.periodo.fim) return
    const { periodo, colaboradores } = pontoResultado
    const meta = META_BASE_FOLHA[pontoBase]
    const mesReferencia = periodo.fim.slice(0, 7)
    const mesNome = MESES_PT[Number(periodo.fim.slice(5, 7)) - 1]
    const ano = periodo.fim.slice(0, 4)

    const cabecalho = [
      '#', 'COLABORADOR', `HE F1 ${meta.he1Pct}`, `HE F2 ${meta.he2Pct}`, 'AD. NOTURNO',
      ...(pontoBase === 'SAO' || pontoBase === 'RIO'
        ? ['INTERJORNADA VIOLADA (100%)', 'INTERJORNADA VIOLADA (dia útil)']
        : [`INTERJORNADA VIOLADA (${meta.he1Pct})`]),
      pontoBase === 'BHZ' ? `INTRAJORNADA (déficit) (${meta.he1Pct})` : 'INTRAJORNADA (déficit)',
      ...RUBRICAS_DESCONTO.map(r => r.codigo ? `${r.label} (${r.codigo})` : r.label),
    ]

    const linhasMontadas = colaboradores.map(c => montaLinhaFechamentoFolha(c, rhColaboradores, mesReferencia, pontoBase))
    const naoEncontrados = linhasMontadas.filter(l => !l.encontrouRH).map(l => l.nome)

    const linhas = linhasMontadas.map((l, i) => [i + 1, l.nome, ...l.linha])
    const tituloLinhas = [
      [`FECHAMENTO DE FOLHA — ${meta.cidade}  |  ${mesNome} / ${ano}  |  Período: ${isoToBr(periodo.inicio)} a ${isoToBr(periodo.fim)}`],
      [],
      cabecalho,
      ...linhas,
    ]
    const ws = XLSXStyle.utils.aoa_to_sheet(tituloLinhas)

    const estiloTitulo = { font: { bold: true, sz: 13, color: { rgb: '1A2340' } } }
    ws['A1'].s = estiloTitulo
    const estiloHeader = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2D3A8C' } }, alignment: { horizontal: 'center', wrapText: true } }
    cabecalho.forEach((_, col) => {
      const ref = XLSX.utils.encode_cell({ r: 2, c: col })
      if (ws[ref]) ws[ref].s = estiloHeader
    })
    ws['!cols'] = [{ wch: 4 }, { wch: 32 }, ...Array(cabecalho.length - 2).fill({ wch: 13 })]

    const wb = XLSXStyle.utils.book_new()
    XLSXStyle.utils.book_append_sheet(wb, ws, pontoBase)
    const nomeArquivo = `Fechamento_de_Folha_${pontoBase}_${periodo.inicio}_a_${periodo.fim}.xlsx`
    XLSXStyle.writeFile(wb, nomeArquivo)

    if (naoEncontrados.length > 0) {
      alert(`Atenção: não encontrei cadastro no RH pra ${naoEncontrados.length} colaborador(es), então as colunas de desconto saíram em branco pra eles:\n\n${naoEncontrados.join('\n')}`)
    }
  }

  function exportarRelatorioViolacoes() {
    if (!pontoResultado) return
    const { periodo, colaboradores } = pontoResultado
    const cabecalho = ['#', 'Colaborador', 'Tipo', 'Data(s)', 'Detalhe', 'Déficit']
    const linhas = []
    colaboradores.forEach(c => {
      c.violacoesInterjornada.forEach(v => linhas.push({
        colaborador: c.nome, tipo: v.cai100 ? 'Interjornada (100%)' : 'Interjornada', data: `${v.de} → ${v.para}`,
        detalhe: `Descanso real: ${minutosParaHoras(v.gapMinutos)} (mínimo 11:00)`,
        deficitMin: 11 * 60 - v.gapMinutos,
      }))
      c.violacoesIntrajornada.forEach(v => linhas.push({
        colaborador: c.nome, tipo: 'Intrajornada', data: v.data,
        detalhe: `Intervalo real: ${minutosParaHoras(v.intervalo)} (mínimo ${minutosParaHoras(v.minimoExigido)})`,
        deficitMin: v.minimoExigido - v.intervalo,
      }))
    })
    linhas.sort((a, b) => a.colaborador.localeCompare(b.colaborador) || a.tipo.localeCompare(b.tipo))

    if (linhas.length === 0) {
      alert('Nenhuma violação encontrada nesse período — sem nada pra exportar.')
      return
    }

    const tituloLinhas = [
      [`RELATÓRIO DE VIOLAÇÕES${pontoBase ? ` — ${pontoBase}` : ''}  |  Período: ${isoToBr(periodo.inicio)} a ${isoToBr(periodo.fim)}`],
      [],
      cabecalho,
      ...linhas.map((l, i) => [i + 1, l.colaborador, l.tipo, l.data, l.detalhe, minutosParaHoras(l.deficitMin)]),
    ]
    const ws = XLSXStyle.utils.aoa_to_sheet(tituloLinhas)

    ws['A1'].s = { font: { bold: true, sz: 13, color: { rgb: '1A2340' } } }
    const estiloHeader = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2D3A8C' } }, alignment: { horizontal: 'center' } }
    cabecalho.forEach((_, col) => {
      const ref = XLSX.utils.encode_cell({ r: 2, c: col })
      if (ws[ref]) ws[ref].s = estiloHeader
    })
    linhas.forEach((l, i) => {
      const ref = XLSX.utils.encode_cell({ r: i + 3, c: 2 })
      if (ws[ref]) ws[ref].s = {
        font: { bold: true, color: { rgb: l.tipo === 'Interjornada' ? '991B1B' : '92400E' } },
        fill: { fgColor: { rgb: l.tipo === 'Interjornada' ? 'FEE2E2' : 'FEF3C7' } },
      }
    })
    ws['!cols'] = [{ wch: 4 }, { wch: 32 }, { wch: 13 }, { wch: 24 }, { wch: 42 }, { wch: 10 }]

    const wb = XLSXStyle.utils.book_new()
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Violações')
    const nomeArquivo = `Relatorio_Violacoes_${pontoBase || 'base'}_${periodo.inicio || ''}_a_${periodo.fim || ''}.xlsx`
    XLSXStyle.writeFile(wb, nomeArquivo)
  }

  function exportarCartaoPonto() {
    if (!pontoResultado || !pontoBase) return
    const { periodo, colaboradores } = pontoResultado
    if (!colaboradores.every(c => Array.isArray(c.dias) && c.dias.length > 0)) {
      alert('O cartão de ponto só pode ser gerado logo depois de subir o arquivo (precisa dos dados dia a dia, que não ficam guardados num fechamento reaberto). Sobe o espelho de novo pra gerar o PDF.')
      return
    }
    const meta = META_BASE_FOLHA[pontoBase]
    const mesNome = MESES_PT[Number(periodo.fim.slice(5, 7)) - 1]
    const ano = periodo.fim.slice(0, 4)
    const cabecalho = ['DATA', '1ª Entrada', '1ª Saída', '2ª Entrada', '2ª Saída', '3ª Entrada', '3ª Saída', 'CRÉDITO', 'DÉBITO', 'H. INTERV.', 'H. NORM.', `HE F1 ${meta.he1Pct}`, `HE F2 ${meta.he2Pct}`, 'AD. NOT.', 'JUSTIFICATIVA']

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    colaboradores.forEach((c, ci) => {
      if (ci > 0) doc.addPage()

      // dias[0] só é o último dia do período anterior (repetido no arquivo como referência de
      // cálculo, ver excluiPrimeiroDiaDosTotais/calcularViolacoesIntrajornada) pra quem já
      // trabalhava no fechamento passado - por isso só cortamos quando ele existir de fato
      // (c.temDiaReferencia). Quem começou no 1º dia deste período (ex: admissão dia 26) não
      // tem essa linha repetida, e cortá-la incondicionalmente sumiria com o primeiro dia real.
      const diasCartao = c.temDiaReferencia ? c.dias.slice(1) : c.dias
      const periodoInicioTexto = diasCartao[0]?.data || isoToBr(periodo.inicio)
      const periodoFimTexto = isoToBr(periodo.fim)

      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text(`GRUPO PG — CARTÃO DE PONTO | ${pontoBase} | ${mesNome} / ${ano}`, 14, 14)
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text(`Colaborador: ${c.nome}  |  Período: ${periodoInicioTexto} a ${periodoFimTexto}`, 14, 20)

      const corpo = diasCartao.map(d => [
        d.data, d.entrada1, d.saida1, d.entrada2, d.saida2, d.entrada3, d.saida3,
        d.credito, d.debito, d.hIntervalo, d.horasNormais, d.he1, d.he2, d.adicionalNoturno, d.motivo || '',
      ])
      const rodape = c.totais ? [[
        'TOTAIS', '', '', '', '', '', '',
        minutosParaHoras(c.totais.credito), minutosParaHoras(c.totais.debito), minutosParaHoras(c.totais.hIntervalo),
        minutosParaHoras(c.totais.horasNormais), minutosParaHoras(c.totais.he1), minutosParaHoras(c.totais.he2), minutosParaHoras(c.totais.adicionalNoturno), '',
      ]] : []

      autoTable(doc, {
        startY: 24,
        head: [cabecalho],
        body: corpo,
        foot: rodape,
        theme: 'grid',
        styles: { fontSize: 5.5, cellPadding: 0.5, halign: 'center' },
        headStyles: { fillColor: [45, 58, 140], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [226, 232, 240], textColor: [26, 35, 64], fontStyle: 'bold' },
        columnStyles: { 0: { halign: 'left', cellWidth: 16 }, 14: { halign: 'left', cellWidth: 20 } },
        didParseCell: (data) => {
          if (data.section !== 'body') return
          const dia = diasCartao[data.row.index]
          if (!dia) return
          if (data.column.index === 8 && horaParaMinutos(dia.debito) > 0) {
            data.cell.styles.fillColor = [254, 226, 226]
          }
          if (data.column.index === 9 && c.violacoesIntrajornada.some(v => v.data === dia.data)) {
            data.cell.styles.fillColor = [254, 240, 138]
          }
          if (data.column.index === 0 && c.violacoesInterjornada.some(v => v.de === dia.data || v.para === dia.data)) {
            data.cell.styles.fillColor = [253, 186, 116]
          }
        },
      })

      const deficitInterjornada100 = c.violacoesInterjornada.filter(v => v.cai100).reduce((s, v) => s + (11 * 60 - v.gapMinutos), 0)
      const deficitInterjornadaNormal = c.violacoesInterjornada.filter(v => !v.cai100).reduce((s, v) => s + (11 * 60 - v.gapMinutos), 0)
      const deficitIntrajornada = c.violacoesIntrajornada.reduce((s, v) => s + (v.minimoExigido - v.intervalo), 0)

      let y = doc.lastAutoTable.finalY + 4
      doc.setFontSize(6)
      doc.text('Vermelho = débito/horas faltantes  |  Amarelo = intrajornada violada  |  Laranja = interjornada violada', 14, y)

      y += 5
      doc.setFontSize(7.5)
      doc.setFont(undefined, 'bold')
      doc.text('RESUMO DO PERÍODO', 14, y)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(6.5)
      y += 4
      if (pontoBase === 'BHZ') {
        doc.text(`Horas faltantes (débito): ${minutosParaHoras(c.totais?.debito || 0)}   |   Déficit intrajornada (${meta.he1Pct}): ${minutosParaHoras(deficitIntrajornada)}`, 14, y)
        y += 3.5
        doc.text(`Déficit interjornada (${meta.he1Pct}): ${minutosParaHoras(deficitInterjornadaNormal)}`, 14, y)
      } else {
        doc.text(`Horas faltantes (débito): ${minutosParaHoras(c.totais?.debito || 0)}   |   Déficit intrajornada: ${minutosParaHoras(deficitIntrajornada)}`, 14, y)
        y += 3.5
        doc.text(`Déficit interjornada (dia útil): ${minutosParaHoras(deficitInterjornadaNormal)}   |   Déficit interjornada (100% sáb/dom/feriado): ${minutosParaHoras(deficitInterjornada100)}`, 14, y)
      }

      y += 7
      doc.line(14, y, 95, y)
      doc.line(115, y, 196, y)
      y += 4
      doc.setFontSize(8)
      doc.text(c.nome, 14, y)
      doc.text('PG Construtora LTDA', 115, y)
      y += 4
      doc.setFontSize(6.5)
      doc.text(`Período: ${periodoInicioTexto} a ${periodoFimTexto}`, 14, y)
      doc.text(`Período: ${periodoInicioTexto} a ${periodoFimTexto}`, 115, y)
    })

    doc.save(`Cartao_Ponto_${pontoBase}_${periodo.inicio}_a_${periodo.fim}.pdf`)
  }

  async function decidirJanta(id, status, valor) {
    const campos = { status, decidido_por: usuario.email, decidido_em: new Date().toISOString() }
    if (valor !== undefined) campos.valor = valor
    setJantasTodas(prev => prev.map(j => j.id === id ? { ...j, ...campos } : j))
    await supabase.from('solicitacoes_janta').update(campos).eq('id', id)
  }

  async function atualizarRH(id, campos) {
    setRhColaboradores(prev => prev.map(c => c.id === id ? { ...c, ...campos } : c))
    await supabase.from('rh_colaboradores').update(campos).eq('id', id)
  }

  function handleDescontosUpload(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return
    setDescontosErro('')
    setDescontosResultado(null)
    setDescontosProcessando(true)
    setDescontosNomeArquivo(arquivo.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const abas = wb.SheetNames.filter(n => n.trim().toUpperCase() !== 'FOLHA DE ROSTO')
        const porAba = {}
        abas.forEach(nome => {
          porAba[nome] = XLSX.utils.sheet_to_json(wb.Sheets[nome], { header: 1, defval: '' })
        })
        setDescontosPorAba(porAba)
        setDescontosAbas(abas)
        setDescontosAbaEscolhida(abas[abas.length - 1] || '')
      } catch (err) {
        console.error('Erro ao processar planilha de descontos:', err)
        setDescontosErro('Não consegui ler esse arquivo. Confere se é a planilha de descontos (abas por mês).')
        setDescontosPorAba(null)
        setDescontosAbas([])
      }
      setDescontosProcessando(false)
    }
    reader.readAsArrayBuffer(arquivo)
  }

  async function confirmarImportacaoDescontos() {
    const novos = descontosPreviewInfo.lancamentos.filter(l => l.status === 'novo')
    if (novos.length === 0) return
    setDescontosImportando(true)
    const porColaborador = {}
    novos.forEach(l => {
      if (!porColaborador[l.colaboradorId]) porColaborador[l.colaboradorId] = []
      porColaborador[l.colaboradorId].push({ motivo: l.motivo, mes: l.mes, valor: String(l.valor), observacao: `Importado de ${descontosAbaEscolhida}` })
    })
    for (const [id, itens] of Object.entries(porColaborador)) {
      const rh = rhColaboradores.find(c => String(c.id) === id)
      if (!rh) continue
      const descontosAtualizados = [...(Array.isArray(rh.descontos) ? rh.descontos : []), ...itens]
      await atualizarRH(rh.id, { descontos: descontosAtualizados })
    }
    setDescontosResultado({ lancamentos: novos.length, colaboradores: Object.keys(porColaborador).length })
    setDescontosImportando(false)
  }

  function handlePontoUpload(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return
    setPontoErro('')
    setPontoSalvo(false)
    setPontoProcessando(true)
    setPontoNomeArquivo(arquivo.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const resultado = processarEspelhoPonto(ev.target.result, pontoBase)
        setPontoResultado(resultado)
      } catch (err) {
        console.error('Erro ao processar espelho de ponto:', err)
        setPontoErro('Não consegui ler esse arquivo. Confere se é o espelho de ponto exportado do sistema.')
        setPontoResultado(null)
      }
      setPontoProcessando(false)
    }
    reader.readAsArrayBuffer(arquivo)
  }

  async function salvarFechamentoPonto() {
    if (!pontoResultado || !pontoBase || !pontoResultado.periodo.inicio || !pontoResultado.periodo.fim) return
    setPontoSalvando(true)
    setPontoErro('')
    const { periodo, colaboradores } = pontoResultado
    const { error: erroDelete } = await supabase.from('fechamento_ponto').delete()
      .eq('base', pontoBase).eq('periodo_inicio', periodo.inicio).eq('periodo_fim', periodo.fim)
    if (erroDelete) {
      setPontoErro('Não consegui limpar o período anterior: ' + erroDelete.message)
      setPontoSalvando(false)
      return
    }
    const linhas = colaboradores.map(c => ({
      base: pontoBase,
      periodo_inicio: periodo.inicio,
      periodo_fim: periodo.fim,
      colaborador_nome: c.nome,
      horas_normais_min: c.totais?.horasNormais || 0,
      he1_min: c.totais?.he1 || 0,
      he2_min: c.totais?.he2 || 0,
      adicional_noturno_min: c.totais?.adicionalNoturno || 0,
      credito_min: c.totais?.credito || 0,
      debito_min: c.totais?.debito || 0,
      violacoes_interjornada: c.violacoesInterjornada,
      violacoes_intrajornada: c.violacoesIntrajornada,
      processado_por: usuario?.email || null,
    }))
    const { error: erroInsert } = await supabase.from('fechamento_ponto').insert(linhas)
    if (erroInsert) {
      setPontoErro('Não consegui salvar: ' + erroInsert.message)
    } else {
      setPontoSalvo(true)
      carregarFechamentosSalvos()
    }
    setPontoSalvando(false)
  }

  async function adicionarRH() {
    if (!novoRhNomeCompleto.trim()) return
    const partes = novoRhNomeCompleto.trim().split(/\s+/)
    const { data, error } = await supabase.from('rh_colaboradores').insert({
      nome: partes[0],
      sobrenome: partes.slice(1).join(' ') || null,
      base_cadastrado: novoRhBaseCadastrado || null,
      base_atua: novoRhBaseAtua || novoRhBaseCadastrado || null,
      ativo: true,
    }).select().single()
    if (!error && data) {
      setRhColaboradores(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNovoRhNomeCompleto(''); setNovoRhBaseCadastrado(''); setNovoRhBaseAtua('')
    }
  }

  async function removerRH(id) {
    if (!confirm('Remover esse colaborador do RH?')) return
    setRhColaboradores(prev => prev.filter(c => c.id !== id))
    await supabase.from('rh_colaboradores').delete().eq('id', id)
  }

  function ordenaObras(lista) {
    return [...lista].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.nome.localeCompare(b.nome))
  }

  async function carregarObras() {
    // O Supabase/PostgREST corta em 1000 linhas por padrão - com a tabela passando de 1000 obras
    // (Shirley, 2026-08-19: BTG FLUMINENSE FOOTBALL CLUB existia no banco mas nunca aparecia no app,
    // pq ficava depois do corte), precisa paginar com .range() até a página vir vazia/incompleta.
    const TAMANHO_PAGINA = 1000
    let todas = []
    let pagina = 0
    while (true) {
      const { data, error } = await supabase.rpc('pipeline_obras_seguro')
        .range(pagina * TAMANHO_PAGINA, pagina * TAMANHO_PAGINA + TAMANHO_PAGINA - 1)
      if (error) {
        console.error('Erro ao carregar obras:', error)
        return
      }
      todas = todas.concat(data || [])
      if (!data || data.length < TAMANHO_PAGINA) break
      pagina++
    }
    // RPC pode voltar vazia por permissão de papel (ex: rh), não só por a tabela estar realmente vazia.
    // Por isso o reimport da base semente nunca é automático — só via botão manual (ver importarDadosIniciais).
    setObras(ordenaObras(todas))
  }

  async function importarDadosIniciais() {
    setImportando(true)
    const { error } = await supabase.from('pipeline_obras').insert(OBRAS_INICIAIS)
    if (!error) {
      const { data } = await supabase.rpc('pipeline_obras_seguro')
      setObras(ordenaObras(data || []))
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
    const sigeDigitado = novaObra.sige.trim()
    if (sigeDigitado) {
      const jaExiste = obras.find(o => (o.sige || '').trim() === sigeDigitado)
      if (jaExiste && !confirm(`Já existe uma obra com o SIGE ${sigeDigitado}: "${jaExiste.nome}" (${jaExiste.tipo}). Criar mesmo assim?`)) return
    }
    setSalvando(true)
    const ehBDN = TIPOS_BDN.includes(novaObra.tipo)
    const numeroPaDigitado = novaObra.numero_pa.trim()
    const obsComPA = numeroPaDigitado
      ? `PA: ${numeroPaDigitado}${novaObra.obs ? '\n' + novaObra.obs : ''}`
      : (novaObra.obs || null)
    const { data, error } = await supabase.from('pipeline_obras').insert({
      tipo: novaObra.tipo,
      rede: ehBDN ? novaObra.rede : null,
      numero_pc: ehBDN ? (novaObra.numero_pc.trim() || null) : null,
      nome: novaObra.nome,
      local: montaLocal(novaObra.cidade, novaObra.uf),
      endereco: novaObra.endereco || null,
      cidade: novaObra.cidade || null,
      uf: novaObra.uf || null,
      valor: parseFloat(novaObra.valor) || 0,
      sige: novaObra.sige || null,
      pedido: novaObra.pedido || null,
      nf: novaObra.nf || null,
      obs: obsComPA,
      status: ehBDN ? getEtapas(novaObra.rede, novaObra.tipo)[0] : 'VISTORIA',
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
    setNovaObra({ tipo:'', rede:'', numero_pc:'', numero_pa:'', nome:'', endereco:'', cidade:'', uf:'', valor:'', sige:'', pedido:'', nf:'', obs:'', data_cadastro: new Date().toISOString().split('T')[0] })
  }

  async function excluirObra(id) {
    if (!window.confirm('Excluir esta obra?')) return
    await supabase.from('pipeline_obras').delete().eq('id', id)
    setObras(prev => prev.filter(o => o.id !== id))
    setMenuAberto(null)
  }

  function montaRelatorioClientePDF() {
    if (!modal) return null
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('GRUPO PG — RELATÓRIO AO CLIENTE', 14, 16)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`${modal.nome}  |  ${modal.tipo}${editDados.numero_pc ? `  |  PC ${editDados.numero_pc}` : ''}`, 14, 23)
    const enderecoLinha = [editDados.endereco, [editDados.cidade, editDados.uf].filter(Boolean).join('-')].filter(Boolean).join(', ')
    doc.text(enderecoLinha || '—', 14, 28)

    let y = 36
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text(REDES_SEM_ARS.includes(modal.rede) ? 'Contato e agendamento' : 'Consulta ARS e agendamento', 14, y)
    y += 5
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text(`Contato do EC: ${ecNome || '—'}${ecTelefone ? ` (${ecTelefone})` : ''}`, 14, y); y += 5
    doc.text(`Início confirmado com o cliente: ${isoToBr(paraIsoDataObraTexto(dataInicioObraTexto)) || '—'} ${horaInicioObraTexto || ''}`, 14, y); y += 5

    // Critério de segurança/barreira de dissuasão e autorização de mudança não se aplicam à
    // Desativação (só ARS aqui pra pegar contato do ponto) nem ao Bradesco (sem ARS nenhum) -
    // Shirley, 2026-08-19/20.
    if (modal.tipo !== 'DESATIVAÇÃO ATM' && !REDES_SEM_ARS.includes(modal.rede)) {
      const itensTabela = ITENS_SEGURANCA_BANCO24H.map(item => [
        item, segurancaItens.includes(item) ? 'X' : '', segurancaItensCampo.includes(item) ? 'X' : '',
      ])
      itensTabela.push(['Tem barreira de dissuasão', barreiraDissuasao ? 'X' : '', barreiraDissuasaoCampo ? 'X' : ''])
      autoTable(doc, {
        startY: y,
        head: [['Critério de segurança', 'Solicitação no ARS', 'Executado em campo']],
        body: itensTabela,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [45, 58, 140], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'center', cellWidth: 26 }, 2: { halign: 'center', cellWidth: 26 } },
      })
      y = doc.lastAutoTable.finalY + 5
      if (autorizacaoMudanca.trim()) {
        doc.setFontSize(9)
        doc.text(`Mudança autorizada por: ${autorizacaoMudanca}`, 14, y)
        y += 7
      }
    } else {
      y += 3
    }

    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('O que foi feito no local', 14, y)
    y += 3

    const linhasVisitas = []
    registrosOperacaoCampo.forEach(r => {
      (r.atividades || []).forEach(a => {
        let detalhe = a.impedimento && a.motivo ? `Desvio: ${a.motivo}` : (a.impedimento ? 'Com desvio' : '')
        if (a.atividade === 'Habilitação') {
          const extras = []
          if (!a.dimerFinalizado) extras.push(`Dimer não finalizado${a.dimerMotivo ? ` (${a.dimerMotivo})` : ''}`)
          if (!a.alarme253Finalizado) extras.push(`Alarme 253 não finalizado${a.alarme253Motivo ? ` (${a.alarme253Motivo})` : ''}`)
          if (a.cgrNome) extras.push(`CGR: ${a.cgrNome}`)
          detalhe = [detalhe, ...extras].filter(Boolean).join(' — ')
        }
        if (a.atividade === 'Outros' && a.descricao) detalhe = [detalhe, a.descricao].filter(Boolean).join(' — ')
        linhasVisitas.push([
          r.data ? isoToBr(r.data) : '—',
          Array.isArray(r.equipe) ? r.equipe.join(', ') : '',
          a.atividade,
          a.feita ? 'Concluída' : 'Não concluída',
          detalhe,
        ])
      })
    })
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Equipe', 'Atividade', 'Situação', 'Observações/Dificuldades']],
      body: linhasVisitas.length > 0 ? linhasVisitas : [['—', '—', '—', '—', 'Nenhuma visita registrada']],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [45, 58, 140], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 4: { cellWidth: 70 } },
    })

    y = doc.lastAutoTable.finalY + 10
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} por ${usuario?.email || ''}`, 14, y)

    return doc
  }

  function exportarRelatorioCliente() {
    const doc = montaRelatorioClientePDF()
    if (!doc) return
    doc.save(`Relatorio_Cliente_${modal.nome.replace(/[^\w]+/g, '_')}.pdf`)
  }

  function arquivoParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleAdicionarFotosRelatorio(fileList) {
    const arquivos = Array.from(fileList || [])
    const novas = await Promise.all(arquivos.map(async file => ({
      filename: file.name,
      mimeType: file.type || 'image/jpeg',
      base64: await arquivoParaBase64(file),
    })))
    setFotosRelatorio(prev => [...prev, ...novas])
  }

  function montaAssuntoRelatorioTecban() {
    const ordem = (editDados.os_tecban || modal?.os_tecban || '').trim() || '(sem OS)'
    const tipoCodigo = (modal?.tipo || '').replace(/\s*ATM\s*$/i, '').trim().toUpperCase()
    return `B24H_${ordem}_${tipoCodigo}`
  }

  function montaCorpoRelatorioTecban() {
    if (!modal) return ''
    const localTexto = [editDados.cidade, editDados.uf].filter(Boolean).join('/')
    return `Prezados,\n\nNossa equipe esteve no local para a atividade de ${modal.tipo}${editDados.numero_pc ? ` (PC ${editDados.numero_pc})` : ''} - ${modal.nome}${localTexto ? `, em ${localTexto}` : ''}. A obra foi concluída até onde compete à nossa atuação.\n\nSegue em anexo o relatório com os detalhes do que foi realizado no local.\n\nEm breve enviaremos o book fotográfico e o encaminhamento para cobrança.\n\nAtenciosamente,\nGrupo PG`
  }

  async function enviarRelatorioTecban() {
    const doc = montaRelatorioClientePDF()
    if (!doc) return
    setEnviandoRelatorio(true)
    setErroEnvioRelatorio('')
    try {
      const pdfBase64 = doc.output('datauristring').split(',')[1] || ''
      const assunto = montaAssuntoRelatorioTecban()
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(EDGE_FUNCTION_TECBAN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          to: EMAIL_RM_TECBAN,
          cc: EMAIL_CC_OPERACAO_GRUPOPG,
          subject: assunto,
          body: montaCorpoRelatorioTecban(),
          pdfBase64,
          pdfFilename: `Relatorio_Cliente_${modal.nome.replace(/[^\w]+/g, '_')}.pdf`,
          fotos: fotosRelatorio,
        }),
      })
      const resultado = await resp.json()
      if (!resultado.ok) throw new Error(resultado.error || 'Falha no envio')
      await supabase.from('pipeline_obras').update({
        relatorio_enviado_em: new Date().toISOString(),
        relatorio_enviado_por: usuario.email,
      }).eq('id', modal.id)
      setMostrarEnvioRelatorio(false)
      setFotosRelatorio([])
      alert('Relatório enviado para a Tecban com sucesso.')
    } catch (err) {
      setErroEnvioRelatorio('Não foi possível enviar: ' + err.message)
    } finally {
      setEnviandoRelatorio(false)
    }
  }

  // Lista as divergencias da conferencia do pedido (mesma logica usada no bloco de bate/nao bate) -
  // usada pra montar o corpo do e-mail de solicitacao de correcao (Shirley, 2026-08-20; modelo de
  // texto com par "correto vs pedido" + diferenca ajustado em 2026-08-25).
  function divergenciasPedido() {
    const valorObra = parseFloat(String(editDados.valor).replace(',', '.')) || 0
    const valorPedido = parseFloat(String(editDados.pedido_valor).replace(',', '.')) || 0
    const valorBate = editDados.pedido_valor !== '' && Math.abs(valorPedido - valorObra) < 0.01
    const osBate = editDados.pedido_os.trim() !== '' && editDados.pedido_os.trim() === editDados.os_tecban.trim()
    const ufObra = editDados.uf.trim().toUpperCase()
    const cnpjEsperado = cnpjEsperadoParaUF(ufObra)
    const cnpjBate = !!editDados.pedido_cnpj && editDados.pedido_cnpj === cnpjEsperado
    const fmtRS = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    const problemas = []
    if (editDados.pedido_valor !== '' && !valorBate) {
      const diferenca = valorPedido - valorObra
      problemas.push(`Valor correto: R$ ${fmtRS(valorObra)} | Valor no pedido: R$ ${fmtRS(valorPedido)} | Diferença: R$ ${fmtRS(Math.abs(diferenca))} (pedido veio ${diferenca > 0 ? 'a maior' : 'a menor'})`)
    }
    if (editDados.pedido_os.trim() && !osBate) {
      problemas.push(`OS correta: ${editDados.os_tecban} | OS no pedido: ${editDados.pedido_os}`)
    }
    if (editDados.pedido_cnpj && !cnpjBate) {
      problemas.push(`CNPJ do Fornecedor correto: ${cnpjEsperado} | CNPJ do Fornecedor no pedido: ${editDados.pedido_cnpj}`)
    }
    return problemas
  }

  function montaAssuntoCorrecaoPedido() {
    const pedido = (editDados.pedido || '').trim() || '(sem número)'
    const os = (editDados.os_tecban || '').trim() || '(sem OS)'
    return `Pedido divergente - ${pedido} - OS ${os}`
  }

  function montaCorpoCorrecaoPedido() {
    if (!modal) return ''
    const problemas = divergenciasPedido()
    const pcTexto = editDados.numero_pc ? ` (PC ${editDados.numero_pc})` : ''
    const tomadorTexto = editDados.pedido_tecban_cnpj ? `\nCNPJ do Tomador no pedido: ${editDados.pedido_tecban_cnpj}` : ''
    return `Prezados,\n\nRecebemos o pedido número ${editDados.pedido || '(sem número)'} referente à OS ${editDados.os_tecban || '(sem OS)'} - ${modal.nome}${pcTexto}, com as seguintes divergências:\n\n${problemas.map(p => `- ${p}`).join('\n')}${tomadorTexto}\n\nSolicitamos a correção do pedido para que possamos seguir com o faturamento.\n\nAtenciosamente,\nGrupo PG`
  }

  async function enviarCorrecaoPedidoTecban() {
    setEnviandoCorrecaoPedido(true)
    setErroEnvioCorrecaoPedido('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const resp = await fetch(EDGE_FUNCTION_TECBAN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          to: EMAIL_CORRECAO_PEDIDO_TECBAN,
          cc: EMAIL_CC_CORRECAO_PEDIDO,
          subject: montaAssuntoCorrecaoPedido(),
          body: montaCorpoCorrecaoPedido(),
        }),
      })
      const resultado = await resp.json()
      if (!resultado.ok) throw new Error(resultado.error || 'Falha no envio')
      setMostrarEnvioCorrecaoPedido(false)
      alert('Solicitação de correção enviada para a Tecban.')
    } catch (err) {
      setErroEnvioCorrecaoPedido('Não foi possível enviar: ' + err.message)
    } finally {
      setEnviandoCorrecaoPedido(false)
    }
  }

  async function salvarStatus() {
    if (!novoStatus) return
    setSalvando(true)
    // "RM Enviada" pula pra próxima etapa da régua daquele tipo/rede, não direto pra EMITIR NF -
    // em Banco24Horas/AgiBank/Crefisa e Bradesco existe "Aguardando OS Tecban"/"Aguardando pedido"
    // DEPOIS do RM enviado, que precisa ser respeitado. Só cai em EMITIR NF quando RM Enviada já é a
    // última etapa da régua daquele tipo (TRANSF UN/DESC PA/PAB), como sempre foi (Shirley, 2026-08-19).
    let statusFinal = novoStatus
    if (novoStatus === 'RM ENVIADA') {
      const etapasRegua = getEtapas(modal.rede, modal.tipo)
      const idxRmEnviada = etapasRegua.indexOf('RM ENVIADA')
      statusFinal = (idxRmEnviada >= 0 && etapasRegua[idxRmEnviada + 1]) ? etapasRegua[idxRmEnviada + 1] : 'EMITIR NF'
    }
    // Se o pedido da Tecban chegou E bate certinho (valor, OS e CNPJ conferidos - não só o campo
    // Pedido preenchido, que não garantia nada) numa obra que já estava em etapa avançada
    // (elaborando/enviando RM), considera pronta pra faturar - pula direto pra EMITIR NF. Se não
    // bater, fica como está pra alguém corrigir manualmente (Shirley, 2026-08-20).
    const pedidoConferido = conferePedidoObra({
      valor: editDados.valor, os_tecban: editDados.os_tecban, local: montaLocal(editDados.cidade, editDados.uf),
      pedido_valor: editDados.pedido_valor, pedido_os: editDados.pedido_os, pedido_cnpj: editDados.pedido_cnpj,
    }).completo
    if (['ELABORAR RM', 'ENVIAR RM', 'RM ENVIADA'].includes(novoStatus) && pedidoConferido) {
      statusFinal = 'EMITIR NF'
    }
    // Dados da obra completos (PC até OS Tecban) numa obra ainda na 1ª etapa - avança sozinho pra
    // próxima etapa da régua, sem precisar clicar manual (Shirley, 2026-08-14).
    if (novoStatus === 'OS ABERTA' && TIPOS_BDN.includes(modal.tipo)
      && [editDados.numero_pc, editDados.nome, editDados.endereco, editDados.cidade, editDados.uf, editDados.sige, editDados.os_tecban].every(v => (v || '').toString().trim() !== '')
      && editDados.valor !== '') {
      const etapas = getEtapas(modal.rede, modal.tipo)
      statusFinal = etapas[1] || statusFinal
    }
    // Data de obra preenchida numa movimentação ainda em "Agendamento" - avança sozinho pra
    // "Operação em Campo", sem precisar clicar manual (Shirley, 2026-08-20).
    const dataDeObraPreenchida = temTelaOperacaoCampo(modal.rede, modal.tipo) ? paraIsoDataObraTexto(dataInicioObraTexto) : dataObra.inicio
    if (novoStatus === 'AGENDAMENTO' && TIPOS_BDN.includes(modal.tipo) && dataDeObraPreenchida) {
      const etapas = getEtapas(modal.rede, modal.tipo)
      const idxAgendamento = etapas.indexOf('AGENDAMENTO')
      statusFinal = (idxAgendamento >= 0 && etapas[idxAgendamento + 1]) ? etapas[idxAgendamento + 1] : statusFinal
    }
    const campos = {
      status: statusFinal,
      // Só troca o tipo se a obra já era de família ATM (TIPOS_BDN) - corrige importação errada
      // do SIGE (ex: Desinstalação lida como Instalação) sem arriscar trocar pra uma família com
      // campos incompatíveis, tipo TRANSF UN (Shirley, 2026-08-19).
      ...(TIPOS_BDN.includes(modal.tipo) && editDados.tipo && TIPOS_BDN.includes(editDados.tipo) ? { tipo: editDados.tipo } : {}),
      obs: novaObs || modal.obs || null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.email,
      nome: editDados.nome || modal.nome,
      local: montaLocal(editDados.cidade, editDados.uf),
      endereco: editDados.endereco || null,
      cidade: editDados.cidade || null,
      uf: editDados.uf || null,
      valor: editDados.valor !== '' ? parseFloat(String(editDados.valor).replace(',', '.')) || 0 : null,
      sige: editDados.sige || null,
      numero_pc: editDados.numero_pc || null,
      pedido: editDados.pedido || null,
      nf: editDados.nf || null,
      os_tecban: editDados.os_tecban || null,
      pedido_valor: editDados.pedido_valor !== '' ? parseFloat(String(editDados.pedido_valor).replace(',', '.')) || 0 : null,
      pedido_os: editDados.pedido_os || null,
      pedido_cnpj: editDados.pedido_cnpj || null,
      pedido_tecban_cnpj: editDados.pedido_tecban_cnpj || null,
      pedido_tecban_nome: editDados.pedido_tecban_nome || null,
    }
    const listaVistoria = [...colabsVistoria, ...(terceirizadoVistoria ? [TERCEIRIZADO_PREFIXO + (terceirizadoVistoriaTexto.trim() || '(não informado)')] : [])]
    if (modal.tipo === 'TRANSF UN') {
      // Etapa 1 (Vistoria + BDN) não tem input próprio na tela - vem direto do bloco
      // "Data da vistoria" acima, pra não pedir a mesma informação (quem fez/quando) 2x.
      campos.data_etapa1 = dataVistoria || null
      campos.data_etapa2 = datas.data_etapa2 || null
      campos.data_etapa3 = datas.data_etapa3 || null
      campos.resp_etapa1 = listaVistoria.length > 0 ? listaVistoria.join(', ') : null
      campos.resp_etapa2 = resps.resp_etapa2 || null
      {
        const listaEtapa3 = [...equipeEtapa3, ...(terceirizadoEtapa3 ? [TERCEIRIZADO_PREFIXO + (terceirizadoEtapa3Texto.trim() || '(não informado)')] : [])]
        campos.resp_etapa3 = listaEtapa3.length > 0 ? listaEtapa3.join(', ') : null
      }
      campos.adesivos = adesivos.length > 0 ? adesivos.join(',') : null
      campos.vidros = vidros.length > 0 ? vidros : null
      campos.divisorias = divisorias.length > 0 ? divisorias : null
      campos.itens_especiais = itensEspeciais.length > 0 ? itensEspeciais : null
      campos.biombo_fila = biomboFila !== '' ? parseInt(biomboFila) || 0 : null
      campos.porta_giratoria = portaGiratoria !== '' ? parseInt(portaGiratoria) || 0 : null
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
      campos.entregaveis_na = entregaveisNA.length > 0 ? entregaveisNA : null
    }
    campos.entregaveis_vistoria = entregaveisVistoria.length > 0 ? entregaveisVistoria : null
    campos.data_vistoria = dataVistoria || null
    campos.colaboradores_vistoria = listaVistoria.length > 0 ? listaVistoria : null
    if (temTelaOperacaoCampo(modal.rede, modal.tipo)) {
      campos.ars_verificado = arsVerificado
      campos.ec_nome = ecNome || null
      campos.ec_telefone = ecTelefone || null
      campos.data_inicio_obra_texto = paraIsoDataObraTexto(dataInicioObraTexto)
      campos.hora_inicio_obra_texto = horaInicioObraTexto.trim() || null
      campos.seguranca_itens = segurancaItens.length > 0 ? segurancaItens : null
      campos.seguranca_itens_campo = segurancaItensCampo.length > 0 ? segurancaItensCampo : null
      campos.barreira_dissuasao = barreiraDissuasao
      campos.barreira_dissuasao_campo = barreiraDissuasaoCampo
      campos.autorizacao_mudanca = autorizacaoMudanca || null
      campos.agendamento_data = agendamentoData || null
      campos.registros_operacao_campo = registrosOperacaoCampo.length > 0 ? registrosOperacaoCampo : null
    }
    if (modal.tipo === 'TRANSF UN') {
      campos.registros_operacao_campo = registrosOperacaoCampo.length > 0 ? registrosOperacaoCampo : null
    }
    // TRANSF UN não usa mais um campo solto de "data de início" - o Cenário passou a ler direto as
    // datas da 1ª/2ª Etapa (data_etapa2/data_etapa3), então não sobrescreve data_obra_inicio pra
    // esse tipo (Shirley, 2026-08-20).
    if (modal.tipo !== 'TRANSF UN') campos.data_obra_inicio = dataObra.inicio || null
    const listaObra = [...colabsObra, ...(terceirizadoObra ? [TERCEIRIZADO_PREFIXO + (terceirizadoObraTexto.trim() || '(não informado)')] : [])]
    campos.colaboradores_obra = listaObra.length > 0 ? listaObra : null
    campos.responsavel_escritorio = responsavelEscritorio || null
    campos.auxiliar_escritorio = auxiliarEscritorio || null
    campos.custos_terceirizados = custosTerceirizados.length > 0 ? custosTerceirizados : null
    campos.despesas_pessoal = despesasPessoal.length > 0 ? despesasPessoal : null
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
    setItensEspeciais([])
    setBiomboFila('')
    setPortaGiratoria('')
    setEditDados({ tipo:'', nome:'', endereco:'', cidade:'', uf:'', valor:'', sige:'', numero_pc:'', pedido:'', nf:'', os_tecban:'', pedido_valor:'', pedido_os:'', pedido_cnpj:'', pedido_tecban_cnpj:'', pedido_tecban_nome:'' })
    setDataCadastroModal('')
    setDataVistoria('')
    setColabsVistoria([])
    setTerceirizadoVistoria(false)
    setTerceirizadoVistoriaTexto('')
    setArsVerificado(false)
    setEcNome('')
    setEcTelefone('')
    setDataInicioObraTexto('')
    setHoraInicioObraTexto('')
    setSegurancaItens([])
    setSegurancaItensCampo([])
    setBarreiraDissuasao(false)
    setBarreiraDissuasaoCampo(false)
    setAutorizacaoMudanca('')
    setAgendamentoConfirmado(false)
    setAgendamentoData('')
    setRegistrosOperacaoCampo([])
    setNovoRegistroData('')
    setNovoRegistroHora('')
    setNovoRegistroEquipe([])
    setNovoRegistroTerceirizado(false)
    setNovoRegistroTerceirizadoTexto('')
    setNovoRegistroAtividades({})
    setColabsObra([])
    setTerceirizadoObra(false)
    setTerceirizadoObraTexto('')
    setResponsavelEscritorio('')
    setAuxiliarEscritorio('')
    setCustosTerceirizados([])
    setNovoCustoTipo('GESSO')
    setNovoCustoValor('')
    setNovoCustoObs('')
    setDespesasPessoal([])
    setNovaDespesaData('')
    setNovaDespesaCategoria('Hospedagem')
    setNovaDespesaValor('')
    setNovaDespesaObs('')
    setNovaDespesaKm('')
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

  // Marca todas as obras de um grupo (mesmo CNPJ fornecedor+tomador) como faturadas de uma vez,
  // com o mesmo número de NF e vencimento (Shirley, 2026-08-25).
  async function marcarFaturadoGrupo(chaveGrupo, ids) {
    const d = grupoFaturarDados[chaveGrupo] || {}
    const campos = {
      status: 'NF EMITIDO',
      nf: d.nf || null,
      vencimento: d.vencimento || null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.email,
    }
    const { error } = await supabase.from('pipeline_obras').update(campos).in('id', ids)
    if (!error) {
      setObras(prev => prev.map(o => ids.includes(o.id) ? { ...o, ...campos } : o))
      setGrupoFaturarDados(prev => { const n = {...prev}; delete n[chaveGrupo]; return n })
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

  async function geocodificar(endereco) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(endereco)}`
    const resp = await fetch(url)
    const dados = await resp.json()
    if (!dados || dados.length === 0) return null
    return { lat: Number(dados[0].lat), lon: Number(dados[0].lon), nomeEncontrado: dados[0].display_name }
  }

  async function calcularKmRota() {
    if (!novaDespesaOrigem.trim() || !novaDespesaDestino.trim()) return
    setErroRota('')
    setCalculandoRota(true)
    try {
      const [origem, destino] = await Promise.all([geocodificar(novaDespesaOrigem), geocodificar(novaDespesaDestino)])
      if (!origem) { setErroRota('Não achei o endereço de origem. Tenta ser mais específico (cidade/UF).'); return }
      if (!destino) { setErroRota('Não achei o endereço de destino. Tenta ser mais específico (cidade/UF).'); return }
      const url = `https://router.project-osrm.org/route/v1/driving/${origem.lon},${origem.lat};${destino.lon},${destino.lat}?overview=false`
      const resp = await fetch(url)
      const dados = await resp.json()
      if (!dados.routes || dados.routes.length === 0) { setErroRota('Não consegui calcular uma rota entre esses dois pontos.'); return }
      const kmIdaEVolta = Math.round((dados.routes[0].distance / 1000) * 2)
      setNovaDespesaKm(String(kmIdaEVolta))
    } catch (err) {
      console.error('Erro ao calcular rota:', err)
      setErroRota('Erro ao calcular a rota — tenta de novo ou digita o km manualmente.')
    } finally {
      setCalculandoRota(false)
    }
  }

  const vistoriaCompleta = (Boolean(dataVistoria) && (colabsVistoria.length > 0 || (terceirizadoVistoria && terceirizadoVistoriaTexto.trim() !== '')))
    || (modal?.rede === 'BANCO24HORAS' && SEM_VISTORIA_BANCO24H.includes(modal?.tipo))
  const atividadesCobertas = new Set()
  registrosOperacaoCampo.forEach(r => (r.atividades || []).forEach(a => { if (typeof a.feita === 'boolean') atividadesCobertas.add(a.atividade) }))
  // Vistoria que fracassou (visita improdutiva - ex: gerente desistiu da instalação porque o local
  // vai sofrer obra e não sobra espaço pro ATM) também libera o Relatório ao Cliente/envio pra
  // Tecban, mesmo sem cobrir as atividades de instalação - o ciclo se encerra ali e precisa ser
  // faturado como improdutiva, não fica pendente pra sempre esperando uma instalação que não vai
  // acontecer (Fabio, 2026-08-20).
  const temVistoriaImprodutiva = registrosOperacaoCampo.some(r => (r.atividades || []).some(a => a.atividade === 'Vistoria' && a.feita === false && a.impedimento))
  const operacaoCampoCompleta = atividadesOperacaoCampoObrigatorias(modal?.rede, modal?.tipo).every(a => atividadesCobertas.has(a)) || temVistoriaImprodutiva

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
    if (filtroRede && o.rede !== filtroRede) return false
    if (filtroStatus && o.status !== filtroStatus) return false
    if (filtroResponsavel && o.responsavel_escritorio !== filtroResponsavel && o.auxiliar_escritorio !== filtroResponsavel) return false
    // Card do Cenario clicado: mostra so as obras daquele estado que tem evento no dia selecionado
    // (nao a pipeline inteira do estado, de qualquer dia/status). Exceção: "S/UF" é um problema de
    // cadastro (obra sem estado definido), não uma agenda do dia - mostra todas as S/UF direto, pra
    // dar pra achar e corrigir, mesmo sem atividade hoje (Shirley, 2026-08-20).
    if (filtroCenarioUF && estadoDaObra(o) !== filtroCenarioUF) return false
    if (filtroCenarioUF && filtroCenarioUF !== 'S/UF' && eventosCenarioObra(o, cenarioData).length === 0) return false
    if (busca) {
      // Busca por palavras (AND, qualquer ordem) em vez de substring literal - "BTG FLUMINENSE"
      // agora acha "BTG - AG. FLUMINENSE" ou "FLUMINENSE BTG", que a busca antiga (substring unico)
      // não achava (Shirley, 2026-08-19).
      const campos = [o.nome, o.local, o.cidade, o.uf, o.os_tecban, o.pedido, o.sige, o.numero_pc]
        .map(c => (c || '').toLowerCase()).join(' ')
      const palavras = busca.toLowerCase().trim().split(/\s+/).filter(Boolean)
      if (!palavras.every(p => campos.includes(p))) return false
    }
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

  const podeVerValores = papel === 'admin' || papel === 'administrativo' || papel === 'financeiro'
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

  // Cenário por estado: atividade agendada pra um dia especifico (cenarioData, navegavel pelas
  // setas - Shirley, 2026-08-18). Replica o que a Dani/Carol/Glauce postam todo dia no grupo do
  // WhatsApp "Demandas" - ex: "VISTORIA DE SUBSTITUIÇÃO" (data_vistoria bate com o dia) e/ou
  // "INSTALAÇÃO" (data de execução bate com o dia - data_obra_inicio pra maioria dos tipos,
  // data_inicio_obra_texto especificamente pra Banco24Horas, que não tem fase de vistoria).
  // Uma mesma obra pode contribuir com até 2 eventos no mesmo dia (vistoria de uma e execução de
  // outra, coincidencia rara mas possivel).
  // Lista fixa de estados (todos os que já têm obra ativa, ordem alfabética) - garante cor estável
  // por estado (não muda de um dia pro outro) e mostra o estado zerado quando não tem atividade
  // naquele dia, em vez de sumir do carrossel (Shirley, 2026-08-20).
  const todosEstadosCenario = [...new Set(obrasAtivas.map(estadoDaObra))].sort()
  const cenarioPorUFMap = {}
  todosEstadosCenario.forEach(estado => { cenarioPorUFMap[estado] = { uf: estado, obras: 0, movimentacao: 0, pendenteFaturar: 0, categorias: {} } })
  obrasAtivas.forEach(o => {
    // Pendente de faturar - independe do dia selecionado no Cenario, é o total de obras daquele
    // estado que ainda não chegaram em "Emitir NF" (Shirley, 2026-08-20: rodapé do card virou isso
    // em vez do total de eventos do dia, que ela achou confuso ali).
    if (!STATUS_FATURAR.includes(o.status)) cenarioPorUFMap[estadoDaObra(o)].pendenteFaturar++
    const eventos = eventosCenarioObra(o, cenarioData)
    if (eventos.length === 0) return
    const estado = estadoDaObra(o)
    eventos.forEach(ev => {
      cenarioPorUFMap[estado].categorias[ev.categoria] = (cenarioPorUFMap[estado].categorias[ev.categoria] || 0) + 1
      cenarioPorUFMap[estado][ev.familia]++
    })
  })
  const corPorEstadoCenario = {}
  todosEstadosCenario.forEach((estado, i) => { corPorEstadoCenario[estado] = CENARIO_CORES[i % CENARIO_CORES.length] })
  const cenarioPorUF = Object.values(cenarioPorUFMap).sort((a, b) => (b.obras + b.movimentacao) - (a.obras + a.movimentacao))

  const todasDespesas = []
  obras.forEach(o => {
    (Array.isArray(o.despesas_pessoal) ? o.despesas_pessoal : []).forEach(d => {
      todasDespesas.push({ ...d, obraId: o.id, obraNome: o.nome })
    })
  })
  const despesasSemData = todasDespesas.filter(d => !d.data)
  const despesasFiltradas = todasDespesas.filter(d => {
    if (!d.data) return false
    const ano = Number(d.data.slice(0, 4))
    const mes = Number(d.data.slice(5, 7))
    if (despesasModo === 'ano') return ano === despesasAno
    return ano === despesasAno && mes === despesasMes
  })
  const totalDespesas = despesasFiltradas.reduce((s, d) => s + Number(d.valor || 0), 0)
  const despesasPorCategoria = CATEGORIAS_DESPESA_PESSOAL.map(cat => ({
    categoria: cat,
    total: despesasFiltradas.filter(d => d.categoria === cat).reduce((s, d) => s + Number(d.valor || 0), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)
  const despesasPorObraMap = {}
  despesasFiltradas.forEach(d => {
    if (!despesasPorObraMap[d.obraId]) despesasPorObraMap[d.obraId] = { obraId: d.obraId, obraNome: d.obraNome, total: 0, itens: [] }
    despesasPorObraMap[d.obraId].total += Number(d.valor || 0)
    despesasPorObraMap[d.obraId].itens.push(d)
  })
  const despesasPorObraLista = Object.values(despesasPorObraMap).sort((a, b) => b.total - a.total)

  function exportarCSV() {
    const cab = ['Tipo','Nome','Local','Status','Valor','SIGE','PC/BDN','Pedido','NF','Início','Término','ART pronta','Em negociação','Observação','Post-its Régua','Data Entrada Pipeline','Dias no Pipeline','Vidros','Divisórias','Itens Especiais','Biombo de Fila','Porta Giratória','Atualizado por','Atualizado em']
    const linhasObras = obrasFiltradas.map(o => {
      const d = diasNoPipeline(o.data_cadastro)
      const ehMovimentacao = TIPOS_BDN.includes(o.tipo)
      return [
        o.tipo, o.nome, o.local||'', o.status,
        Number(o.valor||0),
        // O campo "sige" no banco guarda a SIGE de verdade pra obra normal, mas pra obra
        // de movimentação guardava (por engano, na importação de 06-07/08) o código
        // interno do pedido no SIGE, não o número real do PC - "numero_pc" é o campo
        // corrigido (ver "🔧 PC/BDN"). Cada tipo sai numa coluna diferente pra não
        // misturar os dois na mesma planilha (ver [[projeto-instalacao-atm]]).
        ehMovimentacao ? '' : (o.sige||''),
        ehMovimentacao ? (o.numero_pc || o.sige || '') : '',
        o.pedido||'', o.nf||'',
        o.inicio||'', o.termino||'',
        o.data_art ? isoToBr(o.data_art) : '',
        o.em_negociacao ? 'Sim' : '',
        (o.obs||'').replace(/\n/g,' '),
        Array.isArray(o.lembretes) && o.lembretes.length > 0
          ? o.lembretes.map(l => `Etapa ${l.etapa}: ${l.texto}${l.autor ? ` (${l.autor})` : ''}`).join(' | ')
          : '',
        o.data_cadastro ? isoToBr(o.data_cadastro) : '',
        d !== null ? d : '',
        Array.isArray(o.vidros) && o.vidros.length > 0 ? o.vidros.join(' | ') : '',
        Array.isArray(o.divisorias) && o.divisorias.length > 0 ? o.divisorias.map(d => `${d.tipo} ${d.m2}m²`).join(' | ') : '',
        Array.isArray(o.itens_especiais) && o.itens_especiais.length > 0 ? o.itens_especiais.join(' | ') : '',
        o.biombo_fila != null ? String(o.biombo_fila) : '',
        o.porta_giratoria != null ? String(o.porta_giratoria) : '',
        o.atualizado_por||'',
        o.atualizado_em ? new Date(o.atualizado_em).toLocaleString('pt-BR') : ''
      ]
    })
    const wsObras = XLSXStyle.utils.aoa_to_sheet([cab, ...linhasObras])
    wsObras['!cols'] = cab.map(() => ({ wch: 16 }))

    // Obras com tela de operação de campo (Banco24Horas/AgiBank/Crefisa, as 4 atividades sem vistoria própria de Banco24Horas) que tenham dado entrada de ARS
    const obrasB24h = obrasFiltradas.filter(o => temTelaOperacaoCampo(o.rede, o.tipo))

    const cabArs = ['Obra','PC','Status','Entrou no ARS','Contato EC - nome','Contato EC - telefone','Data início (confirmada)','Hora início (confirmada)','ARS solicitado','Campo executado','Barreira dissuasão (ARS)','Barreira dissuasão (Campo)','Quem autorizou a mudança']
    const linhasArs = obrasB24h.map(o => [
      o.nome, o.numero_pc || '', o.status,
      o.ars_verificado ? 'Sim' : 'Não',
      o.ec_nome || '', o.ec_telefone || '',
      isoToBr(paraIsoDataObraTexto(o.data_inicio_obra_texto)) || '', o.hora_inicio_obra_texto || '',
      Array.isArray(o.seguranca_itens) ? o.seguranca_itens.join(' | ') : '',
      Array.isArray(o.seguranca_itens_campo) ? o.seguranca_itens_campo.join(' | ') : '',
      o.barreira_dissuasao ? 'Sim' : 'Não',
      o.barreira_dissuasao_campo ? 'Sim' : 'Não',
      o.autorizacao_mudanca || '',
    ])
    const wsArs = XLSXStyle.utils.aoa_to_sheet([cabArs, ...linhasArs])
    wsArs['!cols'] = cabArs.map(() => ({ wch: 20 }))

    const cabDia = ['Obra','PC','Data da visita','Equipe','Atividade','Feita','Impedimento/Desvio','Motivo','Descrição (Outros)','Dimer finalizado','Motivo Dimer','Alarme 253 finalizado','Motivo Alarme 253','Quem atendeu no CGR']
    const linhasDia = []
    obrasB24h.forEach(o => {
      const registros = Array.isArray(o.registros_operacao_campo) ? o.registros_operacao_campo : []
      registros.forEach(r => {
        (r.atividades || []).forEach(a => {
          linhasDia.push([
            o.nome, o.numero_pc || '',
            r.data ? isoToBr(r.data) : '',
            Array.isArray(r.equipe) ? r.equipe.join(', ') : '',
            a.atividade, a.feita ? 'Sim' : 'Não', a.impedimento ? 'Sim' : 'Não', a.motivo || '',
            a.atividade === 'Outros' ? (a.descricao || '') : '',
            a.atividade === 'Habilitação' ? (a.dimerFinalizado ? 'Sim' : 'Não') : '',
            a.atividade === 'Habilitação' ? (a.dimerMotivo || '') : '',
            a.atividade === 'Habilitação' ? (a.alarme253Finalizado ? 'Sim' : 'Não') : '',
            a.atividade === 'Habilitação' ? (a.alarme253Motivo || '') : '',
            a.atividade === 'Habilitação' ? (a.cgrNome || '') : '',
          ])
        })
      })
    })
    const wsDia = XLSXStyle.utils.aoa_to_sheet([cabDia, ...linhasDia])
    wsDia['!cols'] = cabDia.map(() => ({ wch: 20 }))

    const estiloHeader = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2D3A8C' } } }
    ;[[wsObras, cab], [wsArs, cabArs], [wsDia, cabDia]].forEach(([ws, cabecalho]) => {
      cabecalho.forEach((_, col) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: col })
        if (ws[ref]) ws[ref].s = estiloHeader
      })
    })

    const wb = XLSXStyle.utils.book_new()
    XLSXStyle.utils.book_append_sheet(wb, wsObras, 'Pipeline')
    XLSXStyle.utils.book_append_sheet(wb, wsArs, 'Banco24Horas - ARS')
    XLSXStyle.utils.book_append_sheet(wb, wsDia, 'Banco24Horas - Dia da obra')
    const d = new Date()
    const nomeArquivo = `pipeline-${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}.xlsx`
    XLSXStyle.writeFile(wb, nomeArquivo)
  }

  async function processarCorrecaoPC() {
    if (!corrigirPCArquivo) return
    setCorrigirPCProcessando(true)
    setCorrigirPCErro('')
    try {
      const buf = await corrigirPCArquivo.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const linhas = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const pcPorCodigo = {}
      linhas.forEach(l => {
        const codigo = String(l['Código'] || '').trim()
        const pc = String(l['AtributosId_NdoPC'] || '').trim()
        if (codigo && pc) pcPorCodigo[codigo] = pc
      })
      const encontrados = []
      obras.forEach(o => {
        if (!TIPOS_BDN.includes(o.tipo)) return
        const codigo = String(o.sige || '').trim()
        if (!codigo || !pcPorCodigo[codigo]) return
        const novoPc = pcPorCodigo[codigo]
        if (novoPc === (o.numero_pc || '')) return
        encontrados.push({ id: o.id, nome: o.nome, tipo: o.tipo, sige: codigo, numeroPcAtual: o.numero_pc || '', numeroPcNovo: novoPc })
      })
      setCorrigirPCPreview(encontrados)
    } catch (e) {
      setCorrigirPCErro('Erro ao ler a planilha: ' + e.message)
    }
    setCorrigirPCProcessando(false)
  }

  async function confirmarCorrecaoPC() {
    if (!corrigirPCPreview || corrigirPCPreview.length === 0) return
    setCorrigirPCSalvando(true)
    const TAMANHO_LOTE = 20
    let erroGeral = null
    const corrigidos = []
    for (let i = 0; i < corrigirPCPreview.length; i += TAMANHO_LOTE) {
      const lote = corrigirPCPreview.slice(i, i + TAMANHO_LOTE)
      const resultados = await Promise.all(lote.map(c =>
        supabase.from('pipeline_obras').update({ numero_pc: c.numeroPcNovo }).eq('id', c.id)
      ))
      const comErro = resultados.find(r => r.error)
      if (comErro) { erroGeral = comErro.error; break }
      corrigidos.push(...lote)
    }
    if (erroGeral) {
      setCorrigirPCErro(`Erro ao salvar (${corrigidos.length} de ${corrigirPCPreview.length} já corrigidas antes do erro): ` + erroGeral.message)
    } else {
      const porId = {}
      corrigidos.forEach(c => { porId[c.id] = c.numeroPcNovo })
      setObras(prev => prev.map(o => porId[o.id] != null ? { ...o, numero_pc: porId[o.id] } : o))
      setModalCorrigirPC(false)
      setCorrigirPCArquivo(null)
      setCorrigirPCPreview(null)
    }
    setCorrigirPCSalvando(false)
  }

  async function processarImportacaoNovas() {
    if (!importarNovasArquivo) return
    setImportarNovasProcessando(true)
    setImportarNovasErro('')
    try {
      const buf = await importarNovasArquivo.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const linhasPlanilha = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const sigesExistentes = new Set(obras.map(o => (o.sige || '').trim()).filter(Boolean))
      const naoClassificados = {}
      let excluidosPorTipo = 0
      const candidatos = []
      linhasPlanilha.forEach(l => {
        const codigo = String(l['Código'] || '').trim()
        if (!codigo || sigesExistentes.has(codigo)) return
        const tipo = classificaTipoMovimentacaoSige(l['AtributosId_TIPODESERVICO'])
        if (tipo === null) { excluidosPorTipo++; return }
        if (tipo === undefined) {
          const chave = String(l['AtributosId_TIPODESERVICO'] || '(vazio)').trim()
          naoClassificados[chave] = (naoClassificados[chave] || 0) + 1
          return
        }
        const rede = normalizaRedeImportacaoSige(l['AtributosId_REDE'])
        const ehBradesco = rede === 'BRADESCO'
        const statusBruto = String(l['Status'] || '').trim().toUpperCase()
        const mapa = ehBradesco ? STATUS_MOVIMENTACAO_BRADESCO_SIGE : STATUS_MOVIMENTACAO_NAO_BRADESCO_SIGE
        const status = mapa[statusBruto] || 'OS ABERTA'

        let cidade = String(l['AtributosId_CIDADE'] || '').trim()
        const uf = String(l['AtributosId_UF'] || '').trim()
        cidade = cidade.replace(new RegExp(`\\s*-\\s*${uf}$`, 'i'), '').trim()
        let nome = String(l['AtributosId_NomedoPC'] || '').trim()
        if (!nome || nome === 'NA' || nome === 'ND') nome = cidade || codigo

        const pedidoBruto = String(l['AtributosId_PedidoTB'] || '').trim()
        const pedido = /^\d+$/.test(pedidoBruto) ? pedidoBruto : null
        const nfBruto = String(l['AtributosId_NF'] || '').trim()
        const nf = /^\d+$/.test(nfBruto) ? nfBruto : null
        const osTecban = String(l['AtributosId_OrdemdeservicosTB'] || '').trim() || null
        const numeroPc = String(l['AtributosId_NdoPC'] || '').trim() || null
        const valor = Number(l['Valor Total']) || 0
        const dataCadastro = excelSerialParaIso(l['Data']) || excelSerialParaIso(l['AtributosId_DATAINICIO']) || hojeIso()
        const redeOriginal = String(l['AtributosId_REDE'] || '').trim()

        candidatos.push({
          tipo, rede, status, nome, cidade, uf, sige: codigo, pedido, nf, os_tecban: osTecban, numero_pc: numeroPc, valor, data_cadastro: dataCadastro,
          obs: `Importado do relatório SIGE (${new Date().toLocaleDateString('pt-BR')}) - tipo original: ${l['AtributosId_TIPODESERVICO'] || '—'} - status original: ${l['Status'] || '—'}${rede !== redeOriginal ? ` - rede original: ${redeOriginal}` : ''}`,
        })
        sigesExistentes.add(codigo)
      })
      setImportarNovasPreview({ candidatos, excluidosPorTipo, naoClassificados })
    } catch (e) {
      setImportarNovasErro('Erro ao ler a planilha: ' + e.message)
    }
    setImportarNovasProcessando(false)
  }

  async function confirmarImportacaoNovas() {
    if (!importarNovasPreview || importarNovasPreview.candidatos.length === 0) return
    setImportarNovasSalvando(true)
    const linhas = importarNovasPreview.candidatos.map(c => ({
      tipo: c.tipo, nome: c.nome, local: montaLocal(c.cidade, c.uf), cidade: c.cidade || null, uf: c.uf || null,
      valor: c.valor, sige: c.sige, pedido: c.pedido, nf: c.nf, os_tecban: c.os_tecban, numero_pc: c.numero_pc, status: c.status, rede: c.rede,
      data_cadastro: c.data_cadastro, obs: c.obs, criado_por: usuario?.email || null, atualizado_por: usuario?.email || null,
      atualizado_em: new Date().toISOString(),
    }))
    const TAMANHO_LOTE = 200
    let erroGeral = null
    const inseridos = []
    for (let i = 0; i < linhas.length; i += TAMANHO_LOTE) {
      const lote = linhas.slice(i, i + TAMANHO_LOTE)
      const { data, error } = await supabase.from('pipeline_obras').insert(lote).select()
      if (error) { erroGeral = error; break }
      inseridos.push(...(data || []))
    }
    if (erroGeral) {
      setImportarNovasErro(`Erro ao salvar (${inseridos.length} de ${linhas.length} já inseridas antes do erro): ` + erroGeral.message)
    } else {
      setObras(prev => ordenaObras([...prev, ...inseridos]))
      setModalImportarNovas(false)
      setImportarNovasArquivo(null)
      setImportarNovasPreview(null)
    }
    setImportarNovasSalvando(false)
  }

  return (
    <div style={estilo}>
      {/* Header */}
      <div style={{ background:'#1A2340', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>Pipeline de Obras</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginTop:2 }}>
            Grupo PG — {obras.length} obras · {emAndamento} em execução · <span style={{ color: pendencias > 0 ? '#FCA5A5' : 'inherit' }}>{pendencias} pendência{pendencias === 1 ? '' : 's'}</span>
            {EMAILS_VER_VALORES_TOPO.includes(usuario?.email) && (
              <> · R${(totalValor/1000).toFixed(0)}k em andamento · <span style={{ color: obrasFaturar.length > 0 ? '#FDE68A' : 'inherit' }}>R${(totalFaturar/1000).toFixed(0)}k a faturar</span></>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {podeVerValores && (
            <button onClick={() => setModalNovaObra(true)}
              style={{ background:'#1A6B4A', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', padding:'6px 12px', borderRadius:8 }}>
              + Nova
            </button>
          )}
          {podeVerValores && (
            <button onClick={exportarCSV}
              style={{ background:'#0E4D73', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', padding:'6px 12px', borderRadius:8 }}>
              ↓ Excel
            </button>
          )}
          {papel === 'admin' && (
            <button onClick={() => setModalCorrigirPC(true)}
              style={{ background:'none', border:'1px solid rgba(255,255,255,.3)', color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:700, cursor:'pointer', padding:'6px 10px', borderRadius:8 }}>
              🔧 PC/BDN
            </button>
          )}
          {papel === 'admin' && (
            <button onClick={() => setModalImportarNovas(true)}
              style={{ background:'none', border:'1px solid rgba(255,255,255,.3)', color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:700, cursor:'pointer', padding:'6px 10px', borderRadius:8 }}>
              📥 Importar novas
            </button>
          )}
          {papel && <span style={{ fontSize:10, color:'rgba(255,255,255,.5)', textTransform:'uppercase' }}>{papel}</span>}
          <button onClick={() => supabase.auth.signOut()} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:12, cursor:'pointer' }}>Sair</button>
        </div>
      </div>


      {/* Abas */}
      <div style={{ background:'#fff', borderBottom:'2px solid #E0E8F0', display:'flex' }}>
        {[
          { id:'pipeline', label:'Pipeline', count: obrasFiltradas.length },
          ...(podeVerValores ? [{ id:'faturar', label:'Disponível para Faturar', count: obrasFaturar.length, cor:'#1A6B4A' }] : []),
          ...(podeVerValores ? [{ id:'historico', label:'Histórico', count: obras.filter(o=>o.status==='NF EMITIDO').length }] : []),
          ...((papel === 'admin' || papel === 'rh' || papel === 'financeiro') ? [{ id:'rh', label:'RH', count: rhColaboradores.length, cor:'#7C3AED' }] : []),
          ...(papel ? [{ id:'meusdados', label:'Meus Documentos', count:null, cor:'#7C3AED' }] : []),
          ...((papel === 'admin' || papel === 'rh' || papel === 'financeiro') ? [{ id:'jantas', label:'Jantas', count: jantasTodas.filter(j => j.status === 'pendente').length, cor:'#B45309' }] : []),
          ...(EMAILS_CUSTOS_DESPESAS.includes(usuario?.email) ? [{ id:'despesas', label:'Despesas', count:null, cor:'#B91C1C' }] : []),
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            style={{ flex:1, padding:'12px 8px', border:'none', borderBottom: aba===a.id ? `3px solid ${a.cor||'#2D3A8C'}` : '3px solid transparent',
              background:'none', cursor:'pointer', fontSize:12, fontWeight: aba===a.id ? 700 : 500,
              color: aba===a.id ? (a.cor||'#2D3A8C') : '#64748B' }}>
            {a.label}
            {a.count != null && (
              <span style={{ marginLeft:5, fontSize:10, background: aba===a.id ? (a.cor||'#2D3A8C') : '#E0E8F0',
                color: aba===a.id ? '#fff' : '#64748B', borderRadius:10, padding:'1px 6px', fontWeight:700 }}>
                {a.count}
              </span>
            )}
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
              {(() => {
                const obrasCorrecao = obrasFaturar.filter(o => conferePedidoObra(o).precisaCorrecao)
                const obrasProntas = obrasFaturar.filter(o => conferePedidoObra(o).completo)
                const idsProntas = new Set(obrasProntas.map(o => o.id))
                const obrasOutras = obrasFaturar.filter(o => !conferePedidoObra(o).precisaCorrecao && !idsProntas.has(o.id))
                const grupos = agruparParaFaturamento(obrasProntas)
                return (
                  <>
                    {obrasCorrecao.length > 0 && (
                      <div style={{ fontSize:11, color:'#9A3412', fontWeight:700, marginTop:6, marginBottom:10, padding:'8px 12px', background:'#FFF7ED', borderRadius:8, border:'1px solid #FED7AA' }}>
                        ⚠ Precisa de correção antes de faturar ({obrasCorrecao.length})
                      </div>
                    )}
                    {obrasCorrecao.map(o => {
                      const conf = conferePedidoObra(o)
                      const tc = TIPO_COR[o.tipo] || { bg:'#F1F5F9', text:'#475569' }
                      const sc = STATUS_COR[o.status] || { bg:'#F1F5F9', text:'#475569' }
                      return (
                        <div key={o.id} style={{ background:'#fff', border:'1px solid #FED7AA', borderRadius:12, marginBottom:10, padding:'12px 14px' }}>
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
                          <div style={{ fontSize:11, background:'#FFF7ED', borderLeft:'3px solid #EA580C', padding:'5px 8px', borderRadius:4, color:'#9A3412', marginBottom:10 }}>
                            ⚠ Divergência no pedido:{conf.temValor && !conf.valorBate && ' valor'}{conf.temOs && !conf.osBate && ' · OS'}{conf.temCnpj && !conf.cnpjBate && ' · CNPJ'}
                          </div>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={async () => {
                              const campos = { status:'RM ENVIADA', atualizado_em: new Date().toISOString(), atualizado_por: usuario.email }
                              const { error } = await supabase.from('pipeline_obras').update(campos).eq('id', o.id)
                              if (!error) setObras(prev => prev.map(ob => ob.id === o.id ? { ...ob, ...campos } : ob))
                            }}
                              style={{ flex:1, padding:'10px', background:'#fff', color:'#2D3A8C', border:'1.5px solid #2D3A8C', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                              ↩ Devolver ao Pipeline
                            </button>
                            <button onClick={() => {
                              setModal(o)
                              setEditDados({ tipo: o.tipo||'', nome: o.nome||'', endereco: o.endereco||'', cidade: o.cidade||'', uf: o.uf||'', valor: o.valor!=null ? String(o.valor) : '', sige: o.sige||'', numero_pc: o.numero_pc||'', pedido: o.pedido||'', nf: o.nf||'', os_tecban: o.os_tecban||'', pedido_valor: o.pedido_valor!=null ? String(o.pedido_valor) : '', pedido_os: o.pedido_os||'', pedido_cnpj: o.pedido_cnpj||'', pedido_tecban_cnpj: o.pedido_tecban_cnpj||'', pedido_tecban_nome: o.pedido_tecban_nome||'' })
                              setMostrarEnvioCorrecaoPedido(true)
                            }}
                              style={{ flex:1, padding:'10px', background:'#EA580C', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                              📧 Solicitar correção à Tecban
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {grupos.length > 0 && (
                      <div style={{ fontSize:11, color:'#1A6B4A', fontWeight:700, marginTop:16, marginBottom:10, padding:'8px 12px', background:'#D1FAE5', borderRadius:8 }}>
                        ✓ Prontos pra faturar, agrupados por CNPJ ({grupos.length} grupo{grupos.length===1?'':'s'})
                      </div>
                    )}
                    {grupos.map(g => {
                      const gd = grupoFaturarDados[g.chave] || {}
                      const ufGrupo = ufDoCnpjFornecedor(g.cnpjFornecedor)
                      return (
                        <div key={g.chave} style={{ background:'#fff', border:'1px solid #D1FAE5', borderRadius:12, marginBottom:10, overflow:'hidden' }}>
                          <div onClick={() => setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), expandido: !gd.expandido}}))}
                            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, padding:'12px 14px', cursor:'pointer', background: gd.expandido ? '#F0FDF4' : '#fff' }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', flex:1, lineHeight:1.4, minWidth:0 }}>
                              {ufGrupo ? `${ufGrupo} – ` : ''}{g.nomeTecban || 'Tecban'} <span style={{ fontWeight:400, color:'#64748B' }}>· tomador {g.cnpjTomador || '(sem CNPJ)'}</span>
                            </div>
                            <div style={{ fontSize:11, color:'#64748B', fontWeight:700, whiteSpace:'nowrap' }}>QTD {g.obras.length}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:'#1A6B4A', whiteSpace:'nowrap' }}>{fmt(g.total)}</div>
                            <span style={{ fontSize:12, color:'#64748B', transform: gd.expandido ? 'rotate(180deg)' : 'none', display:'inline-block' }}>▼</span>
                          </div>
                          {gd.expandido && (
                          <div style={{ padding:'0 14px 14px', borderTop:'1px solid #F0F4F8' }}>
                          <div style={{ fontSize:11, color:'#475569', margin:'10px 0' }}>
                            Fornecedor (Grupo PG): <b>{g.cnpjFornecedor}</b> · {g.obras.length} serviço{g.obras.length===1?'':'s'} (máx. {MAX_SERVICOS_POR_GRUPO_FATURAMENTO}/grupo)
                          </div>
                          <div style={{ background:'#F8FAFC', borderRadius:8, padding:'6px 10px', marginBottom:10 }}>
                            {g.obras.map(o => (
                              <div key={o.id} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#334155', padding:'3px 0' }}>
                                <span>{o.nome}{o.pedido ? ` · Pedido ${o.pedido}` : ''}</span>
                                <span style={{ fontWeight:600, whiteSpace:'nowrap', marginLeft:8 }}>{fmt(o.valor)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ background:'#F0F4F8', borderRadius:10, padding:10, marginBottom:10 }}>
                            <div style={{ fontSize:11, color:'#2D3A8C', fontWeight:700, marginBottom:8 }}>Dados para faturamento do grupo</div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                              <div>
                                <label style={{ fontSize:10, color:'#64748B', fontWeight:600, display:'block', marginBottom:3 }}>Nº da NF *</label>
                                <input value={gd.nf||''} onChange={e => setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), nf: e.target.value}}))}
                                  placeholder="Ex: 3185"
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize:10, color:'#64748B', fontWeight:600, display:'block', marginBottom:3 }}>Vencimento</label>
                                <input type="date" value={gd.vencimento||''} onChange={e => setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), vencimento: e.target.value}}))}
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ marginBottom:10 }}>
                            <button onClick={() => setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), mostrarTextoNF: !gd.mostrarTextoNF}}))}
                              style={{ width:'100%', padding:'8px 10px', background:'#EFF6FF', color:'#1E40AF', border:'1px solid #BFDBFE', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              📄 {gd.mostrarTextoNF ? 'Esconder' : 'Gerar'} texto para NF
                            </button>
                            {gd.mostrarTextoNF && (() => {
                              const textoNF = montaTextoNF(g, gd.vencimento)
                              return (
                                <div style={{ marginTop:8 }}>
                                  <textarea readOnly value={textoNF} rows={g.obras.length + 4}
                                    style={{ width:'100%', padding:10, border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', fontFamily:'monospace', resize:'vertical' }} />
                                  <button onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(textoNF)
                                      setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), copiado: true}}))
                                      setTimeout(() => setGrupoFaturarDados(prev => ({...prev, [g.chave]: {...(prev[g.chave]||{}), copiado: false}})), 2000)
                                    } catch (err) {}
                                  }}
                                    style={{ width:'100%', marginTop:6, padding:'8px 10px', background:'#1E40AF', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                                    {gd.copiado ? '✓ Copiado!' : '📋 Copiar texto'}
                                  </button>
                                </div>
                              )
                            })()}
                          </div>
                          <button onClick={() => marcarFaturadoGrupo(g.chave, g.obras.map(o => o.id))}
                            disabled={!gd.nf}
                            style={{ width:'100%', padding:'10px', background: gd.nf ? '#1A6B4A' : '#ccc', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor: gd.nf ? 'pointer' : 'default' }}>
                            ✓ Marcar grupo inteiro como Faturado ({g.obras.length})
                          </button>
                          </div>
                          )}
                        </div>
                      )
                    })}

                    {obrasOutras.map(o => {
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
                              const campos = { status:'RM ENVIADA', atualizado_em: new Date().toISOString(), atualizado_por: usuario.email }
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
                )
              })()}
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

      {/* ====== ABA: RH — Colaboradores (com sub-navegação lateral) ====== */}
      {aba === 'rh' && rhSubaba === 'colaboradores' && (papel === 'admin' || papel === 'rh' || papel === 'financeiro') && (
        <div style={{ display:'flex', alignItems:'flex-start' }}>
          <SidebarRH ativa={rhSubaba} onChange={setRhSubaba} totalColaboradores={rhColaboradores.length} totalHolerites={holeritesSalvos.length} />
          <div style={{ flex:1, minWidth:0, padding:12 }}>
          <div style={{ fontSize:11, color:'#5B21B6', fontWeight:700, marginBottom:10, padding:'8px 12px', background:'#EDE9FE', borderRadius:8, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
            <span>{rhColaboradores.length} colaborador(es) cadastrado(s)</span>
            {(() => {
              const comPendencia = rhColaboradores.filter(c => contarPendenciasRH(c, perfisLogin) > 0).length
              return comPendencia > 0
                ? <span style={{ color:'#991B1B' }}>⚠ {comPendencia} com documentação pendente</span>
                : <span style={{ color:'#065F46' }}>✓ Todos em dia</span>
            })()}
          </div>

          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ fontSize:12, color:'#5B21B6', fontWeight:700, marginBottom:10 }}>📥 Importar descontos (.xlsx)</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <input type="file" accept=".xlsx,.xls" onChange={handleDescontosUpload} style={{ fontSize:12 }} />
              {descontosAbas.length > 0 && (
                <select value={descontosAbaEscolhida} onChange={e => setDescontosAbaEscolhida(e.target.value)}
                  style={{ padding:'6px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                  {descontosAbas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              )}
            </div>
            {descontosProcessando && <div style={{ fontSize:12, color:'#888', marginTop:8 }}>Lendo arquivo...</div>}
            {descontosErro && <div style={{ fontSize:12, color:'#991B1B', marginTop:8 }}>{descontosErro}</div>}
            {descontosNomeArquivo && !descontosProcessando && (
              <div style={{ fontSize:11, color:'#888', marginTop:8 }}>Arquivo: {descontosNomeArquivo}</div>
            )}

            {(() => {
              const { lancamentos, erro } = descontosPreviewInfo
              if (erro) return <div style={{ fontSize:12, color:'#991B1B', marginTop:8 }}>{erro}</div>
              if (!descontosAbaEscolhida || lancamentos.length === 0) return null
              const novos = lancamentos.filter(l => l.status === 'novo')
              const duplicados = lancamentos.filter(l => l.status === 'duplicado')
              const naoEncontrados = lancamentos.filter(l => l.status === 'nao_encontrado')
              const invalidos = lancamentos.filter(l => l.status === 'invalido')
              return (
                <div style={{ marginTop:10 }}>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:11, marginBottom:8 }}>
                    <span style={{ color:'#065F46' }}>✓ {novos.length} novo(s)</span>
                    <span style={{ color:'#888' }}>= {duplicados.length} já importado(s)</span>
                    {naoEncontrados.length > 0 && <span style={{ color:'#991B1B' }}>⚠ {naoEncontrados.length} nome não encontrado no RH</span>}
                    {invalidos.length > 0 && <span style={{ color:'#92400E' }}>⚠ {invalidos.length} valor não numérico (confere manualmente)</span>}
                  </div>

                  {naoEncontrados.length > 0 && (
                    <div style={{ fontSize:11, color:'#991B1B', marginBottom:8 }}>
                      Não encontrados: {[...new Set(naoEncontrados.map(l => l.nomeBruto))].join(', ')}
                    </div>
                  )}
                  {invalidos.length > 0 && (
                    <div style={{ fontSize:11, color:'#92400E', marginBottom:8 }}>
                      {invalidos.map((l, idx) => <div key={idx}>{l.nomeBruto} — {l.mes} — "{l.textoOriginal}"</div>)}
                    </div>
                  )}

                  {(novos.length > 0 || duplicados.length > 0) && (
                    <div style={{ maxHeight:220, overflowY:'auto', border:'1px solid #E0E8F0', borderRadius:8, marginBottom:10 }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                        <thead>
                          <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                            <th style={{ padding:6 }}>Colaborador</th>
                            <th style={{ padding:6 }}>Motivo</th>
                            <th style={{ padding:6 }}>Mês</th>
                            <th style={{ padding:6 }}>Valor</th>
                            <th style={{ padding:6 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {novos.concat(duplicados).map((l, idx) => (
                            <tr key={idx} style={{ borderTop:'1px solid #F1F5F9' }}>
                              <td style={{ padding:6 }}>{l.colaboradorNome || l.nomeBruto}</td>
                              <td style={{ padding:6 }}>{rubricaLabel(l.motivo)}</td>
                              <td style={{ padding:6 }}>{l.mes}</td>
                              <td style={{ padding:6 }}>R$ {l.valor.toFixed(2)}</td>
                              <td style={{ padding:6, color: l.status === 'novo' ? '#065F46' : '#888' }}>{l.status === 'novo' ? 'Novo' : 'Já importado'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button onClick={confirmarImportacaoDescontos} disabled={novos.length === 0 || descontosImportando}
                    style={{ padding:'8px 16px', background: novos.length === 0 ? '#CBD5E1' : '#5B21B6', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor: novos.length === 0 ? 'default' : 'pointer' }}>
                    {descontosImportando ? 'Importando...' : `Confirmar importação (${novos.length} lançamento(s))`}
                  </button>
                </div>
              )
            })()}

            {descontosResultado && (
              <div style={{ fontSize:12, color:'#065F46', marginTop:8 }}>
                ✓ {descontosResultado.lancamentos} lançamento(s) importado(s) para {descontosResultado.colaboradores} colaborador(es).
              </div>
            )}
          </div>

          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ fontSize:12, color:'#5B21B6', fontWeight:700, marginBottom:10 }}>+ Novo colaborador</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <input value={novoRhNomeCompleto} onChange={e => setNovoRhNomeCompleto(e.target.value)}
                placeholder="Nome completo" style={{ flex:2, minWidth:180, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
              <select value={novoRhBaseCadastrado} onChange={e => setNovoRhBaseCadastrado(e.target.value)}
                style={{ padding:'7px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                <option value="">Base cadastrado</option>
                {BASES_GRUPOPG.map(b => <option key={b.nome} value={b.nome}>{b.label}</option>)}
              </select>
              <select value={novoRhBaseAtua} onChange={e => setNovoRhBaseAtua(e.target.value)}
                style={{ padding:'7px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                <option value="">Base onde atua</option>
                {BASES_GRUPOPG.map(b => <option key={b.nome} value={b.nome}>{b.label}</option>)}
              </select>
              <button onClick={adicionarRH}
                style={{ padding:'7px 14px', background:'#5B21B6', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                + Adicionar
              </button>
            </div>
          </div>

          <input value={filtroRhNome} onChange={e => setFiltroRhNome(e.target.value)}
            placeholder="🔎 Buscar colaborador por nome..."
            style={{ width:'100%', padding:'9px 12px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginBottom:10 }} />

          {rhColaboradores
            .filter(c => !filtroRhNome || `${c.nome} ${c.sobrenome || ''}`.toLowerCase().includes(filtroRhNome.toLowerCase()))
            .map(c => (
            <ColaboradorRHRow key={c.id} c={c} emailsLogin={emailsLogin} perfisLogin={perfisLogin}
              onUpdate={campos => atualizarRH(c.id, campos)}
              onRemove={() => removerRH(c.id)} />
          ))}
        </div>
        </div>
      )}

      {/* ====== ABA: MEUS DOCUMENTOS (operacional) ====== */}
      {aba === 'meusdados' && papel && (
        <div style={{ padding:12 }}>
          {carregandoMeuRH ? (
            <div style={{ textAlign:'center', color:'#888', marginTop:40, fontSize:14 }}>Carregando...</div>
          ) : !meuRH ? (
            <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:12, padding:16, fontSize:13, color:'#92400E' }}>
              🔒 Seu cadastro ainda não foi vinculado ao seu e-mail de login. Peça pro RH vincular seu e-mail na aba de colaboradores.
            </div>
          ) : (() => {
            const vencimentoAso = somaAnos(meuRH.data_aso, 1)
            const statusAso = statusVencimento(vencimentoAso)
            const statusCnh = statusVencimento(meuRH.data_vencimento_cnh)
            const previsaoFerias = proximaFeriasEstimativa(meuRH.data_admissao)
            const precisaNRSelf = papel === 'operacional'
            const nrs = [
              { label:'NR6', status:interpretaStatusDoc(meuRH.nr6, NR_VALIDADE_ANOS.nr6, precisaNRSelf) },
              { label:'NR10', status:interpretaStatusDoc(meuRH.nr10, NR_VALIDADE_ANOS.nr10, precisaNRSelf) },
              { label:'NR33', status:interpretaStatusDoc(meuRH.nr33, NR_VALIDADE_ANOS.nr33, precisaNRSelf) },
              { label:'NR35', status:interpretaStatusDoc(meuRH.nr35, NR_VALIDADE_ANOS.nr35, precisaNRSelf) },
              { label:'NR12', status:interpretaStatusDoc(meuRH.nr12, NR_VALIDADE_ANOS.nr12, precisaNRSelf) },
            ]
            const pontoPendentes = mesesPendentes(meuRH.ponto_assinado_meses, 2026)
            const holeriteAdiantPendentes = mesesPendentes(meuRH.holerite_adiantamento_meses, 2026)
            const holeritePagtoPendentes = mesesPendentes(meuRH.holerite_pagamento_meses, 2026)
            const epis = Array.isArray(meuRH.epis) ? meuRH.epis : []
            const descontos = Array.isArray(meuRH.descontos) ? meuRH.descontos : []
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ background:'#EDE9FE', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#5B21B6' }}>{meuRH.nome} {meuRH.sobrenome}</div>
                  <div style={{ fontSize:12, color:'#5B21B6', marginTop:2 }}>
                    Base cadastrado: {meuRH.base_cadastrado || '—'} · Base onde atua: {meuRH.base_atua || '—'}
                  </div>
                </div>

                <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:12, color:'#1A2340', fontWeight:700, marginBottom:10 }}>Situação documental</div>
                  <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>ASO</div>
                      {vencimentoAso
                        ? <span style={{ fontSize:12, fontWeight:700, padding:'4px 8px', borderRadius:6, background:statusAso.bg, color:statusAso.cor }}>{isoToBr(vencimentoAso)} · {statusAso.label}</span>
                        : <span style={{ fontSize:12, color:'#888' }}>—</span>}
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>CNH</div>
                      {statusCnh
                        ? <span style={{ fontSize:12, fontWeight:700, padding:'4px 8px', borderRadius:6, background:statusCnh.bg, color:statusCnh.cor }}>{isoToBr(meuRH.data_vencimento_cnh)} · {statusCnh.label}</span>
                        : <span style={{ fontSize:12, color:'#888' }}>—</span>}
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>Próximas férias (estimativa)</div>
                      <span style={{ fontSize:12, fontWeight:600, color:'#1A2340' }}>{previsaoFerias ? isoToBr(previsaoFerias) : '—'}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>Ponto assinado (2026)</div>
                      <span style={{ fontSize:12, fontWeight:700, padding:'4px 8px', borderRadius:6, background: pontoPendentes.length === 0 ? '#D1FAE5' : '#FEE2E2', color: pontoPendentes.length === 0 ? '#065F46' : '#991B1B' }}>
                        {pontoPendentes.length === 0 ? 'Em dia' : `${pontoPendentes.length} mês(es) pendente(s): ${pontoPendentes.map(mesLabel).join(', ')}`}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>Holerite adiantamento (2026)</div>
                      <span style={{ fontSize:12, fontWeight:700, padding:'4px 8px', borderRadius:6, background: holeriteAdiantPendentes.length === 0 ? '#D1FAE5' : '#FEE2E2', color: holeriteAdiantPendentes.length === 0 ? '#065F46' : '#991B1B' }}>
                        {holeriteAdiantPendentes.length === 0 ? 'Em dia' : `${holeriteAdiantPendentes.length} mês(es) pendente(s): ${holeriteAdiantPendentes.map(mesLabel).join(', ')}`}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#888', textTransform:'uppercase' }}>Holerite pagamento (2026)</div>
                      <span style={{ fontSize:12, fontWeight:700, padding:'4px 8px', borderRadius:6, background: holeritePagtoPendentes.length === 0 ? '#D1FAE5' : '#FEE2E2', color: holeritePagtoPendentes.length === 0 ? '#065F46' : '#991B1B' }}>
                        {holeritePagtoPendentes.length === 0 ? 'Em dia' : `${holeritePagtoPendentes.length} mês(es) pendente(s): ${holeritePagtoPendentes.map(mesLabel).join(', ')}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:12, color:'#1A2340', fontWeight:700, marginBottom:10 }}>NRs (certificações de segurança)</div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {nrs.map(nr => (
                      <div key={nr.label} style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
                        <span style={{ fontSize:10, color:'#888', fontWeight:600 }}>{nr.label}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6, background:nr.status.bg, color:nr.status.cor }}>{nr.status.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {epis.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:12, color:'#1A2340', fontWeight:700, marginBottom:10 }}>EPIs entregues</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {epis.map((ep, idx) => {
                        const statusEp = statusVencimento(ep.validade)
                        return (
                          <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'5px 10px' }}>
                            <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                              {ep.item}{ep.data ? ` — entregue ${isoToBr(ep.data)}` : ''}{ep.validade ? ` — validade ${isoToBr(ep.validade)}` : ''}
                            </span>
                            {statusEp && <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:5, background:statusEp.bg, color:statusEp.cor }}>{statusEp.label}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {descontos.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:12, color:'#1A2340', fontWeight:700, marginBottom:10 }}>💰 O que devo à empresa</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {descontos.map((d, idx) => (
                        <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'5px 10px' }}>
                          <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                            {rubricaLabel(d.motivo)} — {mesLabel(d.mes)} — {d.valor}{d.observacao ? ` (${d.observacao})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
                  <div style={{ fontSize:12, color:'#1A2340', fontWeight:700, marginBottom:10 }}>🍽 Solicitar janta</div>
                  <div style={{ fontSize:11, color:'#64748B', marginBottom:10 }}>
                    Só se aplica se: (1) você está em viagem e vai dormir na cidade, ou (2) extrapolou 8h de trabalho e ficou até mais tarde. Fica pendente até o RH aprovar.
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                    <input type="date" value={novaJantaData} onChange={e => setNovaJantaData(e.target.value)}
                      style={{ padding:'7px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340' }} />
                    <select value={novaJantaTipo} onChange={e => setNovaJantaTipo(e.target.value)}
                      style={{ padding:'7px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                      <option value="viagem_pernoite">Viagem — vou dormir na cidade</option>
                      <option value="extrapolou_8h">Extrapolei 8h de trabalho</option>
                    </select>
                    <input value={novaJantaMotivo} onChange={e => setNovaJantaMotivo(e.target.value)}
                      placeholder="Descreva o motivo (ex: horário que começou/terminou)"
                      style={{ flex:1, minWidth:200, padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                    <button onClick={solicitarJanta}
                      style={{ padding:'7px 14px', background:'#B45309', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      Solicitar
                    </button>
                  </div>
                  {minhasJantas.length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {minhasJantas.map(j => {
                        const cor = j.status === 'aprovado' ? { bg:'#D1FAE5', cor:'#065F46' } : j.status === 'recusado' ? { bg:'#FEE2E2', cor:'#991B1B' } : { bg:'#FEF3C7', cor:'#92400E' }
                        return (
                          <div key={j.id} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0F4F8', borderRadius:6, padding:'5px 10px' }}>
                            <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                              {isoToBr(j.data)} — {j.motivo_tipo === 'viagem_pernoite' ? 'Viagem/pernoite' : 'Extrapolou 8h'} — {j.motivo_texto}
                            </span>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, background:cor.bg, color:cor.cor, textTransform:'uppercase' }}>{j.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ====== ABA: JANTAS ====== */}
      {aba === 'jantas' && (papel === 'admin' || papel === 'rh' || papel === 'financeiro') && (() => {
        const pendentes = jantasTodas.filter(j => j.status === 'pendente')
        const decididas = jantasTodas.filter(j => j.status !== 'pendente')
        return (
        <div style={{ padding:12 }}>
          <div style={{ fontSize:11, color:'#B45309', fontWeight:700, marginBottom:10, padding:'8px 12px', background:'#FFF7ED', borderRadius:8 }}>
            {pendentes.length} solicitação(ões) pendente(s)
          </div>

          {pendentes.length === 0 ? (
            <div style={{ textAlign:'center', color:'#888', marginTop:30, fontSize:13, marginBottom:20 }}>Nenhuma pendência 🎉</div>
          ) : pendentes.map(j => (
            <div key={j.id} style={{ background:'#fff', border:'1px solid #FED7AA', borderRadius:12, marginBottom:8, padding:'12px 14px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:4 }}>{j.colaborador_nome}</div>
              <div style={{ fontSize:12, color:'#475569', marginBottom:8 }}>
                {isoToBr(j.data)} — {j.motivo_tipo === 'viagem_pernoite' ? 'Viagem/pernoite' : 'Extrapolou 8h'}
              </div>
              <div style={{ fontSize:12, color:'#1A2340', background:'#F8FAFC', borderRadius:6, padding:'6px 10px', marginBottom:10 }}>
                "{j.motivo_texto}"
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="number" placeholder="Valor R$" defaultValue={j.valor || ''} id={`valor-janta-${j.id}`}
                  style={{ width:100, padding:'6px 8px', border:'1px solid #CDD8E3', borderRadius:6, fontSize:12, color:'#1A2340' }} />
                <button onClick={() => decidirJanta(j.id, 'aprovado', Number(document.getElementById(`valor-janta-${j.id}`).value) || null)}
                  style={{ padding:'7px 14px', background:'#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  ✓ Aprovar
                </button>
                <button onClick={() => decidirJanta(j.id, 'recusado')}
                  style={{ padding:'7px 14px', background:'#F1F5F9', color:'#991B1B', border:'1px solid #FCA5A5', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  ✕ Recusar
                </button>
              </div>
            </div>
          ))}

          {decididas.length > 0 && (
            <>
              <div style={{ fontSize:12, color:'#64748B', fontWeight:700, marginTop:20, marginBottom:8 }}>Histórico</div>
              {decididas.map(j => {
                const cor = j.status === 'aprovado' ? { bg:'#D1FAE5', cor:'#065F46' } : { bg:'#FEE2E2', cor:'#991B1B' }
                return (
                  <div key={j.id} style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:10, marginBottom:6, padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, color:'#1A2340', flex:1 }}>
                      {j.colaborador_nome} — {isoToBr(j.data)} — {j.motivo_tipo === 'viagem_pernoite' ? 'Viagem/pernoite' : 'Extrapolou 8h'}
                      {j.valor ? ` — ${fmt(j.valor)}` : ''}
                    </span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, background:cor.bg, color:cor.cor, textTransform:'uppercase' }}>{j.status}</span>
                  </div>
                )
              })}
            </>
          )}
        </div>
        )
      })()}

      {/* ====== SUB-ABA RH: FECHAMENTO DE PONTO ====== */}
      {aba === 'rh' && rhSubaba === 'fechamento' && (
        <div style={{ display:'flex', alignItems:'flex-start' }}>
          <SidebarRH ativa={rhSubaba} onChange={setRhSubaba} totalColaboradores={rhColaboradores.length} totalHolerites={holeritesSalvos.length} />
          <div style={{ flex:1, minWidth:0, padding:12 }}>
          <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#92400E', marginBottom:14 }}>
            ⚠ Fase 1 (em teste): sobe o espelho de ponto bruto (.xlsx) e o Pipeline calcula sozinho as violações de interjornada (mín. 11h entre turnos) e intrajornada (15min se 4-6h trabalhadas, 1h se mais de 6h, exceto fins de semana/feriado). Confere contra um mês que você já sabe que fechou certo antes de usar pra valer.
          </div>

          {pontoSalvos.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:14 }}>
              <label style={{ fontSize:12, color:'#1A2340', fontWeight:700, display:'block', marginBottom:8 }}>Fechamentos já salvos</label>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {pontoSalvos.map(p => (
                  <div key={`${p.base}|${p.periodo_inicio}|${p.periodo_fim}`}
                    onClick={() => abrirFechamentoSalvo(p.base, p.periodo_inicio, p.periodo_fim)}
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#F0F4F8', borderRadius:6, padding:'6px 10px', cursor:'pointer' }}>
                    <span style={{ fontSize:12, color:'#1A2340' }}>{p.base} — {isoToBr(p.periodo_inicio)} até {isoToBr(p.periodo_fim)}</span>
                    <span style={{ fontSize:11, color:'#0F766E', fontWeight:700 }}>Abrir →</span>
                  </div>
                ))}
              </div>
              {pontoCarregandoSalvo && <div style={{ fontSize:12, color:'#64748B', marginTop:8 }}>Carregando...</div>}
            </div>
          )}

          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:14 }}>
            <label style={{ fontSize:12, color:'#1A2340', fontWeight:700, display:'block', marginBottom:8 }}>Base</label>
            <select value={pontoBase} onChange={e => setPontoBase(e.target.value)}
              style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', marginBottom:12 }}>
              <option value="">Selecione a base —</option>
              <option value="RIO">RIO</option>
              <option value="SAO">SAO</option>
              <option value="BHZ">BHZ</option>
            </select>
            <label style={{ fontSize:12, color:'#1A2340', fontWeight:700, display:'block', marginBottom:8 }}>Espelho de ponto (.xlsx)</label>
            <input type="file" accept=".xlsx,.xls" onChange={handlePontoUpload}
              style={{ fontSize:12, color:'#1A2340' }} />
            {pontoProcessando && <div style={{ fontSize:12, color:'#64748B', marginTop:8 }}>Processando {pontoNomeArquivo}...</div>}
            {pontoErro && <div style={{ fontSize:12, color:'#991B1B', marginTop:8 }}>{pontoErro}</div>}
          </div>

          {pontoResultado && (() => {
            const { periodo, colaboradores } = pontoResultado
            const totalInterjornada = colaboradores.reduce((s,c) => s + c.violacoesInterjornada.length, 0)
            const totalIntrajornada = colaboradores.reduce((s,c) => s + c.violacoesIntrajornada.length, 0)
            return (
              <>
                <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div style={{ fontSize:12, color:'#1A2340' }}>
                    Período: {periodo.inicio ? isoToBr(periodo.inicio) : '?'} até {periodo.fim ? isoToBr(periodo.fim) : '?'}
                    {!periodo.inicio && <span style={{ color:'#991B1B' }}> — não consegui identificar o período no arquivo, confere manualmente antes de salvar.</span>}
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <button onClick={exportarPontoExcel}
                      style={{ padding:'8px 16px', background:'#fff', border:'1px solid #0F766E', color:'#0F766E', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      📊 Exportar Excel (ponto)
                    </button>
                    {pontoBase && META_BASE_FOLHA[pontoBase] && (
                      <button onClick={exportarFechamentoFolha}
                        style={{ padding:'8px 16px', background:'#fff', border:'1px solid #7C3AED', color:'#7C3AED', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        📄 Fechamento de Folha (com descontos)
                      </button>
                    )}
                    <button onClick={exportarRelatorioViolacoes}
                      style={{ padding:'8px 16px', background:'#fff', border:'1px solid #B45309', color:'#B45309', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      ⚠ Relatório de Violações
                    </button>
                    {pontoBase && META_BASE_FOLHA[pontoBase] && (
                      <button onClick={exportarCartaoPonto}
                        style={{ padding:'8px 16px', background:'#fff', border:'1px solid #1A2340', color:'#1A2340', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        🖨 Cartão de Ponto (PDF)
                      </button>
                    )}
                    <button onClick={salvarFechamentoPonto} disabled={pontoSalvando || !pontoBase || !periodo.inicio}
                      style={{ padding:'8px 16px', background: (!pontoBase || !periodo.inicio) ? '#CDD8E3' : '#0F766E', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor: (!pontoBase || !periodo.inicio) ? 'not-allowed' : 'pointer' }}>
                      {pontoSalvando ? 'Salvando...' : pontoSalvo ? '✓ Salvo' : '💾 Salvar este processamento'}
                    </button>
                  </div>
                  {!pontoBase && <span style={{ fontSize:11, color:'#991B1B' }}>Selecione a base pra poder salvar</span>}
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <div style={{ flex:1, background:'#fff', border:'1px solid #E0E8F0', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:700, color:'#1A2340' }}>{colaboradores.length}</div>
                    <div style={{ fontSize:10, color:'#64748B' }}>Colaboradores no arquivo</div>
                  </div>
                  <div style={{ flex:1, background: totalInterjornada > 0 ? '#FEE2E2' : '#D1FAE5', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:700, color: totalInterjornada > 0 ? '#991B1B' : '#065F46' }}>{totalInterjornada}</div>
                    <div style={{ fontSize:10, color: totalInterjornada > 0 ? '#991B1B' : '#065F46' }}>Violações de interjornada</div>
                  </div>
                  <div style={{ flex:1, background: totalIntrajornada > 0 ? '#FEE2E2' : '#D1FAE5', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:700, color: totalIntrajornada > 0 ? '#991B1B' : '#065F46' }}>{totalIntrajornada}</div>
                    <div style={{ fontSize:10, color: totalIntrajornada > 0 ? '#991B1B' : '#065F46' }}>Violações de intrajornada</div>
                  </div>
                </div>

                {colaboradores.map(c => {
                  const temViolacao = c.violacoesInterjornada.length > 0 || c.violacoesIntrajornada.length > 0
                  const aberto = pontoAbertoNome === c.nome
                  return (
                    <div key={c.nome} style={{ background:'#fff', border: temViolacao ? '1px solid #FCA5A5' : '1px solid #E0E8F0', borderRadius:12, marginBottom:8, overflow:'hidden' }}>
                      <div onClick={() => setPontoAbertoNome(aberto ? null : c.nome)}
                        style={{ padding:'12px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <div style={{ fontSize:13, fontWeight:700, color:'#1A2340' }}>{c.nome}</div>
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                          {c.totais && <span style={{ fontSize:11, color:'#64748B' }}>Normais {minutosParaHoras(c.totais.horasNormais)} · HE1 {minutosParaHoras(c.totais.he1)} · HE2 {minutosParaHoras(c.totais.he2)} · Adic. not. {minutosParaHoras(c.totais.adicionalNoturno)}</span>}
                          {c.violacoesInterjornada.length > 0 && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FEE2E2', color:'#991B1B' }}>⚠ {c.violacoesInterjornada.length} interjornada</span>}
                          {c.violacoesIntrajornada.length > 0 && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FEE2E2', color:'#991B1B' }}>⚠ {c.violacoesIntrajornada.length} intrajornada</span>}
                          {!temViolacao && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#D1FAE5', color:'#065F46' }}>✓ sem violações</span>}
                        </div>
                      </div>
                      {aberto && (
                        <div style={{ padding:'0 14px 14px', borderTop:'1px solid #E0E8F0' }}>
                          {c.violacoesInterjornada.length > 0 && (
                            <div style={{ marginTop:10 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:'#991B1B', marginBottom:4 }}>Interjornada violada</div>
                              {c.violacoesInterjornada.map((v,i) => (
                                <div key={i} style={{ fontSize:12, color:'#1A2340', padding:'4px 0' }}>
                                  {v.de} → {v.para}: só {minutosParaHoras(v.gapMinutos)} de descanso (mínimo 11:00)
                                  {v.cai100 && <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:'#7C2D12', background:'#FFEDD5', padding:'1px 6px', borderRadius:5 }}>100%</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {c.violacoesIntrajornada.length > 0 && (
                            <div style={{ marginTop:10 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:'#991B1B', marginBottom:4 }}>Intrajornada violada</div>
                              {c.violacoesIntrajornada.map((v,i) => (
                                <div key={i} style={{ fontSize:12, color:'#1A2340', padding:'4px 0' }}>
                                  {v.data}: intervalo de {minutosParaHoras(v.intervalo)} (mínimo {minutosParaHoras(v.minimoExigido)})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )
          })()}
        </div>
        </div>
      )}

      {/* ====== SUB-ABA RH: HOLERITES ====== */}
      {aba === 'rh' && rhSubaba === 'holerites' && (
        <div style={{ display:'flex', alignItems:'flex-start' }}>
          <SidebarRH ativa={rhSubaba} onChange={setRhSubaba} totalColaboradores={rhColaboradores.length} totalHolerites={holeritesSalvos.length} />
          <div style={{ flex:1, minWidth:0, padding:14 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:10 }}>📥 Importar pagamentos realizados do mês (.pdf)</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Base</label>
                <select value={holeriteBase} onChange={e => setHoleriteBase(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', background:'#fff' }}>
                  <option value="SAO">SAO</option>
                  <option value="RIO">RIO</option>
                  <option value="BHZ">BHZ</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Mês (competência)</label>
                <input type="month" value={holeriteMes} onChange={e => setHoleriteMes(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>PDF do saldo (HOLERITE final) *</label>
                <input type="file" accept="application/pdf" onChange={e => setHoleriteArquivoSaldo(e.target.files?.[0] || null)}
                  style={{ width:'100%', fontSize:12 }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>PDF do adiantamento (opcional)</label>
                <input type="file" accept="application/pdf" onChange={e => setHoleriteArquivoAdiant(e.target.files?.[0] || null)}
                  style={{ width:'100%', fontSize:12 }} />
              </div>
            </div>
            <div style={{ fontSize:11, color:'#64748B', marginBottom:10 }}>
              Sem o PDF do adiantamento, o "total do mês" fica igual ao líquido do saldo (sem somar a 1ª parcela).
            </div>
            {holeriteErro && <div style={{ fontSize:12, color:'#991B1B', marginBottom:10 }}>{holeriteErro}</div>}
            <button onClick={processarHolerites} disabled={holeriteProcessando || !holeriteArquivoSaldo}
              style={{ padding:'9px 16px', background: (holeriteProcessando || !holeriteArquivoSaldo) ? '#ccc' : '#0E4D73', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              {holeriteProcessando ? 'Lendo PDF...' : 'Processar PDFs'}
            </button>
          </div>

          {holeritePreview && (
            <div style={{ background:'#fff', border:'1px solid #BFDBFE', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1E40AF', marginBottom:10 }}>
                Prévia — {holeritePreview.length} funcionário(s) encontrados em {holeriteBase} {holeriteMes || '(preencha o mês acima)'}
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                  <thead>
                    <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                      {['Colaborador','Cadastro','HE (h / R$)','Inter (h / R$)','Intra (h / R$)','Noturno (R$)','Líquido saldo','Líquido adiant.','Total do mês'].map(h => (
                        <th key={h} style={{ padding:'6px 8px', borderBottom:'1px solid #E0E8F0', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holeritePreview.map((f, i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #F1F5F9' }}>
                        <td style={{ padding:'6px 8px', fontWeight:600 }}>{f.nome}</td>
                        <td style={{ padding:'6px 8px' }}>
                          {f.colaboradorId
                            ? <span style={{ color:'#065F46' }}>✓ encontrado</span>
                            : <span style={{ color:'#991B1B' }}>⚠ não achei no RH</span>}
                        </td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(f.he.minutos)} / {fmt(f.he.valor)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(f.inter.minutos)} / {fmt(f.inter.valor)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(f.intra.minutos)} / {fmt(f.intra.valor)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{fmt(f.noturno.valor)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{fmt(f.valorLiquido || 0)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{fmt(f.liquidoAdiantamento || 0)}</td>
                        <td style={{ padding:'6px 8px', whiteSpace:'nowrap', fontWeight:700 }}>{fmt(f.liquidoMes || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={confirmarImportacaoHolerites} disabled={holeriteSalvando || !holeriteMes}
                  style={{ padding:'9px 16px', background: (holeriteSalvando || !holeriteMes) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {holeriteSalvando ? 'Salvando...' : !holeriteMes ? 'Preencha o mês pra salvar' : 'Confirmar importação'}
                </button>
                <button onClick={() => setHoleritePreview(null)}
                  style={{ padding:'9px 16px', background:'#fff', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#64748B', cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:10 }}>Consulta — {holeritesSalvos.length} holerite(s) importado(s)</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
              <select value={filtroHoleriteBase} onChange={e => setFiltroHoleriteBase(e.target.value)}
                style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                <option value="">Todas bases</option>
                {['SAO','RIO','BHZ'].map(b => <option key={b}>{b}</option>)}
              </select>
              <select value={filtroHoleriteMes} onChange={e => setFiltroHoleriteMes(e.target.value)}
                style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                <option value="">Todos os meses</option>
                {[...new Set(holeritesSalvos.map(h => h.mes))].sort().reverse().map(m => <option key={m}>{m}</option>)}
              </select>
              <input value={filtroHoleriteNome} onChange={e => setFiltroHoleriteNome(e.target.value)} placeholder="Buscar colaborador..."
                style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:1, minWidth:160 }} />
            </div>
            {(() => {
              const filtrados = holeritesSalvos.filter(h => {
                if (filtroHoleriteBase && h.base !== filtroHoleriteBase) return false
                if (filtroHoleriteMes && h.mes !== filtroHoleriteMes) return false
                if (filtroHoleriteNome && !h.colaborador_nome.toLowerCase().includes(filtroHoleriteNome.toLowerCase())) return false
                return true
              })
              if (filtrados.length === 0) return <div style={{ textAlign:'center', color:'#888', fontSize:13, padding:'20px 0' }}>Nenhum holerite importado ainda (ou nenhum bate com o filtro)</div>
              return (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                    <thead>
                      <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                        {['Colaborador','Base','Mês','HE (h / R$)','Inter (h / R$)','Intra (h / R$)','Total recebido no mês'].map(h => (
                          <th key={h} style={{ padding:'6px 8px', borderBottom:'1px solid #E0E8F0', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map(h => {
                        const rubricas = Array.isArray(h.rubricas) ? h.rubricas : []
                        const he = somaRubricas(rubricas, 'HORAS EXTRAS')
                        const inter = somaRubricas(rubricas, 'INTER JORNADA')
                        const intra = somaRubricas(rubricas, 'INTRAJORNADA')
                        return (
                          <tr key={h.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                            <td style={{ padding:'6px 8px', fontWeight:600 }}>{h.colaborador_nome}{!h.colaborador_id && <span title="Não encontrado no cadastro de RH" style={{ color:'#991B1B' }}> ⚠</span>}</td>
                            <td style={{ padding:'6px 8px' }}>{h.base}</td>
                            <td style={{ padding:'6px 8px' }}>{h.mes}</td>
                            <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(he.minutos)} / {fmt(he.valor)}</td>
                            <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(inter.minutos)} / {fmt(inter.valor)}</td>
                            <td style={{ padding:'6px 8px', whiteSpace:'nowrap' }}>{minutosParaHoras(intra.minutos)} / {fmt(intra.valor)}</td>
                            <td style={{ padding:'6px 8px', whiteSpace:'nowrap', fontWeight:700 }}>{fmt(h.total_liquido_mes || 0)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        </div>
        </div>
      )}

      {/* ====== SUB-ABA RH: HOLERITES (consulta compacta por colaborador, pensada pro celular) ====== */}
      {aba === 'rh' && rhSubaba === 'horas_extras' && (
        <div style={{ display:'flex', alignItems:'flex-start' }}>
          <SidebarRH ativa={rhSubaba} onChange={setRhSubaba} totalColaboradores={rhColaboradores.length} totalHolerites={holeritesSalvos.length} />
          <div style={{ flex:1, minWidth:0, padding:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:10 }}>Holerites — histórico por colaborador</div>

            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Selecione o nome</label>
              <input list="lista-colaboradores-holerites" value={horasExtrasNomeDigitado}
                onChange={e => {
                  const digitado = e.target.value
                  setHorasExtrasNomeDigitado(digitado)
                  const achado = rhColaboradores.find(c => `${c.nome} ${c.sobrenome || ''}`.trim() === digitado)
                  setHorasExtrasColaboradorId(achado ? achado.id : '')
                  setHorasExtrasMesExpandido(null)
                }}
                placeholder="Digite pra buscar..."
                style={{ width:'100%', maxWidth:380, padding:'9px 12px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', background:'#fff', boxSizing:'border-box' }} />
              <datalist id="lista-colaboradores-holerites">
                {rhColaboradores.map(c => <option key={c.id} value={`${c.nome} ${c.sobrenome || ''}`.trim()} />)}
              </datalist>
            </div>

            {horasExtrasColaboradorId && (
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Selecione o período</label>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:12, color:'#64748B' }}>De</span>
                  <input type="month" value={horasExtrasMesDe} onChange={e => setHorasExtrasMesDe(e.target.value)}
                    style={{ padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  <span style={{ fontSize:12, color:'#64748B' }}>até</span>
                  <input type="month" value={horasExtrasMesAte} onChange={e => setHorasExtrasMesAte(e.target.value)}
                    style={{ padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  {(horasExtrasMesDe || horasExtrasMesAte) && (
                    <button onClick={() => { setHorasExtrasMesDe(''); setHorasExtrasMesAte('') }}
                      style={{ padding:'7px 10px', background:'#F1F5F9', border:'1px solid #CDD8E3', borderRadius:8, fontSize:11, color:'#64748B', cursor:'pointer' }}>
                      ✕ limpar
                    </button>
                  )}
                </div>
              </div>
            )}

            {!horasExtrasColaboradorId && (
              <div style={{ textAlign:'center', color:'#888', fontSize:13, padding:'30px 0' }}>Digite o nome de um colaborador pra ver o histórico de holerites.</div>
            )}

            {horasExtrasColaboradorId && (() => {
              const holeritesDoColaborador = holeritesSalvos
                .filter(h => h.colaborador_id === horasExtrasColaboradorId)
                .filter(h => !horasExtrasMesDe || h.mes >= horasExtrasMesDe)
                .filter(h => !horasExtrasMesAte || h.mes <= horasExtrasMesAte)
                .sort((a, b) => b.mes.localeCompare(a.mes))
              if (holeritesDoColaborador.length === 0) {
                return <div style={{ textAlign:'center', color:'#888', fontSize:13, padding:'30px 0' }}>Nenhum holerite importado ainda pra esse colaborador nesse período.</div>
              }
              const salarioBaseAtual = holeritesDoColaborador[0]?.salario_base
              return (
                <>
                  <div style={{ overflowX:'auto', border:'1px solid #E0E8F0', borderRadius:12 }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                          {['Mês','H.E.','Intra','Inter','Total do mês',''].map(hd => (
                            <th key={hd} style={{ padding:'8px', borderBottom:'1px solid #E0E8F0', whiteSpace:'nowrap' }}>{hd}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holeritesDoColaborador.map(h => {
                          const rubricas = Array.isArray(h.rubricas) ? h.rubricas : []
                          const he = somaRubricas(rubricas, 'HORAS EXTRAS')
                          const intra = somaRubricas(rubricas, 'INTRAJORNADA')
                          const inter = somaRubricas(rubricas, 'INTER JORNADA')
                          const expandido = horasExtrasMesExpandido === h.id
                          return (
                            <React.Fragment key={h.id}>
                            <tr onClick={() => setHorasExtrasMesExpandido(expandido ? null : h.id)} style={{ borderBottom:'1px solid #F1F5F9', cursor:'pointer', background: expandido ? '#F5F3FF' : 'transparent' }}>
                              <td style={{ padding:'8px', fontWeight:600, whiteSpace:'nowrap' }}>{mesLabel(h.mes)}</td>
                              <td style={{ padding:'8px', whiteSpace:'nowrap' }}>{minutosParaHoras(he.minutos)} / {fmt(he.valor)}</td>
                              <td style={{ padding:'8px', whiteSpace:'nowrap' }}>{minutosParaHoras(intra.minutos)} / {fmt(intra.valor)}</td>
                              <td style={{ padding:'8px', whiteSpace:'nowrap' }}>{minutosParaHoras(inter.minutos)} / {fmt(inter.valor)}</td>
                              <td style={{ padding:'8px', whiteSpace:'nowrap', fontWeight:700 }}>{fmt(h.total_liquido_mes || 0)}</td>
                              <td style={{ padding:'8px', color:'#7C3AED', fontWeight:700, whiteSpace:'nowrap' }}>{expandido ? '▲ fechar' : '▼ ver holerite'}</td>
                            </tr>
                            {expandido && (
                              <tr>
                                <td colSpan={6} style={{ padding:'10px 10px 16px', background:'#FAFAFF' }}>
                                  <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', marginBottom:8 }}>{h.base} — {mesLabel(h.mes)}{h.funcao ? ` · ${h.funcao}` : ''}</div>
                                  <div style={{ overflowX:'auto' }}>
                                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, background:'#fff' }}>
                                      <thead>
                                        <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                                          {['Descrição','Referência','Vencimentos','Descontos'].map(hd => (
                                            <th key={hd} style={{ padding:'6px 8px', borderBottom:'1px solid #E0E8F0' }}>{hd}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rubricas.map((r, i) => (
                                          <tr key={i} style={{ borderBottom:'1px solid #F1F5F9' }}>
                                            <td style={{ padding:'5px 8px' }}>{r.descricao}{r.codigo ? <span style={{ color:'#94A3B8' }}> ({r.codigo})</span> : ''}</td>
                                            <td style={{ padding:'5px 8px' }}>{r.referencia}</td>
                                            <td style={{ padding:'5px 8px' }}>{r.vencimento != null ? fmt(r.vencimento) : ''}</td>
                                            <td style={{ padding:'5px 8px' }}>{r.desconto != null ? fmt(r.desconto) : ''}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr style={{ background:'#F8FAFC', fontWeight:700 }}>
                                          <td style={{ padding:'6px 8px' }} colSpan={2}>Total</td>
                                          <td style={{ padding:'6px 8px' }}>{h.total_vencimentos != null ? fmt(h.total_vencimentos) : '—'}</td>
                                          <td style={{ padding:'6px 8px' }}>{h.total_descontos != null ? fmt(h.total_descontos) : '—'}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                  <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:10, fontSize:12 }}>
                                    <div><span style={{ color:'#888' }}>Salário Base: </span><b>{h.salario_base != null ? fmt(h.salario_base) : '—'}</b></div>
                                    <div><span style={{ color:'#888' }}>Líquido saldo: </span><b>{fmt(h.total_liquido_saldo || 0)}</b></div>
                                    <div><span style={{ color:'#888' }}>Líquido adiantamento: </span><b>{fmt(h.total_liquido_adiantamento || 0)}</b></div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop:12, fontSize:13, color:'#1A2340' }}>
                    <span style={{ color:'#888' }}>Salário Base: </span><b>{salarioBaseAtual != null ? fmt(salarioBaseAtual) : '—'}</b>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ====== ABA: DESPESAS ====== */}
      {aba === 'despesas' && EMAILS_CUSTOS_DESPESAS.includes(usuario?.email) && (() => {
        const anoAtual = new Date().getFullYear()
        const anosDisponiveis = Array.from(new Set([anoAtual - 1, anoAtual, anoAtual + 1, despesasAno])).sort()
        return (
        <div style={{ padding:12 }}>
          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:'10px 14px', marginBottom:14, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ display:'flex', border:'1px solid #CDD8E3', borderRadius:8, overflow:'hidden' }}>
              <button onClick={() => setDespesasModo('mes')}
                style={{ padding:'7px 14px', border:'none', background: despesasModo==='mes' ? '#B91C1C' : '#fff', color: despesasModo==='mes' ? '#fff' : '#1A2340', fontSize:12, fontWeight:700, cursor:'pointer' }}>Mês</button>
              <button onClick={() => setDespesasModo('ano')}
                style={{ padding:'7px 14px', border:'none', background: despesasModo==='ano' ? '#B91C1C' : '#fff', color: despesasModo==='ano' ? '#fff' : '#1A2340', fontSize:12, fontWeight:700, cursor:'pointer' }}>Ano</button>
            </div>
            {despesasModo === 'mes' && (
              <select value={despesasMes} onChange={e => setDespesasMes(Number(e.target.value))}
                style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                {MESES_FILTRO.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            )}
            <select value={despesasAno} onChange={e => setDespesasAno(Number(e.target.value))}
              style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
              {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:160, background:'#B91C1C', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.8)', fontWeight:600, textTransform:'uppercase' }}>Total no período</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#fff', marginTop:4 }}>{fmt(totalDespesas)}</div>
            </div>
            <div style={{ flex:1, minWidth:160, background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Obras com despesa</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#1A2340', marginTop:4 }}>{despesasPorObraLista.length}</div>
            </div>
            <div style={{ flex:1, minWidth:160, background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'#64748B', fontWeight:600, textTransform:'uppercase' }}>Maior categoria</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#1A2340', marginTop:4 }}>{despesasPorCategoria[0] ? despesasPorCategoria[0].categoria : '—'}</div>
              <div style={{ fontSize:13, color:'#64748B' }}>{despesasPorCategoria[0] ? fmt(despesasPorCategoria[0].total) : ''}</div>
            </div>
          </div>

          {despesasPorCategoria.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', marginBottom:10 }}>Por categoria</div>
              {despesasPorCategoria.map(c => {
                const pct = totalDespesas > 0 ? (c.total / totalDespesas * 100) : 0
                return (
                  <div key={c.categoria} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#1A2340', marginBottom:3 }}>
                      <span style={{ fontWeight:600 }}>{c.categoria}</span>
                      <span>{fmt(c.total)}</span>
                    </div>
                    <div style={{ background:'#F1F5F9', borderRadius:6, height:8, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: CATEGORIA_DESPESA_COR[c.categoria] || '#94A3B8', borderRadius:6 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ background:'#fff', border:'1px solid #E0E8F0', borderRadius:12, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', marginBottom:10 }}>Por obra</div>
            {despesasPorObraLista.length === 0 && <div style={{ textAlign:'center', color:'#888', fontSize:13, padding:'20px 0' }}>Nenhuma despesa lançada nesse período</div>}
            {despesasPorObraLista.map(o => {
              const aberto = despesaObraAberta === o.obraId
              return (
                <div key={o.obraId} style={{ borderBottom:'1px solid #F1F5F9', padding:'8px 0' }}>
                  <div onClick={() => setDespesaObraAberta(aberto ? null : o.obraId)} style={{ display:'flex', justifyContent:'space-between', cursor:'pointer' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#1A2340' }}>{o.obraNome}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#B91C1C' }}>{fmt(o.total)}</span>
                  </div>
                  {aberto && (
                    <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:4 }}>
                      {o.itens.map((it,i) => (
                        <div key={i} style={{ fontSize:11, color:'#64748B', display:'flex', justifyContent:'space-between', background:'#F8FAFC', borderRadius:6, padding:'4px 8px', gap:8 }}>
                          <span>{it.data ? isoToBr(it.data) : '—'} · <span style={{ color: CATEGORIA_DESPESA_COR[it.categoria] || '#64748B', fontWeight:600 }}>{it.categoria}</span>{it.obs ? ` — ${it.obs}` : ''}{it.km ? ` (${it.km}km)` : ''}</span>
                          <span style={{ fontWeight:600, whiteSpace:'nowrap' }}>{fmt(it.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {despesasSemData.length > 0 && (
            <div style={{ fontSize:11, color:'#92400E', marginTop:10 }}>
              ⚠ {despesasSemData.length} lançamento(s) sem data preenchida — não entram no filtro por mês/ano.
            </div>
          )}
        </div>
        )
      })()}

      {/* ====== ABA: PIPELINE ====== */}
      {aba === 'pipeline' && <>

      {/* Cenário */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E0E8F0', padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div onClick={() => setMostrarCenario(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1A2340' }}>📊 Cenário — obras em execução</div>
            {filtroCenarioUF && (
              <span onClick={e => { e.stopPropagation(); setFiltroCenarioUF('') }}
                style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:'#2D3A8C', color:'#fff', cursor:'pointer' }}>
                Filtrando: {filtroCenarioUF} ✕
              </span>
            )}
          </div>
          <span onClick={() => setMostrarCenario(v => !v)} style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, cursor:'pointer' }}>{mostrarCenario ? 'Recolher ▲' : 'Expandir ▼'}</span>
        </div>
        {mostrarCenario && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <button onClick={() => setCenarioData(d => somaDias(d, -1))}
                style={{ border:'none', background:'#1A2340', color:'#fff', borderRadius:8, width:28, height:28, cursor:'pointer', fontSize:14, flexShrink:0 }}>◀</button>
              <div style={{ flex:1, textAlign:'center', background:'#1A2340', color:'#fff', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
                {cenarioData === hojeIso() ? 'Hoje' : isoToBr(cenarioData)}
              </div>
              <button onClick={() => setCenarioData(d => somaDias(d, 1))}
                style={{ border:'none', background:'#1A2340', color:'#fff', borderRadius:8, width:28, height:28, cursor:'pointer', fontSize:14, flexShrink:0 }}>▶</button>
              {cenarioData !== hojeIso() && (
                <span onClick={() => setCenarioData(hojeIso())} style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>voltar pra hoje</span>
              )}
            </div>
            {cenarioPorUF.length === 0 ? (
              <div style={{ padding:12, fontSize:12, color:'#888', textAlign:'center', border:'1px solid #E0E8F0', borderRadius:10 }}>Nenhuma atividade agendada pra {cenarioData === hojeIso() ? 'hoje' : isoToBr(cenarioData)}</div>
            ) : (
              <div>
                <div ref={cenarioScrollRef} style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6, scrollSnapType:'x proximity' }}>
                  {cenarioPorUF.map((c, i) => {
                    const selecionado = filtroCenarioUF === c.uf
                    const cor = corPorEstadoCenario[c.uf] || CENARIO_CORES[i % CENARIO_CORES.length]
                    return (
                      <div key={c.uf} onClick={() => setFiltroCenarioUF(v => v === c.uf ? '' : c.uf)}
                        style={{ flex:'0 0 200px', scrollSnapAlign:'start', cursor:'pointer', borderRadius:14, overflow:'hidden',
                          border: selecionado ? '2px solid #1A2340' : '2px solid transparent' }}>
                        <div style={{ background:cor, padding:'10px 12px' }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#fff', textAlign:'center', marginBottom:8 }}>{c.uf}</div>
                          {Object.entries(c.categorias).sort((a,b) => b[1]-a[1]).map(([categoria, v]) => (
                            <div key={categoria} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                              <span style={{ fontSize:10, color:'#fff', flex:1 }}>{categoria.toUpperCase()}</span>
                              <span style={{ fontSize:11, fontWeight:700, color:cor, background:'#fff', borderRadius:5, padding:'1px 6px', minWidth:18, textAlign:'center' }}>{v}</span>
                            </div>
                          ))}
                          {Object.keys(c.categorias).length === 0 && (
                            <div style={{ fontSize:10, color:'rgba(255,255,255,.7)', textAlign:'center' }}>—</div>
                          )}
                        </div>
                        <div style={{ background: selecionado ? '#EEF2FF' : '#F8FAFC', padding:'6px 12px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color: c.pendenteFaturar > 0 ? '#9A3412' : '#0F766E', fontWeight:600 }}>
                            <span>PENDENTE DE FATURAR</span><span>{c.pendenteFaturar}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ background:'#fff', padding:'10px 16px', borderBottom:'1px solid #E0E8F0' }}>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} title="Tipos de serviço"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flexShrink:0, maxWidth:160 }}>
            <option value="">Todos tipos</option>
            {[...new Set(obras.map(o=>o.tipo))].sort().map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filtroRede} onChange={e=>setFiltroRede(e.target.value)} title="Rede"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flexShrink:0, maxWidth:140 }}>
            <option value="">Todos bancos</option>
            {[...new Set(obras.map(o=>o.rede))].filter(Boolean).sort().map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value)} title="Status"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flexShrink:0, maxWidth:160 }}>
            <option value="">Todos status</option>
            {[...new Set(obras.map(o=>o.status))].filter(Boolean).sort().map(s => <option key={s}>{s}</option>)}
          </select>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..." title="Busca"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flex:1, minWidth:140 }} />
          <select value={filtroResponsavel} onChange={e=>setFiltroResponsavel(e.target.value)} title="Responsável"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff', flexShrink:0, maxWidth:180 }}>
            <option value="">Responsável/auxiliar — todos</option>
            {COLABORADORES.map(nome => <option key={nome} value={nome}>{nome}</option>)}
          </select>
          <input type="date" value={filtroDe} onChange={e=>setFiltroDe(e.target.value)} title="Período - início"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flexShrink:0 }} />
          <input type="date" value={filtroAte} onChange={e=>setFiltroAte(e.target.value)} title="Período - até"
            style={{ padding:'7px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', flexShrink:0 }} />
          {(filtroDe || filtroAte) && (
            <button onClick={() => { setFiltroDe(''); setFiltroAte('') }}
              style={{ padding:'7px 10px', background:'#F1F5F9', border:'1px solid #CDD8E3', borderRadius:8, fontSize:11, color:'#64748B', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              ✕ limpar período
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ padding:12 }}>
        {obrasFiltradas.length === 0 && <div style={{ textAlign:'center', color:'#4A7FC1', marginTop:40, fontSize:14 }}>Nenhuma obra encontrada</div>}
        {obras.length === 0 && papel === 'admin' && (
          <div style={{ textAlign:'center', marginTop:16 }}>
            <button onClick={() => { if (confirm('Importar as 71 obras da base semente? Use só se a Pipeline estiver realmente vazia.')) importarDadosIniciais() }}
              style={{ padding:'8px 14px', background:'#F1F5F9', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#2D3A8C', cursor:'pointer' }}>
              Importar base semente (71 obras)
            </button>
          </div>
        )}
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
              const proxima = proximaAtividadeObra(obra)
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
                        <div style={{ fontSize:13, fontWeight:600, color:'#1A2340', flex:1, lineHeight:1.4 }}>
                          {proxima
                            ? <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#DBEAFE', color:'#1E40AF', marginRight:6, whiteSpace:'nowrap', display:'inline-block' }}>📅 {isoToBr(proxima.data)}{proxima.hora ? ` ${proxima.hora}` : ''}</span>
                            : <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#F1F5F9', color:'#64748B', marginRight:6, whiteSpace:'nowrap', display:'inline-block' }}>SEM PROGRAMAÇÃO</span>}
                          {obra.nome}
                        </div>
                      </div>
                      {podeVerValores && <div style={{ fontSize:13, fontWeight:700, color:'#2D3A8C', whiteSpace:'nowrap' }}>{fmt(obra.valor)}</div>}
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                      {TIPOS_BDN.includes(obra.tipo) && (
                        (obra.numero_pc || obra.sige) ? (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#1A2340', color:'#fff' }}>
                            {obra.rede === 'BRADESCO' ? 'BDN' : 'PC'} {obra.numero_pc || obra.sige}
                          </span>
                        ) : (
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FEE2E2', color:'#991B1B' }}>
                            ⚠ Sem {obra.rede === 'BRADESCO' ? 'BDN' : 'PC'}
                          </span>
                        )
                      )}
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:tc.bg, color:tc.text }}>{obra.tipo}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:sc.bg, color:sc.text }}>{obra.status}</span>
                      {obra.em_negociacao && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FEF3C7', color:'#92400E' }}>Em negociação</span>}
                      {alerta && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:alerta.bg, color:alerta.cor }}>⚠ {alerta.label}</span>}
                      {obra.tipo === 'INSTALAÇÃO ATM' && !obra.pedido && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:6, background:'#FFF7ED', color:'#9A3412' }}>⚠ Sem pedido</span>}
                      {obra.local ? <span style={{ fontSize:11, color:'#888' }}>{obra.local}</span> : null}
                    </div>
                  </div>

                  <div style={{ padding:'0 14px 8px' }}>
                    <Regua status={obra.status} rede={obra.rede} tipo={obra.tipo} lembretes={obra.lembretes} onRemoverLembrete={l => removerLembrete(obra.id, l)} />
                  </div>
                  {TIPOS_ENTREGAVEIS.includes(obra.tipo) && (() => {
                    const listaObrigatorios = entregaveisObrigatorios(obra.tipo)
                    const lista = Array.isArray(obra.entregaveis) ? obra.entregaveis : []
                    const na = Array.isArray(obra.entregaveis_na) ? obra.entregaveis_na : []
                    const feitos = lista.length
                    const total = listaObrigatorios.length - na.length
                    const tudo = total === 0 || feitos === total
                    return (
                      <div style={{ padding:'0 14px 8px' }}>
                        <div style={{ fontSize:10, color: tudo ? '#065F46' : '#92400E', fontWeight:700, marginBottom:4 }}>
                          📋 Entregáveis: {feitos}/{total}{tudo ? ' — Completo ✓' : ''}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                          {listaObrigatorios.map(item => {
                            const feito = lista.includes(item)
                            const naoAplica = na.includes(item)
                            return (
                              <span key={item} style={{ fontSize:9, padding:'2px 6px', borderRadius:5,
                                background: feito ? '#D1FAE5' : naoAplica ? '#F1F5F9' : '#FEE2E2',
                                color: feito ? '#065F46' : naoAplica ? '#64748B' : '#991B1B', fontWeight:600,
                                textDecoration: naoAplica ? 'line-through' : 'none' }}>
                                {feito ? '✓' : naoAplica ? '–' : '○'} {item}
                              </span>
                            )
                          })}
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
                                  <div style={{ fontSize:9, fontWeight:700, color: data ? '#1A6B4A' : '#2D3A8C', textTransform:'uppercase', marginBottom:3 }}>{rotuloEtapaUN(i)}</div>
                                  <div style={{ fontSize:10, fontWeight:600, color:'#1A2340', marginBottom:5, lineHeight:1.2 }}>{etapa.titulo}</div>
                                  <div style={{ fontSize:13, fontWeight:700, color: data ? '#1A6B4A' : '#9CA3AF' }}>{data ? isoToBr(data) : '—'}</div>
                                  {obra[`resp_etapa${i+1}`] && <div style={{ fontSize:9, color:'#475569', marginTop:3 }}>👤 {obra[`resp_etapa${i+1}`]}</div>}
                                  {i === 2 && obra.adesivos && (
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', marginTop:6 }}>
                                      {obra.adesivos.split(',').map(a => (
                                        <span key={a} style={{ fontSize:8, background:'#2D3A8C', color:'#fff', borderRadius:4, padding:'1px 5px', fontWeight:600 }}>{a}</span>
                                      ))}
                                    </div>
                                  )}
                                  {i === 2 && Array.isArray(obra.vidros) && obra.vidros.length > 0 && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#0369A1', fontWeight:700, marginBottom:2 }}>VIDROS:</div>
                                      {obra.vidros.map((v, vi) => (
                                        <div key={vi} style={{ fontSize:8, color:'#1E40AF', background:'#EFF6FF', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>🪟 {v}</div>
                                      ))}
                                    </div>
                                  )}
                                  {i === 2 && Array.isArray(obra.divisorias) && obra.divisorias.length > 0 && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#166534', fontWeight:700, marginBottom:2 }}>DIVISÓRIA:</div>
                                      {obra.divisorias.map((d, di) => (
                                        <div key={di} style={{ fontSize:8, color:'#166534', background:'#F0FDF4', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>🧱 {d.tipo} {d.m2}m²</div>
                                      ))}
                                    </div>
                                  )}
                                  {i === 2 && (Array.isArray(obra.itens_especiais) && obra.itens_especiais.length > 0 || obra.biombo_fila || obra.porta_giratoria) && (
                                    <div style={{ marginTop:5, textAlign:'left' }}>
                                      <div style={{ fontSize:8, color:'#065F46', fontWeight:700, marginBottom:2 }}>ITENS:</div>
                                      {Array.isArray(obra.itens_especiais) && obra.itens_especiais.map((it, ii) => (
                                        <div key={ii} style={{ fontSize:8, color:'#065F46', background:'#D1FAE5', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>✓ {it}</div>
                                      ))}
                                      {obra.biombo_fila > 0 && (
                                        <div style={{ fontSize:8, color:'#065F46', background:'#D1FAE5', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>📦 Biombo de fila: {obra.biombo_fila}</div>
                                      )}
                                      {obra.porta_giratoria > 0 && (
                                        <div style={{ fontSize:8, color:'#065F46', background:'#D1FAE5', borderRadius:3, padding:'1px 4px', marginBottom:2 }}>🚪 Porta giratória: {obra.porta_giratoria}</div>
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
                        {(obra.responsavel_escritorio || obra.auxiliar_escritorio) && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Acompanhamento (escritório)</div>{obra.responsavel_escritorio && <div style={{ fontSize:12, color:'#1A2340', fontWeight:600 }}>👤 {obra.responsavel_escritorio}</div>}{obra.auxiliar_escritorio && <div style={{ fontSize:10, color:'#888' }}>aux: {obra.auxiliar_escritorio}</div>}</div>}
                        {EMAILS_CUSTOS_DESPESAS.includes(usuario?.email) && (Array.isArray(obra.custos_terceirizados) && obra.custos_terceirizados.length > 0 || Array.isArray(obra.despesas_pessoal) && obra.despesas_pessoal.length > 0) && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Custos lançados</div><div style={{ fontSize:12, color:'#9A3412', fontWeight:600 }}>{fmt(somaValores(obra.custos_terceirizados) + somaValores(obra.despesas_pessoal))}</div></div>}
                        {obra.sige && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>SIGE</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.sige}</div></div>}
                        {obra.pedido && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>Pedido</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.pedido}</div></div>}
                        {obra.nf && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>NF</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.nf}</div></div>}
                        {obra.os_tecban && <div><div style={{ fontSize:10, color:'#888', textTransform:'uppercase', marginBottom:2 }}>OS Tecban</div><div style={{ fontSize:12, color:'#1A2340', fontWeight:500 }}>{obra.os_tecban}</div></div>}
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
                        {
                          const nomesEtapa3 = (obra.resp_etapa3 || '').split(',').map(s => s.trim()).filter(Boolean)
                          const terceirizadoNomeEtapa3 = nomesEtapa3.find(n => n.startsWith(TERCEIRIZADO_PREFIXO))
                          setEquipeEtapa3(nomesEtapa3.filter(n => !n.startsWith(TERCEIRIZADO_PREFIXO)))
                          setTerceirizadoEtapa3(!!terceirizadoNomeEtapa3)
                          setTerceirizadoEtapa3Texto(terceirizadoNomeEtapa3 ? terceirizadoNomeEtapa3.slice(TERCEIRIZADO_PREFIXO.length) : '')
                        }
                        setDataObra({ inicio: obra.inicio ? brToIso(obra.inicio) : '', termino: obra.termino ? brToIso(obra.termino) : '' })
                        setDataArt(obra.data_art || '')
                        setEmNegociacao(obra.em_negociacao || false)
                        setLembretes(Array.isArray(obra.lembretes) ? obra.lembretes : [])
                        setEntregaveis(Array.isArray(obra.entregaveis) ? obra.entregaveis : [])
                        setEntregaveisNA(Array.isArray(obra.entregaveis_na) ? obra.entregaveis_na : [])
                        setEntregaveisVistoria(Array.isArray(obra.entregaveis_vistoria) ? obra.entregaveis_vistoria : [])
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
                        setPortaGiratoria(obra.porta_giratoria != null ? String(obra.porta_giratoria) : '')
                        setEditDados({ tipo: obra.tipo||'', nome: obra.nome||'', endereco: obra.endereco||'', cidade: obra.cidade||'', uf: obra.uf||'', valor: obra.valor!=null ? String(obra.valor) : '', sige: obra.sige||'', numero_pc: obra.numero_pc||'', pedido: obra.pedido||'', nf: obra.nf||'', os_tecban: obra.os_tecban||'', pedido_valor: obra.pedido_valor!=null ? String(obra.pedido_valor) : '', pedido_os: obra.pedido_os||'', pedido_cnpj: obra.pedido_cnpj||'', pedido_tecban_cnpj: obra.pedido_tecban_cnpj||'', pedido_tecban_nome: obra.pedido_tecban_nome||'' })
                        setDataCadastroModal(obra.data_cadastro || '')
                        setDataVistoria(obra.data_vistoria || '')
                        const listaVistoria = Array.isArray(obra.colaboradores_vistoria) ? obra.colaboradores_vistoria : []
                        const terceiroVistoria = listaVistoria.find(c => c.startsWith(TERCEIRIZADO_PREFIXO))
                        setColabsVistoria(listaVistoria.filter(c => !c.startsWith(TERCEIRIZADO_PREFIXO)))
                        setTerceirizadoVistoria(!!terceiroVistoria)
                        setTerceirizadoVistoriaTexto(terceiroVistoria ? terceiroVistoria.slice(TERCEIRIZADO_PREFIXO.length) : '')
                        setArsVerificado(obra.ars_verificado || false)
                        setEcNome(obra.ec_nome || '')
                        setEcTelefone(obra.ec_telefone || '')
                        setDataInicioObraTexto(obra.data_inicio_obra_texto || '')
                        setHoraInicioObraTexto(obra.hora_inicio_obra_texto || '')
                        setSegurancaItens(Array.isArray(obra.seguranca_itens) ? obra.seguranca_itens : [])
                        setSegurancaItensCampo(Array.isArray(obra.seguranca_itens_campo) ? obra.seguranca_itens_campo : [])
                        setBarreiraDissuasao(obra.barreira_dissuasao || false)
                        setBarreiraDissuasaoCampo(obra.barreira_dissuasao_campo || false)
                        setAutorizacaoMudanca(obra.autorizacao_mudanca || '')
                        setAgendamentoData(obra.agendamento_data || '')
                        setRegistrosOperacaoCampo(Array.isArray(obra.registros_operacao_campo) ? obra.registros_operacao_campo : [])
                        setNovoRegistroData('')
                        setNovoRegistroHora('')
                        setNovoRegistroEquipe([])
                        setNovoRegistroTerceirizado(false)
                        setNovoRegistroTerceirizadoTexto('')
                        setNovoRegistroAtividades({})
                        setMostrarEnvioRelatorio(false)
                        setFotosRelatorio([])
                        setErroEnvioRelatorio('')
                        const listaObra = Array.isArray(obra.colaboradores_obra) ? obra.colaboradores_obra : []
                        const terceiroObra = listaObra.find(c => c.startsWith(TERCEIRIZADO_PREFIXO))
                        setColabsObra(listaObra.filter(c => !c.startsWith(TERCEIRIZADO_PREFIXO)))
                        setTerceirizadoObra(!!terceiroObra)
                        setTerceirizadoObraTexto(terceiroObra ? terceiroObra.slice(TERCEIRIZADO_PREFIXO.length) : '')
                        setResponsavelEscritorio(obra.responsavel_escritorio || '')
                        setAuxiliarEscritorio(obra.auxiliar_escritorio || '')
                        setCustosTerceirizados(Array.isArray(obra.custos_terceirizados) ? obra.custos_terceirizados : [])
                        setNovoCustoTipo('GESSO')
                        setNovoCustoValor('')
                        setNovoCustoObs('')
                        setDespesasPessoal(Array.isArray(obra.despesas_pessoal) ? obra.despesas_pessoal : [])
                        setNovaDespesaData('')
                        setNovaDespesaCategoria('Hospedagem')
                        setNovaDespesaValor('')
                        setNovaDespesaObs('')
                        setNovaDespesaKm('')
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

      {/* Modal Corrigir PC/BDN */}
      {modalCorrigirPC && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) { setModalCorrigirPC(false); setCorrigirPCPreview(null); setCorrigirPCArquivo(null); setCorrigirPCErro('') } }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:6 }}>Corrigir número do PC/BDN</div>
            <div style={{ fontSize:12, color:'#64748B', marginBottom:14 }}>
              Sobe o relatório do SIGE Cloud (Vendas → Pedidos e Orçamentos) com as colunas "Código" e "Atributo N.º do PC". Casa pelo Código (já salvo em cada obra de movimentação) e corrige o número de PC/BDN mostrado no card - não mexe em status nem cria obra nova.
            </div>
            <input type="file" accept=".xlsx,.xls" onChange={e => { setCorrigirPCArquivo(e.target.files?.[0] || null); setCorrigirPCPreview(null) }}
              style={{ width:'100%', fontSize:12, marginBottom:12 }} />
            {corrigirPCErro && <div style={{ fontSize:12, color:'#991B1B', marginBottom:10 }}>{corrigirPCErro}</div>}
            <button onClick={processarCorrecaoPC} disabled={corrigirPCProcessando || !corrigirPCArquivo}
              style={{ padding:'9px 16px', background: (corrigirPCProcessando || !corrigirPCArquivo) ? '#ccc' : '#0E4D73', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:14 }}>
              {corrigirPCProcessando ? 'Lendo planilha...' : 'Processar planilha'}
            </button>

            {corrigirPCPreview && (
              <>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:10 }}>
                  {corrigirPCPreview.length === 0 ? 'Nenhuma obra pra corrigir' : `${corrigirPCPreview.length} obra(s) com PC/BDN pra corrigir`}
                </div>
                {corrigirPCPreview.length > 0 && (
                  <div style={{ overflowX:'auto', marginBottom:14 }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                          {['Obra','Código SIGE','PC/BDN atual','PC/BDN correto'].map(h => (
                            <th key={h} style={{ padding:'6px 8px', borderBottom:'1px solid #E0E8F0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {corrigirPCPreview.map(c => (
                          <tr key={c.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                            <td style={{ padding:'6px 8px' }}>{c.nome}</td>
                            <td style={{ padding:'6px 8px' }}>{c.sige}</td>
                            <td style={{ padding:'6px 8px', color: c.numeroPcAtual ? '#991B1B' : '#94A3B8' }}>{c.numeroPcAtual || '—'}</td>
                            <td style={{ padding:'6px 8px', color:'#065F46', fontWeight:700 }}>{c.numeroPcNovo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {corrigirPCPreview.length > 0 && (
                  <button onClick={confirmarCorrecaoPC} disabled={corrigirPCSalvando}
                    style={{ width:'100%', padding:12, background: corrigirPCSalvando ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
                    {corrigirPCSalvando ? 'Salvando...' : `Corrigir ${corrigirPCPreview.length} obra(s)`}
                  </button>
                )}
              </>
            )}
            <button onClick={() => { setModalCorrigirPC(false); setCorrigirPCPreview(null); setCorrigirPCArquivo(null); setCorrigirPCErro('') }}
              style={{ width:'100%', padding:11, background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:12, fontSize:13, cursor:'pointer' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Importar Novas Obras (SIGE) */}
      {modalImportarNovas && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) { setModalImportarNovas(false); setImportarNovasPreview(null); setImportarNovasArquivo(null); setImportarNovasErro('') } }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:6 }}>Importar novas obras do SIGE</div>
            <div style={{ fontSize:12, color:'#64748B', marginBottom:14 }}>
              Sobe o relatório do SIGE Cloud (ReportPersonalizado). Obras cujo Código já existir no Pipeline são ignoradas (não duplica). Cria como movimentação ATM/BDN (Banco24Horas, Bradesco, Banconordeste, Banrisul), tipo "VISTORIA" entra como INSTALAÇÃO ATM. Obras/Pintura/Infra elétrica e linhas com tipo de serviço não reconhecido são descartadas.
            </div>
            <input type="file" accept=".xlsx,.xls" onChange={e => { setImportarNovasArquivo(e.target.files?.[0] || null); setImportarNovasPreview(null) }}
              style={{ width:'100%', fontSize:12, marginBottom:12 }} />
            {importarNovasErro && <div style={{ fontSize:12, color:'#991B1B', marginBottom:10 }}>{importarNovasErro}</div>}
            <button onClick={processarImportacaoNovas} disabled={importarNovasProcessando || !importarNovasArquivo}
              style={{ padding:'9px 16px', background: (importarNovasProcessando || !importarNovasArquivo) ? '#ccc' : '#0E4D73', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:14 }}>
              {importarNovasProcessando ? 'Lendo planilha...' : 'Processar planilha'}
            </button>

            {importarNovasPreview && (
              <>
                <div style={{ fontSize:13, fontWeight:700, color:'#1A2340', marginBottom:6 }}>
                  {importarNovasPreview.candidatos.length === 0 ? 'Nenhuma obra nova pra importar' : `${importarNovasPreview.candidatos.length} obra(s) nova(s) pra criar`}
                </div>
                <div style={{ fontSize:11, color:'#94A3B8', marginBottom:10 }}>
                  {importarNovasPreview.excluidosPorTipo} linha(s) descartada(s) por tipo (Obras/Pintura/Infra elétrica).
                  {Object.keys(importarNovasPreview.naoClassificados).length > 0 && (
                    <> {Object.values(importarNovasPreview.naoClassificados).reduce((a,b)=>a+b,0)} linha(s) com tipo de serviço não reconhecido, descartada(s): {Object.entries(importarNovasPreview.naoClassificados).map(([k,v]) => `${k} (${v})`).join(', ')}.</>
                  )}
                </div>
                {importarNovasPreview.candidatos.length > 0 && (
                  <div style={{ overflowX:'auto', marginBottom:14 }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead>
                        <tr style={{ background:'#F8FAFC', textAlign:'left' }}>
                          {['Tipo','Rede','Nome','Local','Status','Código SIGE','PC/BDN'].map(h => (
                            <th key={h} style={{ padding:'6px 8px', borderBottom:'1px solid #E0E8F0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importarNovasPreview.candidatos.map(c => (
                          <tr key={c.sige} style={{ borderBottom:'1px solid #F1F5F9' }}>
                            <td style={{ padding:'6px 8px' }}>{c.tipo}</td>
                            <td style={{ padding:'6px 8px' }}>{c.rede || '—'}</td>
                            <td style={{ padding:'6px 8px' }}>{c.nome}</td>
                            <td style={{ padding:'6px 8px' }}>{c.cidade}{c.uf ? '-'+c.uf : ''}</td>
                            <td style={{ padding:'6px 8px' }}>{c.status}</td>
                            <td style={{ padding:'6px 8px' }}>{c.sige}</td>
                            <td style={{ padding:'6px 8px' }}>{c.numero_pc || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {importarNovasPreview.candidatos.length > 0 && (
                  <button onClick={confirmarImportacaoNovas} disabled={importarNovasSalvando}
                    style={{ width:'100%', padding:12, background: importarNovasSalvando ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
                    {importarNovasSalvando ? 'Criando...' : `Criar ${importarNovasPreview.candidatos.length} obra(s)`}
                  </button>
                )}
              </>
            )}
            <button onClick={() => { setModalImportarNovas(false); setImportarNovasPreview(null); setImportarNovasArquivo(null); setImportarNovasErro('') }}
              style={{ width:'100%', padding:11, background:'#fff', color:'#4A7FC1', border:'1px solid #B5D4F4', borderRadius:12, fontSize:13, cursor:'pointer' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Nova Obra */}
      {modalNovaObra && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if(e.target === e.currentTarget) setModalNovaObra(false) }}>
          <div style={{ background:'#fff', borderRadius:'16px 16px 0 0', padding:20, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1A2340', marginBottom:16 }}>Nova Obra</div>
            {[
              { label:'Tipo *', field:'tipo', type:'select', options:['TRANSF UN','TRANSF EN','TRANSF PAE','DESC. PA','DESC. PAB','ENCER. AG','REFORMA','TB FORTE','LINK'] },
            ].map(f => (
              <div key={f.field} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }}>
                    <option value="">Selecione...</option>
                    {f.field === 'tipo' ? (
                      <>
                        <optgroup label="Transformação de agência">
                          {f.options.map(o => <option key={o}>{o}</option>)}
                        </optgroup>
                        <optgroup label="Movimentação de máquina (ATM/BDN)">
                          {TIPOS_BDN.map(o => <option key={o}>{o}</option>)}
                        </optgroup>
                      </>
                    ) : f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]: f.field === 'obs' ? up(e.target.value) : e.target.value}))}
                    rows={3} placeholder={f.placeholder}
                    style={{ width:'100%', padding:'10px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, resize:'none', boxSizing:'border-box', color:'#1A2340' }} />
                ) : (
                  <input type={f.type} value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]:e.target.value}))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                )}
              </div>
            ))}
            {TIPOS_BDN.includes(novaObra.tipo) && (
              <div style={{ marginBottom:12, background:'#F0F7FF', borderRadius:10, padding:12, border:'1px solid #BFDBFE' }}>
                <label style={{ fontSize:12, color:'#1E40AF', fontWeight:700, display:'block', marginBottom:4 }}>Rede *</label>
                <select value={novaObra.rede} onChange={e => setNovaObra(p => ({...p, rede:e.target.value}))}
                  style={{ width:'100%', padding:'10px 12px', border:'1px solid #BFDBFE', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }}>
                  <option value="">Selecione...</option>
                  {['BANCO24HORAS','BRADESCO','AGIBANK','CREFISA','BANESTES','ITAÚ'].map(o => <option key={o}>{o}</option>)}
                </select>
                <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>Define a régua de status: Bradesco tem processo próprio (com vistoria e espera pelo pedido); as demais seguem o processo Banco24Horas.</div>
              </div>
            )}
            {novaObra.rede === 'BANCO24HORAS' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Número do PC *</label>
                  <input value={novaObra.numero_pc} onChange={e => setNovaObra(p => ({...p, numero_pc:e.target.value}))}
                    placeholder="Ex: 12345"
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Número do PA *</label>
                  <input value={novaObra.numero_pa} onChange={e => setNovaObra(p => ({...p, numero_pa:e.target.value}))}
                    placeholder="Ex: 6789"
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
              </div>
            )}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Nome da obra *</label>
              <input value={novaObra.nome} onChange={e => setNovaObra(p => ({...p, nome:up(e.target.value)}))}
                placeholder="Ex: BR_UN 1234 - NOME-USP"
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.3fr 0.6fr', gap:8, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Endereço{novaObra.rede === 'BANCO24HORAS' ? ' *' : ''}</label>
                <input value={novaObra.endereco} onChange={e => setNovaObra(p => ({...p, endereco:up(e.target.value)}))}
                  placeholder="Rua, número, CEP"
                  style={{ width:'100%', padding:'10px 8px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>Cidade{novaObra.rede === 'BANCO24HORAS' ? ' *' : ''}</label>
                <input value={novaObra.cidade} onChange={e => setNovaObra(p => ({...p, cidade:up(e.target.value)}))}
                  placeholder="Ex: São Paulo"
                  style={{ width:'100%', padding:'10px 8px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>UF{novaObra.rede === 'BANCO24HORAS' ? ' *' : ''}</label>
                <input value={novaObra.uf} maxLength={2} onChange={e => setNovaObra(p => ({...p, uf:e.target.value.toUpperCase().replace(/[^A-Z]/g, '')}))}
                  placeholder="SP"
                  style={{ width:'100%', padding:'10px 8px', border: (novaObra.uf && novaObra.uf.length !== 2) ? '1px solid #DC2626' : '1px solid #CDD8E3', borderRadius:10, fontSize:12, color:'#1A2340', boxSizing:'border-box', textTransform:'uppercase' }} />
              </div>
            </div>
            {[
              { label:'Valor (R$)', field:'valor', type:'number', placeholder:'Ex: 12500.00' },
              { label:'SIGE', field:'sige', type:'text', placeholder:'Ex: 14500' },
              { label:'Pedido', field:'pedido', type:'text', placeholder:'Ex: ORDEM 1000079999' },
              { label:'NF', field:'nf', type:'text', placeholder:'Ex: 3181' },
              { label:'Observação', field:'obs', type:'textarea', placeholder:'Detalhes, pendências...' },
            ].map(f => (
              <div key={f.field} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#4A7FC1', display:'block', marginBottom:4 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={novaObra[f.field]} onChange={e => setNovaObra(p => ({...p, [f.field]: f.field === 'obs' ? up(e.target.value) : e.target.value}))}
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
            <button onClick={salvarNovaObra} disabled={!novaObra.tipo || !novaObra.nome || (TIPOS_BDN.includes(novaObra.tipo) && !novaObra.rede) || (novaObra.rede === 'BANCO24HORAS' && (!novaObra.numero_pc.trim() || !novaObra.numero_pa.trim() || !novaObra.endereco.trim() || !novaObra.cidade.trim() || novaObra.uf.trim().length !== 2)) || salvando}
              style={{ width:'100%', padding:13, background: (!novaObra.tipo||!novaObra.nome||(TIPOS_BDN.includes(novaObra.tipo) && !novaObra.rede)||(novaObra.rede === 'BANCO24HORAS' && (!novaObra.numero_pc.trim() || !novaObra.numero_pa.trim() || !novaObra.endereco.trim() || !novaObra.cidade.trim() || novaObra.uf.trim().length !== 2))||salvando) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:8 }}>
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
              {modal.rede === 'BANCO24HORAS' && (
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Número do PC</label>
                <input value={editDados.numero_pc} onChange={e => setEditDados(d => ({...d, numero_pc:e.target.value}))}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
              )}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Nome</label>
                <input value={editDados.nome} onChange={e => setEditDados(d => ({...d, nome:up(e.target.value)}))}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
              </div>
              {TIPOS_BDN.includes(modal.tipo) && (
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Tipo de serviço</label>
                <select value={editDados.tipo || modal.tipo} onChange={e => setEditDados(d => ({...d, tipo:e.target.value}))}
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                  {TIPOS_BDN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>Corrige tipo importado errado do SIGE (ex: Desinstalação lida como Instalação) - só troca entre os tipos ATM, que usam a mesma régua.</div>
              </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.3fr 0.6fr', gap:8, marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Endereço</label>
                  <input value={editDados.endereco} onChange={e => setEditDados(d => ({...d, endereco:up(e.target.value)}))}
                    placeholder="Rua, número, CEP"
                    style={{ width:'100%', padding:'8px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Cidade</label>
                  <input value={editDados.cidade} onChange={e => setEditDados(d => ({...d, cidade:up(e.target.value)}))}
                    style={{ width:'100%', padding:'8px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>UF</label>
                  <input value={editDados.uf} maxLength={2} onChange={e => setEditDados(d => ({...d, uf:e.target.value.toUpperCase()}))}
                    style={{ width:'100%', padding:'8px 8px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', textTransform:'uppercase' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: `repeat(${(podeVerValores?1:0) + (TIPOS_BDN.includes(modal.tipo) && modal.rede !== 'BANCO24HORAS'?1:0) + 4}, 1fr)`, gap:8 }}>
                {podeVerValores && (
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Valor (R$)</label>
                  <input type="number" value={editDados.valor} onChange={e => setEditDados(d => ({...d, valor:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                )}
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>SIGE</label>
                  <input value={editDados.sige} onChange={e => setEditDados(d => ({...d, sige:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                {TIPOS_BDN.includes(modal.tipo) && modal.rede !== 'BANCO24HORAS' && (
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>PC/BDN</label>
                  <input value={editDados.numero_pc} onChange={e => setEditDados(d => ({...d, numero_pc:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                )}
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>OS Tecban</label>
                  <input value={editDados.os_tecban} onChange={e => setEditDados(d => ({...d, os_tecban:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Pedido</label>
                  <input value={editDados.pedido} onChange={e => setEditDados(d => ({...d, pedido:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>NF</label>
                  <input value={editDados.nf} onChange={e => setEditDados(d => ({...d, nf:e.target.value}))}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
              </div>
            </div>

            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Responsável do escritório *</label>
                  <select value={responsavelEscritorio} onChange={e => setResponsavelEscritorio(e.target.value)}
                    style={{ width:'100%', padding:'8px 6px', border: !responsavelEscritorio.trim() ? '1px solid #DC2626' : '1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                    <option value="">—</option>
                    {COLABORADORES.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Auxiliar do escritório</label>
                  <select value={auxiliarEscritorio} onChange={e => setAuxiliarEscritorio(e.target.value)}
                    style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                    <option value="">—</option>
                    {COLABORADORES.map(nome => <option key={nome} value={nome}>{nome}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {podeVerValores && (
              <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#9A3412', fontWeight:700, marginBottom:10 }}>📥 Conferência do pedido de faturamento</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Valor no pedido (R$)</label>
                    <input type="number" value={editDados.pedido_valor} onChange={e => setEditDados(d => ({...d, pedido_valor:e.target.value}))}
                      style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>OS no pedido</label>
                    <input value={editDados.pedido_os} onChange={e => setEditDados(d => ({...d, pedido_os:e.target.value}))}
                      style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>CNPJ indicado no pedido</label>
                    <select value={editDados.pedido_cnpj} onChange={e => setEditDados(d => ({...d, pedido_cnpj:e.target.value}))}
                      style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                      <option value="">—</option>
                      <option value={CNPJS_GRUPOPG.SP}>SP — {CNPJS_GRUPOPG.SP}</option>
                      <option value={CNPJS_GRUPOPG.RJ}>RJ — {CNPJS_GRUPOPG.RJ}</option>
                      <option value={CNPJS_GRUPOPG.MG}>MG — {CNPJS_GRUPOPG.MG}</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>CNPJ da Tecban (dados para faturamento)</label>
                    <input value={editDados.pedido_tecban_cnpj} onChange={e => setEditDados(d => ({...d, pedido_tecban_cnpj:e.target.value}))}
                      placeholder="Ex: 51.427.102/0019-58"
                      style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Razão social da Tecban no pedido</label>
                    <input value={editDados.pedido_tecban_nome} onChange={e => setEditDados(d => ({...d, pedido_tecban_nome:up(e.target.value)}))}
                      placeholder="Ex: TECNOLOGIA BANCARIA S.A. / TBSI"
                      style={{ width:'100%', padding:'8px 6px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                </div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:-6, marginBottom:10 }}>Dado informativo pro faturamento (Aline) — não entra na conferência de bate/não bate.</div>
                {(editDados.pedido_valor !== '' || editDados.pedido_os.trim() || editDados.pedido_cnpj) && (() => {
                  const valorObra = parseFloat(String(editDados.valor).replace(',', '.')) || 0
                  const valorPedido = parseFloat(String(editDados.pedido_valor).replace(',', '.')) || 0
                  const valorBate = editDados.pedido_valor !== '' && Math.abs(valorPedido - valorObra) < 0.01
                  const osBate = editDados.pedido_os.trim() !== '' && editDados.pedido_os.trim() === editDados.os_tecban.trim()
                  const ufObra = editDados.uf.trim().toUpperCase()
                  const cnpjEsperado = cnpjEsperadoParaUF(ufObra)
                  const cnpjBate = !!editDados.pedido_cnpj && editDados.pedido_cnpj === cnpjEsperado
                  const linha = (ok, label) => (
                    <div style={{ fontSize:12, color: ok ? '#065F46' : '#991B1B', fontWeight:600 }}>{ok ? '✓' : '✗'} {label}</div>
                  )
                  return (
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {editDados.pedido_valor !== '' && linha(valorBate, valorBate ? `Valor bate (R$ ${valorObra.toFixed(2)})` : `Valor não bate — pedido R$ ${valorPedido.toFixed(2)} x obra R$ ${valorObra.toFixed(2)}`)}
                      {editDados.pedido_os.trim() && linha(osBate, osBate ? 'OS bate' : `OS não bate — pedido "${editDados.pedido_os}" x cadastro "${editDados.os_tecban}"`)}
                      {editDados.pedido_cnpj && linha(cnpjBate, cnpjBate ? `CNPJ bate (esperado pra ${ufObra || '—'})` : `CNPJ não bate — obra é ${ufObra || '?'}, esperado ${cnpjEsperado}`)}
                    </div>
                  )
                })()}
                {divergenciasPedido().length > 0 && (
                  <div style={{ marginTop:10 }}>
                    <button onClick={() => { setMostrarEnvioCorrecaoPedido(true); setErroEnvioCorrecaoPedido('') }}
                      style={{ width:'100%', padding:10, background:'#DC2626', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      📧 Solicitar correção à Tecban
                    </button>
                    {mostrarEnvioCorrecaoPedido && (
                      <div style={{ marginTop:10, background:'#fff', border:'1px solid #CDD8E3', borderRadius:8, padding:12 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', marginBottom:8 }}>Revisar antes de enviar</div>
                        <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}><strong>Para:</strong> {EMAIL_CORRECAO_PEDIDO_TECBAN}</div>
                        <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}><strong>Cc:</strong> {EMAIL_CC_CORRECAO_PEDIDO}</div>
                        <div style={{ fontSize:12, color:'#374151', marginBottom:8 }}><strong>Assunto:</strong> {montaAssuntoCorrecaoPedido()}</div>
                        <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>Texto do e-mail</div>
                        <div style={{ fontSize:12, color:'#374151', whiteSpace:'pre-wrap', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:10, marginBottom:10 }}>{montaCorpoCorrecaoPedido()}</div>
                        {erroEnvioCorrecaoPedido && <div style={{ fontSize:12, color:'#DC2626', marginBottom:8 }}>{erroEnvioCorrecaoPedido}</div>}
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => { setMostrarEnvioCorrecaoPedido(false); setErroEnvioCorrecaoPedido('') }} disabled={enviandoCorrecaoPedido}
                            style={{ flex:1, padding:10, background:'#F1F5F9', color:'#1A2340', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                            Cancelar
                          </button>
                          <button onClick={enviarCorrecaoPedidoTecban} disabled={enviandoCorrecaoPedido}
                            style={{ flex:1, padding:10, background: enviandoCorrecaoPedido ? '#94A3B8' : '#DC2626', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: enviandoCorrecaoPedido ? 'default' : 'pointer' }}>
                            {enviandoCorrecaoPedido ? 'Enviando...' : 'Confirmar envio'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!(modal.rede === 'BANCO24HORAS' && SEM_VISTORIA_BANCO24H.includes(modal.tipo)) && (
            <>
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Data da vistoria</label>
              <input type="date" value={dataVistoria} onChange={e => setDataVistoria(e.target.value)}
                style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginBottom:8 }} />
              <SeletorEquipe titulo="Vistoria" selecionados={colabsVistoria} onChangeSelecionados={setColabsVistoria}
                terceirizado={terceirizadoVistoria} onChangeTerceirizado={setTerceirizadoVistoria}
                terceirizadoTexto={terceirizadoVistoriaTexto} onChangeTerceirizadoTexto={setTerceirizadoVistoriaTexto} />
            </div>

            <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#1E40AF', fontWeight:700, marginBottom:10 }}>
                📋 Entregáveis pós-vistoria ({entregaveisVistoria.length}/{ENTREGAVEIS_VISTORIA.length})
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ENTREGAVEIS_VISTORIA.map(item => (
                  <label key={item} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                    <input type="checkbox" checked={entregaveisVistoria.includes(item)}
                      onChange={e => setEntregaveisVistoria(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item))} />
                    <span style={{ fontSize:13, color: entregaveisVistoria.includes(item) ? '#1E40AF' : '#1A2340', fontWeight: entregaveisVistoria.includes(item) ? 600 : 400 }}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            </>
            )}

            {temTelaOperacaoCampo(modal.rede, modal.tipo) && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>
                {REDES_SEM_ARS.includes(modal.rede) || modal.tipo === 'SINALIZAÇÃO ATM' ? '📑 Contato e agendamento' : '📑 Consulta ARS e agendamento'}
              </div>
              {!REDES_SEM_ARS.includes(modal.rede) && modal.tipo !== 'SINALIZAÇÃO ATM' && (
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:10 }}>
                <input type="checkbox" checked={arsVerificado} onChange={e => setArsVerificado(e.target.checked)} />
                <span style={{ fontSize:13, color:'#1A2340', fontWeight:600 }}>Entrou no ARS e conferiu as informações</span>
              </label>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Contato do EC — nome</label>
                  <input value={ecNome} onChange={e => setEcNome(up(e.target.value))}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Contato do EC — telefone</label>
                  <input value={ecTelefone} onChange={e => setEcTelefone(e.target.value)}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Data e hora de início da obra (confirmada com o cliente)</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <input type="date" value={paraIsoDataObraTexto(dataInicioObraTexto) || ''} onChange={e => setDataInicioObraTexto(e.target.value)}
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  <input value={horaInicioObraTexto} onChange={e => setHoraInicioObraTexto(e.target.value)}
                    placeholder="HH:MM"
                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                </div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>A OS da Tecban sugere uma data/hora, mas o que vale aqui é a data confirmada com o cliente final (EC) — não usar a data do relatório SIGE.</div>
              </div>
              {modal.tipo !== 'DESATIVAÇÃO ATM' && modal.tipo !== 'SINALIZAÇÃO ATM' && !REDES_SEM_ARS.includes(modal.rede) && (
              <>
              <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:6 }}>Critérios de segurança — o que o ARS indica x o que foi realizado em campo</div>
              <div style={{ marginBottom:12, overflowX:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'minmax(160px, 260px) 100px 100px', gap:4, alignItems:'center', maxWidth:480 }}>
                  <div></div>
                  <div style={{ fontSize:10, color:'#4A7FC1', fontWeight:700, textAlign:'center', lineHeight:1.2 }}>Solicitação no ARS</div>
                  <div style={{ fontSize:10, color:'#4A7FC1', fontWeight:700, textAlign:'center', lineHeight:1.2 }}>Executado em campo</div>
                  {[...ITENS_SEGURANCA_BANCO24H, 'Tem barreira de dissuasão'].map(item => {
                    const ehBarreira = item === 'Tem barreira de dissuasão'
                    const arsMarcado = ehBarreira ? barreiraDissuasao : segurancaItens.includes(item)
                    const campoMarcado = ehBarreira ? barreiraDissuasaoCampo : segurancaItensCampo.includes(item)
                    return (
                      <React.Fragment key={item}>
                        <span style={{ fontSize:13, color: (arsMarcado || campoMarcado) ? '#1E40AF' : '#1A2340', fontWeight: (arsMarcado || campoMarcado) ? 600 : 400 }}>{item}</span>
                        <div style={{ textAlign:'center' }}>
                          <input type="checkbox" checked={arsMarcado} onChange={e => {
                            if (ehBarreira) setBarreiraDissuasao(e.target.checked)
                            else setSegurancaItens(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item))
                          }} />
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <input type="checkbox" checked={campoMarcado} onChange={e => {
                            if (ehBarreira) setBarreiraDissuasaoCampo(e.target.checked)
                            else setSegurancaItensCampo(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item))
                          }} />
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Quem autorizou a mudança? Nome completo e data e hora do e-mail</label>
                <input value={autorizacaoMudanca} onChange={e => setAutorizacaoMudanca(up(e.target.value))}
                  placeholder="Ex: João Silva, 14/08/2026 09:30"
                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>Preencher só quando o que foi realizado em campo é diferente do que o ARS indicava.</div>
              </div>
              </>
              )}
            </div>
            )}

            {temVisitasDeCampo(modal.rede, modal.tipo) && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>
                {modal.tipo === 'TRANSF UN' ? '🔁 Retornos ao ponto — visitas extras' : '🛠️ Dia da obra — visitas de campo'}
              </div>

              {registrosOperacaoCampo.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                  {registrosOperacaoCampo.map((r, idx) => (
                    <div key={idx} style={{ background:'#fff', border:'1px solid #CDD8E3', borderRadius:8, padding:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#1A2340' }}>{r.data ? isoToBr(r.data) : '(sem data)'}{r.hora ? ` ${r.hora}` : ''} — {(r.equipe||[]).join(', ') || '—'}</div>
                        <div style={{ display:'flex', gap:10 }}>
                          <span onClick={() => {
                            setEditandoVisitaIdx(idx)
                            setNovoRegistroData(r.data || '')
                            setNovoRegistroHora(r.hora || '')
                            setNovoRegistroEquipe((r.equipe || []).filter(e => !e.startsWith(TERCEIRIZADO_PREFIXO)))
                            const terceirizadoNome = (r.equipe || []).find(e => e.startsWith(TERCEIRIZADO_PREFIXO))
                            setNovoRegistroTerceirizado(!!terceirizadoNome)
                            setNovoRegistroTerceirizadoTexto(terceirizadoNome ? terceirizadoNome.slice(TERCEIRIZADO_PREFIXO.length) : '')
                            const atividadesMap = {}
                            ;(r.atividades || []).forEach(a => { atividadesMap[a.atividade] = { ...a } })
                            setNovoRegistroAtividades(atividadesMap)
                          }} style={{ fontSize:11, color:'#2D3A8C', cursor:'pointer', fontWeight:600 }}>Editar</span>
                          <span onClick={() => {
                            setRegistrosOperacaoCampo(prev => prev.filter((_, i) => i !== idx))
                            if (editandoVisitaIdx === idx) setEditandoVisitaIdx(null)
                          }} style={{ fontSize:11, color:'#DC2626', cursor:'pointer', fontWeight:600 }}>Remover</span>
                        </div>
                      </div>
                      <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:4 }}>
                        {(r.atividades||[]).map((a, ai) => (
                          <div key={ai} style={{ fontSize:12, color: a.feita === true ? '#065F46' : a.feita === false ? '#991B1B' : '#92400E' }}>
                            {a.feita === true ? '✓ Feita' : a.feita === false ? '✗ Não feita' : '⏳ Planejada'} — {a.atividade}{a.impedimento && a.motivo ? ` (com desvio: ${a.motivo})` : (a.impedimento ? ' (com desvio)' : '')}
                            {a.atividade === 'Habilitação' && a.feita !== null && a.feita !== undefined && (
                              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>
                                Dimer: {a.dimerFinalizado ? 'finalizado' : `não finalizado${a.dimerMotivo ? ` (${a.dimerMotivo})` : ''}`} · Alarme 253: {a.alarme253Finalizado ? 'finalizado' : `não finalizado${a.alarme253Motivo ? ` (${a.alarme253Motivo})` : ''}`}{a.cgrNome ? ` · CGR: ${a.cgrNome}` : ''}
                              </div>
                            )}
                            {a.atividade === 'Outros' && a.descricao && (
                              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{a.descricao}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background:'#fff', border:'1px dashed #B5D4F4', borderRadius:8, padding:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:700 }}>{editandoVisitaIdx !== null ? '✏️ Editando visita' : '+ Nova visita'}</div>
                  {editandoVisitaIdx !== null && (
                    <span onClick={() => {
                      setEditandoVisitaIdx(null)
                      setNovoRegistroData('')
                      setNovoRegistroHora('')
                      setNovoRegistroEquipe([])
                      setNovoRegistroTerceirizado(false)
                      setNovoRegistroTerceirizadoTexto('')
                      setNovoRegistroAtividades({})
                    }} style={{ fontSize:11, color:'#64748B', cursor:'pointer', fontWeight:600 }}>Cancelar edição</span>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Data</label>
                    <input type="date" value={novoRegistroData || (paraIsoDataObraTexto(dataInicioObraTexto) || '')} onChange={e => setNovoRegistroData(e.target.value)}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Hora</label>
                    <input type="time" value={novoRegistroHora} onChange={e => setNovoRegistroHora(e.target.value)}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                </div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:-4, marginBottom:8 }}>Data preenchida a partir da data de início da obra confirmada — ajuste se essa visita for em outro dia. Hora é opcional.</div>
                <SeletorEquipe titulo="Quem foi na obra" selecionados={novoRegistroEquipe} onChangeSelecionados={setNovoRegistroEquipe}
                  terceirizado={novoRegistroTerceirizado} onChangeTerceirizado={setNovoRegistroTerceirizado}
                  terceirizadoTexto={novoRegistroTerceirizadoTexto} onChangeTerceirizadoTexto={setNovoRegistroTerceirizadoTexto} />
                <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, margin:'10px 0 6px' }}>O que foi feito nesta visita</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {atividadesOperacaoCampo(modal.rede, modal.tipo).map(atividade => {
                    const marcado = !!novoRegistroAtividades[atividade]
                    const dados = novoRegistroAtividades[atividade] || {}
                    return (
                      <div key={atividade} style={{ border:'1px solid #E0E8F0', borderRadius:8, padding:8 }}>
                        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                          <input type="checkbox" checked={marcado}
                            onChange={e => setNovoRegistroAtividades(prev => {
                              const next = { ...prev }
                              if (e.target.checked) next[atividade] = { feita: null, impedimento: false, motivo:'' }
                              else delete next[atividade]
                              return next
                            })} />
                          <span style={{ fontSize:13, color:'#1A2340', fontWeight:600 }}>{atividade}</span>
                        </label>
                        {marcado && (
                          <div style={{ marginTop:8, marginLeft:26 }}>
                            <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>A atividade foi concluída?</div>
                            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                              {[{ v:true, l:'✓ Sim' }, { v:false, l:'✗ Não' }].map(op => (
                                <span key={String(op.v)} onClick={() => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], feita: op.v } }))}
                                  style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:6, cursor:'pointer', background: dados.feita === op.v ? (op.v ? '#D1FAE5' : '#FEE2E2') : '#F1F5F9', color: dados.feita === op.v ? (op.v ? '#065F46' : '#991B1B') : '#64748B' }}>
                                  {op.l}
                                </span>
                              ))}
                            </div>
                            <div style={{ fontSize:10, color:'#64748B', marginTop:-4, marginBottom:8 }}>Deixe em branco se essa visita ainda não aconteceu — fica registrada como planejada pro Cenário, e você volta aqui pra completar depois (Editar).</div>
                            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:6 }}>
                              <input type="checkbox" checked={dados.impedimento || false}
                                onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], impedimento: e.target.checked } }))} />
                              <span style={{ fontSize:12, color:'#1A2340' }}>Teve impedimento/desvio do que estava previsto (mesmo que a atividade tenha sido concluída de outro jeito)</span>
                            </label>
                            {dados.impedimento && (
                              atividade === 'Base' ? (
                                <select value={dados.motivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], motivo: e.target.value } }))}
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                                  <option value="">Selecione o motivo...</option>
                                  {MOTIVOS_IMPEDIMENTO_BASE.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              ) : modal.rede === 'BRADESCO' ? (
                                <select value={dados.motivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], motivo: e.target.value } }))}
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                                  <option value="">Selecione o motivo...</option>
                                  {MOTIVOS_IMPEDIMENTO_BRADESCO.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              ) : modal.tipo === 'SINALIZAÇÃO ATM' ? (
                                <select value={dados.motivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], motivo: e.target.value } }))}
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', background:'#fff' }}>
                                  <option value="">Selecione o motivo...</option>
                                  {MOTIVOS_IMPEDIMENTO_SINALIZACAO.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              ) : (
                                <input value={dados.motivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], motivo: up(e.target.value) } }))}
                                  placeholder="Motivo do impedimento (lista fechada ainda não definida)"
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                              )
                            )}
                            {atividade === 'Outros' && (
                              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #E0E8F0' }}>
                                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:4 }}>O que foi feito (obrigatório)</label>
                                <input value={dados.descricao || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], descricao: up(e.target.value) } }))}
                                  placeholder="Ex: retirar modem na StockTrans pro PC 98972"
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                              </div>
                            )}
                            {atividade === 'Habilitação' && (
                              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #E0E8F0' }}>
                                <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>Dimer foi finalizado?</div>
                                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                                  {[{ v:true, l:'✓ Sim' }, { v:false, l:'✗ Não' }].map(op => (
                                    <span key={String(op.v)} onClick={() => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], dimerFinalizado: op.v } }))}
                                      style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:6, cursor:'pointer', background: dados.dimerFinalizado === op.v ? (op.v ? '#D1FAE5' : '#FEE2E2') : '#F1F5F9', color: dados.dimerFinalizado === op.v ? (op.v ? '#065F46' : '#991B1B') : '#64748B' }}>
                                      {op.l}
                                    </span>
                                  ))}
                                </div>
                                {dados.dimerFinalizado === false && (
                                  <input value={dados.dimerMotivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], dimerMotivo: up(e.target.value) } }))}
                                    placeholder="Motivo do Dimer não finalizado (lista fechada ainda não definida)"
                                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', marginBottom:10 }} />
                                )}
                                <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>Alarme 253 foi finalizado?</div>
                                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                                  {[{ v:true, l:'✓ Sim' }, { v:false, l:'✗ Não' }].map(op => (
                                    <span key={String(op.v)} onClick={() => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], alarme253Finalizado: op.v } }))}
                                      style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:6, cursor:'pointer', background: dados.alarme253Finalizado === op.v ? (op.v ? '#D1FAE5' : '#FEE2E2') : '#F1F5F9', color: dados.alarme253Finalizado === op.v ? (op.v ? '#065F46' : '#991B1B') : '#64748B' }}>
                                      {op.l}
                                    </span>
                                  ))}
                                </div>
                                {dados.alarme253Finalizado === false && (
                                  <input value={dados.alarme253Motivo || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], alarme253Motivo: up(e.target.value) } }))}
                                    placeholder="Motivo do Alarme 253 não finalizado (lista fechada ainda não definida)"
                                    style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box', marginBottom:10 }} />
                                )}
                                <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Nome de quem atendeu a equipe no CGR</label>
                                <input value={dados.cgrNome || ''} onChange={e => setNovoRegistroAtividades(prev => ({ ...prev, [atividade]: { ...prev[atividade], cgrNome: up(e.target.value) } }))}
                                  style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {(() => {
                  const marcadas = Object.entries(novoRegistroAtividades)
                  // Data obrigatória (Shirley, 2026-08-20) - sem isso a visita não sobe pro Cenário
                  // como agenda do dia certo.
                  const dataVisita = novoRegistroData || (paraIsoDataObraTexto(dataInicioObraTexto) || '')
                  // "feita" pode ficar em branco (null) - visita planejada, ainda não aconteceu. Só
                  // exige feita decidido (Sim/Não) e os campos extras de Habilitação quando ela já foi
                  // marcada como concluída ou não (Shirley, 2026-08-19 - agenda/dashboard).
                  const valida = Boolean(dataVisita) && marcadas.length > 0 && marcadas.every(([atividade, d]) => {
                    const decidida = d.feita === true || d.feita === false
                    if (d.impedimento && !(d.motivo && d.motivo.trim() !== '')) return false
                    if (atividade === 'Outros' && !(d.descricao && d.descricao.trim() !== '')) return false
                    if (atividade === 'Habilitação' && decidida) {
                      if (d.dimerFinalizado !== true && d.dimerFinalizado !== false) return false
                      if (d.dimerFinalizado === false && !(d.dimerMotivo && d.dimerMotivo.trim() !== '')) return false
                      if (d.alarme253Finalizado !== true && d.alarme253Finalizado !== false) return false
                      if (d.alarme253Finalizado === false && !(d.alarme253Motivo && d.alarme253Motivo.trim() !== '')) return false
                    }
                    return true
                  })
                  function limparFormularioVisita() {
                    setEditandoVisitaIdx(null)
                    setNovoRegistroData('')
                    setNovoRegistroHora('')
                    setNovoRegistroEquipe([])
                    setNovoRegistroTerceirizado(false)
                    setNovoRegistroTerceirizadoTexto('')
                    setNovoRegistroAtividades({})
                  }
                  return (
                    <button onClick={() => {
                      const atividades = marcadas.map(([atividade, d]) => ({
                        atividade, feita: d.feita === true || d.feita === false ? d.feita : null, impedimento: !!d.impedimento, motivo: d.impedimento ? (d.motivo || '') : '',
                        ...(atividade === 'Outros' ? { descricao: d.descricao || '' } : {}),
                        ...(atividade === 'Habilitação' ? {
                          dimerFinalizado: d.dimerFinalizado, dimerMotivo: d.dimerFinalizado === false ? (d.dimerMotivo || '') : '',
                          alarme253Finalizado: d.alarme253Finalizado, alarme253Motivo: d.alarme253Finalizado === false ? (d.alarme253Motivo || '') : '',
                          cgrNome: d.cgrNome || '',
                        } : {}),
                      }))
                      const equipe = [...novoRegistroEquipe, ...(novoRegistroTerceirizado ? [TERCEIRIZADO_PREFIXO + (novoRegistroTerceirizadoTexto.trim() || '(não informado)')] : [])]
                      const registro = { data: dataVisita || null, hora: novoRegistroHora || null, equipe, atividades }
                      if (editandoVisitaIdx !== null) {
                        setRegistrosOperacaoCampo(prev => prev.map((r, i) => i === editandoVisitaIdx ? registro : r))
                      } else {
                        setRegistrosOperacaoCampo(prev => [...prev, registro])
                      }
                      limparFormularioVisita()
                    }}
                      disabled={!valida}
                      style={{ width:'100%', marginTop:10, padding:10, background: !valida ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: !valida ? 'default' : 'pointer' }}>
                      {editandoVisitaIdx !== null ? '💾 Salvar edição' : '+ Adicionar visita'}
                    </button>
                  )
                })()}
              </div>

              {temTelaOperacaoCampo(modal.rede, modal.tipo) && (
              <>
              <div style={{ fontSize:11, color:'#64748B', marginTop:10 }}>
                Cobertura das atividades: {atividadesOperacaoCampoObrigatorias(modal.rede, modal.tipo).filter(a => atividadesCobertas.has(a)).length}/{atividadesOperacaoCampoObrigatorias(modal.rede, modal.tipo).length}
                {temVistoriaImprodutiva && ' — vistoria improdutiva registrada, liberado pra faturar mesmo sem instalação'}
                {!operacaoCampoCompleta && !temVistoriaImprodutiva && ' — precisa de todas pra liberar "Relatório ao Cliente"'}
              </div>
              <button onClick={exportarRelatorioCliente} disabled={!operacaoCampoCompleta}
                style={{ width:'100%', marginTop:10, padding:10, background: !operacaoCampoCompleta ? '#ccc' : '#0E4D73', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: !operacaoCampoCompleta ? 'default' : 'pointer' }}>
                📄 Gerar PDF do relatório ao cliente
              </button>

              {modal.relatorio_enviado_em && (
                <div style={{ fontSize:11, color:'#64748B', marginTop:8 }}>
                  Último envio pra Tecban: {new Date(modal.relatorio_enviado_em).toLocaleString('pt-BR')} por {modal.relatorio_enviado_por}
                </div>
              )}

              {EMAILS_ENVIO_RELATORIO.includes(usuario?.email) && (
                <button onClick={() => { setMostrarEnvioRelatorio(true); setErroEnvioRelatorio('') }}
                  disabled={!operacaoCampoCompleta}
                  style={{ width:'100%', marginTop:8, padding:10, background: !operacaoCampoCompleta ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: !operacaoCampoCompleta ? 'default' : 'pointer' }}>
                  📧 Enviar relatório para a Tecban
                </button>
              )}

              {mostrarEnvioRelatorio && (
                <div style={{ marginTop:10, background:'#fff', border:'1px solid #CDD8E3', borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#1A2340', marginBottom:8 }}>Revisar antes de enviar</div>
                  <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}><strong>Para:</strong> {EMAIL_RM_TECBAN}</div>
                  <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}><strong>Cc:</strong> {EMAIL_CC_OPERACAO_GRUPOPG}</div>
                  <div style={{ fontSize:12, color:'#374151', marginBottom:8 }}><strong>Assunto:</strong> {montaAssuntoRelatorioTecban()}</div>
                  <div style={{ fontSize:12, color:'#374151', marginBottom:8 }}>Anexo: PDF do relatório ao cliente{fotosRelatorio.length > 0 ? ` + ${fotosRelatorio.length} foto(s)` : ''}</div>
                  <div style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, marginBottom:4 }}>Texto do e-mail</div>
                  <div style={{ fontSize:12, color:'#374151', whiteSpace:'pre-wrap', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:8, padding:10, marginBottom:10 }}>{montaCorpoRelatorioTecban()}</div>

                  <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:4 }}>Anexar foto(s) recebida(s) no WhatsApp (opcional)</label>
                  <input type="file" accept="image/*" multiple onChange={e => handleAdicionarFotosRelatorio(e.target.files)}
                    style={{ marginBottom:8, fontSize:12 }} />
                  {fotosRelatorio.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                      {fotosRelatorio.map((f, i) => (
                        <span key={i} style={{ fontSize:11, background:'#F1F5F9', padding:'4px 8px', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}>
                          {f.filename}
                          <span onClick={() => setFotosRelatorio(prev => prev.filter((_, idx) => idx !== i))} style={{ color:'#DC2626', cursor:'pointer', fontWeight:700 }}>×</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {erroEnvioRelatorio && <div style={{ fontSize:12, color:'#DC2626', marginBottom:8 }}>{erroEnvioRelatorio}</div>}

                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => { setMostrarEnvioRelatorio(false); setErroEnvioRelatorio('') }} disabled={enviandoRelatorio}
                      style={{ flex:1, padding:10, background:'#F1F5F9', color:'#1A2340', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      Cancelar
                    </button>
                    <button onClick={enviarRelatorioTecban} disabled={enviandoRelatorio}
                      style={{ flex:1, padding:10, background: enviandoRelatorio ? '#94A3B8' : '#1A6B4A', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor: enviandoRelatorio ? 'default' : 'pointer' }}>
                      {enviandoRelatorio ? 'Enviando...' : 'Confirmar envio'}
                    </button>
                  </div>
                </div>
              )}
              </>
              )}
            </div>
            )}


            {modal.tipo === 'TRANSF UN' && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas de visita ao ponto</div>
                <datalist id="lista-colaboradores-etapas">
                  {COLABORADORES.map(nome => <option key={nome} value={nome} />)}
                </datalist>
                {ETAPAS_UN.map((etapa, i) => (
                  i === 0 ? null : (
                  <div key={etapa.campo} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>
                      {rotuloEtapaUN(i)} — {etapa.titulo}
                    </label>
                    <div style={{ fontSize:10, color:'#888', marginBottom:4 }}>{etapa.desc}</div>
                    {i === 2 ? (
                      <>
                        <input type="date" value={datas[etapa.campo]||''}
                          onChange={e => setDatas(d => ({...d, [etapa.campo]: e.target.value}))}
                          style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', marginBottom:8 }} />
                        <SeletorEquipe titulo="Quem foi na 2ª etapa (Obra Final)" selecionados={equipeEtapa3} onChangeSelecionados={setEquipeEtapa3}
                          terceirizado={terceirizadoEtapa3} onChangeTerceirizado={setTerceirizadoEtapa3}
                          terceirizadoTexto={terceirizadoEtapa3Texto} onChangeTerceirizadoTexto={setTerceirizadoEtapa3Texto} />
                      </>
                    ) : (
                    <div style={{ display:'flex', gap:8 }}>
                      <input type="date" value={datas[etapa.campo]||''}
                        onChange={e => setDatas(d => ({...d, [etapa.campo]: e.target.value}))}
                        style={{ flex:1, padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                      <input value={resps[`resp_etapa${i+1}`]||''}
                        onChange={e => setResps(r => ({...r, [`resp_etapa${i+1}`]: e.target.value}))}
                        placeholder="Responsável" list="lista-colaboradores-etapas"
                        style={{ flex:1, padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                    </div>
                    )}
                    {i === 2 && (
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
                            <input value={novoVidro} onChange={e => setNovoVidro(up(e.target.value))}
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
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                            <label style={{ fontSize:11, color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>Qtd. Biombo de fila:</label>
                            <input type="number" min="0" value={biomboFila} onChange={e => setBiomboFila(e.target.value)}
                              placeholder="0"
                              style={{ width:70, padding:'6px 10px', border:'1.5px solid #BBF7D0', borderRadius:8, fontSize:13, fontWeight:700, color:'#1A2340', textAlign:'center', boxSizing:'border-box' }} />
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <label style={{ fontSize:11, color:'#64748B', fontWeight:600, whiteSpace:'nowrap' }}>Qtd. Porta giratória:</label>
                            <input type="number" min="0" value={portaGiratoria} onChange={e => setPortaGiratoria(e.target.value)}
                              placeholder="0"
                              style={{ width:70, padding:'6px 10px', border:'1.5px solid #BBF7D0', borderRadius:8, fontSize:13, fontWeight:700, color:'#1A2340', textAlign:'center', boxSizing:'border-box' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  )
                ))}
              </div>
            )}

            {!temVisitasDeCampo(modal.rede, modal.tipo) && !temTelaOperacaoCampo(modal.rede, modal.tipo) && (
            <div style={{ background:'#F0F4F8', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#2D3A8C', fontWeight:700, marginBottom:10 }}>Datas da obra</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Início</label>
                    <input type="date" value={dataObra.inicio} disabled={!vistoriaCompleta} onChange={e => setDataObra(d => ({...d, inicio: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box', background: vistoriaCompleta ? '#fff' : '#F1F5F9', cursor: vistoriaCompleta ? 'text' : 'not-allowed' }} />
                  </div>
                  {modal.rede !== 'BANCO24HORAS' && (
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>Término</label>
                    <input type="date" value={dataObra.termino} onChange={e => setDataObra(d => ({...d, termino: e.target.value}))}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  )}
                  {modal.rede !== 'BANCO24HORAS' && (
                  <div>
                    <label style={{ fontSize:11, color:'#4A7FC1', fontWeight:600, display:'block', marginBottom:3 }}>ART pronta em</label>
                    <input type="date" value={dataArt} onChange={e => setDataArt(e.target.value)}
                      style={{ width:'100%', padding:'8px 10px', border:'1px solid #CDD8E3', borderRadius:8, fontSize:13, color:'#1A2340', boxSizing:'border-box' }} />
                  </div>
                  )}
                </div>
                <div style={{ marginBottom:10 }}>
                  <SeletorEquipe titulo="Quem foi na obra" selecionados={colabsObra} onChangeSelecionados={setColabsObra}
                    terceirizado={terceirizadoObra} onChangeTerceirizado={setTerceirizadoObra}
                    terceirizadoTexto={terceirizadoObraTexto} onChangeTerceirizadoTexto={setTerceirizadoObraTexto}
                    bloqueado={!vistoriaCompleta} mensagemBloqueio='Preencha a data da vistoria e quem foi antes de liberar esta etapa' />
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

            {EMAILS_CUSTOS_DESPESAS.includes(usuario?.email) && (
            <>
            <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#9A3412', fontWeight:700, marginBottom:10 }}>
                💰 Custos terceirizados {custosTerceirizados.length > 0 ? `— ${fmt(somaValores(custosTerceirizados))}` : ''}
              </div>
              {custosTerceirizados.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:8 }}>
                  {custosTerceirizados.map((c, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid #FED7AA', borderRadius:8, padding:'5px 10px' }}>
                      <span style={{ fontSize:12, color:'#9A3412', flex:1 }}>{c.tipo}{c.obs ? ` — ${c.obs}` : ''}</span>
                      <span style={{ fontSize:12, color:'#9A3412', fontWeight:700 }}>{fmt(c.valor)}</span>
                      <span onClick={() => setCustosTerceirizados(prev => prev.filter((_, i) => i !== idx))}
                        style={{ fontSize:13, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                <select value={novoCustoTipo} onChange={e => setNovoCustoTipo(e.target.value)}
                  style={{ padding:'7px 8px', border:'1px solid #FED7AA', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                  {TIPOS_CUSTO_TERCEIRIZADO.map(t => <option key={t}>{t}</option>)}
                </select>
                <input value={novoCustoObs} onChange={e => setNovoCustoObs(up(e.target.value))}
                  placeholder="Fornecedor / obs (opcional)"
                  style={{ flex:1, minWidth:120, padding:'7px 10px', border:'1px solid #FED7AA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                <input type="number" value={novoCustoValor} onChange={e => setNovoCustoValor(e.target.value)}
                  placeholder="Valor"
                  style={{ width:100, padding:'7px 10px', border:'1px solid #FED7AA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                <button onClick={() => {
                  if (!novoCustoValor.trim()) return
                  setCustosTerceirizados(prev => [...prev, { tipo: novoCustoTipo, valor: Number(novoCustoValor), obs: novoCustoObs.trim() }])
                  setNovoCustoValor(''); setNovoCustoObs('')
                }} style={{ padding:'7px 14px', background:'#C2410C', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  + Adicionar
                </button>
              </div>
            </div>

            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#991B1B', fontWeight:700, marginBottom:10 }}>
                🧳 Despesas de pessoal {despesasPessoal.length > 0 ? `— ${fmt(somaValores(despesasPessoal))}` : ''}
              </div>
              {despesasPessoal.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:8 }}>
                  {despesasPessoal.map((d, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid #FECACA', borderRadius:8, padding:'5px 10px' }}>
                      <span style={{ fontSize:12, color:'#991B1B', flex:1 }}>
                        {d.data ? isoToBr(d.data) + ' — ' : ''}{d.categoria}{d.km ? ` (${d.km} km)` : ''}{d.obs ? ` — ${d.obs}` : ''}
                      </span>
                      <span style={{ fontSize:12, color:'#991B1B', fontWeight:700 }}>{fmt(d.valor)}</span>
                      <span onClick={() => setDespesasPessoal(prev => prev.filter((_, i) => i !== idx))}
                        style={{ fontSize:13, color:'#EF4444', cursor:'pointer', fontWeight:700, padding:'0 4px' }}>✕</span>
                    </div>
                  ))}
                </div>
              )}
              {novaDespesaCategoria === 'Combustível' && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', marginBottom:8 }}>
                  <input value={novaDespesaOrigem} onChange={e => setNovaDespesaOrigem(up(e.target.value))}
                    placeholder="Origem (cidade/endereço)"
                    style={{ flex:1, minWidth:140, padding:'7px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  <input value={novaDespesaDestino} onChange={e => setNovaDespesaDestino(up(e.target.value))}
                    placeholder="Destino (cidade/endereço)"
                    style={{ flex:1, minWidth:140, padding:'7px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                  <button onClick={calcularKmRota} disabled={calculandoRota || !novaDespesaOrigem.trim() || !novaDespesaDestino.trim()}
                    style={{ padding:'7px 12px', background: calculandoRota ? '#FECACA' : '#B91C1C', color:'#fff', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor: calculandoRota ? 'not-allowed' : 'pointer', whiteSpace:'nowrap' }}>
                    {calculandoRota ? 'Calculando...' : '📍 Calcular km'}
                  </button>
                  {erroRota && <div style={{ fontSize:11, color:'#991B1B', width:'100%' }}>{erroRota}</div>}
                </div>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <input type="date" value={novaDespesaData} onChange={e => setNovaDespesaData(e.target.value)}
                  style={{ padding:'7px 8px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340' }} />
                <select value={novaDespesaCategoria} onChange={e => setNovaDespesaCategoria(e.target.value)}
                  style={{ padding:'7px 8px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }}>
                  {CATEGORIAS_DESPESA_PESSOAL.map(c => <option key={c}>{c}</option>)}
                </select>
                <input value={novaDespesaObs} onChange={e => setNovaDespesaObs(up(e.target.value))}
                  placeholder="Obs (opcional)"
                  style={{ flex:1, minWidth:100, padding:'7px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                {novaDespesaCategoria === 'Combustível' ? (
                  <>
                    <input type="number" value={novaDespesaKm} onChange={e => setNovaDespesaKm(e.target.value)}
                      placeholder="Km ida e volta"
                      style={{ width:110, padding:'7px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                    <span style={{ fontSize:11, color:'#991B1B', fontWeight:600, whiteSpace:'nowrap' }}>
                      ≈ {fmt((Number(novaDespesaKm) || 0) / CONSUMO_MEDIO_KM_L * PRECO_MEDIO_LITRO)}
                    </span>
                  </>
                ) : (
                  <input type="number" value={novaDespesaValor} onChange={e => setNovaDespesaValor(e.target.value)}
                    placeholder="Valor"
                    style={{ width:100, padding:'7px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', boxSizing:'border-box' }} />
                )}
                <button onClick={() => {
                  const isCombustivel = novaDespesaCategoria === 'Combustível'
                  if (isCombustivel && !novaDespesaKm.trim()) return
                  if (!isCombustivel && !novaDespesaValor.trim()) return
                  const valor = isCombustivel
                    ? Math.round((Number(novaDespesaKm) / CONSUMO_MEDIO_KM_L * PRECO_MEDIO_LITRO) * 100) / 100
                    : Number(novaDespesaValor)
                  setDespesasPessoal(prev => [...prev, { data: novaDespesaData || null, categoria: novaDespesaCategoria, valor, km: isCombustivel ? Number(novaDespesaKm) : null, obs: novaDespesaObs.trim() }])
                  setNovaDespesaData(''); setNovaDespesaValor(''); setNovaDespesaObs(''); setNovaDespesaKm('')
                  setNovaDespesaOrigem(''); setNovaDespesaDestino(''); setErroRota('')
                }} style={{ padding:'7px 14px', background:'#B91C1C', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  + Adicionar
                </button>
              </div>
              <div style={{ fontSize:10, color:'#B45309', marginTop:6 }}>
                Combustível é estimado com consumo médio de {CONSUMO_MEDIO_KM_L} km/L e preço médio de {fmt(PRECO_MEDIO_LITRO)}/L
              </div>
            </div>
            </>
            )}

            {TIPOS_ENTREGAVEIS.includes(modal.tipo) && (() => {
              const listaObrigatorios = entregaveisObrigatorios(modal.tipo)
              return (
              <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:12, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#065F46', fontWeight:700, marginBottom:10 }}>
                  📋 Entregáveis do Book ({entregaveis.length}/{listaObrigatorios.length - entregaveisNA.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {listaObrigatorios.map(item => {
                    const na = entregaveisNA.includes(item)
                    const feito = entregaveis.includes(item)
                    return (
                      <div key={item} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <label style={{ display:'flex', alignItems:'center', gap:8, cursor: na ? 'not-allowed' : 'pointer', flex:1, minWidth:0, opacity: na ? 0.5 : 1 }}>
                          <input type="checkbox" checked={feito} disabled={na}
                            onChange={e => setEntregaveis(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item))} />
                          <span style={{ fontSize:13, color: feito ? '#065F46' : '#1A2340', fontWeight: feito ? 600 : 400, textDecoration: na ? 'line-through' : 'none' }}>
                            {item}
                          </span>
                        </label>
                        <span onClick={() => {
                          setEntregaveisNA(prev => na ? prev.filter(i => i !== item) : [...prev, item])
                          if (!na) setEntregaveis(prev => prev.filter(i => i !== item))
                        }}
                          style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, cursor:'pointer', flexShrink:0, background: na ? '#E0E7FF' : '#F1F5F9', color: na ? '#3730A3' : '#64748B' }}>
                          {na ? '↺ Aplica' : 'Não se aplica'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              )
            })()}

            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, marginBottom:8 }}>Etapa da régua:</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6, marginBottom:8 }}>
              {getEtapas(modal.rede, modal.tipo).map((op, i) => {
                const ativo = novoStatus === op
                const bloqueado = (op === 'RM ENVIADA' && !editDados.os_tecban.trim())
                  || (op === 'RELATÓRIO AO CLIENTE' && temTelaOperacaoCampo(modal.rede, modal.tipo) && !operacaoCampoCompleta)
                return (
                  <div key={op} onClick={() => { if (!bloqueado) setNovoStatus(op) }}
                    title={bloqueado ? (op === 'RELATÓRIO AO CLIENTE' ? 'Preencha o status (OK/Impedimento) das atividades no dia da obra para liberar esta etapa' : 'Preencha o campo "OS Tecban" em Dados da obra para liberar esta etapa') : undefined}
                    style={{ padding:'8px 9px', borderRadius:10, border: ativo ? '2px solid #1A6B4A' : '1px solid #E0E8F0', cursor: bloqueado ? 'not-allowed' : 'pointer', background: bloqueado ? '#F8FAFC' : ativo ? '#D1FAE5' : '#fff', opacity: bloqueado ? 0.55 : 1, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:10, background: ativo ? '#1A6B4A' : '#E6F1FB', color: ativo ? '#fff' : '#2D3A8C', fontWeight:700, borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{bloqueado ? '🔒' : i+1}</span>
                    <span style={{ fontSize:11, color:'#1A2340', fontWeight: ativo ? 600 : 400, lineHeight:1.2 }}>{op}</span>
                    {ativo && <span style={{ marginLeft:'auto', fontSize:12, flexShrink:0 }}>●</span>}
                  </div>
                )
              })}
            </div>
            {getEtapas(modal.rede, modal.tipo).includes('RM ENVIADA') && !editDados.os_tecban.trim() && (
              <div style={{ fontSize:11, color:'#92400E', background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'6px 10px', marginBottom:8 }}>
                🔒 "RM Enviada" fica bloqueada até preencher a <b>OS Tecban</b> em Dados da obra.
              </div>
            )}
            {temTelaOperacaoCampo(modal.rede, modal.tipo) && !operacaoCampoCompleta && (
              <div style={{ fontSize:11, color:'#92400E', background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'6px 10px', marginBottom:8 }}>
                🔒 "Relatório ao Cliente" fica bloqueada até preencher OK/Impedimento das atividades no dia da obra.
              </div>
            )}
            <div style={{ fontSize:12, color:'#4A7FC1', fontWeight:600, margin:'12px 0 6px' }}>Observação:</div>
            <textarea value={novaObs} onChange={e=>setNovaObs(up(e.target.value))} rows={3}
              placeholder="Pendências, próximos passos..."
              style={{ width:'100%', padding:'10px', border:'1px solid #CDD8E3', borderRadius:10, fontSize:13, resize:'none', marginBottom:12, boxSizing:'border-box', color:'#1A2340' }} />

            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:14, marginBottom:12 }}>
              <div style={{ fontSize:12, color:'#991B1B', fontWeight:700, marginBottom:10 }}>📌 Post-its na régua</div>
              {lembretes.length > 0 && (
                <div style={{ marginBottom:10, display:'flex', flexDirection:'column', gap:6 }}>
                  {lembretes.map((l, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #FECACA', borderRadius:8, padding:'8px 10px' }}>
                      <span style={{ fontSize:10, background:'#EF4444', color:'#fff', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>{l.etapa}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, color:'#1A2340' }}>{l.texto}</div>
                        {l.autor && <div style={{ fontSize:10, color:'#991B1B', marginTop:2 }}>por {l.autor}</div>}
                      </div>
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
                  {getEtapas(modal.rede, modal.tipo).map((_, i) => (
                    <option key={i} value={i+1}>{i+1}</option>
                  ))}
                </select>
                <input value={novoLembreteTexto} onChange={e => setNovoLembreteTexto(up(e.target.value))}
                  placeholder="Ex: Emitir ART — Carol"
                  style={{ flex:1, padding:'8px 10px', border:'1px solid #FECACA', borderRadius:8, fontSize:12, color:'#1A2340', background:'#fff' }} />
                <button onClick={() => {
                  if (!novoLembreteEtapa || !novoLembreteTexto.trim()) return
                  setLembretes(prev => [...prev, { etapa: Number(novoLembreteEtapa), texto: novoLembreteTexto.trim(), autor: usuario.email }])
                  setNovoLembreteEtapa('')
                  setNovoLembreteTexto('')
                }} style={{ padding:'8px 12px', background:'#EF4444', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                  + Add
                </button>
              </div>
            </div>
            <button onClick={salvarStatus} disabled={!novoStatus || salvando || !responsavelEscritorio.trim() || (novoStatus === 'RM ENVIADA' && !editDados.os_tecban.trim())}
              style={{ width:'100%', padding:13, background: (!novoStatus||salvando||!responsavelEscritorio.trim()||(novoStatus === 'RM ENVIADA' && !editDados.os_tecban.trim())) ? '#ccc' : '#1A6B4A', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor: (!novoStatus||salvando) ? 'default' : 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            {!responsavelEscritorio.trim() && (
              <div style={{ fontSize:11, color:'#92400E', background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'6px 10px', marginTop:8 }}>
                🔒 Preencha o "Responsável do escritório" pra liberar o salvamento.
              </div>
            )}
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
