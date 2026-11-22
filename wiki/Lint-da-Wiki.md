Critério e procedimento pra auditar páginas de `wiki/` que viraram log cronológico em vez de estado consolidado, e as listas de pendência que incharam. Complementa a regra "Forma da página wiki" do [[CLAUDE]]. Contexto: [[OS]], `docs/arquitetura.md` (operação **lint**). O lint do contrato é outra coisa: [[Manutencao-do-Contrato]].

## Estado atual

Fiscalização mecânica pelo hook `SessionStart`: avisa (1) página de wiki que virou log sem bloco "Estado atual", (2) item de lista acima de 700 bytes ou lista acima de 20 KB, (3) mais de 10 checkpoints parados. **Regra que fecha o elo**: aviso do hook é repassado ao usuário na mesma sessão, mesmo com outro assunto. Aviso que ninguém repassa é aviso que não existe.

## A distinção que fundamenta tudo

**Lint do contrato encolhe. Lint de wiki reordena.** Página de wiki só entra em contexto quando a conversa vai até ela; o ganho não é encolher, é o **topo responder "o que vale hoje"**. Consequência, a regra mais importante desta página: **no lint de wiki nada é apagado.** Só se acrescenta um bloco de estado no topo e, quando necessário, se move seção de lugar.

## Critério (o que conta como dívida)

Candidata quando **as três** valem: (1) ≥ 8 seções datadas (`##`/`###` com `DD/MM` ou ano); (2) > 20 KB; (3) **sem `## Estado atual` nas primeiras 40 linhas**. **A condição 3 é a que manda**: página consolidada continua grande e datada pra sempre, e usar só as métricas daria falso positivo eterno, treinando o usuário a ignorar o aviso. O marcador `## Estado atual` é exatamente a string que o hook procura: mudar o formato cega a fiscalização.

**Fora do escopo**: `To-do.md`, `To-do-Operacional.md`, `Concluídos.md`, `CLAUDE.md`, e qualquer coisa fora de `wiki/`.

## Correção, uma página por vez (da menor pra maior)

1. Ler a página inteira (consolidar sem ler produz estado inventado).
2. Escrever `## Estado atual (DD/MM/AAAA)` logo abaixo da abertura, até ~40 linhas: **o que vale hoje**, **o que falta** (com link pro item em [[To-do-Operacional]]), **onde mexer**.
3. Histórico datado fica abaixo, em ordem, sem alteração de texto.
4. `git diff` antes de fechar: deleção líquida de conteúdo datado é erro — reverter e refazer.
5. Um commit por página; mostrar ao usuário depois da primeira.

**Recaída a vigiar**: sessão nova entra *abaixo* do bloco de estado, e o que muda o estado atualiza o bloco — nunca vira seção acima dele.

## Listas de pendência

Item é ponteiro (estado em uma frase, próximo passo, bloqueio, link). Ao receber o aviso de item gordo: reescrever como ponteiro; se ele carrega detalhe que a página linkada não tem, **migrar primeiro**, nunca cortar sem conferir. Item sem ação pendente vai pra [[Concluídos]]. O carimbo "Atualizado" é pra marcar reescrita, não licença pra anexar parágrafo: é assim que uma lista incha.

## Corte de 10 mil caracteres do hook

O Claude Code corta saída de hook acima de 10.000 caracteres e entrega só o começo, calado. Por isso o hook injeta só o **mapa** das listas (títulos), e "o que tenho pra fazer" sempre lê `wiki/To-do.md` do disco. Se o mapa passar de 9.500 caracteres, o próprio hook corta e põe o aviso no começo.

## Travas

Nunca apagar seção datada. Nunca reescrever texto de decisão registrada. Nunca inventar estado (na dúvida, vira pergunta explícita). Nunca criar ou dividir página sem martelo do usuário. Nunca tocar nas listas, em Concluídos ou no contrato por este procedimento.
