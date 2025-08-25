import React, { useEffect, useMemo, useRef, useState } from "react";
import Albums from "./assets/albums.json";
import GameScreen from "./components/GameScreen";

import "./App.css";

async function getRandomLetter() {
  // pega a lista de arquivos
  const resIndex = await fetch("/letras/index.json");
  const files = await resIndex.json();

  // escolhe um aleatório
  const i = Math.floor(Math.random() * files.length);
  const chosen = files[i];

  // carrega o JSON correspondente
  const resFile = await fetch(`/letras/${chosen}`);
  const data = await resFile.json();

  return { nome: chosen, album: data.album, versos: data.versos };
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' ou 'game'
  const [albumAtual, setAlbumAtual] = useState(() => {
    return Math.floor(Math.random() * 28) + 1;
  });
  const [temaAtual, setTemaAtual] = useState(albumAtual);
  const [musicaAtual, setMusicaAtual] = useState(null);
  const [versosCompletosAtuais, setVersosCompletosAtuais] = useState([]);
  const [versoMostrado, setVersoMostrado] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload das imagens dos álbuns
  const preloadAlbumImages = async () => {
    if (imagesPreloaded) return;
    
    try {
      const imagePromises = Array.from({ length: 28 }, (_, i) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Resolve mesmo se houver erro
          img.src = `${i + 1}.jpg`;
        });
      });
      
      await Promise.all(imagePromises);
      setImagesPreloaded(true);
    } catch (error) {
      console.log('Algumas imagens não puderam ser carregadas:', error);
      setImagesPreloaded(true); // Marca como carregado mesmo com erros
    }
  };

  useEffect(() => {
    run();
    // Iniciar preload das imagens em background
    preloadAlbumImages();
  }, []);

  useEffect(() => {
    const visited = localStorage.getItem("hasVisited");
    if (!visited) {
      setShowWelcome(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  async function applyThemeById(id) {
    try {
      const res = await fetch("/temas.json");
      const themes = await res.json();
      const theme = themes.find((t) => String(t.id) === String(id));
      if (!theme) {
        console.warn("Tema não encontrado:", id);
        return;
      }
      const root = document.documentElement;
      Object.entries(theme.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } catch (err) {
      console.error("Erro ao aplicar tema:", err);
    }
  }

  const updateFavicon = (iconUrl) => {
    let link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "icon";
    link.href = iconUrl;
    document.head.appendChild(link);
  };

  const run = () => {
    const data = getRandomLetter();
    data.then((data) => {
      setMusicaAtual(data.nome.replace(/\.[^/.]+$/, ""));
      setVersosCompletosAtuais(data.versos);
      const albumparatrocar = Albums.find((item) => item.name === data.album);
      setAlbumAtual(albumparatrocar.id);
      setTemaAtual(albumparatrocar.id);
      updateFavicon("/" + albumparatrocar.id + ".jpg")
      document.title = albumparatrocar.name;
    });
  };

  const handleClickImage = () => {
    run();
  };

  const startGame = () => {
    setCurrentScreen('game');
  };

  const backToHome = () => {
    setCurrentScreen('home');
  };

  useEffect(() => {
    applyThemeById(temaAtual);
  }, [temaAtual]);

  useEffect(() => {
    const versoEscolhido =
      versosCompletosAtuais[
        Math.floor(Math.random() * versosCompletosAtuais.length)
      ];
    setVersoMostrado(versoEscolhido);
  }, [versosCompletosAtuais]);

  if (currentScreen === 'game') {
    return <GameScreen onBackToHome={backToHome} imagesPreloaded={imagesPreloaded} />;
  }

  return (
    <>
      <header>
        <h1>DJAVANEAR</h1>
      </header>
      
      <div className="container">
        {showWelcome && (
          <div className="welcome-overlay">
            <div className="welcome-modal">
              <div className="welcome-header">
                <h2>🎵 Bem-vindo ao DJAVANEAR!</h2>
              </div>
              
              <div className="welcome-content">
                <div className="welcome-section">
                  <div className="feature-icon">🎼</div>
                  <h3>Versos Aleatórios</h3>
                  <p>Clique na capa do álbum para descobrir versos aleatórios das músicas do Djavan. Cada clique traz uma nova surpresa!</p>
                </div>
                
                <div className="welcome-section">
                  <div className="feature-icon">🎨</div>
                  <h3>Temas Dinâmicos</h3>
                  <p>O visual do app muda automaticamente baseado no álbum da música sorteada, criando uma experiência única.</p>
                </div>
                
                <div className="welcome-section">
                  <div className="feature-icon">🎮</div>
                  <h3>Quiz Interativo</h3>
                  <p>Teste seus conhecimentos sobre o Djavan no nosso quiz! Adivinhe as músicas através dos versos.</p>
                </div>
              </div>
              
              <button 
                className="welcome-button" 
                onClick={() => setShowWelcome(false)}
              >
                Começar a Djavanear! 🎵
              </button>
            </div>
          </div>
        )}

        <div className="main-content">
          <div className="album-section">
            <img
              src={albumAtual + ".jpg"}
              onClick={handleClickImage}
              alt={"capa do álbum " + albumAtual}
              className="capa-album"
            />
            
            <div className="info">
              <h2 className="nome-musica">
                <span>Djavan disse em: </span>
                {musicaAtual}
              </h2>
              <h3 className="verso-escolhido">{versoMostrado}</h3>
            </div>
            
            <div className="click-hint">
              💡 Clique na capa para um novo verso
            </div>
          </div>

          <div className="game-section">
            <button className="game-button" onClick={startGame}>
              🎮 Jogar Quiz do Djavan
            </button>
            <p className="game-description">
              Teste seus conhecimentos sobre as músicas e álbuns do Djavan!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;