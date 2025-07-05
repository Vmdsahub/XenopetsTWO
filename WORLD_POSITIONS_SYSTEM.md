# Sistema de Posições de Mundo - Xenopets

## Visão Geral

O sistema de posições de mundo permite que administradores modifiquem o posicionamento, rotação e tamanho dos mundos/planetas no mapa espacial. As alterações são salvas no banco de dados e sincronizadas em tempo real para todos os jogadores conectados.

## Arquitetura

### 1. Banco de Dados (Supabase)

**Tabela: `world_positions`**

```sql
CREATE TABLE world_positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  size REAL NOT NULL DEFAULT 60,
  rotation REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#4ecdc4',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Políticas RLS:**

- Leitura: Permitida para todos os usuários
- Modificação: Apenas para administradores (`is_admin = true`)

### 2. Tipos TypeScript

**Interface WorldPosition** (`src/types/game.ts`)

```typescript
export interface WorldPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Serviços

**GameService** (`src/services/gameService.ts`)

- `getWorldPositions()`: Carrega todas as posições do banco
- `updateWorldPosition()`: Atualiza uma posição específica
- `subscribeToWorldPositions()`: Subscription em tempo real

### 4. Store (Zustand)

**GameStore** (`src/store/gameStore.ts`)

- `worldPositions: WorldPosition[]`: Estado das posições
- `loadWorldPositions()`: Carrega do banco via service
- `subscribeToWorldPositions()`: Configura subscription em tempo real
- `unsubscribeFromWorldPositions()`: Remove subscription

### 5. Componentes

**SpaceMap** (`src/components/Game/SpaceMap.tsx`)

- Renderiza o mapa com as posições atuais
- Modo de edição para administradores
- Reage automaticamente a mudanças nas posições

**AdminPanel** (`src/components/Admin/AdminPanel.tsx`)

- Nova aba "Mundos" para visualizar todas as posições
- Estatísticas e informações dos mundos configurados

## Fluxo de Funcionamento

### 1. Carregamento Inicial

1. Usuário acessa o jogo
2. `gameStore.loadWorldPositions()` é chamado
3. `gameService.getWorldPositions()` busca dados do Supabase
4. `SpaceMap` renderiza os mundos com as posições carregadas

### 2. Edição por Administrador

1. Admin ativa "Modo de Edição" no SpaceMap
2. Admin seleciona um mundo e faz alterações (posição, tamanho, rotação)
3. `gameService.updateWorldPosition()` salva no banco
4. Subscription em tempo real detecta a mudança

### 3. Sincronização em Tempo Real

1. Mudança no banco dispara evento via Supabase Realtime
2. `gameService.subscribeToWorldPositions()` recebe o evento
3. `gameStore.loadWorldPositions()` recarrega dados atualizados
4. `SpaceMap` atualiza automaticamente via `useEffect([worldPositions])`

## Recursos Implementados

✅ **Persistência**: Todas as alterações são salvas no banco de dados
✅ **Tempo Real**: Mudanças são sincronizadas automaticamente para todos os jogadores
✅ **Controle de Acesso**: Apenas administradores podem editar
✅ **Interface Admin**: Painel administrativo para visualizar configurações
✅ **Validação**: Limites de tamanho e normalização de rotação
✅ **Fallback**: Sistema usa posições padrão se o banco estiver vazio
✅ **Error Handling**: Tratamento de erros com fallback para estado anterior

## Como Usar

### Para Administradores:

1. **Editar no Mapa:**
   - Acesse o SpaceMap
   - Clique no botão "Modo de Edição" (apenas visível para admins)
   - Selecione um mundo clicando nele
   - Arraste para reposicionar
   - Use os controles laterais para ajustar tamanho e rotação
   - As mudanças são salvas automaticamente

2. **Visualizar no Admin Panel:**
   - Acesse o Admin Panel
   - Clique na aba "Mundos"
   - Veja estatísticas e detalhes de todos os mundos

### Para Jogadores:

- As mudanças aparecem automaticamente no mapa
- Não é necessário recarregar a página
- A experiência é transparente

## Considerações Técnicas

### Performance

- Subscription em tempo real é otimizada para detectar apenas mudanças relevantes
- Throttling é aplicado em alterações rápidas (drag, resize)
- Imagens dos planetas são pré-carregadas e cached

### Segurança

- RLS no Supabase garante que apenas admins podem modificar
- Validação no cliente e servidor
- Logs de erro para debugging

### Escalabilidade

- Sistema funciona para qualquer número de mundos
- Subscription única para todos os mundos (não individual)
- Estado local otimizado para atualizações frequentes

## Arquivos Modificados

- `src/services/gameService.ts` - Subscription para world positions
- `src/store/gameStore.ts` - Estado e funções de world positions
- `src/components/Game/SpaceMap.tsx` - Uso do store em vez de carregamento direto
- `src/components/Admin/AdminPanel.tsx` - Nova aba para world positions
- `src/types/database.ts` - Tipos da tabela world_positions

## Melhorias Futuras Possíveis

- [ ] Histórico de mudanças com audit log
- [ ] Backup/restore de configurações
- [ ] Templates de configuração
- [ ] Validação visual de colisões entre mundos
- [ ] Bulk operations (mover todos os mundos)
- [ ] Permissões granulares (diferentes níveis de admin)
