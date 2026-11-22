Como os links da wiki viram ferramenta de pensamento, e não só convenção de texto. O grafo é texto nos `.md`, lido por busca e por script: não depende de nenhum app de notas. Contexto: [[OS]].

## Estado atual

**Quatro peças:**

1. **Páginas de pessoas como base pra resolver nomes.** Quando o usuário fala um nome solto ("o João"), procuro nas páginas de pessoas e em [[Perfil]] antes de supor. Dois homônimos → pergunto "qual João?", nunca chuto o primeiro achado.
2. **Ligar na hora de escrever.** Pessoa, projeto ou conceito com página própria vira `[[link]]` no texto que eu estou escrevendo. Regra no [[CLAUDE]] ("Wikilink, não backtick").
3. **Jardinagem.** Quando o usuário pedir ("faz uma jardinagem"), rodo `python -I scripts/grafo/sugerir_links.py [N]`, leio as páginas candidatas e trago uma lista curta de conexões propostas, com o porquê. **Proposta, não edição**: aplico só o que o usuário aprova. Os sins e nãos ficam em "Calibração" abaixo e viram o critério do que é uma boa conexão.
4. **Investigação dirigida.** O usuário pode pedir "investiga relações entre X, Y e Z": o script entra só como mapa; o trabalho é ler as páginas do recorte e trazer as relações com o porquê.

**Onde mexer**: `scripts/grafo/sugerir_links.py` (Adamic-Adar: duas páginas que apontam pros mesmos vizinhos, mas não uma pra outra; vizinho raro pesa mais). Listas e logs ficam de fora porque ligam tudo a tudo.

**Achado de método**: o algoritmo sozinho devolve quase só pares óbvios. O valor vem de ler as páginas que ele aponta: o script mostra onde olhar, quem acha a relação é a leitura. Com poucas páginas, a jardinagem rende pouco; vale a partir de umas 20–30 páginas com links.

## Calibração

| Data | Proposta | Veredito |
|---|---|---|
