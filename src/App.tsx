import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Database,
  ListChecks,
  LockKeyhole,
  Moon,
  PiggyBank,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Trash2,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { appConfig, environmentStatus } from './config'
import { loadBudgetData, resetBudgetData, saveBudgetData } from './data'
import { calculateForecast, checkAffordability, currentMonthKey } from './forecast'
import type { Account, BudgetData, BudgetSettings, Transaction, WishlistItem } from './types'

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
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const forecast = useMemo(() => calculateForecast(data, selectedMonth), [data, selectedMonth])
  const monthActivity = data.transactions.filter((item) => item.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date))
  const visibleActivity = showAllActivity ? monthActivity : monthActivity.slice(0, 4)
  const accountName = (id: string) => data.accounts.find((account) => account.id === id)?.name ?? 'Unknown account'
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const commit = (next: BudgetData, message?: string) => { setData(next); saveBudgetData(next); if (message) showToast(message) }

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
  const usedBudget = Math.max(0, totalBudget - forecast.remainingEssentials)
  const planProgress = totalBudget ? Math.min(100, (usedBudget / totalBudget) * 100) : 0
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark"><PiggyBank size={20} /></span><span>Budget</span></div>
        <div className="header-actions">
          <span className="secure-status"><LockKeyhole size={15} />Saved on this device</span>
          <button className="icon-button" onClick={() => setModal('settings')} aria-label="Open settings"><Settings size={19} /></button>
          <button className="primary" onClick={() => setModal(data.accounts.length ? 'transaction' : 'accounts')}><Plus size={18} />{data.accounts.length ? 'Add transaction' : 'Add account'}</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="page-heading">
          <div><p className="date">{fullDate.format(new Date())}</p><h1>Your budget</h1></div>
          <label className="month-control"><span className="sr-only">Forecast month</span><input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /><CalendarDays size={17} /></label>
        </div>

        <section className="overview-grid" id="overview">
          <article className="safe-card">
            <div className="safe-card-head">
              <span><ShieldCheck size={18} />Safe to spend</span>
              <button onClick={() => setModal('assumptions')}>{Math.round(forecast.confidenceScore * 100)}% confidence <ChevronRight size={14} /></button>
            </div>
            <strong className="safe-amount">{money.format(forecast.safeToSpend)}</strong>
            <div className="safe-stats">
              <div><span>Balance</span><strong>{money.format(forecast.currentBalance)}</strong></div>
              <div><span>Essentials</span><strong>{money.format(forecast.remainingEssentials)}</strong></div>
              <div><span>Savings</span><strong>{money.format(forecast.projectedSavings)}</strong></div>
            </div>
            <div className="safe-actions">
              <button className="primary light" onClick={() => setModal(data.accounts.length ? 'transaction' : 'accounts')}><Plus size={17} />{data.accounts.length ? 'Log spending' : 'Add an account'}</button>
              <button className="ghost-light" onClick={() => setModal('affordability')}>Check a purchase</button>
            </div>
          </article>

        </section>

        <section className="quick-actions" aria-label="Quick actions">
          <button className="action-card" onClick={() => setModal(data.accounts.length ? 'transaction' : 'accounts')}><span className="action-icon blue"><CircleDollarSign size={20} /></span><span><strong>{data.accounts.length ? 'Add transaction' : 'Add first account'}</strong></span><ChevronRight size={18} /></button>
          <button className="action-card" onClick={() => setModal('checkin')}><span className="action-icon green"><ListChecks size={20} /></span><span><strong>Daily check-in</strong></span>{data.lastCheckIn === todayKey() ? <CheckCircle2 className="done-icon" size={19} /> : <ChevronRight size={18} />}</button>
          <button className="action-card" onClick={() => setModal('affordability')}><span className="action-icon amber"><ShoppingBag size={20} /></span><span><strong>Check a purchase</strong></span><ChevronRight size={18} /></button>
        </section>

        <section className="detail-grid">
          <article className="content-card accounts-card">
            <div className="section-heading"><div><h2>Accounts</h2><p>{money.format(forecast.currentBalance)} total</p></div><button className="text-button" onClick={() => setModal('accounts')}>Manage <ChevronRight size={16} /></button></div>
            <div className="account-list">{data.accounts.length ? data.accounts.map((account) => <div className="account-item" key={account.id}><span className={`account-symbol ${account.type}`}><WalletCards size={18} /></span><span><strong>{account.name}</strong><small>Updated {new Date(account.updatedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</small></span><strong>{money.format(account.balance)}</strong></div>) : <div className="empty-state"><WalletCards size={22} /><strong>No accounts yet</strong></div>}</div>
            <button className="secondary wide" onClick={() => setModal('accounts')}><Plus size={16} />Manage accounts</button>
          </article>

          <article className="content-card activity-card" id="activity">
            <div className="section-heading"><div><h2>Recent activity</h2><p>{monthLabel(selectedMonth)}</p></div>{monthActivity.length > 4 && <button className="text-button" onClick={() => setShowAllActivity((value) => !value)}>{showAllActivity ? 'Show less' : 'See all'} <ChevronRight size={16} /></button>}</div>
            <div className="activity-list">{visibleActivity.length ? visibleActivity.map((item) => <div className="activity-row" key={item.id}><span className={`activity-icon ${item.kind}`}>{item.kind === 'income' ? <ArrowDownLeft size={18} /> : <CircleDollarSign size={18} />}</span><span className="activity-copy"><strong>{item.description}</strong><small>{item.category} · {accountName(item.accountId)}</small></span><strong className={item.kind === 'income' ? 'positive' : ''}>{item.kind === 'income' ? '+' : '−'}{money.format(item.amount)}</strong></div>) : <div className="empty-state"><CircleDollarSign size={22} /><strong>No activity yet</strong></div>}</div>
            <button className="secondary wide" onClick={() => setModal(data.accounts.length ? 'transaction' : 'accounts')}><Plus size={16} />{data.accounts.length ? 'Add transaction' : 'Add account'}</button>
          </article>
        </section>

        <section className="content-card plan-card">
          <div className="section-heading">
            <div><h2>Monthly plan</h2><p>{money.format(forecast.remainingEssentials)} reserved</p></div>
            <button className="confidence-button" onClick={() => setModal('assumptions')}><BarChart3 size={16} />Forecast</button>
          </div>
          <div className="plan-summary"><div className="plan-track"><span style={{ width: `${planProgress}%` }} /></div><span>{Math.round(planProgress)}% used</span></div>
          <div className="essential-list">{essentials.map(({ label, icon: Icon }) => {
            const spent = forecast.spendByCategory[label] ?? 0
            const budget = data.settings.categoryBudgets[label] ?? 0
            return <div className="essential" key={label}><span className="essential-icon"><Icon size={18} /></span><div className="essential-main"><div><strong>{label}</strong><span>{money.format(spent)} / {money.format(budget)}</span></div><div className="progress"><span style={{ width: `${Math.min(100, budget ? (spent / budget) * 100 : 0)}%` }} /></div></div></div>
          })}</div>
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
