Fila de discussões que pararam **sem martelo** quando a conversa ficou grande demais. Cada entrada é o retrato de onde a discussão parou: o que estava na mesa, as posições, o que falta decidir. **Nada aqui é decisão.** A entrada nasce de duas formas: automática, quando o hook avisa o nível de checkpoint automático, ou a pedido do usuário depois do aviso do primeiro nível (níveis em `.claude/hooks/user-prompt-submit.js`; o porquê em [[Guia-de-Tokens]]). Ela **sai daqui** quando a discussão é retomada e martelada (a decisão vai pra página do projeto) ou quando o usuário descarta. É uma fila, não um arquivo: o histórico fica no git. Ao retomar um projeto, esta página é buscada pelo assunto junto com a leitura do item e da página ([[CLAUDE]], "Ao retomar um projeto"). Checkpoint gravado aqui converte o selo ⏸ em ✅. Contexto: [[OS]].

**Formato da entrada (checkpoint enxuto):** uma edição só, acrescentando no fim da fila, e commit só deste arquivo, sem reler páginas de projeto. Registrar é caro com contexto grande: cada chamada reenvia a conversa inteira.

```
### DD/MM: Assunto (página relacionada: [[X]], se houver)
- **Na mesa:** a pergunta ou escolha em aberto.
- **Posições:** do usuário e minha, com o porquê em uma linha cada.
- **Falta decidir:** o que precisa de martelo.
```

**Teto:** acima de 10 entradas, o hook `SessionStart` avisa. Discussão esquecida aqui é dívida: retomar, martelar ou descartar.

## Fila

