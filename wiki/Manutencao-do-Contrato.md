Registro das manutenções do `CLAUDE.md` — o contrato de comportamento. Cada entrada guarda o que mudou, por quê e como reverter. Existe porque o contrato é carregado inteiro em toda mensagem de toda sessão: é o único arquivo do vault cujo tamanho tem custo contínuo, e por isso o único que precisa de manutenção ativa em vez de só crescer. Contexto: [[OS]], `docs/arquitetura.md`. **Não confundir com [[Lint-da-Wiki]]**: aqui o lint ENCOLHE (byte pago em toda mensagem); lá ele REORDENA sem apagar nada.

## Estado atual

⟪preencher na instalação: data de nascimento, tamanho do contrato⟫. Teto e aviso em `.claude/hooks/session-start.js` (constante `TETO_CLAUDE_MD`). Entrada nova vai no histórico abaixo, em ordem cronológica.

## O método

**Por que tem teto**: sem teto, toda correção anexa uma regra e nenhuma sessão poda. Contratos assim dobram de tamanho em poucas semanas. O teto de ~15 KB e o aviso do hook existem pra isso não acontecer.

**Os cortes, nesta ordem**:
1. **A regra fica, o caso de origem sai** pra página wiki do assunto ou pra `docs/arquitetura.md`. É o corte que mais rende.
2. **Compressão de prosa**: mesma regra com menos palavras (~10% por passe).
3. **Ponteiro por gatilho**: regra que dispara num *pedido* do usuário (ex.: "manda um e-mail") pode virar ponteiro pra uma página, porque há pausa natural pra ler antes de agir. Regra que dispara num *impulso* do Claude (vontade de abrir o Chrome, de editar no meio da discussão) fica inline, sempre: não há momento de consulta. Desempate: erro visível → ponteiro; erro silencioso → inline.
4. **Aposentar regra que nunca disparou**: releitura leiga do usuário pega trava contra cenário hipotético. Regra com reincidência real fica, por maior que seja.

**No corte**: justificativa e exemplo saem; gatilho, escopo, exceção e reforço anti-reincidência nunca saem.

**Auditoria de modelo novo**: a cada modelo novo do Claude, vale pedir uma releitura do contrato procurando frase escrita pra modelo antigo (excesso de ênfase, instrução que o modelo novo já segue sozinho). Mudar o contrato passa pelo martelo normal.

## Como reverter

Todo o contrato está no git. `git log -- CLAUDE.md` mostra cada mudança; `git checkout <commit> -- CLAUDE.md` volta a uma versão anterior. Antes de mudança grande, criar uma tag (`git tag contrato-pre-<assunto>-AAAA-MM-DD`).

## Histórico

