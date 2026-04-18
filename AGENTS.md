# NarraBook - Diretrizes do Projeto

Este arquivo contém as instruções permanentes e padrões de design para o desenvolvimento do NarraBook.

## 🎨 Design e UI/UX
- **Estética**: Design editorial de luxo, minimalista e polido.
- **Animações**: Use `motion` (Framer Motion) para todas as transições de tela e interações de botões.
- **Temas**: O app suporta Modo Dia e Noite.
  - Use variáveis CSS (`--background`, `--foreground`, etc.) em vez de cores fixas.
  - A classe `.light` no `document.documentElement` controla o tema claro.
  - Evite `bg-white` ou `bg-black` puros; use `bg-background` ou `bg-foreground/opacity`.
- **Ícones**: Use exclusivamente a biblioteca `lucide-react`.

## 🎙️ Voz e Narração (TTS)
- **Filtro de Vozes**: O app deve exibir apenas vozes nos idiomas: `pt-BR`, `en-US`, `en-GB` e `en-IE`.
- **Variedade**: Tente manter um equilíbrio de 3 vozes masculinas e 3 femininas por idioma, quando disponíveis no sistema.
- **Controle**: O usuário deve ter controle sobre velocidade (`rate`) e volume.

## 🛠️ Stack Técnica
- **Framework**: React com Vite e TypeScript.
- **Estilização**: Tailwind CSS (utilizando o padrão de variáveis adaptativas).
- **Persistência**: Use `localStorage` para salvar a biblioteca do usuário, o progresso de leitura e as configurações de tema.
- **Parsing**: O app suporta arquivos `.txt`, `.epub` e `.pdf`.

## 📜 Regras de Código
- **Componentes**: Prefira componentes funcionais com Hooks.
- **Utilitários**: Use a função `cn()` (de `src/lib/utils.ts`) para gerenciar classes condicionais do Tailwind.
- **Responsividade**: O app deve ser totalmente funcional em tablets e dispositivos móveis (Mobile-First).
- **Acessibilidade**: Garanta contrastes adequados em ambos os temas e use `Tooltip` para ações de ícones.
