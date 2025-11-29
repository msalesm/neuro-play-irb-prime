# 📱 NeuroPlay - Configuração App Nativo com Capacitor

Este guia explica como transformar o NeuroPlay em aplicativo nativo para iOS e Android com **feedback háptico funcionando no iPhone**.

## ✅ O que foi configurado

1. **Capacitor instalado** - Framework para apps nativos
2. **Plugin Haptics** - Feedback háptico nativo (funciona no iPhone!)
3. **Sistema híbrido** - Detecta automaticamente web vs nativo
4. **Hot-reload ativo** - Testa mudanças direto no dispositivo

## 🚀 Como testar no seu iPhone ou Android

### Passo 1: Transferir projeto para GitHub
1. Clique em **"Export to GitHub"** no Lovable
2. Faça `git clone` do seu repositório
3. Entre na pasta do projeto

### Passo 2: Instalar dependências
```bash
npm install
```

### Passo 3: Adicionar plataformas nativas

**Para iOS (necessário Mac com Xcode):**
```bash
npx cap add ios
npx cap update ios
```

**Para Android (necessário Android Studio):**
```bash
npx cap add android
npx cap update android
```

### Passo 4: Build do projeto
```bash
npm run build
```

### Passo 5: Sincronizar com plataformas
```bash
npx cap sync
```

### Passo 6: Abrir no IDE nativo

**Para iOS:**
```bash
npx cap open ios
```
- Abre o Xcode automaticamente
- Conecte seu iPhone via USB
- Selecione seu dispositivo no Xcode
- Clique em ▶️ Run

**Para Android:**
```bash
npx cap open android
```
- Abre o Android Studio automaticamente
- Conecte seu Android via USB (ative modo desenvolvedor)
- Selecione seu dispositivo
- Clique em ▶️ Run

Ou use o comando direto:
```bash
npx cap run ios
npx cap run android
```

## 🎯 Como funciona o Feedback Háptico

### No App Nativo (iOS/Android)
- ✅ **Funciona perfeitamente no iPhone!**
- Usa API nativa do Capacitor Haptics
- 3 tipos de feedback:
  - **Impact** (tap, sequence) - Toque simples
  - **Success** (achievement, success) - Vibração de sucesso
  - **Error/Warning** - Vibração de alerta

### No Navegador Web (Android apenas)
- Usa Web Vibration API
- Funciona em Chrome/Firefox Android
- **Não funciona no Safari iOS** (limitação da Apple)

### Detecção Automática
O código detecta automaticamente se está rodando como:
- **App Nativo** → Usa Capacitor Haptics (iOS/Android)
- **Navegador Web** → Usa Vibration API (Android apenas)

## 🔧 Configurações importantes

### Arquivo: `capacitor.config.ts`
```typescript
{
  appId: 'app.lovable.d98addd99b3b410c900bc8de6e51b25e',
  appName: 'neuro-play-irb-prime',
  webDir: 'dist',
  server: {
    url: 'https://...',  // Hot-reload ativo
    cleartext: true
  }
}
```

### Hot-reload em desenvolvimento
Com `server.url` configurado, o app carrega o código direto do Lovable sandbox, permitindo ver mudanças instantaneamente no dispositivo físico sem rebuild!

**Para desabilitar (produção):**
```typescript
server: {
  url: '',  // Deixe vazio
  cleartext: false
}
```

## 📦 Publicar nas lojas

### App Store (iOS)
1. Configure certificados no Apple Developer
2. Build de produção no Xcode
3. Archive e upload via Xcode
4. Envie para revisão na App Store Connect

### Google Play (Android)
1. Gere signing key no Android Studio
2. Build de produção (AAB)
3. Upload no Google Play Console
4. Publique para revisão

## 🎮 Testar feedback háptico

Abra o app nativo e vá para:
**Configurações → Feedback Háptico**

Você verá:
- ✓ "App Nativo Detectado" (se estiver no app)
- Opções: Off, Leve, Médio, Forte
- Botão "Testar Vibração"

Jogue qualquer jogo (ex: Sequência Cósmica) e sinta a vibração nativa!

## 🐛 Troubleshooting

### Hot-reload não funciona
- Verifique se `server.url` está correto
- Celular e computador devem estar na mesma rede
- Tente desabilitar firewall temporariamente

### Xcode não encontra dispositivo
- Confie no computador no iPhone (Settings → General → Device Management)
- Verifique certificado de desenvolvedor

### Android Studio não detecta celular
- Ative "Depuração USB" no Android
- Instale drivers USB do fabricante
- Aceite autorização no celular

## 📚 Recursos adicionais

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Haptics Plugin](https://capacitorjs.com/docs/apis/haptics)
- [Blog Lovable sobre Capacitor](https://lovable.dev/blog)

## 💡 Próximos passos

1. **Testar no dispositivo real** - Siga passos acima
2. **Customizar ícone/splash** - Edite assets nas pastas ios/android
3. **Adicionar plugins nativos** - Camera, Push Notifications, etc.
4. **Build de produção** - Remova hot-reload e publique

---

**Dúvidas?** Entre em contato com o suporte Lovable!
