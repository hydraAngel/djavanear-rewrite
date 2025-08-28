import React, { useState, useEffect } from 'react';
import Albums from '../assets/albums.json';

// Função para carregar letras aleatórias (igual a do App.jsx)
async function getRandomLetter() {
  const resIndex = await fetch("/letras/index.json");
  const files = await resIndex.json();
  const i = Math.floor(Math.random() * files.length);
  const chosen = files[i];
  const resFile = await fetch(`/letras/${chosen}`);
  const data = await resFile.json();
  return { nome: chosen, album: data.album, versos: data.versos };
}

// Função para carregar todas as músicas de um álbum
async function getMusicasFromAlbum(albumName) {
  const resIndex = await fetch("/letras/index.json");
  const files = await resIndex.json();
  
  const musicasDoAlbum = [];
  for (const file of files) {
    const resFile = await fetch(`/letras/${file}`);
    const data = await resFile.json();
    if (data.album === albumName) {
      musicasDoAlbum.push({
        nome: file.replace(/\.[^/.]+$/, ""),
        versos: data.versos
      });
    }
  }
  return musicasDoAlbum;
}

const GameScreen = ({ onBackToHome, imagesPreloaded }) => {
  const [gameState, setGameState] = useState('instructions'); // 'instructions', 'song-question', 'result', 'game-over'
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(5);
  const [score, setScore] = useState(0);
  const [currentVerse, setCurrentVerse] = useState('');
  const [correctAlbum, setCorrectAlbum] = useState(null);
  const [correctSong, setCorrectSong] = useState('');
  const [songOptions, setSongOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Função para preload das imagens dos álbuns
  const preloadImages = () => {
    return new Promise((resolve) => {
      const totalImages = Albums.length;
      let loadedImages = 0;
      
      const imagePromises = Albums.map((album) => {
        return new Promise((imageResolve) => {
          const img = new Image();
          
          img.onload = () => {
            loadedImages++;
            const progress = Math.round((loadedImages / totalImages) * 100);
            setLoadingProgress(progress);
            imageResolve();
          };
          
          img.onerror = () => {
            // Mesmo se houver erro, contamos como "carregado" para não travar
            loadedImages++;
            const progress = Math.round((loadedImages / totalImages) * 100);
            setLoadingProgress(progress);
            imageResolve();
          };
          
          img.src = `${album.id}.jpg`;
        });
      });
      
      Promise.all(imagePromises).then(() => {
        setImagesLoaded(true);
        resolve();
      });
    });
  };

  // Effect para preload quando o componente monta
  useEffect(() => {
    if (gameState === 'instructions') {
      // Se as imagens já foram pre-carregadas na tela principal, usa essa informação
      if (imagesPreloaded) {
        setImagesLoaded(true);
        setLoadingProgress(100);
      } else {
        // Senão, carrega agora
        preloadImages();
      }
    }
  }, [gameState, imagesPreloaded]);

  // Função para embaralhar array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Função para gerar opções falsas de músicas (de qualquer álbum)
  const generateSongOptions = async (correctSong, correctAlbum) => {
    const resIndex = await fetch("/letras/index.json");
    const files = await resIndex.json();
    
    // Pegar 3 músicas aleatórias que não sejam a correta
    const otherSongs = [];
    const shuffledFiles = shuffleArray([...files]);
    
    for (const file of shuffledFiles) {
      if (otherSongs.length >= 3) break;
      
      const songName = file.replace(/\.[^/.]+$/, "");
      if (songName !== correctSong) {
        otherSongs.push({ nome: songName });
      }
    }
    
    return shuffleArray([
      { nome: correctSong, album: correctAlbum },
      ...otherSongs
    ]);
  };

  // Função para carregar nova questão
  const loadNewQuestion = async () => {
    setIsLoading(true);
    setFeedback('');
    setHintUsed(false);
    setShowHint(false);
    
    try {
      const data = await getRandomLetter();
      const verse = data.versos[Math.floor(Math.random() * data.versos.length)];
      const album = Albums.find(album => album.name === data.album);
      
      setCurrentVerse(verse);
      setCorrectAlbum(album);
      setCorrectSong(data.nome.replace(/\.[^/.]+$/, ""));
      
      // Gerar opções de música diretamente
      const songOpts = await generateSongOptions(data.nome.replace(/\.[^/.]+$/, ""), album);
      setSongOptions(songOpts);
      
      setGameState('song-question');
    } catch (error) {
      console.error('Erro ao carregar questão:', error);
      setFeedback('Erro ao carregar questão. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  const startGame = () => {
    if (imagesLoaded) {
      setGameState('loading');
      loadNewQuestion();
    }
  };

  // Função para mostrar dica
  const showHintHandler = () => {
    setHintUsed(true);
    setShowHint(true);
  };

  // Função para lidar com resposta da música
  const handleSongAnswer = (selectedSong) => {
    if (selectedSong.nome === correctSong) {
      const message = hintUsed 
        ? `🎵 Correto! "${correctSong}" do álbum "${correctAlbum.name}"! (dica usada)`
        : `🎵 Perfeito! "${correctSong}" do álbum "${correctAlbum.name}"!`;
      setFeedback(message);
      setScore(score + 1);
    } else {
      setFeedback(`❌ Incorreto! Era "${correctSong}" do álbum "${correctAlbum.name}"`);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  // Função para próxima questão
  const nextQuestion = () => {
    if (currentQuestion >= totalQuestions) {
      setGameState('game-over');
    } else {
      setCurrentQuestion(currentQuestion + 1);
      loadNewQuestion();
    }
  };

  // Função para reiniciar o jogo
  const restartGame = () => {
    setCurrentQuestion(1);
    setScore(0);
    setGameState('instructions');
  };

  if (gameState === 'instructions') {
    return (
      <div className="game-container">
        <header>
          <h1>🎮 Quiz do Djavan</h1>
        </header>
        
        <div className="instructions-container">
          <div className="instructions">
            <h2>Como Jogar</h2>
            <div className="instruction-steps">
              <div className="step">
                <span className="step-number">1</span>
                <p>Você verá um verso de uma música do Djavan</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>Use a dica para ver a capa do álbum (opcional)</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Escolha qual é a música correta (4 opções)</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <p>São {totalQuestions} questões no total. Boa sorte! 🍀</p>
              </div>
            </div>
            
            <div className="game-buttons">
              <button 
                className={`primary-button ${!imagesLoaded ? 'loading-button' : ''}`} 
                onClick={startGame}
                disabled={!imagesLoaded}
              >
                {imagesLoaded ? 'Entendi, vamos começar!' : 'Preparando jogo...'}
              </button>
              <button className="secondary-button" onClick={onBackToHome}>
                Voltar ao início
              </button>
            </div>
            
            {!imagesLoaded && (
              <div className="preload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  Carregando imagens dos álbuns... {loadingProgress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="game-container">
        <header>
          <h1>🎮 Quiz do Djavan</h1>
        </header>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Carregando questão...</p>
        </div>
      </div>
    );
  }

  if (gameState === 'song-question') {
    return (
      <div className="game-container">
        <header>
          <h1>🎮 Quiz do Djavan</h1>
          <div className="game-progress">
            Questão {currentQuestion}/{totalQuestions} • Pontos: {score}
          </div>
        </header>
        
        <div className="question-container">
          <div className="album-cover-placeholder">
            {feedback || showHint ? (
              <img 
                src={`${correctAlbum.id}.jpg`} 
                alt={correctAlbum.name}
                className="revealed-album-cover"
              />
            ) : (
              <div className="locked-cover">
                <div className="lock-icon">🎵</div>
                <p>Qual música é essa?</p>
              </div>
            )}
            {(feedback || showHint) && <p className="album-name">{correctAlbum.name}</p>}
          </div>
          
          <div className="verse-display">
            <h3>Verso da música:</h3>
            <blockquote>"{currentVerse}"</blockquote>
          </div>
          
          {feedback && (
            <div className={`feedback ${feedback.includes('Correto') || feedback.includes('Perfeito') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
          
          {!feedback && (
            <>
              <div className="hint-section">
                <button 
                  className={`hint-button ${hintUsed ? 'hint-used' : ''}`}
                  onClick={showHintHandler}
                  disabled={hintUsed}
                >
                  {hintUsed ? '💡 Dica usada' : '💡 Ver Dica'}
                </button>
                {showHint && !feedback && (
                  <p className="hint-text">💡 Esta música é do álbum "{correctAlbum.name}"</p>
                )}
              </div>
              
              <h4>Qual é o nome desta música?</h4>
              <div className="options">
                {songOptions.map((song, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => handleSongAnswer(song)}
                  >
                    {song.nome}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'game-over') {
    const maxScore = totalQuestions; // Agora é só 1 ponto por questão
    const percentage = Math.round((score / maxScore) * 100);
    
    let message = '';
    if (percentage >= 90) message = '🎉 Incrível! Você é um verdadeiro expert em Djavan!';
    else if (percentage >= 70) message = '👏 Muito bem! Você conhece bem o Djavan!';
    else if (percentage >= 50) message = '😊 Bom trabalho! Continue ouvindo Djavan!';
    else message = '🎵 Que tal ouvir mais Djavan para melhorar?';

    return (
      <div className="game-container">
        <header>
          <h1>🎮 Quiz do Djavan</h1>
        </header>
        
        <div className="game-over-container">
          <h2>Fim de Jogo!</h2>
          <div className="final-score">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{maxScore}</span>
            </div>
            <p className="percentage">{percentage}% de acertos</p>
          </div>
          
          <p className="final-message">{message}</p>
          
          <div className="game-buttons">
            <button className="primary-button" onClick={restartGame}>
              Jogar Novamente
            </button>
            <button className="secondary-button" onClick={onBackToHome}>
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GameScreen;