import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ReceiptText,
  ChefHat,
  Bike,
  PackageCheck,
  Clock3,
  Filter,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';

type Category = 'All Items' | 'Shawarma' | 'Combos' | 'Burgers' | 'Sides' | 'Drinks';
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, 'All Items'>;
  image: string;
  tag?: string;
  vegetarian?: boolean;
  spicy?: boolean;
  popular?: boolean;
};
type CartItem = Product & { quantity: number };

const logo = '/images/lajawabshawarma__hd.jpg';
const heroImage = 'https://images.pexels.com/photos/37322774/pexels-photo-37322774.jpeg?auto=compress&cs=tinysrgb&h=900&w=1400';
const products: Product[] = [
  { id: 1, name: 'Classic Chicken Shawarma', description: 'Tender chicken, crunchy lettuce, pickles and our signature garlic sauce.', price: 149, category: 'Shawarma', image: 'https://images.pexels.com/photos/29306505/pexels-photo-29306505.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tag: 'Bestseller', popular: true },
  { id: 2, name: 'Smoky Peri Peri Shawarma', description: 'Charred chicken, fiery peri peri, fresh slaw and a creamy drizzle.', price: 179, category: 'Shawarma', image: 'https://images.pexels.com/photos/18852568/pexels-photo-18852568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tag: 'Spicy', spicy: true, popular: true },
  { id: 3, name: 'Lajawab Special Roll', description: 'Double chicken, melted cheese, fries and the house special sauce.', price: 229, category: 'Shawarma', image: 'https://images.pexels.com/photos/40262789/pexels-photo-40262789.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tag: 'Chef’s pick', popular: true },
  { id: 4, name: 'Shawarma Feast for Two', description: 'Two loaded shawarmas, masala fries, dip and two chilled drinks.', price: 499, category: 'Combos', image: 'https://images.pexels.com/photos/18177330/pexels-photo-18177330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tag: 'Save ₹79', popular: true },
  { id: 5, name: 'Crunchy Chicken Burger', description: 'Crispy chicken, slaw, cheese and a smoky signature dressing.', price: 199, category: 'Burgers', image: 'https://images.pexels.com/photos/20003237/pexels-photo-20003237.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', popular: true },
  { id: 6, name: 'Loaded Masala Fries', description: 'Golden fries tossed with masala, cheese sauce and jalapeños.', price: 129, category: 'Sides', image: 'https://images.pexels.com/photos/20003226/pexels-photo-20003226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', spicy: true },
  { id: 7, name: 'Falafel Shawarma', description: 'Crispy falafel, hummus, salad and tahini wrapped fresh.', price: 139, category: 'Shawarma', image: 'https://images.pexels.com/photos/29850814/pexels-photo-29850814.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', vegetarian: true },
  { id: 8, name: 'Fresh Lime Cooler', description: 'Bright, fizzy lime cooler with a hint of mint.', price: 79, category: 'Drinks', image: 'https://images.pexels.com/photos/12129480/pexels-photo-12129480.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];
const categories: Category[] = ['All Items', 'Shawarma', 'Combos', 'Burgers', 'Sides', 'Drinks'];

function App() {
  const [fullMenu, setFullMenu] = useState(() => window.location.hash === '#full-menu');
  const [category, setCategory] = useState<Category>('All Items');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('lajawab-cart') || '[]') as CartItem[]; } catch { return []; }
  });
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartPage, setCartPage] = useState(() => window.location.hash === '#cart');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [trackingPage, setTrackingPage] = useState(() => window.location.hash === '#track-order');
  const [checkoutPage, setCheckoutPage] = useState(() => window.location.hash === '#checkout');
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    try { localStorage.setItem('lajawab-cart', JSON.stringify(cart)); } catch { /* Keep the cart usable without browser storage. */ }
  }, [cart]);
  useEffect(() => {
    const syncPage = () => {
      const isMenu = window.location.hash === '#full-menu';
      setFullMenu(isMenu);
      setCartPage(window.location.hash === '#cart');
      setCheckoutPage(window.location.hash === '#checkout');
      setTrackingPage(window.location.hash === '#track-order');
      setMobileMenu(false);
      if (isMenu) { setCategory('All Items'); setSearch(''); setVegOnly(false); setSort('popular'); }
      requestAnimationFrame(() => {
        if (isMenu || window.location.hash === '#cart' || window.location.hash === '#checkout' || window.location.hash === '#track-order') window.scrollTo({ top: 0, behavior: 'instant' });
        else document.getElementById(window.location.hash.slice(1) || 'top')?.scrollIntoView();
      });
    };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory = category === 'All Items' || product.category === category;
      const matchesSearch = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch && (!vegOnly || product.vegetarian);
    });
    return [...result].sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : Number(b.popular) - Number(a.popular));
  }, [category, search, sort, vegOnly]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal + delivery;

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...product, quantity }];
    });
  };
  const changeQuantity = (id: number, amount: number) => setCart((current) => current.flatMap((item) => item.id === id ? (item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : []) : [item]));

  const scrollToMenu = () => { window.location.hash = 'full-menu'; };

  return (
    <div className="app-shell">
      <div className="topline"><span><Clock3 size={14} /> Open today 11:00 AM – 11:00 PM</span><span className="topline-note">Free delivery on orders above ₹499</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lajawab Shawarma home"><img src="/images/lajawab-wordmark.png" alt="Lajawab Shawarma" /></a>
        <nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'}>
          <a href="#top" onClick={() => setMobileMenu(false)}>Home</a><a href="#full-menu" aria-current={fullMenu ? 'page' : undefined} onClick={() => setMobileMenu(false)}>Full Menu</a><a href="#bestsellers" onClick={() => setMobileMenu(false)}>Bestsellers</a><a href="#about" onClick={() => setMobileMenu(false)}>About us</a><a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>
        </nav>
        <div className="header-actions"><button className="icon-button search-toggle" aria-label="Focus search" onClick={scrollToMenu}><Search size={20} /></button><button className="cart-button" onClick={() => window.location.hash = 'cart'}><ShoppingBag size={19} /><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button><button className="header-order" onClick={scrollToMenu}>Order now <ArrowRight size={16} /></button><button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <SlidersHorizontal />}</button><a className="header-track-order" href="#track-order" aria-current={trackingPage ? 'page' : undefined} onClick={() => setMobileMenu(false)}>Track order</a></div>
      </header>

      <main id="top">
        {trackingPage ? <TrackOrderPage /> : checkoutPage ? <CheckoutPage cart={cart} subtotal={subtotal} onPlaced={() => setCart([])} /> : cartPage ? <CartPage cart={cart} subtotal={subtotal} delivery={delivery} total={total} onBrowse={scrollToMenu} onChange={changeQuantity} onCheckout={() => { window.location.hash = 'checkout'; }} /> : <>
        {!fullMenu && <><section className="hero-section">
          <div className="hero-copy"><p className="eyebrow">Street food, made special</p><h1>Big flavours.<br /><em>Fresh bites.</em><br />Lajawab delights.</h1><p className="hero-text">Explore your favourites, discover delicious combinations, and order your next meal in just a few clicks.</p><div className="hero-actions"><button className="primary-button" onClick={scrollToMenu}>Explore full menu <ArrowRight size={17} /></button><button className="text-button" onClick={() => { setCategory('Combos'); scrollToMenu(); }}>See today’s offers <ChevronRight size={17} /></button></div><div className="hero-proof"><div className="avatars"><span>R</span><span>S</span><span>A</span></div><div><div className="stars"><Star size={14} fill="currentColor" /> <strong>4.8/5</strong></div><small>Loved by 2,000+ foodies</small></div></div></div>
          <div className="hero-visual"><div className="hero-image-wrap"><img src={heroImage} alt="Fresh shawarma wrap with fries" /></div><div className="hero-stamp"><span>100%</span><strong>Fresh<br />daily</strong></div></div>
        </section>

        <section className="promise-row"><div><span className="promise-icon">✦</span><div><strong>Freshly prepared</strong><small>Made to order, every time</small></div></div><div><span className="promise-icon">⌁</span><div><strong>Fast delivery</strong><small>Hot food at your doorstep</small></div></div><div><span className="promise-icon">♡</span><div><strong>Big on flavour</strong><small>Small batch, full heart</small></div></div></section>

        </>}
<section className="menu-section" id="menu">{fullMenu && <a className="text-button menu-back" href="#top">← Back to home</a>}<div className="section-heading"><div><p className="eyebrow">What are you craving?</p><h2>{fullMenu ? <>Our full <em>menu</em></> : <>Find your <em>favourite</em></>}</h2></div><button className="filter-link" onClick={() => setVegOnly(!vegOnly)}><Filter size={16} /> {vegOnly ? 'Showing vegetarian' : 'Dietary filters'}</button></div>
          <div className="menu-toolbar"><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="menu-controls"><label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu..." aria-label="Search the menu" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label><label className="sort-select"><span>Sort:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><ChevronDown size={15} /></label></div></div>
          <div className="menu-meta"><span>{filteredProducts.length} delicious {filteredProducts.length === 1 ? 'pick' : 'picks'} for you</span>{vegOnly && <button onClick={() => setVegOnly(false)}>Clear filter <X size={13} /></button>}</div>
          {filteredProducts.length > 0 ? <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} quantity={cart.find((item) => item.id === product.id)?.quantity ?? 0} onChange={changeQuantity} onAdd={addToCart} onView={setActiveProduct} />)}</div> : <div className="empty-state"><Search size={32} /><h3>Nothing found just yet</h3><p>Try another search or clear your filters to discover something delicious.</p><button className="secondary-button" onClick={() => { setSearch(''); setVegOnly(false); setCategory('All Items'); }}>Show all items</button></div>}
        </section>

        {!fullMenu && <><section className="feature-banner" id="bestsellers"><div><p className="eyebrow">The crowd favourite</p><h2>Good food.<br /><em>Good mood.</em></h2><p>Our most-loved picks, chosen by people who know their shawarma.</p><button className="cream-button" onClick={() => { setCategory('Shawarma'); scrollToMenu(); }}>Shop bestsellers <ArrowRight size={17} /></button></div><img src="https://images.pexels.com/photos/18177327/pexels-photo-18177327.jpeg?auto=compress&cs=tinysrgb&h=800&w=1100" alt="Shawarma feast with dips and fresh vegetables" /></section>

        <section className="about-section" id="about"><div className="about-photo"><img src="https://images.pexels.com/photos/36750271/pexels-photo-36750271.jpeg?auto=compress&cs=tinysrgb&h=800&w=900" alt="Juicy shawarma wrap served with fries" /><span>Since<br /><strong>2026</strong></span></div><div className="about-copy"><p className="eyebrow">A little bit about us</p><h2>Not just a meal.<br /><em>It’s a feeling.</em></h2><p>At Lajawab, we believe the best food is uncomplicated: fresh ingredients, bold spices, and a whole lot of care in every wrap.</p><p>From our kitchen to your table, we make comfort food that brings people together and leaves you planning your next bite.</p><button className="text-button">Our story <ArrowRight size={17} /></button></div></section>
        </>}
        </>}
      </main>

      <footer className="site-footer" id="contact"><div className="footer-brand"><img src={logo} alt="Lajawab Shawarma logo" /><p>Big flavours, fresh bites,<br />lajawab delights.</p></div><div><h3>Explore</h3><a href="#full-menu">Full menu</a><a href="#bestsellers">Bestsellers</a><a href="#about">Our story</a></div><div><h3>Get in touch</h3><p>Have a question or just<br />want to say hello?</p><a href="#contact">Contact us <ArrowRight size={14} /></a></div><div className="footer-order"><span>Ready to eat?</span><button className="cream-button" onClick={scrollToMenu}>Order now <ArrowRight size={16} /></button></div><div className="footer-bottom"><span>© 2024 Lajawab Shawarma. Made with love.</span><span>Privacy · Terms</span></div></footer>

      {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} onAdd={(product, quantity) => { addToCart(product, quantity); setActiveProduct(null); window.location.hash = 'cart'; }} />}
    </div>
  );
}

function ProductCard({ product, quantity, onChange, onAdd, onView }: { product: Product; quantity: number; onChange: (id: number, amount: number) => void; onAdd: (product: Product) => void; onView: (product: Product) => void }) {
  return <article className="product-card"><button className="favorite" aria-label={`Save ${product.name}`}><Heart size={17} /></button><button className="product-image" onClick={() => onView(product)}><img src={product.image} alt={product.name} />{product.tag && <span className={product.tag.startsWith('Save') ? 'offer-tag' : 'product-tag'}>{product.tag}</span>}</button><div className="product-info"><div className="product-title-row"><h3>{product.name}</h3>{product.vegetarian && <span className="veg-dot" aria-label="Vegetarian"></span>}</div><p>{product.description}</p><div className="product-bottom"><strong>₹{product.price}</strong>{quantity > 0 ? <div className="card-cart-quantity"><span aria-live="polite" aria-atomic="true">{quantity} in cart</span><div className="quantity-controls"><button aria-label={`Remove one ${product.name}`} onClick={() => onChange(product.id, -1)}><Minus size={16} /></button><strong aria-label={`${quantity} ${product.name} in cart`}>{quantity}</strong><button aria-label={`Add one ${product.name}`} onClick={() => onAdd(product)}><Plus size={16} /></button></div></div> : <button className="add-button" aria-label={`Add ${product.name} to cart`} onClick={() => onAdd(product)}><Plus size={16} /> Add</button>}</div></div></article>;
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (product: Product, quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="product-modal"><button className="modal-close" onClick={onClose} aria-label="Close details"><X /></button><img src={product.image} alt={product.name} /><div className="modal-content"><p className="eyebrow">{product.category} {product.vegetarian ? '· Vegetarian' : ''}</p><h2>{product.name}</h2><div className="modal-rating"><Star size={15} fill="currentColor" /> 4.8 <span>·</span> A customer favourite</div><p>{product.description} Made fresh when you order, with our signature sauces and crisp seasonal toppings.</p><div className="modal-price">₹{product.price}</div><div className="quantity-row"><span>Quantity</span><div className="quantity-controls"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button><strong>{quantity}</strong><button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button></div></div><button className="primary-button full-button" onClick={() => { onAdd(product, quantity); }}>Add to cart · ₹{product.price * quantity} <ArrowRight size={17} /></button></div></div></div>;
}

function CartPage({ cart, subtotal, delivery, total, onBrowse, onChange, onCheckout }: { cart: CartItem[]; subtotal: number; delivery: number; total: number; onBrowse: () => void; onChange: (id: number, amount: number) => void; onCheckout: () => void }) {
  return <section className="cart-page"><a className="text-button menu-back" href="#full-menu">← Continue shopping</a><div className="cart-page-panel"><div className="drawer-header"><div><p className="eyebrow">Your order</p><h2>Your cart <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span></h2></div><button className="secondary-button" onClick={onBrowse}>Browse menu</button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={38} /><h3>Your cart is waiting</h3><p>Add something delicious and it will appear here.</p><button className="primary-button" onClick={onBrowse}>Browse menu</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-copy"><h3>{item.name}</h3><span>₹{item.price}</span><div className="quantity-controls"><button onClick={() => onChange(item.id, -1)}><Minus size={13} /></button><strong>{item.quantity}</strong><button onClick={() => onChange(item.id, 1)}><Plus size={13} /></button></div></div><strong className="item-total">₹{item.price * item.quantity}</strong></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><div><span>Delivery</span><strong>{delivery ? `₹${delivery}` : 'Free'}</strong></div>{delivery > 0 && <small>Add ₹{500 - subtotal} more for free delivery</small>}<div className="summary-total"><span>Total</span><strong>₹{total}</strong></div><button className="primary-button full-button" onClick={onCheckout}>Go to checkout <ArrowRight size={17} /></button></div></>}</div></section>;
}

function CheckoutPage({ cart, subtotal, onPlaced }: { cart: CartItem[]; subtotal: number; onPlaced: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [placed, setPlaced] = useState(false);
  const [saveError, setSaveError] = useState('');
  const delivery = orderType === 'takeaway' || subtotal > 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal + delivery;
  const placeOrder = () => {
    if (placed || !cart.length) return;
    try {
      localStorage.setItem('lajawab-order-summary', JSON.stringify({ name: name.trim(), phone: phone.trim(), address: orderType === 'delivery' ? address.trim() : '', notes: notes.trim(), orderType, items: cart, subtotal, delivery, total, status: 'local', trackingStage: 0, orderId: 'LJ-' + Date.now().toString(36).toUpperCase(), savedAt: new Date().toISOString() }));
      setSaveError(''); setPlaced(true); onPlaced();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setSaveError('Could not save your order in this browser. Please try again.'); }
  };
  if (placed) return <section className="cart-page"><div className="cart-page-panel order-success" role="status" aria-live="polite"><div className="success-tick-scene" aria-hidden="true"><div className="success-tick-shadow" /><div className="success-tick-medallion"><div className="success-tick-face"><svg viewBox="0 0 64 64" fill="none"><path d="M17 33L27 43L48 21" /></svg></div></div></div><h1>Order placed successfully!</h1><p className="order-thanks">Thanks for ordering</p><p className="order-local-note">Your order is saved on this device. Restaurant submission is not connected yet.</p><div className="success-actions"><a className="primary-button" href="#track-order">Track order <ArrowRight size={17} /></a><a className="secondary-button" href="#full-menu">Back to menu</a></div></div></section>;
  if (!cart.length) return <section className="cart-page"><div className="cart-page-panel cart-empty"><ShoppingBag size={38} /><h2>Your cart is empty</h2><p>Add an item before checking out.</p><a className="primary-button" href="#full-menu">Browse menu</a></div></section>;
  return <section className="cart-page checkout-page">
    <a className="text-button menu-back" href="#cart">← Back to cart</a>
    <nav className="checkout-steps" aria-label="Order progress"><a href="#cart">1. Cart</a><span aria-current="step">2. Checkout</span></nav>
    <div className="checkout-layout"><div className="cart-page-panel">
      <div className="checkout-heading"><img src={logo} alt="Lajawab Shawarma logo" /><div><p className="eyebrow">Checkout</p><h2>Your details</h2></div></div>
      <form onSubmit={(event) => { event.preventDefault(); placeOrder(); }}>
        <div className="checkout-form">
          <label>Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); event.target.setCustomValidity(event.target.value.trim().length < 2 ? "Please enter your full name." : ""); }} placeholder="Your name" /></label>
          <label>Mobile number<input required type="tel" inputMode="tel" autoComplete="tel-national" pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit Indian mobile number" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile number" /></label>
          <div className="checkout-choice" role="group" aria-label="Order type"><span>Order type</span><button type="button" aria-pressed={orderType === 'delivery'} className={orderType === 'delivery' ? 'selected' : ''} onClick={() => setOrderType('delivery')}>Delivery</button><button type="button" aria-pressed={orderType === 'takeaway'} className={orderType === 'takeaway' ? 'selected' : ''} onClick={() => setOrderType('takeaway')}>Takeaway</button></div>
          {orderType === 'delivery' && <label className="wide-field">Delivery address<textarea required minLength={10} maxLength={500} autoComplete="street-address" value={address} onChange={(event) => { setAddress(event.target.value); event.target.setCustomValidity(event.target.value.trim().length < 10 ? 'Please enter a complete delivery address.' : ''); }} placeholder="House number, street, area, city and PIN code" rows={3} /></label>}
          {orderType === 'takeaway' && <p className="wide-field">Collect your food from the restaurant. No delivery charge applies.</p>}
          <label className="wide-field">Order notes (optional)<textarea maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any special requests?" rows={2} /></label>
        </div>
        <p className="checkout-service-note">Your order will be saved on this device. Restaurant submission and online payment are not connected yet.</p>
        {saveError && <p role="alert">{saveError}</p>}
        <button type="submit" className="primary-button full-button">Place order <ArrowRight size={17} /></button>
      </form>
    </div><aside className="cart-page-panel checkout-order" aria-label="Order summary"><h2>Order summary</h2><a className="text-button" href="#cart">Edit cart</a>{cart.map((item) => <div className="checkout-order-item" key={item.id}><span>{item.quantity} × {item.name}</span><strong>₹{item.price * item.quantity}</strong></div>)}<div className="cart-summary"><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><div><span>{orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}</span><strong>{delivery ? '₹' + delivery : 'Free'}</strong></div><div className="summary-total" aria-live="polite"><span>Total</span><strong>₹{total}</strong></div></div></aside></div>
  </section>;
}

type TrackedOrder = { orderId?: string; trackingStage?: number; items: CartItem[]; total: number; orderType: string; savedAt: string };

function TrackOrderPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lajawab-order-summary') || 'null');
      return saved && Array.isArray(saved.items) && saved.items.length && typeof saved.total === 'number' ? saved : null;
    } catch { return null; }
  });
  const [error, setError] = useState('');
  const stage = Number.isInteger(order?.trackingStage) ? Math.max(0, Math.min(3, order!.trackingStage!)) : 0;
  const stages = ['Order received', 'Being prepared', order?.orderType === 'takeaway' ? 'Ready for pickup' : 'Out for delivery', order?.orderType === 'takeaway' ? 'Collected' : 'Delivered'];
  const stageIllustrations = [<ReceiptText key="received" />, <ChefHat key="preparing" />, <Bike key="delivery" />, <PackageCheck key="delivered" />];
  const descriptions = ['Your order details have been recorded.', 'Your food is being freshly prepared.', order?.orderType === 'takeaway' ? 'Your food is ready to collect.' : 'Your food is on its way to you.', order?.orderType === 'takeaway' ? 'Your order has been collected. Enjoy your meal!' : 'Your order has arrived. Enjoy your meal!'];
  const advanceDemo = () => {
    if (!order || stage === 3) return;
    const updated = { ...order, trackingStage: stage + 1 };
    try { localStorage.setItem('lajawab-order-summary', JSON.stringify(updated)); setOrder(updated); setError(''); }
    catch { setError('Could not save the tracking update. Please try again.'); }
  };
  if (!order) return <section className="cart-page"><div className="cart-page-panel cart-empty"><ShoppingBag size={42} /><h1>No order to track yet</h1><p>Place an order to see its progress here.</p><a className="primary-button" href="#full-menu">Browse menu</a></div></section>;
  return <section className="cart-page tracking-page"><a className="text-button menu-back" href="#full-menu">← Back to menu</a><div className="cart-page-panel">
    <p className="eyebrow">Track order</p><h1>Your order’s journey</h1><p className="tracking-reference">{order.orderId || 'Your latest order'} · {order.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}</p>
    <div className="tracking-current" role="status" aria-live="polite"><span className="tracking-current-icon" aria-hidden="true">{stageIllustrations[stage]}</span><div><h2>{stages[stage]}</h2><p>{descriptions[stage]}</p></div></div>
    <ol className="tracking-timeline" aria-label="Order progress">{stages.map((label, index) => <li key={label} className={index < stage ? 'complete' : index === stage ? 'current' : ''} aria-current={index === stage ? 'step' : undefined}><div className="tracking-illustration" aria-hidden="true">{stageIllustrations[index]}</div><div><h3>{label}</h3><span>{index < stage ? 'Completed' : index === stage ? 'Current status' : 'Upcoming'}</span></div></li>)}</ol>
    <div className="tracking-demo"><strong>Demo tracking</strong><p>This order is stored on your device. Statuses are not connected to the restaurant or a delivery service.</p>{stage < 3 ? <button className="secondary-button" onClick={advanceDemo}>Preview next status: {stages[stage + 1]}</button> : <p>Demo complete. Thanks for ordering!</p>}{error && <p role="alert">{error}</p>}</div>
    <div className="tracking-details"><h2>Order details</h2>{order.items.map((item) => <div className="checkout-order-item" key={item.id}><span>{item.quantity} × {item.name}</span><strong>₹{item.price * item.quantity}</strong></div>)}<div className="checkout-order-item"><span>Total</span><strong>₹{order.total}</strong></div></div>
  </div></section>;
}

export default App;
