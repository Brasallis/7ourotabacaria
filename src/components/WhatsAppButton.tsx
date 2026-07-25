"use client";

export default function WhatsAppButton({ 
  phoneNumber, 
  message 
}: { 
  phoneNumber: string; 
  message: string; 
}) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <button className="btn-primary" onClick={handleWhatsAppClick} style={{ width: '100%', padding: '16px' }}>
      Enviar Pedido por WhatsApp
    </button>
  );
}
