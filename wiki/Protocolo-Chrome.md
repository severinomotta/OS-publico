Como operar o Chrome (`mcp__claude-in-chrome__*`) sem queimar o limite do plano. Contexto: [[OS]], [[Guia-de-Tokens]].

## Por que o Chrome é caro

Cada screenshot é uma imagem que entra no contexto (~1.500 tokens) e **fica lá**: toda mensagem seguinte reenvia todas as imagens anteriores. Vinte passos de Chrome numa conversa podem custar mais que um dia inteiro de uso normal, e o custo cresce calado até a sessão ficar inviável. Por isso: **API primeiro, sempre** ([[Robo-Google]]); Chrome só quando não existe rota programática (um painel sem API, um site sem integração).

## Regras operantes — ler antes da primeira ação no Chrome

O [[CLAUDE]] guarda só o portão (autorização prévia do usuário). Estas regras contêm o custo depois que a porta abriu.

1. **Plano antes de bloco pesado**: decompor em subtarefas e propor a divisão em sessões (simples = 1; complexa = 2–3), com o usuário aprovando e dando `/clear` entre elas. Tarefa pontual e curta dispensa plano.
2. **Medir a cada passo**: um passo por mensagem. O hook informa o tamanho do contexto em toda mensagem; no fim de cada resposta, digo **quanto aquele passo custou** (diferença pro anterior) e quanto a sessão já soma. Passou de ~40 mil tokens só de Chrome na sessão: paro, mostro a conta e pergunto se segue.
3. **`browser_batch` como padrão**: sequência de ações conhecidas numa chamada só; ação isolada só quando o passo seguinte depende do resultado.
4. **Texto antes de imagem**: `get_page_text`/`read_page` sempre que resolvem; screenshot só pra incerteza genuinamente visual.
5. **Teto de 3 tentativas por objetivo** (1 tentativa = 1 ciclo de ação-e-checagem): bateu 3 sem resolver, paro, explico o que tentei e onde travou, e pergunto se o usuário assume manual ou se tento outro caminho.
6. **Aviso de inchaço**: a cada ~8 screenshots na sessão, aviso e proponho consolidar na wiki + `/clear`.
7. **Fechar a aba ao terminar** (`tabs_close_mcp`): nunca deixar aba pro usuário fechar.

Houve `/clear` no meio da tarefa? Reler esta seção antes de continuar.
