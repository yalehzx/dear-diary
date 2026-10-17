# dear diary

Este repositório contém um site em HTML/CSS/JavaScript para um diário romântico dedicado à Isabella.

## Estrutura

- `diary/index.html` — estrutura do site e módulos
- `diary/css/` — estilos do login, intro, galeria, músicas e diário
- `diary/js/` — lógica de autenticação, introdução, galeria, música e livro
- `diary/data/` — textos, fotos e conteúdo do diário em arquivos separados
- `diary/assets/` — imagens e capas em SVG de placeholders

## Como abrir

Abra em um servidor local simples, por exemplo:

```bash
cd diary
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Senha

A senha é: `cheidefogonapiroca`

### Gerando um novo hash

```bash
python3 - <<'PY'
import hashlib
senha = 'nova-senha-aqui'
print(hashlib.sha256(senha.strip().lower().encode('utf-8')).hexdigest())
PY
```

Cole o resultado em `diary/data/config.js` no campo `passwordHash`.

## Observação

Na experiência, a comparação usa `crypto.subtle.digest()` quando o contexto é seguro. Se a página abrir em ambiente inseguro, o código faz fallback documentado em `diary/js/auth.js` para não quebrar a experiência.

