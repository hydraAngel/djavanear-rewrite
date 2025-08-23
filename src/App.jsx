import React, { useEffect, useMemo, useRef, useState } from "react";
import Albums from "./assets/albums.json";

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
  const [albumAtual, setAlbumAtual] = useState(() => {
    // This function will only run once during the initial render
    return Math.floor(Math.random() * 28) + 1; // Generates a random integer from 1 to 28
  });
  const [temaAtual, setTemaAtual] = useState(albumAtual);
  const [musicaAtual, setMusicaAtual] = useState(null);
  const [versosCompletosAtuais, setVersosCompletosAtuais] = useState([]);
  const [versoMostrado, setVersoMostrado] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // chama a função e atualiza o state
    run();
  }, []);

  useEffect(() => {
    // verifica se já existe flag no localStorage
    const visited = localStorage.getItem("hasVisited");

    if (!visited) {
      // primeira vez
      setShowWelcome(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  /**
   * Aplica tema com base no id (número da capa)
   * @param {number|string} id - id do álbum/tema (ex: "1", "2", ...)
   */
  async function applyThemeById(id) {
    try {
      // Carrega o JSON dos temas (ajuste o caminho conforme seu projeto)
      const res = await fetch("/temas.json");
      const themes = await res.json();

      // Procura o tema pelo id
      const theme = themes.find((t) => String(t.id) === String(id));
      if (!theme) {
        console.warn("Tema não encontrado:", id);
        return;
      }

      // Aplica as variáveis CSS no :root
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
      document.title = albumAtual;
    });
  };

  const handleClickImage = () => {
    run();
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
  return (
    <>
      <header>
        <h1>DJAVANEAR</h1>
      </header>
      {showWelcome && (
        <div className="showWelcome">
          🎉 Bem-vindo(a) ao aplicativo! Clique na imagem para gerar um verso.
        </div>
      )}

      <img
        src={albumAtual + ".jpg"}
        onClick={handleClickImage}
        alt={"capa do álbum " + albumAtual}
        className="capa-album"
      ></img>
      <div className="info">
        <h2 className="nome-musica">
          <span>Djavan disse em: </span>
          {musicaAtual}
        </h2>
        <h3 className="verso-escolhido">{versoMostrado}</h3>
      </div>
    </>
  );
}

export default App;
