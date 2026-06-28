import React, { useState } from 'react';
import { Check, CreditCard, Plus, X } from 'lucide-react';

interface SavedCard { id: string; brand: string; last4: string; expiry: string; holder: string; }
interface PaymentFlowProps { title: string; items: Array<{ label: string; value: string }>; amount: number; onBack: () => void; onConfirm: () => void; }

const initialCards: SavedCard[] = [
  { id: 'visa-4242', brand: 'Visa', last4: '4242', expiry: '09/28', holder: 'Priya Sharma' },
  { id: 'master-5678', brand: 'Mastercard', last4: '5678', expiry: '09/27', holder: 'Priya Sharma' }
];

export const PaymentFlow: React.FC<PaymentFlowProps> = ({ title, items, amount, onBack, onConfirm }) => {
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState(cards[0].id);
  const [cardPickerOpen, setCardPickerOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', security: '' });
  const selected = cards.find(card => card.id === selectedCard) ?? cards[0];

  const addCard = () => {
    const digits = newCard.number.replace(/\D/g, '');
    if (digits.length < 4 || !newCard.holder || !newCard.expiry) return;
    const card = { id: `card-${Date.now()}`, brand: 'Visa', last4: digits.slice(-4), expiry: newCard.expiry, holder: newCard.holder };
    setCards(values => [...values, card]); setSelectedCard(card.id); setAddCardOpen(false); setCardPickerOpen(false);
  };

  return <div className="payment-flow">
    <div className="payment-flow__layout">
      <section className="payment-flow__main">
        <span className="billing-eyebrow">Payment</span><h3>{title}</h3><p>Review your payment and choose how you want to pay.</p>
        <div className="payment-flow__items">{items.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>
        <button type="button" className="payment-card-selector" onClick={() => setCardPickerOpen(true)}>
          <CreditCard /><div><span>Payment method</span><strong>{selected.brand} •••• {selected.last4}</strong><small>{selected.holder} · Expires {selected.expiry}</small></div><em>Change</em>
        </button>
      </section>
      <aside className="payment-summary"><span>Order summary</span>{items.map(item => <div key={item.label}><small>{item.label}</small><b>{item.value}</b></div>)}<div className="payment-summary__total"><strong>Due today</strong><strong>${amount.toFixed(2)}</strong></div><button className="org-btn org-btn--primary" onClick={onConfirm}>Confirm & Pay ${amount.toFixed(2)}</button><button className="org-btn org-btn--ghost" onClick={onBack}>Back</button><p>Payment is securely processed using your selected card.</p></aside>
    </div>

    {cardPickerOpen && <div className="billing-inner-modal" onClick={() => setCardPickerOpen(false)}><div className="billing-inner-modal__card" onClick={event => event.stopPropagation()}><header><div><h3>Payment method</h3><p>Select a saved card or add another one.</p></div><button onClick={() => setCardPickerOpen(false)}><X /></button></header><div className="saved-card-list">{cards.map(card => <button key={card.id} className={selectedCard === card.id ? 'is-selected' : ''} onClick={() => { setSelectedCard(card.id); setCardPickerOpen(false); }}><span className="saved-card-radio">{selectedCard === card.id && <Check />}</span><CreditCard /><div><strong>{card.brand} •••• {card.last4}</strong><span>{card.holder} · Exp {card.expiry}</span></div></button>)}</div><button className="org-btn org-btn--secondary" onClick={() => setAddCardOpen(true)}><Plus /> Add new card</button></div></div>}
    {addCardOpen && <div className="billing-inner-modal billing-inner-modal--top" onClick={() => setAddCardOpen(false)}><div className="billing-inner-modal__card" onClick={event => event.stopPropagation()}><header><div><h3>Add payment card</h3><p>Card details are stored securely.</p></div><button onClick={() => setAddCardOpen(false)}><X /></button></header><div className="settings-form-grid"><label className="org-form-field settings-form-grid__full"><span>Card number</span><input value={newCard.number} onChange={event => setNewCard(value => ({ ...value, number: event.target.value }))} placeholder="1234 5678 9012 3456" /></label><label className="org-form-field settings-form-grid__full"><span>Cardholder name</span><input value={newCard.holder} onChange={event => setNewCard(value => ({ ...value, holder: event.target.value }))} /></label><label className="org-form-field"><span>Expiry</span><input value={newCard.expiry} onChange={event => setNewCard(value => ({ ...value, expiry: event.target.value }))} placeholder="MM/YY" /></label><label className="org-form-field"><span>Security code</span><input value={newCard.security} onChange={event => setNewCard(value => ({ ...value, security: event.target.value }))} placeholder="CVV" /></label></div><footer><button className="org-btn org-btn--secondary" onClick={() => setAddCardOpen(false)}>Cancel</button><button className="org-btn org-btn--primary" onClick={addCard}>Save card</button></footer></div></div>}
  </div>;
};
