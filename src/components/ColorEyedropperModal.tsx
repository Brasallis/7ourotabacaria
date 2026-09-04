"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

type ColorEyedropperModalProps = {
  imageSrc: string;
  initialColorName?: string;
  initialColorHex?: string;
  availableColors: string[];
  onConfirm: (data: { colorName: string; colorHex: string }) => void;
  onCancel: () => void;
};

// Helper para converter RGB em HEX
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Helper para determinar se a cor é clara ou escura (para contraste de texto)
function isColorLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export default function ColorEyedropperModal({
  imageSrc,
  initialColorName = "",
  initialColorHex = "#D4AF37",
  availableColors = [],
  onConfirm,
  onCancel,
}: ColorEyedropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [selectedHex, setSelectedHex] = useState<string>(initialColorHex || "#D4AF37");
  const [hoverHex, setHoverHex] = useState<string>(initialColorHex || "#D4AF37");
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [colorName, setColorName] = useState<string>(initialColorName || "");
  const [isNewColor, setIsNewColor] = useState<boolean>(!availableColors.includes(initialColorName));
  const [hasEyeDropperApi, setHasEyeDropperApi] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      setHasEyeDropperApi(true);
    }
  }, []);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Carregar imagem no canvas principal
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Definir dimensões base do canvas com base na proporção da imagem
      const maxWidth = 750;
      const maxHeight = 480;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;

      const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [imageSrc]);

  // Atualizar a lupa de aumento quando o mouse se move
  const updateLoupe = useCallback(
    (canvasX: number, canvasY: number, hex: string) => {
      const loupeCanvas = loupeCanvasRef.current;
      const mainCanvas = canvasRef.current;
      if (!loupeCanvas || !mainCanvas) return;

      const loupeCtx = loupeCanvas.getContext("2d");
      if (!loupeCtx) return;

      const zoomSize = 80;
      const zoomFactor = 6;
      const sampleRadius = Math.floor(zoomSize / (2 * zoomFactor));

      loupeCtx.imageSmoothingEnabled = false;
      loupeCtx.clearRect(0, 0, zoomSize, zoomSize);

      // Recorte ao redor do cursor e ampliação
      loupeCtx.drawImage(
        mainCanvas,
        canvasX - sampleRadius,
        canvasY - sampleRadius,
        sampleRadius * 2,
        sampleRadius * 2,
        0,
        0,
        zoomSize,
        zoomSize
      );

      // Desenhar retículo (mira no centro exato do pixel)
      const center = zoomSize / 2;
      loupeCtx.strokeStyle = isColorLight(hex) ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)";
      loupeCtx.lineWidth = 1.5;

      // Mira central
      loupeCtx.beginPath();
      loupeCtx.arc(center, center, 4, 0, Math.PI * 2);
      loupeCtx.stroke();
    },
    []
  );

  // Manipulador de movimento do mouse sobre a imagem
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      setHoverCoords(null);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

    setHoverCoords({ x: e.clientX, y: e.clientY });
    setHoverHex(hex);
    updateLoupe(x, y, hex);
  };

  const handleMouseLeave = () => {
    setHoverCoords(null);
  };

  // Clique na foto para selecionar a cor
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setSelectedHex(hex);
  };

  // Usar API nativa EyeDropper do navegador (se disponível)
  const handleNativeEyeDropper = async () => {
    try {
      if (typeof window !== "undefined" && "EyeDropper" in window) {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          setSelectedHex(hex);
          setHoverHex(hex);
        }
      }
    } catch (err) {
      // Usuário cancelou ou fechou
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = colorName.trim();
    if (!finalName) {
      alert("Por favor, digite ou selecione o nome da cor.");
      return;
    }
    onConfirm({
      colorName: finalName,
      colorHex: selectedHex,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #181818 0%, #101010 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.2)",
          maxWidth: "840px",
          width: "100%",
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.3rem",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🖌️</span>
              <span className="gold-text">Pincel Identificador de Cor</span>
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              Passe o mouse com a <strong>lupa de precisão</strong> sobre a foto e clique no ponto exato da cor que deseja capturar.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#aaa",
              fontSize: "1.2rem",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Corpo: Canvas Interativo da Foto */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            overflowY: "auto",
          }}
        >
          {/* Barra de Instruções & Conta-Gotas do Sistema */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              background: "rgba(255, 255, 255, 0.03)",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--gold-primary)", fontWeight: 600 }}>💡 Dica:</span>
              <span style={{ color: "#ccc" }}>
                Clique em qualquer pixel do produto na imagem abaixo.
              </span>
            </div>

            {hasEyeDropperApi && (
              <button
                type="button"
                onClick={handleNativeEyeDropper}
                className="btn-secondary"
                style={{
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.8rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderColor: "var(--gold-primary)",
                  color: "var(--gold-primary)",
                  background: "rgba(212, 175, 55, 0.12)",
                }}
              >
                <span>🔍</span> Usar Conta-Gotas do Navegador
              </button>
            )}
          </div>

          {/* Área do Canvas com Cursor de Pincel */}
          <div
            style={{
              position: "relative",
              maxWidth: "100%",
              background: "#070707",
              borderRadius: "10px",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
              cursor: "crosshair",
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
              style={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
                userSelect: "none",
              }}
            />

            {!imageLoaded && (
              <div style={{ padding: "4rem", color: "var(--text-secondary)" }}>
                Carregando foto para extração...
              </div>
            )}
          </div>

          {/* Lupa Flutuante Amplificadora */}
          {hoverCoords && (
            <div
              style={{
                position: "fixed",
                left: hoverCoords.x + 20,
                top: hoverCoords.y - 60,
                pointerEvents: "none",
                zIndex: 100000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "3px solid var(--gold-primary)",
                  overflow: "hidden",
                  background: "#000",
                  boxShadow: "0 0 16px rgba(212, 175, 55, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <canvas
                  ref={loupeCanvasRef}
                  width={80}
                  height={80}
                  style={{ width: "80px", height: "80px" }}
                />
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.9)",
                  border: "1px solid var(--gold-primary)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: hoverHex,
                    border: "1px solid #fff",
                    display: "inline-block",
                  }}
                />
                <span>{hoverHex}</span>
              </div>
            </div>
          )}

          {/* Painel de Confirmação e Atribuição da Cor */}
          <form
            onSubmit={handleSubmit}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "12px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              {/* Amostra da Cor Capturada */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: selectedHex,
                    border: "3px solid #fff",
                    boxShadow: `0 0 20px ${selectedHex}88, 0 4px 10px rgba(0,0,0,0.5)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="color"
                    value={selectedHex}
                    onChange={(e) => setSelectedHex(e.target.value.toUpperCase())}
                    title="Ajustar tom manualmente se preferir"
                    style={{
                      opacity: 0,
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--gold-primary)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Amostra da Cor Identificada
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "2px",
                    }}
                  >
                    <span>{selectedHex}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-secondary)",
                        fontWeight: "normal",
                        fontFamily: "sans-serif",
                      }}
                    >
                      (Clique na amostra para ajustar)
                    </span>
                  </div>
                </div>
              </div>

              {/* Atribuição de Nome da Cor */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}>
                  Nome da Cor desta Foto:
                </label>

                <div style={{ display: "flex", gap: "8px" }}>
                  {availableColors.length > 0 && !isNewColor ? (
                    <select
                      value={colorName}
                      onChange={(e) => {
                        if (e.target.value === "__NEW__") {
                          setIsNewColor(true);
                          setColorName("");
                        } else {
                          setColorName(e.target.value);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        background: "#111",
                        border: "1px solid var(--gold-primary)",
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    >
                      <option value="">Selecione uma cor existente...</option>
                      {availableColors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW__">+ Cadastrar Nova Cor...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="Ex: Rosa Choque, Dourado, Preto"
                      required
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        background: "#111",
                        border: "1px solid var(--gold-primary)",
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  )}

                  {availableColors.length > 0 && isNewColor && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewColor(false);
                        setColorName(availableColors[0] || "");
                      }}
                      className="btn-secondary"
                      style={{ padding: "0.6rem 0.8rem", fontSize: "0.8rem" }}
                      title="Voltar para lista de cores existentes"
                    >
                      Escolher Existente
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "0.5rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                style={{ padding: "0.65rem 1.4rem" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: "0.65rem 1.8rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                }}
              >
                <span>✓</span> Salvar Cor da Foto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
