"use client";

import { useCart } from "@/components/CartContext";
import styles from "./page.module.css";
import { useState } from "react";
import Image from "next/image";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    deliveryType: "retirada", // retirada ou entrega
    address: "",
    paymentMethod: "pix",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountPercentage: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const discountAmount = appliedCoupon ? (total * appliedCoupon.discountPercentage) / 100 : 0;
  const finalTotal = total - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/cupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.code, discountPercentage: data.discountPercentage });
        setCouponMessage({ type: "success", text: `Cupom aplicado! ${data.discountPercentage}% de desconto.` });
        setCouponCode("");
      } else {
        setAppliedCoupon(null);
        setCouponMessage({ type: "error", text: data.error || "Cupom inválido." });
      }
    } catch (err) {
      setCouponMessage({ type: "error", text: "Erro ao validar cupom." });
    }
    setValidatingCoupon(false);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "5511940565052"; // Novo número do cliente
    let message = `*NOVO PEDIDO - 7 OURO TABACARIA* 🚬\n\n`;

    message += `*Cliente:* ${customerInfo.name}\n`;
    message += `*Tipo:* ${customerInfo.deliveryType === 'entrega' ? 'Entrega' : 'Retirada na Loja'}\n`;

    if (customerInfo.deliveryType === 'entrega') {
      message += `*Endereço:* ${customerInfo.address}\n`;
      message += `*Pagamento:* PIX\n`;
    } else {
      message += `*Pagamento:* ${customerInfo.paymentMethod.toUpperCase()}\n`;
    }

    message += `\n*ITENS:*\n`;
    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price)})\n`;
    });

    message += `\n*RESUMO DOS PRODUTOS:*\n`;
    message += `Subtotal: ${formatCurrency(total)}\n`;
    if (appliedCoupon) {
      message += `Cupom (${appliedCoupon.code}): -${formatCurrency(discountAmount)} (${appliedCoupon.discountPercentage}% OFF)\n`;
    }
    message += `*TOTAL (Sem frete):* ${formatCurrency(finalTotal)}\n`;

    if (customerInfo.deliveryType === 'entrega') {
      message += `\n_Aguarde um momento! Iremos calcular a taxa de entrega via Uber Moto para o seu endereço. Retornaremos em breve com o valor do frete somado ao pedido e os dados para o pagamento (PIX)._\n`;
    } else if (customerInfo.paymentMethod === 'pix') {
      message += `\n_Por favor, após realizar o pagamento, nos envie o comprovante por aqui para darmos andamento ao seu pedido!_\n`;
    } else {
      message += `\n_Aguardamos você na loja para o pagamento e retirada!_\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    clearCart();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Seu <span className="gold-text">Carrinho</span></h1>

        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Seu carrinho está vazio.</p>
            <a href="/catalogo" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Ir para o Catálogo
            </a>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.id} className={`glass-panel ${styles.cartItem}`}>
                  <div className={styles.itemInfo}>
                    <h3>{item.name}</h3>
                    <p className="gold-text">{formatCurrency(item.price)}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remover</button>
                  </div>
                </div>
              ))}

              <div className={styles.totalSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Cupom Section */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Código de Desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="btn-secondary"
                    disabled={validatingCoupon || !couponCode.trim()}
                    style={{ padding: '0.75rem 1rem' }}
                  >
                    {validatingCoupon ? "..." : "Aplicar"}
                  </button>
                </div>

                {couponMessage.text && (
                  <p style={{ color: couponMessage.type === 'error' ? '#ff4d4f' : '#4CAF50', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
                    {couponMessage.text}
                  </p>
                )}

                <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }}></div>

                {appliedCoupon && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4CAF50' }}>
                      <span>Desconto ({appliedCoupon.code}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Total:</h2>
                  <h2 className="gold-text">{formatCurrency(finalTotal)}</h2>
                </div>
              </div>
            </div>

            <div className={`glass-panel ${styles.checkoutForm}`}>
              <h2>Finalizar Pedido</h2>

              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Como deseja receber?</label>
                <select
                  value={customerInfo.deliveryType}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, deliveryType: e.target.value })}
                >
                  <option value="retirada">Retirar na Loja</option>
                  <option value="entrega">Entrega em Domicílio</option>
                </select>
              </div>

              {customerInfo.deliveryType === 'entrega' && (
                <div className={styles.formGroup}>
                  <label>Endereço Completo</label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Rua, Número, Bairro, Ponto de Referência"
                    rows={3}
                  />
                  <small style={{ color: 'var(--gold-primary)', marginTop: '0.5rem', display: 'block' }}>
                    * Para entregas, aceitamos apenas PIX. A chave será enviada no WhatsApp.
                  </small>
                </div>
              )}

              {customerInfo.deliveryType === 'retirada' && (
                <div className={styles.formGroup}>
                  <label>Forma de Pagamento (na loja)</label>
                  <select
                    value={customerInfo.paymentMethod}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, paymentMethod: e.target.value })}
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão de Crédito/Débito</option>
                  </select>
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
                onClick={handleWhatsAppOrder}
                disabled={!customerInfo.name || (customerInfo.deliveryType === 'entrega' && !customerInfo.address)}
              >
                Enviar Pedido por WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
