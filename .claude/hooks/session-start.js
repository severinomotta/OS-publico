/**
 * Hook SessionStart do OS.
 *
 * Faz três coisas, nesta ordem:
 *   1. Injeta o MAPA de wiki/To-do.md e wiki/To-do-Operacional.md (área +
 *      título de cada item) — garantia mecânica de que o Claude sabe o que
 *      está pendente (caso de 13/07/2026, docs/arquitetura.md). Até 21/10
 *      injetava as listas inteiras, o que estourava o corte de 10.000
 *      caracteres do Claude Code (ver seção 4).
 *   2. Avisa se o CLAUDE.md passou do teto de ~15 KB — ele é carregado inteiro
 *      em toda mensagem de toda sessão, é o único arquivo cujo tamanho tem
 *      custo contínuo (wiki/Manutencao-do-Contrato.md).
 *   3. Avisa se alguma página de wiki/ virou log cronológico sem bloco de
 *      estado no topo (wiki/Lint-da-Wiki.md).
 *   4. Avisa se as duas listas de pendência passaram do teto de ponteiro
 *      fino — por item e pela lista inteira (05/09/2026, wiki/Lint-da-Wiki.md,
 *      seção "Lint das listas de pendência").
 *
 * Estava inline dentro de .claude/settings.json até 24/08/2026; virou arquivo
 * quando o item 3 entrou — o one-liner com aspas escapadas já estava no limite
 * e mais um regex ali dentro era pedir bug de quoting.
 *
 * NUNCA deixar este script lançar exceção: settings.json chama com
 * `|| true`, então uma falha aqui apaga silenciosamente a injeção das listas,
 * que é a parte que o contrato depende. Tudo que pode falhar vai em try/catch
 * e degrada pra "não avisa nada", nunca pra "não injeta nada".
 */

const fs = require('fs');
const path = require('path');

const raiz = process.env.CLAUDE_PROJECT_DIR || '.';

// ---------- 1. As duas listas (obrigatório — se isto falhar, não há hook) ----------
const todo = fs.readFileSync(path.join(raiz, 'wiki', 'To-do.md'), 'utf8');
const todoOp = fs.readFileSync(path.join(raiz, 'wiki', 'To-do-Operacional.md'), 'utf8');

let extra = '';

// ---------- 2. Teto de tamanho do CLAUDE.md ----------
const TETO_CLAUDE_MD = 15360; // ~15 KB, o teto de referência escrito no próprio CLAUDE.md
try {
  const tamanho = fs.statSync(path.join(raiz, 'CLAUDE.md')).size;
  if (tamanho > TETO_CLAUDE_MD) {
    extra += '\n\n---\n\nAviso automatico (hook SessionStart): CLAUDE.md esta em ' + tamanho +
      ' bytes, acima do teto de referencia de ~15KB (secao "Lint do contrato", no proprio CLAUDE.md). ' +
      'Considere rodar lint nesta sessao antes de anexar novas regras — metodologia e historico em ' +
      'wiki/Manutencao-do-Contrato.md.';
  }
} catch (e) { /* sem CLAUDE.md legível: não avisa, não quebra */ }

// ---------- 2b. Teto das listas de pendência (05/09/2026) ----------
// A lista operacional foi de 6,6 KB a 46 KB em 7 semanas sem que ninguém
// avisasse — mesma curva do CLAUDE.md antes do lint. Item = bloco que começa
// com "- " e vai até a próxima linha em branco; subtítulos "###" não contam.
const TETO_ITEM_LISTA = 700;   // bytes por item — ponteiro fino cabe folgado
const TETO_LISTA = 20480;      // ~20 KB por lista inteira
try {
  const avisos = [];
  for (const [nome, texto] of [['wiki/To-do.md', todo], ['wiki/To-do-Operacional.md', todoOp]]) {
    const bytes = Buffer.byteLength(texto, 'utf8');
    if (bytes > TETO_LISTA) avisos.push(nome + ' inteira esta em ' + bytes + ' bytes (teto ~20 KB)');
    const gordos = texto.split(/\r?\n[ \t]*\r?\n/)
      .map((b) => b.trim())
      .filter((b) => b.startsWith('- '))
      .map((b) => ({ bytes: Buffer.byteLength(b, 'utf8'), titulo: b.slice(2, 62).replace(/\*/g, '') }))
      .filter((i) => i.bytes > TETO_ITEM_LISTA);
    for (const g of gordos) avisos.push(nome + ': item de ' + g.bytes + ' B — "' + g.titulo + '..."');
  }
  if (avisos.length > 0) {
    extra += '\n\n---\n\nAviso automatico (hook SessionStart): lista(s) de pendencia acima do teto de ponteiro fino (' +
      TETO_ITEM_LISTA + ' B por item, ~20 KB por lista):\n- ' + avisos.join('\n- ') +
      '\nReescrever o item como ponteiro (estado, proximo passo, bloqueio, link); se ele carrega detalhe que a ' +
      'pagina linkada nao tem, migrar primeiro. Criterio em wiki/Lint-da-Wiki.md, secao "Lint das listas de pendencia".';
  }
} catch (e) { /* nunca quebra a injeção das listas */ }

// ---------- 2c. Teto da fila de checkpoints (17/09/2026) ----------
// A página NÃO é injetada (custo fixo por chamada) — só o aviso de fila
// cheia. Entrada = seção "### " dentro de "## Fila". wiki/Checkpoints.md.
const TETO_CHECKPOINTS = 10;
try {
  const texto = fs.readFileSync(path.join(raiz, 'wiki', 'Checkpoints.md'), 'utf8');
  const fila = (texto.split(/^## Fila\s*$/m)[1] || '').split(/^## /m)[0];
  const entradas = (fila.match(/^### /gm) || []).length;
  if (entradas > TETO_CHECKPOINTS) {
    extra += '\n\n---\n\nAviso automatico (hook SessionStart): wiki/Checkpoints.md tem ' + entradas +
      ' discussoes paradas sem martelo (teto ' + TETO_CHECKPOINTS + '). Cada uma e divida: retomar, ' +
      'martelar ou descartar. Mencionar ao usuario.';
  }
} catch (e) { /* sem página: não avisa */ }

// ---------- 3. Lint de wiki: página que virou log sem bloco de estado ----------
// Critério e procedimento completos em wiki/Lint-da-Wiki.md. O sinal que importa
// é a AUSÊNCIA do marcador "## Estado atual" no topo — nunca a contagem de
// seções datadas sozinha: uma página já consolidada continua grande e cheia de
// datas pra sempre, então usar só as métricas numéricas geraria falso positivo
// permanente e treinaria a pessoa a ignorar o aviso (erro real cometido em
// 24/08/2026, registrado na própria página).
const TAMANHO_MINIMO = 20000;   // abaixo disso o custo não justifica mexer
const MINIMO_DATADAS = 8;       // menos que isso não é log, é conteúdo denso
const LINHAS_DE_TOPO = 40;      // onde o bloco de estado tem que estar
const SECAO_DATADA = /^#{2,3} .*(\d{2}\/\d{2}|20\d{2})/;
const MARCADOR_ESTADO = /^## Estado atual/;
// Altitude e regras próprias, definidas no cabeçalho de cada uma — não são páginas de projeto.
const FORA_DO_ESCOPO = new Set(['To-do.md', 'To-do-Operacional.md', 'Concluídos.md']);

try {
  const dirWiki = path.join(raiz, 'wiki');
  const sujas = [];

  for (const arquivo of fs.readdirSync(dirWiki)) {
    if (!arquivo.endsWith('.md') || FORA_DO_ESCOPO.has(arquivo)) continue;

    const caminho = path.join(dirWiki, arquivo);
    if (fs.statSync(caminho).size <= TAMANHO_MINIMO) continue;

    const linhas = fs.readFileSync(caminho, 'utf8').split(/\r?\n/);
    if (linhas.filter((l) => SECAO_DATADA.test(l)).length < MINIMO_DATADAS) continue;
    if (linhas.slice(0, LINHAS_DE_TOPO).some((l) => MARCADOR_ESTADO.test(l))) continue;

    sujas.push(arquivo);
  }

  if (sujas.length > 0) {
    extra += '\n\n---\n\nAviso automatico (hook SessionStart): ' + sujas.length +
      ' pagina(s) de wiki/ viraram log cronologico sem bloco "## Estado atual" no topo — ' +
      sujas.join(', ') + '. Quem retoma o projeto tem que garimpar a cronologia pra saber ' +
      'o que vale hoje (regra "Forma da pagina wiki", CLAUDE.md). Criterio, procedimento e ' +
      'travas em wiki/Lint-da-Wiki.md. Nao e urgente: so nao anexe sessao nova a uma dessas ' +
      'paginas sem consolidar o topo antes.';
  }
} catch (e) { /* wiki/ ilegível: não avisa, não quebra */ }

// ---------- 4. Mapa das listas, não as listas (21/10/2026) ----------
// O Claude Code corta todo additionalContext acima de 10.000 caracteres:
// salva num arquivo e entrega só os primeiros 2.000, sem mandar ler o resto.
// Injetar as listas inteiras (~25 mil) fazia cada sessão ver só o começo do
// To-do e responder "o que tenho pra fazer" com lista incompleta. Agora vai
// só o mapa (área + título de cada item), pra reconhecer o assunto quando
// o usuário fala de passagem; a lista inteira se lê do disco quando pergunta.
// Caso em wiki/Lint-da-Wiki.md.
const TETO_HOOK = 9500; // margem abaixo do corte de 10.000 do Claude Code
const TITULO_MAX = 110;

function mapa(texto) {
  const pendente = (texto.split(/^## Pendente\s*$/m)[1] || '').split(/^## /m)[0];
  const linhas = [];
  let total = 0;
  for (const bloco of pendente.split(/\r?\n[ \t]*\r?\n/).map((b) => b.trim())) {
    const area = bloco.match(/^### (.+)/);
    if (area) { linhas.push('[' + area[1].trim() + ']'); continue; }
    if (!bloco.startsWith('- ')) continue;
    const negrito = bloco.match(/^- \*\*(.+?)\*\*/);
    let titulo = (negrito ? negrito[1] : bloco.slice(2)).replace(/\s+/g, ' ').trim();
    if (titulo.length > TITULO_MAX) titulo = titulo.slice(0, TITULO_MAX) + '…';
    linhas.push('- ' + titulo);
    total++;
  }
  return { texto: linhas.join('\n'), total };
}

const mTodo = mapa(todo);
const mOp = mapa(todoOp);

const aberturaFixa =
  'MAPA das listas de pendencia (hook SessionStart) — SO os titulos, NAO o conteudo. ' +
  'Pra responder "o que tenho pra fazer", LER wiki/To-do.md INTEIRO do disco e trazer todos os ' +
  mTodo.total + ' itens. Pra retomar um projeto, ler o item e a pagina linkada. ' +
  'O mapa serve pra reconhecer o assunto quando o usuario fala de passagem.\n\n';

let corpo =
  '# wiki/To-do.md (tarefas do usuario) — ' + mTodo.total + ' itens\n\n' + mTodo.texto + '\n\n' +
  '# wiki/To-do-Operacional.md (pendencias operacionais; fora do "o que tenho pra fazer") — ' +
  mOp.total + ' itens\n\n' + mOp.texto + extra;

let saida = aberturaFixa + corpo;
if (saida.length > TETO_HOOK) {
  // Nunca deixar o corte do Claude Code agir calado: o aviso vai no começo,
  // dentro dos 2.000 caracteres que sempre chegam.
  const aviso = 'ATENCAO: o mapa passou de ' + TETO_HOOK + ' caracteres e foi cortado — ' +
    'ler wiki/To-do.md e wiki/To-do-Operacional.md do disco antes de usar o mapa. ' +
    'Revisar TETO_HOOK/TITULO_MAX em .claude/hooks/session-start.js.\n\n';
  saida = (aviso + aberturaFixa + corpo).slice(0, TETO_HOOK) + '\n[...cortado]';
}

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: saida
  }
}));
