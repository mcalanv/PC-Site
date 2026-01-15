import { useState, useRef, useCallback, useEffect } from "react";

export default function RetroDesktop() {
  const [openApps, setOpenApps] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  // Snake game state
  const [snakeGames, setSnakeGames] = useState({});

  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    windowId: null,
  });
  const resizeRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    windowId: null,
    direction: "",
  });

  const apps = [
    { id: "notepad", name: "Notepad", icon: "📝", x: 50, y: 50 },
    { id: "calculator", name: "Calculator", icon: "🧮", x: 50, y: 140 },
    { id: "paint", name: "Paint", icon: "🎨", x: 50, y: 230 },
    { id: "files", name: "Files", icon: "📁", x: 50, y: 320 },
    { id: "music", name: "Music Player", icon: "🎵", x: 150, y: 50 },
    { id: "browser", name: "Browser", icon: "🌐", x: 150, y: 140 },
    { id: "snake", name: "Snake Game", icon: "🐍", x: 150, y: 230 },
  ];

  const openApp = useCallback(
    (appId) => {
      if (openApps.find((app) => app.id === appId)) {
        setActiveWindow(appId);
        return;
      }

      const app = apps.find((a) => a.id === appId);
      const newWindow = {
        id: appId,
        name: app.name,
        icon: app.icon,
        x: Math.random() * 200 + 100,
        y: Math.random() * 150 + 100,
        width: 400,
        height: 300,
        minimized: false,
        maximized: false,
      };

      setOpenApps((prev) => [...prev, newWindow]);
      setActiveWindow(appId);
    },
    [openApps, apps],
  );

  const closeApp = useCallback((appId) => {
    setOpenApps((prev) => prev.filter((app) => app.id !== appId));
    setActiveWindow(null);
  }, []);

  const minimizeApp = useCallback((appId) => {
    setOpenApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, minimized: true } : app)),
    );
    setActiveWindow(null);
  }, []);

  const restoreApp = useCallback((appId) => {
    setOpenApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, minimized: false } : app,
      ),
    );
    setActiveWindow(appId);
  }, []);

  const handleResizeStart = useCallback((e, windowId, direction) => {
    e.stopPropagation();
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      windowId,
      direction,
    };
    setActiveWindow(windowId);
  }, []);

  const handleMouseDown = useCallback((e, windowId) => {
    if (
      e.target.closest(".window-controls") ||
      e.target.closest(".resize-handle")
    )
      return;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      windowId,
    };
    setActiveWindow(windowId);
  }, []);

  const handleMouseMove = useCallback((e) => {
    // Handle window dragging
    if (dragRef.current.isDragging) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setOpenApps((prev) =>
        prev.map((app) =>
          app.id === dragRef.current.windowId
            ? { ...app, x: app.x + deltaX, y: app.y + deltaY }
            : app,
        ),
      );

      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    }

    // Handle window resizing
    if (resizeRef.current.isResizing) {
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;
      const direction = resizeRef.current.direction;

      setOpenApps((prev) =>
        prev.map((app) => {
          if (app.id !== resizeRef.current.windowId) return app;

          let newWidth = app.width;
          let newHeight = app.height;
          let newX = app.x;
          let newY = app.y;

          // Handle different resize directions
          if (direction.includes("right")) {
            newWidth = Math.max(200, app.width + deltaX);
          }
          if (direction.includes("left")) {
            const widthChange = -deltaX;
            newWidth = Math.max(200, app.width + widthChange);
            if (newWidth > 200) {
              newX = app.x - widthChange;
            }
          }
          if (direction.includes("bottom")) {
            newHeight = Math.max(150, app.height + deltaY);
          }
          if (direction.includes("top")) {
            const heightChange = -deltaY;
            newHeight = Math.max(150, app.height + heightChange);
            if (newHeight > 150) {
              newY = app.y - heightChange;
            }
          }

          return {
            ...app,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
          };
        }),
      );

      resizeRef.current.startX = e.clientX;
      resizeRef.current.startY = e.clientY;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current.isDragging = false;
    resizeRef.current.isResizing = false;
  }, []);

  const renderAppContent = (appId) => {
    switch (appId) {
      case "notepad":
        return (
          <div className="p-4 h-full bg-white">
            <textarea
              className="w-full h-full resize-none border-none outline-none font-mono text-sm"
              placeholder="Welcome to Retro Notepad..."
              defaultValue="Welcome to Retro Desktop!\n\nThis is a nostalgic recreation of classic PC interfaces.\n\nTry opening different apps and dragging windows around!"
            />
          </div>
        );
      case "calculator":
        return (
          <div className="p-4 bg-[#c0c0c0]">
            <div className="bg-white p-2 mb-3 text-right font-mono border-2 border-[#808080] border-t-white border-l-white">
              0
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                "C",
                "±",
                "%",
                "÷",
                "7",
                "8",
                "9",
                "×",
                "4",
                "5",
                "6",
                "-",
                "1",
                "2",
                "3",
                "+",
                "0",
                "0",
                ".",
                "=",
              ].map((btn) => (
                <button
                  key={btn}
                  className="h-8 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] text-sm font-bold hover:bg-[#d0d0d0] active:border-[#808080] active:border-r-white active:border-b-white"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        );
      case "paint":
        return (
          <div className="p-2 bg-[#c0c0c0] h-full">
            <div className="bg-white border-2 border-[#808080] border-t-white border-l-white h-full p-2">
              <canvas
                width="350"
                height="200"
                className="border border-gray-400 bg-white cursor-crosshair"
              />
            </div>
          </div>
        );
      case "files":
        return (
          <div className="bg-white h-full">
            <div className="bg-[#c0c0c0] p-2 border-b border-[#808080]">
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-[#c0c0c0] border border-[#808080] text-xs">
                  File
                </button>
                <button className="px-3 py-1 bg-[#c0c0c0] border border-[#808080] text-xs">
                  Edit
                </button>
                <button className="px-3 py-1 bg-[#c0c0c0] border border-[#808080] text-xs">
                  View
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 hover:bg-blue-100 p-1 cursor-pointer">
                  <span>📁</span>
                  <span className="text-sm">Documents</span>
                </div>
                <div className="flex items-center space-x-2 hover:bg-blue-100 p-1 cursor-pointer">
                  <span>📁</span>
                  <span className="text-sm">Pictures</span>
                </div>
                <div className="flex items-center space-x-2 hover:bg-blue-100 p-1 cursor-pointer">
                  <span>📝</span>
                  <span className="text-sm">readme.txt</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "music":
        return (
          <div className="bg-[#2a2a2a] text-white p-4 h-full">
            <div className="text-center mb-4">
              <div className="text-lg font-bold mb-2">🎵 RetroPlayer</div>
              <div className="text-sm text-gray-300 mb-1">
                Now Playing: With You
              </div>
              <div className="text-xs text-gray-400">Chris Brown</div>
            </div>
            <div className="bg-black p-3 rounded mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">1:23</span>
                <span className="text-xs">4:16</span>
              </div>
              <div className="w-full bg-gray-600 h-2 rounded cursor-pointer">
                <div className="w-1/3 bg-green-400 h-2 rounded transition-all"></div>
              </div>
            </div>
            <div className="flex justify-center space-x-3 mb-4">
              <button className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full text-lg flex items-center justify-center transition-colors">
                ⏮
              </button>
              <button className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full text-xl flex items-center justify-center transition-colors">
                ⏸
              </button>
              <button className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded-full text-lg flex items-center justify-center transition-colors">
                ⏭
              </button>
            </div>
            <div className="bg-[#1a1a1a] rounded p-2 text-xs">
              <div className="text-center text-gray-400 mb-2">Up Next:</div>
              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Kiss Kiss</span>
                  <span className="text-gray-500">3:28</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Forever</span>
                  <span className="text-gray-500">4:37</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Run It!</span>
                  <span className="text-gray-500">3:35</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "browser":
        return (
          <div className="bg-white h-full">
            <div className="bg-[#c0c0c0] p-2 border-b border-[#808080]">
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 bg-[#c0c0c0] border border-[#808080] text-xs">
                  Back
                </button>
                <button className="px-2 py-1 bg-[#c0c0c0] border border-[#808080] text-xs">
                  Forward
                </button>
                <div className="flex-1 bg-white border-2 border-[#808080] border-t-white border-l-white px-2 py-1 text-sm">
                  http://retro-desktop.local
                </div>
              </div>
            </div>
            <div className="p-4">
              <h1 className="text-xl font-bold mb-4">Welcome to RetroNet!</h1>
              <p className="text-sm mb-2">
                This is a simulation of a classic web browser from the 90s.
              </p>
              <p className="text-sm text-blue-600 underline cursor-pointer">
                • Visit our homepage
              </p>
              <p className="text-sm text-blue-600 underline cursor-pointer">
                • Check your email
              </p>
              <p className="text-sm text-blue-600 underline cursor-pointer">
                • Browse the web ring
              </p>
            </div>
          </div>
        );
      case "snake":
        return <SnakeGame key={appId} />;
      default:
        return <div className="p-4">Application content goes here...</div>;
    }
  };

  const SnakeGame = () => {
    const GRID_SIZE = 20;
    const GRID_WIDTH = 15;
    const GRID_HEIGHT = 12;

    const [gameState, setGameState] = useState({
      snake: [{ x: 7, y: 6 }],
      food: { x: 10, y: 8 },
      direction: { x: 1, y: 0 },
      isGameOver: false,
      score: 0,
      isPlaying: false,
    });

    const gameLoopRef = useRef();

    const generateFood = useCallback((snake) => {
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_WIDTH),
          y: Math.floor(Math.random() * GRID_HEIGHT),
        };
      } while (
        snake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y,
        )
      );
      return newFood;
    }, []);

    const moveSnake = useCallback(() => {
      setGameState((prev) => {
        if (prev.isGameOver || !prev.isPlaying) return prev;

        const head = prev.snake[0];
        const newHead = {
          x: head.x + prev.direction.x,
          y: head.y + prev.direction.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_WIDTH ||
          newHead.y < 0 ||
          newHead.y >= GRID_HEIGHT
        ) {
          return { ...prev, isGameOver: true, isPlaying: false };
        }

        // Check self collision
        if (
          prev.snake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y,
          )
        ) {
          return { ...prev, isGameOver: true, isPlaying: false };
        }

        const newSnake = [newHead, ...prev.snake];

        // Check food collision
        if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
          return {
            ...prev,
            snake: newSnake,
            food: generateFood(newSnake),
            score: prev.score + 10,
          };
        } else {
          newSnake.pop();
          return {
            ...prev,
            snake: newSnake,
          };
        }
      });
    }, [generateFood]);

    useEffect(() => {
      const handleKeyPress = (e) => {
        setGameState((prev) => {
          if (prev.isGameOver || !prev.isPlaying) return prev;

          let newDirection = prev.direction;

          switch (e.key) {
            case "ArrowUp":
              if (prev.direction.y === 0) newDirection = { x: 0, y: -1 };
              break;
            case "ArrowDown":
              if (prev.direction.y === 0) newDirection = { x: 0, y: 1 };
              break;
            case "ArrowLeft":
              if (prev.direction.x === 0) newDirection = { x: -1, y: 0 };
              break;
            case "ArrowRight":
              if (prev.direction.x === 0) newDirection = { x: 1, y: 0 };
              break;
            default:
              return prev;
          }

          return { ...prev, direction: newDirection };
        });
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    useEffect(() => {
      if (gameState.isPlaying && !gameState.isGameOver) {
        gameLoopRef.current = setInterval(moveSnake, 150);
      } else {
        clearInterval(gameLoopRef.current);
      }

      return () => clearInterval(gameLoopRef.current);
    }, [gameState.isPlaying, gameState.isGameOver, moveSnake]);

    const startGame = () => {
      setGameState({
        snake: [{ x: 7, y: 6 }],
        food: { x: 10, y: 8 },
        direction: { x: 1, y: 0 },
        isGameOver: false,
        score: 0,
        isPlaying: true,
      });
    };

    const pauseGame = () => {
      setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    return (
      <div className="h-full bg-[#c0c0c0] p-4 flex flex-col">
        {/* Game Info Bar */}
        <div className="flex justify-between items-center mb-4 bg-[#808080] p-2 border-2 border-white border-r-[#404040] border-b-[#404040]">
          <div className="text-white font-bold text-sm">🐍 SNAKE</div>
          <div className="text-white font-bold text-sm">
            Score: {gameState.score}
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="bg-black border-4 border-[#808080]"
            style={{
              width: GRID_WIDTH * GRID_SIZE,
              height: GRID_HEIGHT * GRID_SIZE,
              position: "relative",
            }}
          >
            {/* Snake */}
            {gameState.snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute ${index === 0 ? "bg-lime-400" : "bg-green-500"}`}
                style={{
                  left: segment.x * GRID_SIZE,
                  top: segment.y * GRID_SIZE,
                  width: GRID_SIZE - 1,
                  height: GRID_SIZE - 1,
                  border:
                    index === 0 ? "1px solid #65a30d" : "1px solid #15803d",
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-red-500 rounded-full"
              style={{
                left: gameState.food.x * GRID_SIZE + 2,
                top: gameState.food.y * GRID_SIZE + 2,
                width: GRID_SIZE - 4,
                height: GRID_SIZE - 4,
              }}
            />

            {/* Game Over Overlay */}
            {gameState.isGameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-xl font-bold mb-2">GAME OVER</div>
                  <div className="text-sm mb-4">
                    Final Score: {gameState.score}
                  </div>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {!gameState.isPlaying &&
              !gameState.isGameOver &&
              gameState.snake.length > 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-xl font-bold">PAUSED</div>
                </div>
              )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex justify-center space-x-2">
          {!gameState.isPlaying ? (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-bold text-sm hover:bg-[#d0d0d0] active:border-[#808080] active:border-r-white active:border-b-white"
            >
              {gameState.isGameOver ? "New Game" : "Start"}
            </button>
          ) : (
            <button
              onClick={pauseGame}
              className="px-4 py-2 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] font-bold text-sm hover:bg-[#d0d0d0] active:border-[#808080] active:border-r-white active:border-b-white"
            >
              Pause
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-xs text-black">
          Use arrow keys to control the snake
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-screen bg-gradient-to-br from-[#008080] via-[#20b2aa] to-[#008b8b] relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => setStartMenuOpen(false)}
    >
      {/* Scan lines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)",
        }}
      />

      {/* Desktop Icons */}
      {apps.map((app) => (
        <div
          key={app.id}
          className="absolute flex flex-col items-center cursor-pointer p-2 rounded hover:bg-white/20 transition-colors"
          style={{ left: app.x, top: app.y }}
          onDoubleClick={() => openApp(app.id)}
        >
          <div className="text-3xl mb-1">{app.icon}</div>
          <div className="text-white text-xs font-bold text-center text-shadow-lg px-1 py-0.5 bg-black/30 rounded">
            {app.name}
          </div>
        </div>
      ))}

      {/* Windows */}
      {openApps
        .filter((app) => !app.minimized)
        .map((app) => (
          <div
            key={app.id}
            className={`absolute bg-[#c0c0c0] border-2 border-[#c0c0c0] ${
              activeWindow === app.id ? "z-20" : "z-10"
            }`}
            style={{
              left: app.x,
              top: app.y,
              width: app.width,
              height: app.height,
              boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
            onMouseDown={(e) => handleMouseDown(e, app.id)}
          >
            {/* Title Bar */}
            <div
              className={`flex items-center justify-between px-2 py-1 text-white text-sm font-bold ${
                activeWindow === app.id
                  ? "bg-gradient-to-r from-[#0040ff] to-[#0080ff]"
                  : "bg-gradient-to-r from-[#808080] to-[#a0a0a0]"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{app.icon}</span>
                <span>{app.name}</span>
              </div>
              <div className="flex space-x-1 window-controls">
                <button
                  className="w-4 h-4 bg-[#c0c0c0] border border-[#808080] text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
                  onClick={() => minimizeApp(app.id)}
                >
                  _
                </button>
                <button
                  className="w-4 h-4 bg-[#c0c0c0] border border-[#808080] text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
                  onClick={() => closeApp(app.id)}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="h-[calc(100%-32px)] overflow-hidden relative">
              {renderAppContent(app.id)}

              {/* Resize Handles */}
              {/* Corner handles */}
              <div
                className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "top-left")}
              />
              <div
                className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "top-right")}
              />
              <div
                className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "bottom-left")}
              />
              <div
                className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize resize-handle"
                onMouseDown={(e) =>
                  handleResizeStart(e, app.id, "bottom-right")
                }
              />

              {/* Edge handles */}
              <div
                className="absolute top-0 left-2 right-2 h-1 cursor-n-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "top")}
              />
              <div
                className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "bottom")}
              />
              <div
                className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "left")}
              />
              <div
                className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize resize-handle"
                onMouseDown={(e) => handleResizeStart(e, app.id, "right")}
              />
            </div>
          </div>
        ))}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1">
        {/* Start Button */}
        <button
          className="flex items-center space-x-2 px-3 py-1 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] hover:bg-[#d0d0d0] font-bold text-sm"
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen(!startMenuOpen);
          }}
        >
          <span className="text-lg">🪟</span>
          <span>Start</span>
        </button>

        {/* Taskbar Apps */}
        <div className="flex-1 flex space-x-1 mx-2">
          {openApps.map((app) => (
            <button
              key={app.id}
              className={`flex items-center space-x-1 px-2 py-1 text-xs border-2 ${
                app.minimized
                  ? "border-[#808080] border-r-white border-b-white bg-[#a0a0a0]"
                  : activeWindow === app.id
                    ? "border-[#808080] border-r-white border-b-white bg-[#a0a0a0]"
                    : "border-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] hover:bg-[#d0d0d0]"
              }`}
              onClick={() =>
                app.minimized ? restoreApp(app.id) : setActiveWindow(app.id)
              }
            >
              <span>{app.icon}</span>
              <span className="truncate max-w-24">{app.name}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center space-x-2 border-l-2 border-[#808080] border-r border-r-white pl-2">
          <div className="text-xs">🔊</div>
          <div className="text-xs font-bold">{time}</div>
        </div>
      </div>

      {/* Start Menu */}
      {startMenuOpen && (
        <div
          className="absolute bottom-10 left-0 w-64 bg-[#c0c0c0] border-2 border-white border-r-[#808080] border-b-[#808080] z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-[#0040ff] to-[#0080ff] text-white p-3 font-bold text-sm">
            Retro Desktop
          </div>
          <div className="p-2">
            {apps.map((app) => (
              <button
                key={app.id}
                className="w-full flex items-center space-x-3 px-2 py-2 hover:bg-blue-100 text-left text-sm"
                onClick={() => {
                  openApp(app.id);
                  setStartMenuOpen(false);
                }}
              >
                <span className="text-lg">{app.icon}</span>
                <span>{app.name}</span>
              </button>
            ))}
            <hr className="my-2 border-[#808080]" />
            <button className="w-full flex items-center space-x-3 px-2 py-2 hover:bg-blue-100 text-left text-sm">
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-2 py-2 hover:bg-blue-100 text-left text-sm">
              <span className="text-lg">🔌</span>
              <span>Shut Down</span>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .text-shadow-lg {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        * {
          cursor: default;
        }
        
        button {
          cursor: pointer !important;
        }
        
        textarea, input {
          cursor: text !important;
        }
        
        .resize-handle {
          background: transparent;
        }
        
        .resize-handle:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
