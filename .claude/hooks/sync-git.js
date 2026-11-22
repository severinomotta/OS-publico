/**
 * Hook SessionStart — sincronia do vault com o GitHub
 * (wiki/Captura-pelo-Celular.md).
 *
 * Com a captura pelo celular ligada, cada sessão na nuvem trabalha num clone
 * do repositório e grava num branch `claude/...` (a nuvem pode não ter
 * permissão de gravar no branch principal). Quem junta tudo é este script,
 * ao abrir sessão:
 *
 *   No PC: busca o GitHub, traz o branch principal de lá, incorpora todo
 *   branch `claude/*`, manda o principal de volta e apaga os branches já
 *   incorporados. Conflito: desfaz o merge daquele branch e avisa — nunca
 *   resolve sozinho, nunca perde nada (o branch continua no GitHub).
 *
 *   Na nuvem (CLAUDE_CODE_REMOTE=true): incorpora os `claude/*` no branch
 *   atual, pra uma captura nova enxergar as anteriores que o PC ainda não
 *   juntou. Não mexe no principal.
 *
 * Sem celular, ele só mantém PC e GitHub iguais.
 *
 * Branch principal: o que o GitHub diz que é (origin/HEAD); sem essa
 * informação, "main" ou "master", o que existir.
 *
 * Mesma regra do session-start.js: NUNCA lançar exceção. Sem rede, sem
 * git ou com erro, avisa em uma linha e segue — a sessão abre do mesmo
 * jeito.
 */

const { execFileSync } = require('child_process');

const raiz = process.env.CLAUDE_PROJECT_DIR || '.';
const naNuvem = process.env.CLAUDE_CODE_REMOTE === 'true';
const avisos = [];
// Merges de verdade nesta rodada. Branch que já estava contido não conta:
// sem isso, o aviso repetiria os mesmos branches toda sessão.
let novos = 0;

function git(args) {
  return execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 }).trim();
}
function tenta(args) {
  try { git(args); return true; } catch (e) { return false; }
}

function incorporarBranchesDaNuvem() {
  const remotos = git(['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/claude/'])
    .split('\n').filter(Boolean);
  const juntados = [];
  novos = 0;
  for (const ref of remotos) {
    // Já contido no HEAD (merge de outra vez): só falta apagar no GitHub.
    if (tenta(['merge-base', '--is-ancestor', ref, 'HEAD'])) { juntados.push(ref); continue; }
    if (tenta(['merge', '--no-edit', '-m', 'Incorpora captura da nuvem (' + ref + ')', ref])) {
      juntados.push(ref);
      novos++;
    } else {
      tenta(['merge', '--abort']);
      avisos.push('CONFLITO ao incorporar ' + ref + ' — merge desfeito, branch intacto no GitHub. ' +
        'Resolver nesta sessão: git merge ' + ref + ', juntar à mão, commit, push.');
    }
  }
  return juntados;
}

function branchPrincipal() {
  try { return git(['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(/^origin\//, ''); } catch (e) { /* sem origin/HEAD */ }
  for (const b of ['main', 'master']) if (tenta(['rev-parse', '--verify', '-q', 'refs/remotes/origin/' + b])) return b;
  return 'main';
}

try {
  git(['fetch', '--prune', '-q', 'origin']);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const P = branchPrincipal();

  if (naNuvem) {
    const juntados = incorporarBranchesDaNuvem();
    if (novos) avisos.push('Nuvem: ' + novos + ' captura(s) anterior(es) ainda não juntadas no principal foram incorporadas neste branch.');
  } else if (branch !== P) {
    avisos.push('Sincronia com o GitHub pulada: o PC está no branch "' + branch + '", não no principal (' + P + ').');
  } else {
    if (!tenta(['merge', '--ff-only', '-q', 'origin/' + P]) &&
        !tenta(['merge', '--no-edit', '-q', 'origin/' + P])) {
      tenta(['merge', '--abort']);
      avisos.push('CONFLITO ao trazer o ' + P + ' do GitHub — merge desfeito. Resolver nesta sessão antes de qualquer commit.');
    }
    const juntados = incorporarBranchesDaNuvem();
    const aFrente = Number(git(['rev-list', '--count', 'origin/' + P + '..' + P]) || 0);
    if (aFrente > 0 && !tenta(['push', '-q', 'origin', P])) {
      avisos.push('Push do ' + P + ' pro GitHub falhou (' + aFrente + ' commit(s) só no PC) — a nuvem vai ler uma wiki velha até isso passar.');
    } else {
      for (const ref of juntados) tenta(['push', '-q', 'origin', '--delete', ref.replace(/^origin\//, '')]);
    }
    if (juntados.length) avisos.push('Capturas da nuvem incorporadas no ' + P + ': ' + juntados.join(', ') +
      '. Conferir o que entrou (git log) antes de responder sobre o que o usuario ditou.');
  }
} catch (e) {
  avisos.push('Sincronia com o GitHub não rodou (' + String(e.message || e).split('\n')[0].slice(0, 120) + ').');
}

if (avisos.length) process.stdout.write('Aviso automatico (hook SessionStart, sync-git): ' + avisos.join(' | ') + '\n');
