---
name: storybook-stories
description: Cria ou atualiza o arquivo *.stories.tsx (Storybook) de componentes de UI em apps/www. Use SEMPRE que criar, alterar, renomear ou remover um componente React/estilo de UI (features/*/ui, shared, app/globals.css), mesmo que o usuário não mencione Storybook ou stories — toda mudança visual precisa de uma story correspondente.
---

# Stories para componentes de UI (`apps/www`)

Todo componente de UI precisa ter uma story: o Storybook é a vitrine visual do projeto, e uma story desatualizada (ou ausente) esconde regressões visuais. Mantenha o mínimo de código — poucas stories, cada uma mostrando um estado relevante.

## Quando agir

- **Componente novo** → criar `<Componente>.stories.tsx` ao lado dele.
- **Componente alterado** (props, estados, visual) → atualizar as stories existentes e adicionar uma para cada estado novo.
- **Componente removido/renomeado** → remover/renomear a story.
- **Tokens ou classes globais** (`app/globals.css`) → atualizar `apps/www/stories/DesignSystem.stories.tsx`.
- Hooks, `api.ts`, `types.ts` e páginas de `app/` não precisam de story.

## Como escrever

- Local: `features/<feature>/ui/<Componente>.stories.tsx` ou `shared/ui/...`; o `main.ts` já encontra `{features,shared,stories}/**/*.stories.@(ts|tsx)`.
- Imports de tipos do `@storybook/nextjs-vite`; utilitários de teste de `storybook/test` (`fn`, `expect`, `userEvent`, `within`).
- Use `satisfies Meta<typeof Componente>` e `StoryObj<typeof meta>`. `title` no padrão `<Feature>/<Componente>` (ex.: `Auth/LogoutModal`); no `shared`, `Shared/<Componente>`.
- Callbacks como `args: { onCancel: fn() }`. Estado controlado → story com `render` e `useState`.
- Estados a cobrir (só os que o componente realmente tem): padrão, erro, carregando, desabilitado, vazio, aberto/fechado.
- Componentes que usam contexto (ex.: `useAuth`) → `decorators` com o provider real (veja `LoginForm.stories.tsx`). `next/link` e `next/navigation` já funcionam no framework `nextjs-vite`.
- Fluxos de interação (validação, erros) → `play` com `userEvent` + `expect`. Não faça chamadas reais à API: prefira estados que não dependam dela.
- Estilos vêm de `app/globals.css` (importado em `.storybook/preview.ts`): use as classes e variáveis `--*` existentes, sem CSS novo só para a story.

## Verificar

Rode no host e confirme que termina sem erro:

```bash
npx tsc --noEmit -p apps/www && npm run build-storybook -w www
```

Se tiver como, abra `npm run storybook:ui` e confira visualmente as stories tocadas. Cite no resumo final quais stories foram criadas/atualizadas.
