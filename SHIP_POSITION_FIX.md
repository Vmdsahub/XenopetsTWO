# Correção: Persistência da Posição da Nave

## Problema Identificado

A posição da nave do jogador não estava sendo salva quando o usuário trocava de menus. Isso acontecia porque:

1. O estado da nave estava armazenado apenas no `useState` local do componente `SpaceMap`
2. Quando o usuário navegava para outros menus, o componente era desmontado
3. Ao retornar ao mapa espacial, o componente era remontado com estado inicial padrão

## Solução Implementada

### 1. Adicionado Estado da Nave ao GameStore

- **Arquivo**: `src/types/game.ts`
- **Mudança**: Adicionado campo `shipState` opcional à interface `GameState`

### 2. Implementado Ações no Store

- **Arquivo**: `src/store/gameStore.ts`
- **Mudanças**:
  - Adicionadas ações `updateShipState()` e `getShipState()`
  - Estado da nave incluído na configuração de persistência do Zustand
  - Estado inicial definido como `null`

### 3. Criado Hook de Persistência Otimizada

- **Arquivo**: `src/hooks/useShipStatePersistence.ts`
- **Funcionalidade**:
  - Throttling para salvar apenas a cada 1 segundo (evita sobrecarga)
  - Função `forceSaveShipState()` para salvamento imediato
  - Otimização de performance para jogos em tempo real

### 4. Integrado SpaceMap com Estado Persistente

- **Arquivo**: `src/components/Game/SpaceMap.tsx`
- **Mudanças**:
  - Inicialização do estado usando dados salvos do store
  - Salvamento automático do estado (throttled) durante o jogo
  - Salvamento forçado quando o componente é desmontado
  - Imports e dependency arrays atualizados

## Como Funciona

1. **Inicialização**: Quando o SpaceMap carrega, verifica se há estado salvo no store
2. **Durante o Jogo**: A cada segundo, o estado atual é salvo automaticamente
3. **Saída do Mapa**: Quando o usuário sai, o estado final é salvo imediatamente
4. **Retorno**: Quando voltar ao mapa, a posição, velocidade e câmera são restauradas

## Benefícios

- ✅ Posição da nave persistente entre navegações
- ✅ Performance otimizada (salvamento throttled)
- ✅ Estado da câmera também preservado
- ✅ Velocidade da nave mantida
- ✅ Integração transparente com sistema existente

## Arquivos Modificados

1. `src/types/game.ts` - Definição do tipo
2. `src/store/gameStore.ts` - Lógica de persistência
3. `src/hooks/useShipStatePersistence.ts` - Hook de otimização (novo)
4. `src/components/Game/SpaceMap.tsx` - Integração com store
