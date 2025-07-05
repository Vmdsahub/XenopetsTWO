# Guia do Editor de Mundos

Este guia explica como usar a nova funcionalidade de edição de mundos no painel administrativo.

## Como Ativar o Modo de Edição

1. **Faça login como administrador**
   - Apenas usuários com permissão de administrador podem acessar esta funcionalidade

2. **Acesse o Painel Admin**
   - Navegue até a tela do painel administrativo
   - Clique na aba "Editar Mundos"

3. **Ative o Modo de Edição**
   - Clique no botão "Ativar Modo Edição"
   - Você será automaticamente direcionado para o mapa espacial
   - O cursor mudará para indicar o modo de edição

## Funcionalidades do Editor

### Reposicionamento de Mundos

- **Seleção**: Clique em qualquer mundo para selecioná-lo
- **Arrastar**: Mantenha pressionado e arraste para mover o mundo
- **Salvar**: As posições são salvas automaticamente no banco de dados

### Redimensionamento

- Use a barra deslizante "Tamanho" no painel lateral direito
- Varia de 20 a 200 pixels de raio
- O raio de interação é ajustado automaticamente

### Rotação

- Use a barra deslizante "Rotação" no painel lateral direito
- Varia de 0° a 360°
- Rotaciona a imagem do mundo visualmente

### Feedback Visual

- **Mundo Selecionado**: Destacado com borda amarela sólida
- **Mundos Não Selecionados**: Borda branca tracejada
- **Cursor**: Muda para "grab" no modo de edição

## Persistência dos Dados

### Banco de Dados

- As alterações são salvas na tabela `world_positions`
- Campos armazenados: `x`, `y`, `size`, `rotation`
- Atualizações são feitas em tempo real

### Segurança

- Apenas administradores podem modificar posições
- Row Level Security (RLS) implementado
- Logs de auditoria automáticos

## Interface de Controle

### Painel Lateral (Modo Edição Ativo)

- **Tamanho**: Controle deslizante para raio do mundo
- **Rotação**: Controle deslizante para rotação em graus
- **Posição**: Exibição das coordenadas X,Y atuais
- **Nome e ID**: Identificação do mundo selecionado

### Instruções na Tela

- Canto inferior esquerdo mostra controles ativos
- **Modo Normal**: Mouse para mover nave, Click para atirar/planeta
- **Modo Edição**: Click para selecionar, Arrastar para mover

## Estrutura Técnica

### Componentes Criados

- `WorldEditor.tsx`: Interface de edição lateral
- Modificações em `SpaceMap.tsx`: Suporte a modo de edição
- Modificações em `AdminPanel.tsx`: Nova aba de mundos

### Serviços

- `gameService.getWorldPositions()`: Carrega posições do banco
- `gameService.updateWorldPosition()`: Salva alterações

### Estado Global

- `isWorldEditMode`: Booleano para controlar modo de edição
- `setWorldEditMode()`: Função para alternar modo

### Banco de Dados

```sql
-- Tabela world_positions
CREATE TABLE world_positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  size REAL NOT NULL,
  rotation REAL NOT NULL,
  color TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Migração de Dados

As posições iniciais dos mundos foram migradas baseadas na configuração original do código:

- 6 mundos dispostos em círculo ao redor do centro
- Raio de 250 unidades do centro (7500, 7500)
- Tamanho padrão de 60 pixels
- Rotação inicial de 0°

## Limitações e Considerações

1. **Performance**: Atualizações são throttled para evitar spam no banco
2. **Concorrência**: Apenas um admin pode editar por vez efetivamente
3. **Validação**: Tamanho limitado entre 20-200 pixels
4. **Coordenadas**: Não há limite de posição, mas considera wrapping do mundo

## Solução de Problemas

### Mundo não se move

- Verifique se o modo de edição está ativo
- Confirme que você tem permissões de administrador
- Tente recarregar a página

### Alterações não são salvas

- Verifique conexão com o banco de dados
- Confirme que a migração foi aplicada
- Veja o console do navegador para erros

### Interface não aparece

- Confirme que está logado como admin
- Verifique se a aba "Editar Mundos" está visível
- Recarregue a aplicação se necessário
