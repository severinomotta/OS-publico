"""Sugere conexoes entre paginas da wiki que ainda nao se ligam.

Metodo: Adamic-Adar (predicao de links). Duas paginas que apontam pros
mesmos vizinhos, mas nao uma pra outra, sao candidatas a relacao. Vizinho
raro pesa mais que vizinho que liga tudo (1/log do grau).

Uso: python -I scripts/grafo/sugerir_links.py [N]
"""
import math, re, sys
from itertools import combinations
from pathlib import Path

WIKI = Path(__file__).resolve().parents[2] / "wiki"
# Listas e logs ligam tudo a tudo: nao dizem relacao de conteudo.
IGNORAR = {"To-do", "To-do-Operacional", "Concluídos", "Checkpoints",
           "Manutencao-do-Contrato", "Lint-da-Wiki", "Aberto"}
LINK = re.compile(r"\[\[([^\]|#]+)")

paginas = {p.stem: p for p in WIKI.glob("*.md")}
chave = {nome.lower(): nome for nome in paginas}
viz = {nome: set() for nome in paginas if nome not in IGNORAR}

for nome in viz:
    for alvo in LINK.findall(paginas[nome].read_text(encoding="utf-8")):
        alvo = chave.get(alvo.strip().lower())
        if alvo and alvo != nome and alvo in viz:
            viz[nome].add(alvo)
            viz[alvo].add(nome)

notas = []
for a, b in combinations(sorted(viz), 2):
    if b in viz[a]:
        continue
    comuns = viz[a] & viz[b]
    if len(comuns) < 2:
        continue
    score = sum(1 / math.log(len(viz[c])) for c in comuns if len(viz[c]) > 1)
    notas.append((score, a, b, sorted(comuns)))

n = int(sys.argv[1]) if len(sys.argv) > 1 else 15
for score, a, b, comuns in sorted(notas, reverse=True)[:n]:
    print(f"{score:.2f}  {a} <-> {b}  | em comum: {', '.join(comuns)}")
