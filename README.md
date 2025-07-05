# Xenopets - Jogo de Pets Alienígenas

Um jogo web interativo onde você explora galáxias, coleta pets alienígenas e vive aventuras espaciais.

## 🎵 Sistema de Trilha Sonora Galáctica

O jogo agora inclui um sistema completo de música de fundo para a navegação galáctica com:

### Funcionalidades

- **5 faixas musicais** em rotação automática
- **Fade in/out suaves** (2 segundos de transição)
- **Crossfade** entre músicas para transições perfeitas
- **Controles intuitivos** (play/pause, próxima/anterior, volume)
- **Pré-carregamento** inteligente para reprodução fluida
- **Pausa automática** quando sai do mapa galáctico

### Controles de Música

- 🎵 **Play/Pause**: Controla reprodução
- ⏭️ **Próxima/Anterior**: Navega entre faixas
- 🔊 **Volume**: Slider de controle de 0-100%
- 🔇 **Mute**: Silencia/ativa rapidamente

### Localização dos Arquivos

```
public/sounds/
├── galaxy-music-1.mp3  # "Cosmic Voyage"
├── galaxy-music-2.mp3  # "Stellar Winds"
├── galaxy-music-3.mp3  # "Nebula Dreams"
├── galaxy-music-4.mp3  # "Deep Space"
└── galaxy-music-5.mp3  # "Galactic Horizon"
```

**Nota**: Os arquivos atuais são placeholders. Substitua por músicas reais seguindo o guia em `MUSIC_SETUP.md`.

## 🚀 Tecnologias

- **React 18** + TypeScript
- **Vite** para build rápido
- **Framer Motion** para animações fluidas
- **Zustand** para gerenciamento de estado
- **Tailwind CSS** para estilização
- **Supabase** para backend e autenticação
- **Web Audio API** para efeitos sonoros e música

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 16+
- npm, yarn ou pnpm

### Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITÓRIO]
cd xenopets

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações do Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Verifica código

## 🎮 Funcionalidades do Jogo

### 🌌 Navegação Galáctica

- Mapa galáctico interativo com zoom e pan
- Sistema de coordenadas wraparound
- Efeitos visuais de estrelas e nebulosas
- Música de fundo ambiente com controles

### 🚀 Sistema de Nave

- Controle manual da nave espacial
- Auto-pilot para pontos de interesse
- Efeitos sonoros de motor e colisões
- Animações fluidas de movimento

### 👤 Sistema de Usuários

- Autenticação completa
- Perfis de usuário personalizáveis
- Sistema de achievements
- Inventário de itens

### 🛒 Loja Virtual

- Compra de itens e melhorias
- Sistema de moedas do jogo
- Variedade de produtos disponíveis

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Audio/          # Controles de música
│   ├── Auth/           # Autenticação
│   ├── Pet/            # Sistema de pets
│   ├── Screens/        # Telas principais
│   └── World/          # Mapa galáctico
├── hooks/              # Custom hooks
├── services/           # Serviços (API, música, etc.)
├── store/              # Gerenciamento de estado
├── types/              # Definições TypeScript
└── utils/              # Utilitários
```

## 🎨 Customização

### Música de Fundo

Consulte `MUSIC_SETUP.md` para instruções detalhadas sobre:

- Substituição de arquivos de música
- Personalização de faixas
- Configuração de fade/crossfade
- Geração de música sintética temporária

### Temas e Estilos

- Edite `tailwind.config.js` para cores personalizadas
- Modifique `src/index.css` para estilos globais
- Use Tailwind classes para estilização rápida

## 🐛 Solução de Problemas

### Música não Reproduz

1. Verifique se os arquivos MP3 estão na pasta `public/sounds/`
2. Confirme que os nomes dos arquivos estão corretos
3. Teste em navegador com suporte a Web Audio API
4. Verifique console para erros de carregamento

### Performance

- Use arquivos de áudio comprimidos (128-192 kbps)
- Mantenha duração das faixas entre 2-5 minutos
- Teste em dispositivos móveis para performance

## 📱 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (funcionalidade limitada)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Xenopets** - Explore galáxias, colete pets alienígenas, viva aventuras espaciais! 🛸👽🎵
