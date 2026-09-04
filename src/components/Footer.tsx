"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Navigation, Compass, Phone, ExternalLink } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Não exibir rodapé nas páginas do painel administrativo ou de login
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return null;
  }

  const placeName = "7 Ouro Tabacaria | Tabacaria no Km18";
  const addressText = "Av. Hildebrando de Lima, 345 - Km 18, Osasco - SP, 06190-160";
  
  // Pesquisa pelo nome exato da empresa cadastrada no Google Meu Negócio / Maps + endereço
  const fullSearchQuery = `${placeName}, ${addressText}`;
  const encodedFullQuery = encodeURIComponent(fullSearchQuery);
  const encodedPlaceName = encodeURIComponent(placeName);
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedFullQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedPlaceName}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodedPlaceName}&daddr=${encodedFullQuery}`;
  const instagramUrl = "https://www.instagram.com/seteourotabacaria/";
  const whatsappUrl = "https://wa.me/5511940565052?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20loja!";

  return (
    <footer id="localizacao" suppressHydrationWarning style={{
      backgroundColor: "#050505",
      borderTop: "1px solid rgba(212, 175, 55, 0.2)",
      color: "var(--text-secondary)",
      paddingTop: "3.5rem",
      paddingBottom: "2rem",
      position: "relative",
      zIndex: 20
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1.5rem",
      }}>
        {/* Grid Principal */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3rem"
        }}>
          {/* Coluna 1: Sobre & Redes Sociais */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <Image
                src="/Logo.png"
                alt="7 Ouro Logo"
                width={50}
                height={50}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid var(--gold-primary)",
                  boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)"
                }}
              />
              <div>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", display: "block" }}>
                  <span className="gold-text">7 OURO</span> TABACARIA
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--gold-primary)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Tabacaria & Headshop
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
              A sua melhor experiência em tabacaria. Produtos selecionados com alta qualidade, atendimento personalizado e entrega rápida.
            </p>

            {/* Botão Instagram Destaque */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "8px",
                  background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 15px rgba(220, 39, 67, 0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  width: "fit-content"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 39, 67, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(220, 39, 67, 0.3)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Siga @seteourotabacaria</span>
                <ExternalLink size={16} />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#25D366",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  marginTop: "4px"
                }}
              >
                <Phone size={16} />
                <span>WhatsApp: (11) 94056-5052</span>
              </a>
            </div>
          </div>

          {/* Coluna 2: Endereço & Botões de GPS */}
          <div>
            <h3 style={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <MapPin size={20} color="var(--gold-primary)" />
              <span>Nossa Loja Física</span>
            </h3>

            <div style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1.25rem"
            }}>
              <p style={{ color: "var(--gold-primary)", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 6px 0", letterSpacing: "0.2px" }}>
                7 Ouro Tabacaria | Tabacaria no Km18
              </p>
              <p style={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem", margin: "0 0 4px 0" }}>
                Av. Hildebrando de Lima, 345
              </p>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#ccc" }}>
                Km 18, Osasco - SP
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--gold-primary)" }}>
                CEP: 06190-160
              </p>
            </div>

            <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem", color: "#ddd" }}>
              Toque abaixo para abrir sua rota direto no aplicativo:
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  background: "rgba(66, 133, 244, 0.15)",
                  border: "1px solid #4285F4",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.2s"
                }}
              >
                <Navigation size={16} color="#4285F4" />
                <span>Google Maps</span>
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  background: "rgba(51, 204, 255, 0.15)",
                  border: "1px solid #33CCFF",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.2s"
                }}
              >
                <Compass size={16} color="#33CCFF" />
                <span>Waze</span>
              </a>

              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.2s"
                }}
              >
                <span>🍎 Apple Maps</span>
              </a>
            </div>
          </div>

          {/* Coluna 3: Mapinha Interativo com Clique para GPS */}
          <div>
            <h3 style={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>🗺️</span>
              <span>Como Chegar</span>
            </h3>

            <div style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
              height: "190px",
              background: "#111"
            }}>
              <iframe
                title="Localização 7 Ouro Tabacaria | Tabacaria no Km18"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodedFullQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                style={{
                  filter: "invert(90%) hue-rotate(180deg) contrast(1.1) brightness(0.9)",
                  border: 0,
                  width: "100%",
                  height: "100%"
                }}
              />

              {/* Botão Flutuante de Rota Rápida no Mapa */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "var(--gold-gradient)",
                  color: "#000",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
                  zIndex: 10
                }}
              >
                <span>📍 Traçar Rota</span>
              </a>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px", textAlign: "right" }}>
              Clique no mapa ou botão para traçar sua rota
            </p>
          </div>
        </div>

        {/* Barra Inferior de Direitos Autorais e Links */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.85rem"
        }}>
          <div>
            <p style={{ margin: 0 }} suppressHydrationWarning>
              © {new Date().getFullYear()} <strong style={{ color: "var(--gold-primary)" }}>7 Ouro Tabacaria</strong>. Todos os direitos reservados.
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", opacity: 0.6 }}>
              Venda proibida para menores de 18 anos. Aprecie com moderação.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href="/catalogo" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Catálogo
            </Link>
            <Link href="/carrinho" style={{ color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Carrinho
            </Link>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-primary)", textDecoration: "none" }}>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
