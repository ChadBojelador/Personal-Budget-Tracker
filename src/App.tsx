import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  PiggyBank,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react'
import { useState } from 'react'

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const accounts = [
  { name: 'Cash', amount: 1_850, tone: 'cash', updated: 'Updated today' },
  { name: 'GCash', amount: 3_420, tone: 'gcash', updated: 'Updated 2 days ago' },
  { name: 'MariBank', amount: 6_730, tone: 'mari', updated: 'Updated 2 days ago' },
]

const essentials = [
  { label: 'Food', value: 2_480, icon: Utensils, progress: 58 },
  { label: 'Transport', value: 1_120, icon: ArrowRight, progress: 44 },
  { label: 'Wi-Fi', value: 1_299, icon: Wifi, progress: 100 },
  { label: 'Mobile load', value: 300, icon: CreditCard, progress: 75 },
]

const activities = [
  { label: 'Lunch', meta: 'Food · Cash', value: -145, icon: Utensils },
  { label: 'Allowance', meta: 'Income · GCash', value: 5_000, icon: ArrowDownLeft },
  { label: 'Jeepney', meta: 'Transport · Cash', value: -26, icon: ArrowRight },
]

type CheckInProps = { open: boolean; onClose: () => void }

function CheckIn({ open, onClose }: CheckInProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="check-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="check-in-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close daily check-in">
          <X size={19} />
        </button>
        <span className="check-in-orb"><ListChecks size={24} /></span>
        <h2 id="check-in-title">Daily check-in</h2>
        <p>A quick minute now keeps your forecast honest.</p>
        <div className="check-in-list">
          {['Record today’s cash activity', 'Confirm cash on hand', 'Review uncategorized activity', 'Check expected income'].map((item, index) => (
            <button key={item} className="check-in-row">
              <span>{index + 1}</span>
              {item}
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
        <button className="primary wide" onClick={onClose}>Start check-in</button>
      </section>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const total = accounts.reduce((sum, account) => sum + account.amount, 0)

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark"><PiggyBank size={20} /></span>
          <span>Budget</span>
        </div>
        <nav aria-label="Primary navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={19} />Overview</a>
          <a className="nav-item" href="#activity"><CircleDollarSign size={19} />Activity</a>
          <a className="nav-item" href="#wishlist"><ShoppingBag size={19} />Wishlist</a>
          <a className="nav-item" href="#insights"><Sparkles size={19} />Insights</a>
        </nav>
        <div className="sidebar-bottom">
          <button className="check-in-button" onClick={() => setCheckInOpen(true)}>
            <span><ListChecks size={19} /></span>
            <span><strong>Daily check-in</strong><small>Due at 9:00 PM</small></span>
          </button>
          <a className="nav-item" href="#settings"><Settings size={19} />Settings</a>
          <div className="profile">
            <span className="avatar">C</span>
            <span><strong>My budget</strong><small>Vault unlocked</small></span>
            <ChevronRight size={17} />
          </div>
        </div>
      </aside>

      <button
        className="mobile-menu icon-button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label="Toggle navigation"
      >
        <Menu size={20} />
      </button>

      <main>
        <header className="topbar">
          <div>
            <p className="date">Monday, September 28</p>
            <h1>Good evening.</h1>
          </div>
          <div className="top-actions">
            <span className="secure-status"><LockKeyhole size={15} />Private vault</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="primary" onClick={() => setCheckInOpen(true)}><Plus size={18} />Add transaction</button>
          </div>
        </header>

        <section className="runway" id="overview">
          <div className="runway-head">
            <div>
              <p>Your month at a glance</p>
              <div className="balance-row">
                <h2>{money.format(total)}</h2>
                <span className="trend">+{money.format(3_180)} this month</span>
              </div>
              <span className="subtle">Across 3 accounts · reconciled 2 days ago</span>
            </div>
            <button className="glass-button">September <CalendarDays size={17} /></button>
          </div>

          <div className="runway-track" aria-label="September budget timeline">
            <div className="track-line"><span style={{ width: '62%' }} /></div>
            <div className="track-point start"><i /><span>Sep 1<small>Started with {money.format(7_930)}</small></span></div>
            <div className="track-point today"><i /><span>Today<small>{money.format(total)} available</small></span></div>
            <div className="track-point payday"><i /><span>Next allowance<small>Expected Oct 1</small></span></div>
            <div className="track-point finish"><i /><span>Month end<small>{money.format(3_900)} projected</small></span></div>
          </div>

          <div className="forecast-strip">
            <div><ShieldCheck size={19} /><span><strong>{money.format(1_000)}</strong><small>Emergency floor protected</small></span></div>
            <div><PiggyBank size={19} /><span><strong>{money.format(3_900)}</strong><small>Projected month-end savings</small></span></div>
            <div className="learning"><Sparkles size={19} /><span><strong>Learning your rhythm</strong><small>18 days until your first recommendation</small></span></div>
          </div>
        </section>

        <section className="accounts-section">
          <div className="section-heading">
            <div><h2>Your money</h2><p>Balances reflect your latest check-in and imports.</p></div>
            <button className="text-button">Manage accounts <ChevronRight size={16} /></button>
          </div>
          <div className="account-row">
            {accounts.map((account) => (
              <article className={`account ${account.tone}`} key={account.name}>
                <div className="account-top"><span className="account-symbol"><WalletCards size={18} /></span><small>{account.updated}</small></div>
                <p>{account.name}</p>
                <strong>{money.format(account.amount)}</strong>
              </article>
            ))}
            <button className="account add-account"><Plus size={20} /><span>Add account</span></button>
          </div>
        </section>

        <div className="lower-grid">
          <section className="essentials" id="insights">
            <div className="section-heading compact">
              <div><h2>Protected essentials</h2><p>Learning from this month’s activity.</p></div>
              <span className="confidence">Low confidence</span>
            </div>
            <div className="essential-list">
              {essentials.map(({ label, value, icon: Icon, progress }) => (
                <div className="essential" key={label}>
                  <span className="essential-icon"><Icon size={18} /></span>
                  <div className="essential-main">
                    <div><strong>{label}</strong><span>{money.format(value)} observed</span></div>
                    <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="activity" id="activity">
            <div className="section-heading compact">
              <div><h2>Recent activity</h2><p>Today</p></div>
              <button className="text-button">See all <ChevronRight size={16} /></button>
            </div>
            <div className="activity-list">
              {activities.map(({ label, meta, value, icon: Icon }) => (
                <div className="activity-row" key={label}>
                  <span className="activity-icon"><Icon size={18} /></span>
                  <span className="activity-copy"><strong>{label}</strong><small>{meta}</small></span>
                  <strong className={value > 0 ? 'positive' : ''}>{value > 0 ? '+' : '−'}{money.format(Math.abs(value))}</strong>
                </div>
              ))}
            </div>
            <button className="secondary wide" onClick={() => setCheckInOpen(true)}>Finish today’s check-in</button>
          </section>
        </div>

        <section className="wishlist-callout" id="wishlist">
          <span className="wish-icon"><ShoppingBag size={22} /></span>
          <div><h2>Thinking about buying something?</h2><p>Add it to your wishlist and we’ll find its earliest safe date.</p></div>
          <button className="secondary">Check affordability <ArrowRight size={17} /></button>
        </section>
      </main>

      <CheckIn open={checkInOpen} onClose={() => setCheckInOpen(false)} />
    </div>
  )
}

export default App
