# 🎨 NeuroPlay - Assets para App Nativo

Esta pasta contém os assets fonte para geração automática de ícones e splash screens do app nativo NeuroPlay.

## 📁 Estrutura de Arquivos

```
resources/
├── icon.png       # Ícone do app (fonte)
├── splash.png     # Splash screen (fonte)
└── README.md      # Este arquivo
```

## 🎯 Especificações dos Assets

### Icon.png
- **Tamanho mínimo:** 1024x1024 pixels
- **Formato:** PNG com transparência ou fundo sólido
- **Conteúdo:** Logo NeuroPlay
- **Área segura:** Manter elementos importantes dentro de 80% central (ícones iOS têm bordas arredondadas)
- **Cores:** Usar cores oficiais NeuroPlay (#3A86FF, #8338EC, #06D6A0, #FF9F1C, #FFD166)

### Splash.png
- **Tamanho mínimo:** 2732x2732 pixels (tamanho do iPad Pro 12.9")
- **Formato:** PNG
- **Layout:** Logo centralizado em fundo sólido
- **Área segura:** Manter logo dentro de 1200x1200px centrais
- **Fundo:** Cor azul #3A86FF (cor primária NeuroPlay)
- **Logo:** Branco ou dourado (#c7923e) para contraste

## 🚀 Como Usar

### 1. Preparar Assets Personalizados

Substitua os arquivos `icon.png` e `splash.png` por suas versões customizadas seguindo as especificações acima.

**Ferramentas recomendadas:**
- **Figma/Sketch:** Criar designs em alta resolução
- **Photoshop/GIMP:** Editar e exportar em PNG
- **ImageMagick:** Redimensionar via linha de comando

### 2. Instalar Ferramenta Capacitor Assets

```bash
npm install @capacitor/assets --save-dev
```

### 3. Gerar Assets Automaticamente

```bash
npx capacitor-assets generate
```

Este comando criará automaticamente:

#### iOS (ios/App/App/Assets.xcassets/)
- AppIcon.appiconset - Ícones em 13 tamanhos (20pt até 1024pt)
- Splash.imageset - Splash screens otimizados

#### Android (android/app/src/main/res/)
- mipmap-mdpi até mipmap-xxxhdpi - Ícones em 5 densidades
- drawable-land/port-mdpi até xxxhdpi - Splash screens em múltiplas orientações e densidades

### 4. Verificar Resultados

Após gerar, verifique:
- iOS: Abra `ios/App/App.xcworkspace` no Xcode → Assets.xcassets
- Android: Navegue para `android/app/src/main/res/` e verifique pastas mipmap-* e drawable-*

## 🎨 Diretrizes de Design

### Ícone do App (icon.png)

**Recomendações:**
- Use logo NeuroPlay simplificado
- Evite gradientes complexos (podem não renderizar bem em tamanhos pequenos)
- Teste em fundo claro e escuro (iOS usa ambos)
- Mantenha alto contraste para visibilidade

**Exemplo de composição:**
```
┌─────────────────┐
│                 │
│   ┌───────┐     │
│   │       │     │  ← Área segura (80% central)
│   │  LOGO │     │     Logo NeuroPlay centralizado
│   │       │     │
│   └───────┘     │
│                 │
└─────────────────┘
```

### Splash Screen (splash.png)

**Recomendações:**
- Fundo sólido cor primária (#0a1e35)
- Logo centralizado em branco ou dourado
- Adicione slogan "Transformando vidas através da neurociência" (opcional)
- Mantenha elementos importantes na área segura central

**Exemplo de composição:**
```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │             │      │
│    │   ┌─────┐   │      │  ← Área segura (1200x1200px)
│    │   │LOGO │   │      │     Logo + texto centralizado
│    │   └─────┘   │      │
│    │             │      │
│    │ "Slogan"    │      │
│    └─────────────┘      │
│                         │
└─────────────────────────┘
```

## 🔄 Regenerar Assets

Sempre que atualizar `icon.png` ou `splash.png`:

1. Salve os novos arquivos em `resources/`
2. Execute `npx capacitor-assets generate`
3. Sincronize com plataformas: `npx cap sync`
4. Rebuilde os projetos nativos

## 📱 Testar Ícones

### iOS (Xcode)
1. Abra `ios/App/App.xcworkspace`
2. Selecione dispositivo/simulador
3. Build & Run (⌘R)
4. Verifique ícone na home screen

### Android (Android Studio)
1. Abra pasta `android/` no Android Studio
2. Selecione dispositivo/emulador
3. Run app (▶️)
4. Verifique ícone no launcher

## 🛠️ Troubleshooting

### Ícone não aparece após build
- Limpe build cache (Xcode: Product → Clean Build Folder)
- Delete app do dispositivo e reinstale
- Verifique que arquivos foram gerados corretamente

### Splash screen aparece cortada
- Certifique-se que `splash.png` tem 2732x2732px
- Mantenha conteúdo importante na área segura central
- Ajuste `androidScaleType` em `capacitor.config.ts`

### Cores erradas nos ícones
- Verifique perfil de cor do PNG (use sRGB)
- Exporte novamente com perfil de cor embedado
- Teste em diferentes fundos (claro/escuro)

## 📚 Recursos Adicionais

- [Capacitor Assets CLI](https://github.com/ionic-team/capacitor-assets)
- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)
- [Brand Manual NeuroPlay](docs/NEUROPLAY_BRAND_MANUAL.pdf)

## ✅ Checklist de Publicação

Antes de publicar nas lojas:

- [ ] Ícone 1024x1024 em alta resolução (icon.png)
- [ ] Splash screen 2732x2732 otimizado (splash.png)
- [ ] Assets gerados com `npx capacitor-assets generate`
- [ ] Testado em iOS (simulador + dispositivo real)
- [ ] Testado em Android (emulador + dispositivo real)
- [ ] Ícone visível e claro em fundos claro e escuro
- [ ] Splash screen alinhado e sem cortes
- [ ] Cores correspondem ao brand manual NeuroPlay

---

**Dúvidas?** Consulte CAPACITOR_SETUP.md ou documentação oficial do Capacitor.
