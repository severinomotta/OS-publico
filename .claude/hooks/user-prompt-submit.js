/**
 * Hook UserPromptSubmit — medidor de contexto e lembrete do selo.
 *
 * Roda a cada mensagem do usuário, antes da resposta. Lê o transcript da
 * sessão, pega o tamanho do contexto da última resposta (input + cache lido +
 * cache criado) e:
 *   - em TODA mensagem: informa o tamanho atual do contexto (é o que permite
 *     medir o custo de cada passo no Chrome e aprender a ler o gasto);
 *   - ao cruzar NIVEL_AVISO: avisar e propor checkpoint + /clear (uma vez);
 *   - ao cruzar NIVEL_AUTO: checkpoint automático em wiki/Checkpoints.md.
 * Por que tokens e não número de mensagens: wiki/Guia-de-Tokens.md.
 *
 * NÍVEIS: 120 mil / 200 mil pressupõem um modelo com janela de contexto
 * maior que 200 mil tokens. O checkpoint precisa disparar ANTES de o Claude
 * Code resumir a conversa sozinho (auto-compact, perto do fim da janela).
 * Janela menor ou plano apertado: baixar os dois (ex.: 60% e 80% da
 * janela; /context mostra a janela do modelo em uso). Calibrar com o uso
 * real: o log de cada disparo fica em .claude/hooks/estado/ (fora do git).
 *
 * NUNCA lançar exceção nem bloquear a mensagem: qualquer falha degrada pra
 * "só o lembrete do selo".
 */

const fs = require('fs');
const path = require('path');

const NIVEL_AVISO = 120000;
const NIVEL_AUTO = 200000;

const raiz = process.env.CLAUDE_PROJECT_DIR || '.';
const dirEstado = path.join(raiz, '.claude', 'hooks', 'estado');

function tamanhoDoContexto(transcript) {
  const linhas = fs.readFileSync(transcript, 'utf8').split('\n');
  for (let i = linhas.length - 1; i >= 0; i--) {
    if (!linhas[i].includes('"usage"')) continue;
    let e;
    try { e = JSON.parse(linhas[i]); } catch (err) { continue; }
    if (e.isSidechain || e.type !== 'assistant' || !e.message || !e.message.usage) continue;
    const u = e.message.usage;
    return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
  }
  return 0;
}

// Lembrete do selo de clear (CLAUDE.md "Discussão × consolidação"): vai em
// TODA mensagem, com ou sem aviso de contexto.
const SELO = 'Lembrete (hook UserPromptSubmit): termine a resposta com o selo de clear, ' +
  'uma linha so: "✅ Clear liberado" (tudo gravado e commitado, nenhuma pergunta sua na mesa) ' +
  'ou "⏸ Discussão aberta: <assunto>". Commit pendente: faca antes do selo.';

function medidor(ctx) {
  if (!ctx) return '';
  return 'Contexto desta sessao antes desta mensagem: ~' + Math.round(ctx / 1000) + ' mil tokens ' +
    '(cada mensagem reenvia tudo isso; em tarefa de Chrome, informar a diferenca pro passo anterior). ';
}

function injeta(texto) {
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: texto }
  }));
  process.exit(0);
}

try {
  const entrada = JSON.parse(fs.readFileSync(0, 'utf8'));
  const sessao = entrada.session_id;
  if (!sessao || !entrada.transcript_path) injeta(SELO);

  const ctx = tamanhoDoContexto(entrada.transcript_path);
  if (ctx < NIVEL_AVISO) injeta(medidor(ctx) + SELO);

  fs.mkdirSync(dirEstado, { recursive: true });
  const arqEstado = path.join(dirEstado, 'sessoes.json');
  let estado = {};
  try { estado = JSON.parse(fs.readFileSync(arqEstado, 'utf8')); } catch (err) { /* primeiro uso */ }
  const jaAvisado = estado[sessao] || {};

  let nivel = null;
  if (ctx >= NIVEL_AUTO && !jaAvisado.auto) nivel = 'auto';
  else if (ctx < NIVEL_AUTO && !jaAvisado.aviso && !jaAvisado.auto) nivel = 'aviso';
  if (!nivel) injeta(medidor(ctx) + SELO);

  estado[sessao] = Object.assign(jaAvisado, { [nivel]: new Date().toISOString() });
  fs.writeFileSync(arqEstado, JSON.stringify(estado, null, 1));
  fs.appendFileSync(path.join(dirEstado, 'contexto-log.jsonl'),
    JSON.stringify({ quando: new Date().toISOString(), sessao, nivel, ctx }) + '\n');

  const mil = Math.round(ctx / 1000);
  const texto = nivel === 'aviso'
    ? 'Aviso automatico (hook UserPromptSubmit): contexto desta sessao em ~' + mil + ' mil tokens, ' +
      'passou do nivel de aviso (' + NIVEL_AVISO / 1000 + ' mil). Responda a mensagem normalmente e, no fim, ' +
      'avise o usuario que o contexto cresceu e que um /clear economiza o limite do plano. O veredito e o ' +
      'proprio selo de clear: se for "⏸ Discussão aberta", ofereca gravar em Checkpoints. Registro so com ' +
      'pedido dele. Nao repete nesta sessao. Regras em wiki/Checkpoints.md.'
    : 'Aviso automatico (hook UserPromptSubmit): contexto desta sessao em ~' + mil + ' mil tokens, ' +
      'passou do nivel de checkpoint automatico (' + NIVEL_AUTO / 1000 + ' mil). Responda a mensagem normalmente ' +
      'e, NA MESMA resposta, faca o checkpoint enxuto em wiki/Checkpoints.md seguindo o cabecalho da pagina ' +
      '(uma edicao, commit so desse arquivo, sem martelo). Se nao ha nada em aberto que ja nao esteja ' +
      'consolidado, nao registre, so diga isso. Gravado o checkpoint, o selo vira "✅ Clear liberado" e ' +
      'recomende o /clear. Nao repete nesta sessao.';

  injeta(texto + ' ' + SELO);
} catch (e) { injeta(SELO); /* nunca quebra a mensagem */ }
