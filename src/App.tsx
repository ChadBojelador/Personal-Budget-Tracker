import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  CreditCard,
  Database,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  Moon,
  PiggyBank,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { requestAICoaching } from './aiCoach'
import { appConfig, environmentStatus } from './config'
import { loadBudgetData, resetBudgetData, saveBudgetData } from './data'
import { calculateForecast, checkAffordability, createLocalCoaching, currentMonthKey } from './forecast'
import type { Account, BudgetData, BudgetSettings, CoachResponse, Transaction, WishlistItem } from './types'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
const fullDate = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })
const monthLabel = (month: string) => new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(new Date(`${month}-02T12:00:00`))
const todayKey = () => new Date().toLocaleDateString('en-CA')
const uid = () => crypto.randomUUID()

type Modal = 'transaction' | 'accounts' | 'checkin' | 'affordability' | 'settings' | 'assumptions' | null

function Dialog({ title, description, children, onClose, className = '' }: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label={`Close ${title}`}><X size={19} /></button>
        <h2 id="dialog-title">{title}</h2>
        {description && <p className="dialog-description">{description}</p>}
        {children}
      </section>
    </div>
  )
}

function TransactionDialog({ accounts, onSave, onClose }: {
  accounts: Account[]
  onSave: (transaction: Omit<Transaction, 'id'>) => void
  onClose: () => void
}) {
  const [kind, setKind] = useState<Transaction['kind']>('expense')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(todayKey())

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!accountId || numericAmount <= 0 || !description.trim()) return
    onSave({ accountId, amount: numericAmount, kind, category, description: description.trim(), date })
  }

  return (
    <Dialog title="Add transaction" description="Your forecast updates as soon as this is saved." onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <div className="segmented" aria-label="Transaction type">
          <button type="button" className={kind === 'expense' ? 'active' : ''} onClick={() => setKind('expense')}>Expense</button>
          <button type="button" className={kind === 'income' ? 'active' : ''} onClick={() => setKind('income')}>Income</button>
        </div>
        <label>Amount<input autoFocus type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></label>
        <div className="form-grid">
          <label>Account<select value={accountId} onChange={(event) => setAccountId(event.target.value)}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
          <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        </div>
        <label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What was it for?" required /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>
          {(kind === 'income' ? ['Allowance', 'Other income'] : ['Food', 'Transport', 'Wi-Fi', 'Mobile load', 'Shopping', 'Uncategorized']).map((item) => <option key={item}>{item}</option>)}
        </select></label>
        <button className="primary wide" type="submit">Save transaction</button>
      </form>
    </Dialog>
  )
}

function AccountsDialog({ accounts, onAdd, onUpdate, onDelete, onClose }: {
  accounts: Account[]
  onAdd: (account: Omit<Account, 'id' | 'updatedAt'>) => void
  onUpdate: (id: string, balance: number) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [type, setType] = useState<Account['type']>('wallet')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || Number(balance) < 0) return
    onAdd({ name: name.trim(), balance: Number(balance), type })
    setName('')
    setBalance('')
  }
  return (
    <Dialog title="Manage accounts" description="Update a balance or add another place where you keep money." onClose={onClose} className="dialog-wide">
      <div className="manage-list">
        {accounts.map((account) => (
          <div className="manage-row" key={account.id}>
            <span><strong>{account.name}</strong><small>{account.type}</small></span>
            <label><span className="sr-only">{account.name} balance</span><input type="number" min="0" value={account.balance} onChange={(event) => onUpdate(account.id, Number(event.target.value))} /></label>
            <button className="icon-button danger-button" onClick={() => onDelete(account.id)} disabled={accounts.length === 1} aria-label={`Delete ${account.name}`}><Trash2 size={17} /></button>
          </div>
        ))}
      </div>
      <form className="add-account-form" onSubmit={submit}>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Account name" required /></label>
        <label>Type<select value={type} onChange={(event) => setType(event.target.value as Account['type'])}><option value="cash">Cash</option><option value="wallet">E-wallet</option><option value="bank">Bank</option></select></label>
        <label>Balance<input type="number" min="0" value={balance} onChange={(event) => setBalance(event.target.value)} placeholder="0" required /></label>
        <button className="secondary" type="submit"><Plus size={17} />Add account</button>
      </form>
    </Dialog>
  )
}

function CheckInDialog({ data, onComplete, onClose }: { data: BudgetData; onComplete: (cashBalance: number) => void; onClose: () => void }) {
  const cash = data.accounts.find((account) => account.type === 'cash')
  const [cashBalance, setCashBalance] = useState(String(cash?.balance ?? 0))
  const [checks, setChecks] = useState([false, false, false])
  const items = ['I recorded today’s cash activity', 'I reviewed uncategorized activity', 'I checked expected income']
  return (
    <Dialog title="Daily check-in" description="One minute now keeps the next forecast honest." onClose={onClose}>
      <div className="check-in-orb"><ListChecks size={24} /></div>
      <div className="check-in-list">
        {items.map((item, index) => (
          <button key={item} className={checks[index] ? 'check-in-row complete' : 'check-in-row'} onClick={() => setChecks((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}>
            <span>{checks[index] ? <Check size={14} /> : index + 1}</span>{item}<ChevronRight size={18} />
          </button>
        ))}
      </div>
      <label className="field-label">Cash on hand<input type="number" min="0" value={cashBalance} onChange={(event) => setCashBalance(event.target.value)} /></label>
      <button className="primary wide" onClick={() => onComplete(Number(cashBalance))} disabled={checks.some((item) => !item)}>Complete check-in</button>
    </Dialog>
  )
}

function AffordabilityDialog({ data, forecast, onSave, onClose }: {
  data: BudgetData
  forecast: ReturnType<typeof calculateForecast>
  onSave: (item: Omit<WishlistItem, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [desiredDate, setDesiredDate] = useState(todayKey())
  const [priority, setPriority] = useState<WishlistItem['priority']>('medium')
  const numericPrice = Number(price)
  const result = numericPrice > 0 ? checkAffordability({ price: numericPrice }, forecast, data) : null
  const save = () => {
    if (!name.trim() || numericPrice <= 0) return
    onSave({ name: name.trim(), price: numericPrice, desiredDate, priority })
  }
  return (
    <Dialog title="Check affordability" description="See the earliest safe date without dipping into protected money." onClose={onClose}>
      <div className="form-stack">
        <label>What are you considering?<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. New headphones" /></label>
        <div className="form-grid">
          <label>Estimated price<input type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" /></label>
          <label>Desired date<input type="date" value={desiredDate} onChange={(event) => setDesiredDate(event.target.value)} /></label>
        </div>
        <label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value as WishlistItem['priority'])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        {result && (
          <div className={result.affordableNow ? 'affordability-result safe' : 'affordability-result wait'}>
            {result.affordableNow ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            <span><strong>{result.affordableNow ? 'Affordable now' : result.earliestDate ? `Safer on ${new Date(`${result.earliestDate}T12:00:00`).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}` : 'Not within the next 90 days'}</strong>
            <small>{result.affordableNow ? `${money.format(forecast.safeToSpend - numericPrice)} remains flexible after purchase.` : `Today’s protected shortfall is ${money.format(result.shortfall)}.`}</small></span>
          </div>
        )}
        <button className="primary wide" onClick={save} disabled={!name.trim() || numericPrice <= 0}>Save to wishlist</button>
      </div>
    </Dialog>
  )
}

function SettingsDialog({ settings, theme, resetLabel, onSave, onTheme, onReset, onClose }: {
  settings: BudgetSettings
  theme: 'light' | 'dark'
  resetLabel: string
  onSave: (settings: BudgetSettings) => void
  onTheme: (theme: 'light' | 'dark') => void
  onReset: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(settings)
  const save = () => { onSave(draft); onClose() }
  return (
    <Dialog title="Settings" description="Tune the guardrails used in every forecast." onClose={onClose} className="dialog-wide">
      <div className="connection-grid">
        <div><Database size={18} /><span><strong>Supabase</strong><small>{environmentStatus.supabase ? 'Environment connected' : environmentStatus.supabasePartial ? 'One environment value is missing' : 'Local mode—add environment values to connect'}</small></span><i className={environmentStatus.supabase ? 'status-dot online' : 'status-dot'} /></div>
        <div><Bot size={18} /><span><strong>AI coaching</strong><small>{environmentStatus.aiCoaching ? 'Endpoint ready' : 'Local coaching—add an endpoint to connect'}</small></span><i className={environmentStatus.aiCoaching ? 'status-dot online' : 'status-dot'} /></div>
      </div>
      <div className="settings-grid">
        <label>Emergency floor<input type="number" min="0" value={draft.emergencyFloor} onChange={(event) => setDraft({ ...draft, emergencyFloor: Number(event.target.value) })} /></label>
        <label>Monthly savings target<input type="number" min="0" value={draft.savingsTarget} onChange={(event) => setDraft({ ...draft, savingsTarget: Number(event.target.value) })} /></label>
        <label>Allowance amount<input type="number" min="0" value={draft.allowanceAmount} onChange={(event) => setDraft({ ...draft, allowanceAmount: Number(event.target.value) })} /></label>
        <label>Allowance days<input value={draft.allowanceDays.join(', ')} onChange={(event) => {
          const days = event.target.value.split(',').map(Number).filter((value) => value >= 1 && value <= 31)
          if (days.length >= 2) setDraft({ ...draft, allowanceDays: [days[0], days[1]] })
        }} /></label>
      </div>
      <div className="theme-row"><span><strong>Appearance</strong><small>Switch without losing your data.</small></span><div className="segmented"><button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')}><Sun size={15} />Light</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')}><Moon size={15} />Dark</button></div></div>
      <div className="dialog-actions"><button className="text-button danger-text" onClick={onReset}>{resetLabel}</button><button className="primary" onClick={save}>Save settings</button></div>
    </Dialog>
  )
}

function App() {
  const [data, setData] = useState(() => loadBudgetData(appConfig.demoMode))
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())
  const [modal, setModal] = useState<Modal>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [remoteCoach, setRemoteCoach] = useState<CoachResponse | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)
  const [coachError, setCoachError] = useState('')
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const forecast = useMemo(() => calculateForecast(data, selectedMonth), [data, selectedMonth])
  const localCoach = useMemo(() => createLocalCoaching(forecast, data), [forecast, data])
  const coach = remoteCoach ?? localCoach
  const monthActivity = data.transactions.filter((item) => item.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date))
  const visibleActivity = showAllActivity ? monthActivity : monthActivity.slice(0, 4)
  const accountName = (id: string) => data.accounts.find((account) => account.id === id)?.name ?? 'Unknown account'
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const commit = (next: BudgetData, message?: string) => { setData(next); saveBudgetData(next); setRemoteCoach(null); if (message) showToast(message) }

  const saveTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const next = {
      ...data,
      transactions: [{ ...transaction, id: uid() }, ...data.transactions],
      accounts: data.accounts.map((account) => account.id === transaction.accountId ? {
        ...account,
        balance: Math.max(0, account.balance + (transaction.kind === 'income' ? transaction.amount : -transaction.amount)),
        updatedAt: new Date().toISOString(),
      } : account),
    }
    commit(next, 'Transaction saved. Forecast updated.')
    setModal(null)
  }

  const refreshCoach = async () => {
    if (!environmentStatus.aiCoaching) { setModal('settings'); return }
    setCoachLoading(true)
    setCoachError('')
    try { setRemoteCoach(await requestAICoaching(forecast, data)) }
    catch (error) { setCoachError(error instanceof Error ? error.message : 'AI coaching is unavailable.'); setRemoteCoach(null) }
    finally { setCoachLoading(false) }
  }

  const setAppTheme = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#07101c' : '#f3f7fc')
    localStorage.setItem('budget-tracker-theme', nextTheme)
  }

  const essentials = [
    { label: 'Food', icon: Utensils },
    { label: 'Transport', icon: ArrowRight },
    { label: 'Wi-Fi', icon: Wifi },
    { label: 'Mobile load', icon: CreditCard },
  ]
  const totalBudget = Object.values(data.settings.categoryBudgets).reduce((sum, value) => sum + value, 0)
  const runwayProgress = Math.min(100, Math.max(4, (forecast.daysElapsed / Math.max(1, forecast.daysElapsed + forecast.daysRemaining)) * 100))
  const todayMarker = Math.min(78, Math.max(18, runwayProgress))

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand"><span className="brand-mark"><PiggyBank size={20} /></span><span>Budget</span></div>
        <nav aria-label="Primary navigation">
          <a className="nav-item active" href="#overview" onClick={() => setMenuOpen(false)}><LayoutDashboard size={19} />Overview</a>
          <a className="nav-item" href="#activity" onClick={() => setMenuOpen(false)}><CircleDollarSign size={19} />Activity</a>
          <a className="nav-item" href="#wishlist" onClick={() => setMenuOpen(false)}><ShoppingBag size={19} />Wishlist</a>
          <a className="nav-item" href="#insights" onClick={() => setMenuOpen(false)}><Sparkles size={19} />Insights</a>
        </nav>
        <div className="sidebar-bottom">
          <button className="check-in-button" onClick={() => setModal('checkin')}><span><ListChecks size={19} /></span><span><strong>Daily check-in</strong><small>{data.lastCheckIn === todayKey() ? 'Complete for today' : 'Due at 9:00 PM'}</small></span></button>
          <button className="nav-item nav-button" onClick={() => setModal('settings')}><Settings size={19} />Settings</button>
          <button className="profile profile-button" onClick={() => setModal('settings')}><span className="avatar">C</span><span><strong>My budget</strong><small>Local vault unlocked</small></span><ChevronRight size={17} /></button>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <button className="mobile-menu icon-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation"><Menu size={20} /></button>

      <main>
        <header className="topbar">
          <div><p className="date">{fullDate.format(new Date())}</p><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}.</h1></div>
          <div className="top-actions">
            <span className="secure-status"><LockKeyhole size={15} />Private local vault</span>
            <div className="notification-wrap">
              <button className="icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><Bell size={19} /><i /></button>
              {notificationsOpen && <div className="notification-panel"><div><strong>Forecast updated</strong><small>Your spending pace is reflected in the new month-end estimate.</small></div><div><strong>Daily check-in</strong><small>{data.lastCheckIn === todayKey() ? 'You are all caught up.' : 'Cash confirmation is still due today.'}</small></div><button className="text-button" onClick={() => { setNotificationsOpen(false); setModal('checkin') }}>Open check-in</button></div>}
            </div>
            <button className="primary" onClick={() => setModal('transaction')}><Plus size={18} />Add transaction</button>
          </div>
        </header>

        <section className="runway" id="overview">
          <div className="runway-head">
            <div><p>Your month at a glance</p><div className="balance-row"><h2>{money.format(forecast.currentBalance)}</h2><span className={forecast.monthIncome - forecast.monthSpending >= 0 ? 'trend' : 'trend negative'}>{forecast.monthIncome - forecast.monthSpending >= 0 ? '+' : '−'}{money.format(Math.abs(forecast.monthIncome - forecast.monthSpending))} this month</span></div><span className="subtle">Across {data.accounts.length} account{data.accounts.length === 1 ? '' : 's'} · forecast updates with every entry</span></div>
            <label className="month-control"><span className="sr-only">Forecast month</span><input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /><CalendarDays size={17} /></label>
          </div>
          <div className="runway-track" aria-label={`${monthLabel(selectedMonth)} budget timeline`}>
            <div className="track-line"><span style={{ width: `${runwayProgress}%` }} /></div>
            <div className="track-point start"><i /><span>Month start<small>{money.format(forecast.currentBalance - forecast.monthIncome + forecast.monthSpending)}</small></span></div>
            <div className="track-point today" style={{ left: `${todayMarker}%` }}><i /><span>{selectedMonth === currentMonthKey() ? 'Today' : 'Recorded'}<small>{money.format(forecast.currentBalance)} available</small></span></div>
            <div className="track-point finish"><i /><span>Month end<small>{money.format(forecast.projectedMonthEnd)} projected</small></span></div>
          </div>
          <div className="forecast-strip">
            <div><ShieldCheck size={19} /><span><strong>{money.format(data.settings.emergencyFloor)}</strong><small>Emergency floor protected</small></span></div>
            <div><PiggyBank size={19} /><span><strong>{money.format(forecast.projectedSavings)}</strong><small>Projected month-end savings</small></span></div>
            <button className="forecast-detail" onClick={() => setModal('assumptions')}><BarChart3 size={19} /><span><strong>{Math.round(forecast.confidenceScore * 100)}% {forecast.confidence} confidence</strong><small>{forecast.dataDays} activity days · see assumptions</small></span><ChevronRight size={17} /></button>
          </div>
        </section>

        <section className="coach-panel" id="insights">
          <div className="coach-intro"><span className="coach-mark"><Bot size={23} /></span><div><h2>Forecast coach</h2><p>{coach.summary}</p></div><span className="source-pill">{coach.source === 'remote' ? <><Cloud size={13} /> Connected AI</> : <><Database size={13} /> On-device</>}</span><button className="icon-button coach-refresh" aria-label="Refresh AI coaching" onClick={refreshCoach} disabled={coachLoading}><RefreshCw size={17} className={coachLoading ? 'spinning' : ''} /></button></div>
          {coachError && <div className="inline-error"><AlertCircle size={16} />{coachError} Local coaching remains active.</div>}
          <div className="coach-grid">
            {coach.insights.map((insight) => <article className={`coach-insight ${insight.tone}`} key={insight.id}><i /><h3>{insight.title}</h3><p>{insight.body}</p><button className="text-button" onClick={() => insight.id === 'safe-to-spend' ? setModal('affordability') : insight.id === 'spending-pace' ? document.querySelector('#activity')?.scrollIntoView() : setModal('assumptions')}>{insight.action}<ChevronRight size={15} /></button></article>)}
          </div>
        </section>

        <section className="accounts-section">
          <div className="section-heading"><div><h2>Your money</h2><p>Balances reflect saved entries and check-ins.</p></div><button className="text-button" onClick={() => setModal('accounts')}>Manage accounts <ChevronRight size={16} /></button></div>
          <div className="account-row">
            {data.accounts.map((account) => <article className={`account ${account.type}`} key={account.id}><div className="account-top"><span className="account-symbol"><WalletCards size={18} /></span><small>{new Date(account.updatedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</small></div><p>{account.name}</p><strong>{money.format(account.balance)}</strong></article>)}
            <button className="account add-account" onClick={() => setModal('accounts')}><Plus size={20} /><span>Add account</span></button>
          </div>
        </section>

        <div className="lower-grid">
          <section className="essentials">
            <div className="section-heading compact"><div><h2>Protected essentials</h2><p>{money.format(forecast.remainingEssentials)} still reserved.</p></div><span className={`confidence ${forecast.confidence}`}>{forecast.confidence} confidence</span></div>
            <div className="essential-list">{essentials.map(({ label, icon: Icon }) => {
              const spent = forecast.spendByCategory[label] ?? 0
              const budget = data.settings.categoryBudgets[label] ?? 0
              return <div className="essential" key={label}><span className="essential-icon"><Icon size={18} /></span><div className="essential-main"><div><strong>{label}</strong><span>{money.format(spent)} of {money.format(budget)}</span></div><div className="progress"><span style={{ width: `${Math.min(100, budget ? (spent / budget) * 100 : 0)}%` }} /></div></div></div>
            })}</div>
            <div className="essential-total"><span>Plan coverage</span><strong>{totalBudget ? Math.round(((totalBudget - forecast.remainingEssentials) / totalBudget) * 100) : 0}% used</strong></div>
          </section>

          <section className="activity" id="activity">
            <div className="section-heading compact"><div><h2>Recent activity</h2><p>{monthLabel(selectedMonth)}</p></div>{monthActivity.length > 4 && <button className="text-button" onClick={() => setShowAllActivity((value) => !value)}>{showAllActivity ? 'Show less' : 'See all'} <ChevronRight size={16} /></button>}</div>
            <div className="activity-list">{visibleActivity.length ? visibleActivity.map((item) => <div className="activity-row" key={item.id}><span className="activity-icon">{item.kind === 'income' ? <ArrowDownLeft size={18} /> : <CircleDollarSign size={18} />}</span><span className="activity-copy"><strong>{item.description}</strong><small>{item.category} · {accountName(item.accountId)}</small></span><strong className={item.kind === 'income' ? 'positive' : ''}>{item.kind === 'income' ? '+' : '−'}{money.format(item.amount)}</strong></div>) : <div className="empty-state">No activity in this month yet.</div>}</div>
            <button className="secondary wide" onClick={() => setModal('transaction')}><Plus size={16} />Add another transaction</button>
          </section>
        </div>

        <section className="wishlist-callout" id="wishlist">
          <span className="wish-icon"><ShoppingBag size={22} /></span><div><h2>Plan wants without borrowing from needs</h2><p>{data.wishlist.length ? `${data.wishlist.length} saved item${data.wishlist.length === 1 ? '' : 's'} · ${money.format(forecast.safeToSpend)} flexible today` : 'Check any purchase against essentials, your emergency floor, and savings target.'}</p></div><button className="secondary" onClick={() => setModal('affordability')}>Check affordability <ArrowRight size={17} /></button>
        </section>
      </main>

      {modal === 'transaction' && <TransactionDialog accounts={data.accounts} onSave={saveTransaction} onClose={() => setModal(null)} />}
      {modal === 'accounts' && <AccountsDialog accounts={data.accounts} onAdd={(account) => commit({ ...data, accounts: [...data.accounts, { ...account, id: uid(), updatedAt: new Date().toISOString() }] }, 'Account added.')} onUpdate={(id, balance) => commit({ ...data, accounts: data.accounts.map((account) => account.id === id ? { ...account, balance: Math.max(0, balance), updatedAt: new Date().toISOString() } : account) })} onDelete={(id) => commit({ ...data, accounts: data.accounts.filter((account) => account.id !== id), transactions: data.transactions.filter((item) => item.accountId !== id) }, 'Account removed.')} onClose={() => setModal(null)} />}
      {modal === 'checkin' && <CheckInDialog data={data} onComplete={(cashBalance) => { commit({ ...data, lastCheckIn: todayKey(), accounts: data.accounts.map((account) => account.type === 'cash' ? { ...account, balance: cashBalance, updatedAt: new Date().toISOString() } : account) }, 'Check-in complete. Forecast refreshed.'); setModal(null) }} onClose={() => setModal(null)} />}
      {modal === 'affordability' && <AffordabilityDialog data={data} forecast={forecast} onSave={(item) => { commit({ ...data, wishlist: [...data.wishlist, { ...item, id: uid() }] }, 'Saved to your wishlist.'); setModal(null) }} onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsDialog settings={data.settings} theme={theme} resetLabel={appConfig.demoMode ? 'Reset demo data' : 'Clear all data'} onSave={(settings) => commit({ ...data, settings }, 'Settings saved. Forecast recalculated.')} onTheme={setAppTheme} onReset={() => { commit(resetBudgetData(appConfig.demoMode), appConfig.demoMode ? 'Demo data restored.' : 'Local data cleared.'); setModal(null) }} onClose={() => setModal(null)} />}
      {modal === 'assumptions' && <Dialog title="Forecast assumptions" description="Every prediction stays traceable to data you can review." onClose={() => setModal(null)}><div className="assumption-list"><div><span>Current funds</span><strong>{money.format(forecast.currentBalance)}</strong></div><div><span>Expected allowance</span><strong>+{money.format(forecast.expectedIncome)}</strong></div><div><span>Remaining essentials</span><strong>−{money.format(forecast.remainingEssentials)}</strong></div><div><span>Uncertainty hold</span><strong>−{money.format(forecast.uncertaintyHold)}</strong></div><div className="assumption-total"><span>Projected month end</span><strong>{money.format(forecast.projectedMonthEnd)}</strong></div></div><ul className="reason-list">{forecast.confidenceReasons.map((reason) => <li key={reason}><CheckCircle2 size={15} />{reason}</li>)}</ul></Dialog>}
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  )
}

export default App
