Como o consumo do plano funciona e como gerenciar, pra o limite não acabar antes da hora. Contexto: [[OS]], [[Protocolo-Chrome]].

## Estado atual

Plano: ⟪preencher na instalação⟫. Níveis do medidor: aviso em 120 mil tokens de contexto, checkpoint automático em 200 mil (`.claude/hooks/user-prompt-submit.js`). Uso extra (crédito pago além do plano): ⟪ligado/desligado, decisão do usuário⟫. O log de cada disparo fica em `.claude/hooks/estado/contexto-log.jsonl` (fora do git), pra calibrar.

## O que é token

Token é o pedaço de texto que o modelo lê e escreve: mais ou menos ¾ de uma palavra em português. "Organiza minha semana" são uns 6 tokens. O plano não conta mensagens, conta tokens processados (mais o peso do modelo escolhido), dentro de duas janelas: uma de algumas horas e uma semanal.

## A coisa mais importante: toda mensagem reenvia a conversa inteira

O modelo não tem memória entre uma mensagem e outra. A cada mensagem, o Claude Code manda **tudo de novo**: o contrato, o mapa das listas, cada mensagem anterior, cada arquivo lido, cada resultado de comando, cada imagem. Isso é o **contexto**.

- Conversa com 10 mil tokens de contexto: cada mensagem nova custa ~10 mil.
- A mesma conversa com 100 mil: cada "ok, segue" custa ~100 mil.

Por isso conversa longa é cara, e o `/clear` (zera a conversa) é a principal ferramenta de economia. O vault é o que torna o `/clear` seguro: o que importa já foi gravado na wiki, e a sessão nova lê de lá. É a grande vantagem do sistema: **não depender de conversas**, só sessões curtas sobre um registro que fica.

**Cache**: o trecho repetido do início (contrato, mensagens antigas) sai bem mais barato quando reenviado logo em seguida, porque fica guardado alguns minutos. Ajuda, mas não zera.

## Os níveis do medidor, e quando mudar

O hook mostra o tamanho do contexto em toda mensagem e age em dois níveis:

- **Aviso (120 mil)**: o Claude avisa que a conversa cresceu e propõe gravar onde a discussão parou + `/clear`.
- **Checkpoint automático (200 mil)**: o Claude grava sozinho onde a discussão parou em [[Checkpoints]], pra conversa poder ser apagada sem perder nada.

Os dois números pressupõem um modelo com janela de contexto maior que 200 mil tokens. Perto do limite da janela, o Claude Code resume a conversa sozinho (*auto-compact*) e perde detalhe; o checkpoint tem que disparar antes disso. **Janela menor ou limite apertado: baixar os dois** (ex.: 60% e 80% da janela), nas constantes `NIVEL_AVISO` e `NIVEL_AUTO` do hook. `/context` mostra o tamanho da janela do modelo em uso.

## Os instrumentos

| Comando (no Claude Code) | O que mostra |
|---|---|
| (automático) | O hook diz em toda mensagem o tamanho do contexto atual |
| `/context` | De onde vem o contexto: contrato, mensagens, arquivos, ferramentas |
| `/usage` | Quanto do limite do plano já foi usado |
| `/clear` | Zera a conversa (o vault fica) |
| `/compact` | Resume a conversa (perde detalhe; prefira gravar na wiki + `/clear`) |
| `/model` | Troca o modelo (os maiores gastam o limite mais rápido) |
| `/effort` | Quanto o modelo pensa antes de responder |

## Hábitos que economizam

1. **Uma sessão por assunto.** Terminou o assunto, selo ✅, `/clear`.
2. **Selo ⏸ e contexto alto?** Peça "registra onde paramos" (vai pra [[Checkpoints]]) e dê `/clear`.
3. **API antes de Chrome.** Uma tarefa via robô ([[Robo-Google]]) custa uma fração do mesmo trabalho clicando pelo Chrome, porque o robô trabalha fora do contexto e devolve só o resultado.
4. **Arquivo grande se lê por trecho.** PDF longo: extrair texto e buscar, nunca colar inteiro.
5. **Modelo e esforço sob medida.** Tarefa simples (anotar, mover item) não precisa do modelo maior nem de esforço alto.

## Chrome: a exceção cara

Screenshot fica no contexto e é reenviado em toda mensagem seguinte. Regra: **um passo por mensagem, com a conta de quanto custou** ([[Protocolo-Chrome]]).
