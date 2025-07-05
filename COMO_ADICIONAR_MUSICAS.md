# 🎵 Como Adicionar Suas Próprias Músicas

## 📂 Passos Simples

### 1. **Prepare seus arquivos de música**

- **Formato**: MP3 (recomendado)
- **Qualidade**: 128-192 kbps (boa qualidade, tamanho razoável)
- **Duração**: 2-5 minutos por faixa (ideal para loops)
- **Volume**: Normalize todas as faixas para níveis similares

### 2. **Renomeie os arquivos**

Seus arquivos devem ter exatamente estes nomes:

```
galaxy-music-1.mp3
galaxy-music-2.mp3
galaxy-music-3.mp3
galaxy-music-4.mp3
galaxy-music-5.mp3
```

### 3. **Coloque na pasta correta**

Copie os arquivos para a pasta:

```
public/sounds/
```

A estrutura final deve ficar assim:

```
public/
└── sounds/
    ├── galaxy-music-1.mp3  ← Sua música 1
    ├── galaxy-music-2.mp3  ← Sua música 2
    ├── galaxy-music-3.mp3  ← Sua música 3
    ├── galaxy-music-4.mp3  ← Sua música 4
    ├── galaxy-music-5.mp3  ← Sua música 5
    └── notification-pop.mp3 (já existe)
```

### 4. **Recarregue a página**

- Atualize a página no navegador
- O sistema detectará automaticamente seus arquivos
- Se os arquivos forem válidos, ele usará suas músicas
- Se houver problemas, voltará para música sintética

## 🔧 **Dicas Importantes**

### ✅ **Formatos Suportados**

- **MP3**: Melhor compatibilidade
- **OGG**: Boa alternativa
- **WAV**: Funciona mas arquivos maiores

### ⚠️ **Resolução de Problemas**

**Se a música não tocar:**

1. Verifique se os nomes estão exatos (case-sensitive)
2. Teste os arquivos em outro player
3. Confirme que estão na pasta `public/sounds/`
4. Recarregue a página
5. Abra console do navegador (F12) para ver logs

**Se o volume não funcionar:**

- O sistema detecta automaticamente arquivos reais
- Controles de volume funcionam tanto para arquivos reais quanto sintéticos

### 📝 **Logs do Console**

Você verá mensagens como:

- `🔍 Verificando arquivos de música...`
- `✅ Arquivos de música detectados!` (se encontrou seus arquivos)
- `❌ Arquivos não encontrados - usando música sintética` (se não encontrou)

## 🎨 **Personalizando Nomes das Faixas**

Se quiser mudar os nomes que aparecem na interface, edite o arquivo:
`src/services/backgroundMusicService.ts`

Procure por:

```typescript
{
  id: 'galaxy-1',
  name: 'Trilha Galáctica 1', ← Mude aqui
  path: '/sounds/galaxy-music-1.mp3',
},
```

## 🔄 **Sistema Híbrido**

O sistema funciona assim:

1. **Tenta carregar seus arquivos** primeiro
2. **Se encontrar**: usa suas músicas com controles de volume
3. **Se não encontrar**: volta para música sintética
4. **Sempre funciona**: nunca fica sem música

---

**Qualquer dúvida, me avise! 🎵**
