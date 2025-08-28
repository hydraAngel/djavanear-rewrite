# 🎵 DJAVANEAR

Um projeto web interativo dedicado ao cantor e compositor brasileiro Djavan. O site apresenta versos aleatórios das músicas do artista e inclui um quiz para testar seus conhecimentos sobre sua obra.

## ✨ Funcionalidades

### 🎼 Versos Aleatórios
- Clique na capa do álbum para descobrir versos aleatórios das músicas do Djavan
- Cada clique traz uma nova surpresa musical
- Visual dinâmico que muda baseado no álbum da música sorteada

### 🎨 Temas Dinâmicos
- Interface que se adapta automaticamente ao álbum selecionado
- Cores e estilos únicos para cada disco
- Experiência visual imersiva

### 🎮 Quiz Interativo
- Teste seus conhecimentos sobre as músicas do Djavan
- Adivinhe o nome das músicas através dos versos
- Sistema de pontuação e feedback instantâneo
- 5 questões por rodada

## 🚀 Tecnologias Utilizadas

- **React** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização com variáveis CSS e design responsivo
- **JSON** - Armazenamento dos dados das músicas e álbuns

## 📱 Design Responsivo

O projeto foi desenvolvido com foco em responsividade, funcionando perfeitamente em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🎯 Como Usar

### Página Principal
1. Visualize um verso aleatório de uma música do Djavan
2. Clique na capa do álbum para gerar um novo verso
3. O tema da página muda automaticamente baseado no álbum

### Quiz
1. Clique em "🎮 Jogar Quiz do Djavan"
2. Leia o verso apresentado
3. Escolha qual é a música correta entre as 4 opções
4. Veja sua pontuação ao final das 5 questões

## 🛠️ Instalação e Execução

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd djavanear

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Para build de produção
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── GameScreen.jsx    # Componente do quiz
├── assets/
│   └── albums.json       # Dados dos álbuns
├── App.jsx              # Componente principal
├── App.css              # Estilos principais
└── main.jsx             # Ponto de entrada

public/
├── letras/              # Arquivos JSON com letras
├── temas.json           # Configurações de temas
└── [1-28].jpg          # Capas dos álbuns
```

## 🎨 Características Visuais

- **Fonte**: Figtree (Google Fonts)
- **Paleta de cores**: Dinâmica baseada no álbum
- **Animações**: Transições suaves e hover effects
- **Modal de boas-vindas**: Explicação das funcionalidades
- **Loading states**: Feedback visual durante carregamento

## 📝 Dados

O projeto utiliza:
- **28 álbuns** do Djavan
- **Centenas de versos** organizados por música
- **Temas personalizados** para cada álbum
- **Sistema de arquivos JSON** para fácil manutenção

## 🎵 Sobre o Djavan

Djavan é um dos maiores compositores e intérpretes da música popular brasileira, conhecido por sua fusão única de MPB, jazz, pop e música latina. Este projeto é uma homenagem à sua extensa e rica discografia.

---

**Desenvolvido com ❤️ para celebrar a música de Djavan**
