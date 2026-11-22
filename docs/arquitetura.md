# Arquitetura

Por que o sistema é do jeito que é. Cada princípio abaixo nasceu de um
problema real de uso, não de teoria: o problema vem junto, porque é ele
que diz quando a regra ainda vale e quando pode ser mudada. Nada aqui é
dogma ("Nenhuma decisão é imutável", no `CLAUDE.md`).

## A ideia central: não depender de conversas

O jeito comum de usar um assistente de IA é conversar. Cada conversa
começa do zero ou carrega um histórico que cresce sem controle; o que se
decidiu fica espalhado em dezenas de conversas que ninguém relê.

**Problema que isso causa**: conhecimento que existiu e se perdeu. Um
projeto que evolui ao longo de 20 conversas fica fragmentado: cada
pedaço está numa conversa, e é impossível juntar os pedaços pra avançar.
E a conversa longa fica cara: cada mensagem nova reenvia o histórico
inteiro.

**A solução**: um vault (pasta de arquivos de texto, versionada em git)
operado pelo Claude Code. A conversa vira só a porta de entrada: o que
importa sai dela e vai pra uma página. Com o registro feito, a conversa
pode ser apagada (`/clear`) sem perder nada. Sessões curtas sobre um
registro que fica, em vez de conversas longas que somem.

É por isso que o sistema vive no **Claude Code (CLI)** e não no chat do
app ou do site: o chat não lê o vault, não roda os hooks e não faz
commit, e mostra uma lista de conversas que convida a voltar nelas. No
CLI, a memória é o vault desde a primeira mensagem.

## Linha de vida

Tudo flui como uma linha contínua: captura → pensamento/plano →
execução → dado → novo pensamento. Não existe fronteira fixa entre essas
fases: uma nota solta vira plano, o plano gera dado ao ser executado, e
o dado vira matéria-prima da próxima captura.

Exemplo: "organizar oficina de circo" nasce como intenção solta. Só ao
ser processada ela ganha estrutura (falar com o professor, ver
autorização do bombeiro). A forma final não precede a captura, emerge
dela.

## Sem categoria fixa

**Problema**: a tendência natural de quem desenha um sistema (inclusive
do Claude) é impor categorias com template — "isso é tarefa", "isso é
ideia", "isso é projeto". A vida real não chega em categorias, e exigir
isso na hora de anotar cria atrito exatamente quando a captura precisa
ser rápida.

**Regra**: a estrutura certa é reconhecida no processamento, não
prevista na escrita. Nenhuma porta de captura exige formato, categoria
ou template. Se o Claude se pegar desenhando template fixo, é recaída no
erro original, e o usuário deve apontar sem suavizar.

Consequência: nenhuma página nasce vazia "esperando uso". A casa nasce
quando o conteúdo real chega, com a forma que aquele conteúdo pedir.
Link `[[assim]]` pra página que ainda não existe é casa reservada, não
erro.

## Três operações: ingest, query, lint

Inspirado na ideia de Andrej Karpathy de uma wiki pessoal operada por
LLM como memória de longo prazo:

- **Ingest**: o que chega (fala, arquivo, resultado de trabalho) é
  processado e promovido pra `wiki/`, a página que guarda o estado
  daquilo.
- **Query**: responder e trabalhar a partir do que já está na wiki.
- **Lint**: auditar a wiki (link morto, página órfã, duplicata,
  conteúdo envelhecido, página que virou diário).

`wiki/` é o conhecimento consolidado. Material bruto que vale guardar
como fonte (uma transcrição, uma extração) pode ganhar pasta própria
quando aparecer; a captura do dia a dia não precisa de caixa de
entrada, porque o padrão é "anota e já organiza".

## Memória de produção

**Problema**: um sistema construído, um estudo, um evento realizado: no
fim funciona, mas o "como foi resolvido" fica espalhado em commit,
lista de tarefas, comentário de código e conversa. Meses depois ninguém
responde "por que fizemos assim?". E o usuário precisar pedir "registra
isso" é sintoma do furo, não funcionamento normal.

**Regra, em duas metades obrigatórias**:

1. **Consolidar**: toda produção tem uma página com o estado atual
   daquilo: o que é, como foi desenhado, que problemas apareceram e
   como foram resolvidos (inclusive caminho descartado, quando o motivo
   do descarte é conhecimento). Atualizar a página é parte de terminar
   o trabalho, como o commit.
2. **Reaproveitar**: guardar sem consultar não fecha o ciclo. Ao pegar
   problema novo, o Claude busca na wiki o análogo já resolvido e traz
   sem ser perguntado ("isso parece com o que fizemos em X, só mudando
   Z"). Quem lembra é o sistema, não o usuário.

Pra sistema com código: o cabeçalho do código documenta a peça; a
página wiki documenta o sistema (problema, mapa, decisões); o git é o
log de quando cada coisa mudou.

## Página é estado, não diário

**Problema**: página que cresce sessão a sessão vira log cronológico. Pra
saber "o que vale hoje" é preciso ler a história inteira, e quem retoma
o projeto (inclusive o Claude numa sessão nova) responde com informação
velha.

**Regra**: página que cresce começa por `## Estado atual` (o que vale
hoje, o que falta, onde mexer); o histórico datado vem depois. O hook
avisa quando uma página grande virou log sem esse bloco. No lint de
wiki nada se apaga: só se escreve o estado no topo.

## Mapa e território

**Problema**: lista de tarefas com a história inteira de cada projeto
dentro de cada item. A lista incha, fica ilegível, e numa sessão nova o
estado se perde no meio do histórico.

**Regra**: cada camada tem altitude própria. O item da lista é
**ponteiro** (estado em uma frase, próximo passo, link); a página wiki
é o território completo. O mapa (títulos das listas) entra em toda
sessão, automaticamente; o território (página cheia) só entra quando a
conversa vai até ele.

**Critério de custo**: o sistema ótimo entrega 100% do resultado com o
número preciso de tokens. Gastar de menos (responder sem ler o estado)
erra e custa mais caro que ler; gastar de mais (carregar tudo por
precaução) anula o desenho. Pouco token é sintoma de sistema saudável,
não meta.

## Garantia mecânica, e fiscalização da garantia

**Problema**: regra que depende de disciplina ("lembre de ler as
listas", "não deixe a lista inchar") falha em silêncio. E a garantia
mecânica também falha calada: o Claude Code corta texto de hook acima
de 10 mil caracteres e entrega só o começo, então uma "leitura
garantida" pode ser leitura de um pedaço.

**Regra**: trabalho determinístico vira código; modelo só onde precisa
de julgamento. Os hooks garantem a leitura do mapa, medem o contexto e
fiscalizam tetos (contrato, listas, páginas). E a própria entrega é
fiscalizada: se o mapa passar do corte, o hook avisa no começo, dentro
do trecho que sempre chega. Aviso de hook nunca fica em silêncio: o
Claude repassa ao usuário na mesma sessão.

## Escrita imediata

**Problema**: o usuário confirma um avanço ("rodei o setup"), a sessão
termina sem registrar, e a sessão seguinte apresenta como pendente o que
já foi feito. Pior que o retrabalho é a desconfiança: o relato do
sistema não bate com o que o usuário sabe. E estado velho entregue pelo
hook convence mais que estado velho lembrado de memória.

**Regra**: confirmação que muda estado é gravada na mesma resposta em
que chega. Sessão não tem garantia de encerramento ordenado (morre,
compacta, simplesmente para), então "registro no fim" não é registro.

## Discussão × consolidação, e o selo

**Problema**: registrar no meio do debate grava opinião provisória como
decisão, e o registro vira arqueologia da discussão em vez de decisão
limpa. No outro extremo, apagar a conversa com discussão em aberto perde
o que só existia nela.

**Regra**: enquanto há escolha em aberto, nada é tocado no vault; com o
martelo do usuário, tudo é consolidado de uma vez. Toda resposta termina
com o selo: `✅ Clear liberado` (pode apagar a conversa sem perder nada)
ou `⏸ Discussão aberta` (ainda há coisa só na conversa). Quando o
contexto cresce demais, o hook propõe ou faz um checkpoint (retrato de
onde a discussão parou, sem decisão) pra que a conversa possa ser
apagada mesmo sem martelo.

## Contrato enxuto

**Problema**: o `CLAUDE.md` é lido inteiro em toda mensagem. Toda
correção tende a anexar uma regra; nenhuma sessão poda. Sem teto, o
contrato cresce sem parar e o custo vai junto.

**Regra**: no contrato fica só a regra operante; o porquê mora aqui ou
na wiki. Teto de ~15 KB, fiscalizado pelo hook. Método de corte em
`wiki/Manutencao-do-Contrato.md`.

## Ferramenta nova: o que ela abre

**Problema**: avaliar ferramenta nova só pela dor de hoje faz quase tudo
sair "descartado", e o sistema para de crescer. Muita coisa só mostra o
valor depois de testada.

**Regra**: primeiro checar se é verdade (fonte externa, não o número do
autor do post); depois responder pelo que a ferramenta possibilita e
pelo custo de testar. Descarte é sempre "por ora".

## Como o sistema evolui

O desenho não termina na instalação. Ele muda a partir de casos reais de
uso: o usuário traz um caso concreto (um tropeço, uma captura que deu
errado, um pedido que precisou ser repetido), e o Claude extrai dele um
princípio, confirmando ou contradizendo os de cima. Nenhuma mudança de
arquitetura nasce de especulação sobre uso futuro.

Casos novos entram abaixo, com data, no mesmo formato: problema →
princípio.

## Casos deste sistema
