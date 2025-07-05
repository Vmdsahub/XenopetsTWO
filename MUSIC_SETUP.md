# Sistema de Trilha Sonora Galáctica

## Visão Geral

O sistema de trilha sonora galáctica foi implementado para fornecer uma experiência musical imersiva durante a navegação no mapa galáctica do jogo Xenopets. O sistema inclui:

- **5 faixas musicais** que tocam em rotação
- **Fade in/out** suaves entre faixas e controles
- **Crossfade** entre músicas para transições perfeitas
- **Controles de reprodução** (play/pause, próxima/anterior)
- **Controle de volume** com slider
- **Pausa automática** quando o componente é desmontado

## Arquivos de Música

### Localização dos Placeholders

Os arquivos de música placeholder estão localizados em:

```
public/sounds/
├── galaxy-music-1.mp3
├── galaxy-music-2.mp3
├── galaxy-music-3.mp3
├── galaxy-music-4.mp3
└── galaxy-music-5.mp3
```

### Substituindo os Placeholders

1. **Formatos suportados**: MP3, OGG, WAV (MP3 recomendado para compatibilidade)
2. **Duração recomendada**: 2-5 minutos por faixa
3. **Tamanho**: Comprimir adequadamente para web (128-192 kbps)
4. **Volume**: Normalizar todas as faixas para volume similar

### Nomes das Faixas

As faixas são identificadas pelos seguintes nomes no código:

- `galaxy-music-1.mp3` → "Cosmic Voyage"
- `galaxy-music-2.mp3` → "Stellar Winds"
- `galaxy-music-3.mp3` → "Nebula Dreams"
- `galaxy-music-4.mp3` → "Deep Space"
- `galaxy-music-5.mp3` → "Galactic Horizon"

Para personalizar os nomes, edite o arquivo:
`src/services/backgroundMusicService.ts`

## Como Funciona

### Inicialização Automática

- A música inicia automaticamente quando o componente GalaxyMap é carregado
- Faz pré-carregamento de todas as faixas para reprodução suave
- Para automaticamente quando o componente é desmontado

### Controles Disponíveis

- **Play/Pause**: Toca ou pausa a música atual
- **Próxima/Anterior**: Navega entre as faixas
- **Volume**: Controle deslizante de 0-100%
- **Mute**: Silencia/ativa rapidamente

### Funcionalidades Técnicas

- **Crossfade**: Transição suave entre faixas (2 segundos)
- **Fade in/out**: Entrada e saída suaves (2 segundos)
- **Loop infinito**: Após a última faixa, volta para a primeira
- **Tolerância a erros**: Continua funcionando mesmo se alguns arquivos falharem

## Personalização

### Modificando Faixas

Para adicionar/remover faixas, edite:
`src/services/backgroundMusicService.ts`

```typescript
private tracks: MusicTrack[] = [
  {
    id: 'galaxy-1',
    name: 'Sua Música 1',
    path: '/sounds/sua-musica-1.mp3',
  },
  // ... adicione mais faixas aqui
];
```

### Modificando Configurações

Parâmetros configuráveis no serviço:

- `volume`: Volume padrão (0.3)
- `fadeDuration`: Duração do fade (2000ms)
- `fadeSteps`: Passos do fade (20)

### Modificando Aparência

Edite o componente `src/components/Audio/MusicControls.tsx` para:

- Alterar posição dos controles
- Modificar cores e estilos
- Adicionar/remover controles
- Mudar tamanhos dos ícones

## Recomendações de Música

### Estilo

- **Ambient/Electronic**: Para criar atmosfera espacial
- **Synthwave**: Para sensação futurística
- **Orchestral**: Para épico galáctico
- **Lo-fi Space**: Para relaxamento durante exploração

### Critérios

- **Sem vocais** ou vocais mínimos
- **Loop suave** (sem início/fim abrupto)
- **Instrumental** preferencialmente
- **Atmosférica** e não distrativa
- **Consistente** em energia e volume

## Solução de Problemas

### Música não toca

1. Verifique se os arquivos MP3 estão na pasta correta
2. Confirme que os nomes dos arquivos estão corretos
3. Teste os arquivos em outros players
4. Verifique console do navegador para erros

### Problemas de Performance

1. Comprima os arquivos de áudio
2. Use MP3 com bitrate menor (128 kbps)
3. Reduza duração das faixas se necessário

### Crossfade não funciona

1. Verifique se o navegador suporta Web Audio API
2. Teste em navegador mais recente
3. Verifique se há erros no console

## Suporte a Navegadores

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (funcionalidade limitada)

## Arquivos do Sistema

### Principais

- `src/services/backgroundMusicService.ts` - Serviço principal
- `src/hooks/useBackgroundMusic.ts` - Hook React
- `src/components/Audio/MusicControls.tsx` - Interface de controles
- `src/components/World/GalaxyMap.tsx` - Integração no mapa

### Estilos

- `src/index.css` - Estilos do slider de volume
