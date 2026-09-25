import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthScreen } from '../components/AuthScreen';
import { BillModal } from '../components/BillModal';
import { CategoryModal } from '../components/CategoryModal';
import { Charts } from '../components/Charts';
import { FilterBar } from '../components/FilterBar';
import { ContributeModal, GoalModal } from '../components/GoalModal';
import { Header } from '../components/Header';
import { PartnerInviteModal } from '../components/PartnerInviteModal';
import { ProfileModal } from '../components/ProfileModal';
import { StockModal } from '../components/StockModal';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionItem } from '../components/TransactionItem';
import { WorkspaceModal } from '../components/WorkspaceModal';
import { THEME, formatCurrency } from '../lib/constants';
import { DataService } from '../lib/dataService';
import { supabase } from '../lib/supabase';
import {
  Bill,
  Category,
  CurrencyCode,
  FilterOptions,
  FinancialGoal,
  PaymentMethod,
  StockInvestment,
  Transaction,
  UserProfile,
  Workspace,
} from '../lib/types';

export default function Index() {
  const dataService = useMemo(() => DataService.getInstance(), []);

  // Main App State
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [investments, setInvestments] = useState<StockInvestment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  // Active Tab: 'overview' | 'goals' | 'stocks' | 'stats' | 'bills' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'stocks' | 'stats' | 'bills' | 'settings'>('overview');

  // Modals visibility
  const [showTxModal, setShowTxModal] = useState(false);
  const [txInitialType, setTxInitialType] = useState<'expense' | 'income' | 'investment' | 'bill'>('expense');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoalForContribute, setSelectedGoalForContribute] = useState<FinancialGoal | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPartnerInviteModal, setShowPartnerInviteModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    period: 'all',
    type: 'all',
    paidBy: 'all',
  });

  // Load and initialize data
  const loadAppData = async () => {
    try {
      await dataService.initialize();
      const p = await dataService.getProfile();
      const wsList = await dataService.getWorkspaces();
      const activeWs = await dataService.getActiveWorkspace();
      const cats = await dataService.getCategories();
      const pms = await dataService.getPaymentMethods();
      const txs = await dataService.getTransactions();
      const g = await dataService.getFinancialGoals();
      const invs = await dataService.getStockInvestments();
      const b = await dataService.getBills();

      setProfile(p);
      setWorkspaces(wsList);
      setActiveWorkspace(activeWs);
      setCategories(cats);
      setPaymentMethods(pms);
      setTransactions(txs);
      setGoals(g);
      setInvestments(invs);
      setBills(b);
    } catch (err) {
      console.log('Error initializing NuPra data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check Supabase session or fallback to storage
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
        loadAppData();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    } else {
      loadAppData();
      setIsAuthenticated(true);
    }
  }, [dataService]);

  // Currency helper
  const currentCurrency: CurrencyCode = profile?.preferred_currency || activeWorkspace?.currency || 'INR';

  const handleToggleCurrency = async (newCurrency: CurrencyCode) => {
    if (!profile) return;
    const updated = await dataService.updateProfile({ preferred_currency: newCurrency });
    setProfile(updated);
  };

  // Handlers for data actions
  const handleSaveTransaction = async (newTx: Omit<Transaction, 'id' | 'created_at'>) => {
    const saved = await dataService.addTransaction(newTx);
    setTransactions((prev) => [saved, ...prev]);
  };

  const handleDeleteTransaction = async (id: string) => {
    await dataService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveGoal = async (newGoal: Omit<FinancialGoal, 'id'>) => {
    const saved = await dataService.addFinancialGoal(newGoal);
    setGoals((prev) => [saved, ...prev]);
  };

  const handleContributeToGoal = async (goalId: string, amount: number) => {
    if (!profile) return;
    const updatedGoal = await dataService.contributeToGoal(goalId, amount, profile.display_name || 'Me');
    if (updatedGoal) {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));
      const freshTxs = await dataService.getTransactions();
      setTransactions(freshTxs);
    }
  };

  const handleSaveStock = async (newInv: Omit<StockInvestment, 'id'>) => {
    const saved = await dataService.addStockInvestment(newInv);
    setInvestments((prev) => [saved, ...prev]);
    const freshTxs = await dataService.getTransactions();
    setTransactions(freshTxs);
  };

  const handleSaveBill = async (newBill: Omit<Bill, 'id'>) => {
    const saved = await dataService.addBill(newBill);
    setBills((prev) => [saved, ...prev]);
  };

  const handleMarkBillPaid = async (billId: string) => {
    if (!profile) return;
    const updated = await dataService.markBillAsPaid(billId, profile.id, profile.display_name || 'Me');
    if (updated) {
      setBills((prev) => prev.map((b) => (b.id === billId ? updated : b)));
      const freshTxs = await dataService.getTransactions();
      setTransactions(freshTxs);
    }
  };

  const handleSaveCategory = async (newCat: Omit<Category, 'id'>) => {
    const saved = await dataService.addCategory(newCat);
    setCategories((prev) => [saved, ...prev]);
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const p = await dataService.updateProfile(updated);
    setProfile(p);
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const handleCreateCoupleSpace = async (name: string, partnerName: string) => {
    if (!profile) return;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: name,
      type: 'couple',
      currency: profile.preferred_currency,
      invite_code: `NUPRA${Math.floor(1000 + Math.random() * 9000)}`,
      owner_id: profile.id,
      partner_id: `usr-partner-${Date.now()}`,
      partner_name: partnerName,
    };
    const updatedWorkspaces = [...workspaces, newWs];
    setWorkspaces(updatedWorkspaces);
    await dataService.setActiveWorkspace(newWs);
    setActiveWorkspace(newWs);
  };

  const handleExportReport = async () => {
    const reportText = `NuPra Finance - Couple Financial Statement\nWorkspace: ${activeWorkspace?.name}\nDate: ${new Date().toLocaleDateString()}\n\nTransactions Count: ${transactions.length}\nGoals Count: ${goals.length}\nInvestments Count: ${investments.length}\nBills Count: ${bills.length}\n\nGenerated with NuPra Finance App.`;
    try {
      await Share.share({ message: reportText, title: 'NuPra Financial Statement' });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.category_name?.toLowerCase().includes(q);
        const matchesPayer = t.paid_by_name?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesPayer) return false;
      }

      // Period filter
      if (filters.period !== 'all') {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth() + 1;
        const [tYear, tMonth] = t.transaction_date.split('-').map(Number);

        if (filters.period === 'this_month') {
          if (tYear !== curYear || tMonth !== curMonth) return false;
        } else if (filters.period === 'last_month') {
          const lastMonth = curMonth === 1 ? 12 : curMonth - 1;
          const lastMonthYear = curMonth === 1 ? curYear - 1 : curYear;
          if (tYear !== lastMonthYear || tMonth !== lastMonth) return false;
        } else if (filters.period === 'this_year') {
          if (tYear !== curYear) return false;
        }
      }

      // Type filter
      if (filters.type !== 'all') {
        if (filters.type === 'expense' && t.type !== 'expense' && t.type !== 'bill') return false;
        if (filters.type !== 'expense' && t.type !== filters.type) return false;
      }

      // Payer filter
      if (filters.paidBy !== 'all' && profile) {
        if (filters.paidBy === 'me' && t.paid_by !== profile.id) return false;
        if (filters.paidBy === 'partner' && t.paid_by === profile.id) return false;
      }

      return true;
    });
  }, [transactions, filters, profile]);

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <View style={styles.loadingGlow}>
          <ActivityIndicator size="large" color={THEME.colors.primaryLight} />
          <Text style={styles.loadingText}>Loading NuPra Finance...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated && !profile) {
    return (
      <AuthScreen
        onLoginSuccess={(userProf) => {
          setProfile(userProf);
          setIsAuthenticated(true);
          loadAppData();
        }}
        onContinueAsGuest={() => {
          setIsAuthenticated(true);
          loadAppData();
        }}
      />
    );
  }

  const currentProfile = profile || {
    id: 'usr-guest',
    email: 'guest@nupra.app',
    display_name: 'Nu',
    preferred_currency: 'INR',
  };

  const currentWs = activeWorkspace || {
    id: 'ws-couple-default',
    name: 'Nu & Pra Shared Space 💍',
    type: 'couple',
    currency: currentCurrency,
    owner_id: currentProfile.id,
    partner_name: 'Pra',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Header */}
      <Header
        profile={currentProfile}
        workspace={currentWs}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenWorkspaceModal={() => setShowWorkspaceModal(true)}
        onToggleCurrency={handleToggleCurrency}
        onOpenPartnerInvite={() => setShowPartnerInviteModal(true)}
      />

      {/* Main Body per Active Tab */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScroll}
        style={{ flex: 1 }}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View>
            {/* Hero Couple Summary Card */}
            <SummaryCard
              transactions={transactions}
              profile={currentProfile}
              workspace={currentWs}
              currency={currentCurrency}
              onAddExpense={() => {
                setTxInitialType('expense');
                setShowTxModal(true);
              }}
              onAddIncome={() => {
                setTxInitialType('income');
                setShowTxModal(true);
              }}
              onAddInvestment={() => setShowStockModal(true)}
              onAddGoal={() => setShowGoalModal(true)}
            />

            {/* Category Budget Tracker Section */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <Ionicons name="pie-chart" size={18} color={THEME.colors.primaryLight} />
                  <Text style={styles.sectionTitle}>Budget & Categories</Text>
                </View>
                <Pressable onPress={() => setShowCategoryModal(true)} style={styles.sectionActionLink}>
                  <Ionicons name="add" size={14} color={THEME.colors.primaryLight} />
                  <Text style={styles.sectionActionText}>Custom Category</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetScroll}>
                {categories.slice(0, 7).map((cat) => {
                  const spentInCat = transactions
                    .filter((t) => t.category_name === cat.name && (t.type === 'expense' || t.type === 'bill'))
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                  const budget = cat.monthly_budget || 15000;
                  const pct = Math.min(100, Math.round((spentInCat / budget) * 100));

                  return (
                    <View key={cat.id} style={[styles.budgetCard, { borderColor: cat.color + '40' }]}>
                      <View style={styles.budgetCardTop}>
                        <View style={[styles.catIconWrap, { backgroundColor: cat.color + '25' }]}>
                          <Ionicons name={(cat.icon as any) || 'pricetag'} size={14} color={cat.color} />
                        </View>
                        <Text style={styles.catCardName}>{cat.name}</Text>
                      </View>
                      <Text style={styles.catSpent}>{formatCurrency(spentInCat, currentCurrency)}</Text>
                      <Text style={styles.catLimit}>Limit: {formatCurrency(budget, currentCurrency)}</Text>
                      <View style={styles.budgetTrack}>
                        <View style={[styles.budgetFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Upcoming Unpaid Bills Glance */}
            {bills.filter((b) => !b.is_paid).length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleWithIcon}>
                    <Ionicons name="receipt" size={18} color={THEME.colors.accent} />
                    <Text style={styles.sectionTitle}>Upcoming Bills</Text>
                  </View>
                  <Pressable onPress={() => setActiveTab('bills')} style={styles.sectionActionLink}>
                    <Text style={styles.sectionActionText}>View All</Text>
                  </Pressable>
                </View>

                {bills
                  .filter((b) => !b.is_paid)
                  .slice(0, 2)
                  .map((bill) => (
                    <View key={bill.id} style={styles.miniBillCard}>
                      <View style={styles.miniBillLeft}>
                        <Ionicons name="alert-circle" size={18} color={THEME.colors.accent} />
                        <View>
                          <Text style={styles.miniBillTitle}>{bill.title}</Text>
                          <Text style={styles.miniBillDue}>Due {bill.due_date} • Assigned to {bill.assigned_to_name || 'You'}</Text>
                        </View>
                      </View>
                      <View style={styles.miniBillRight}>
                        <Text style={styles.miniBillAmount}>{formatCurrency(bill.amount, currentCurrency)}</Text>
                        <Pressable style={styles.miniPayBtn} onPress={() => handleMarkBillPaid(bill.id)}>
                          <Text style={styles.miniPayBtnText}>Pay</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Filter Bar & Recent Transactions */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <Ionicons name="time" size={18} color={THEME.colors.primaryLight} />
                  <Text style={styles.sectionTitle}>Recent Transactions</Text>
                </View>
                <Text style={styles.txCountText}>{filteredTransactions.length} records</Text>
              </View>

              <FilterBar
                filters={filters}
                categories={categories}
                workspace={currentWs}
                onUpdateFilters={(f) => setFilters((prev) => ({ ...prev, ...f }))}
                onResetFilters={() =>
                  setFilters({ searchQuery: '', period: 'all', type: 'all', paidBy: 'all' })
                }
              />

              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="receipt-outline" size={36} color={THEME.colors.textDim} />
                  <Text style={styles.emptyTitle}>No transactions found</Text>
                  <Text style={styles.emptySubtitle}>Tap the + buttons above to log your first shared expense!</Text>
                </View>
              ) : (
                filteredTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    profile={currentProfile}
                    workspace={currentWs}
                    currency={currentCurrency}
                    onDelete={handleDeleteTransaction}
                  />
                ))
              )}
            </View>
          </View>
        )}

        {/* TAB 2: GOALS */}
        {activeTab === 'goals' && (
          <View style={styles.sectionWrap}>
            <View style={styles.tabBannerRow}>
              <View>
                <Text style={styles.tabHeading}>Couple & Personal Goals 🎯</Text>
                <Text style={styles.tabSubheading}>
                  Track your shared dreams, wedding, vacation, house & safety funds.
                </Text>
              </View>
              <Pressable style={styles.addPrimaryBtn} onPress={() => setShowGoalModal(true)}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addPrimaryText}>New Goal</Text>
              </Pressable>
            </View>

            <View style={{ gap: 14 }}>
              {goals.map((goal) => {
                const current = Number(goal.current_amount) || 0;
                const target = Number(goal.target_amount) || 1;
                const neededMore = Math.max(0, target - current);
                const progressPct = Math.min(100, Math.round((current / target) * 100));

                return (
                  <View key={goal.id} style={[styles.goalFullCard, { borderColor: goal.color + '40' }]}>
                    <View style={styles.goalFullHeader}>
                      <View style={styles.goalFullLeft}>
                        <View style={[styles.goalFullIconWrap, { backgroundColor: goal.color + '25' }]}>
                          <Ionicons name={(goal.icon as any) || 'trophy'} size={22} color={goal.color} />
                        </View>
                        <View>
                          <Text style={styles.goalFullTitle}>{goal.title}</Text>
                          <Text style={styles.goalFullMeta}>
                            {goal.is_shared ? 'Shared Couple Goal 💍' : 'Personal Goal 👤'} • Due {goal.target_date || 'Ongoing'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.goalPctBadge, { backgroundColor: goal.color + '25' }]}>
                        <Text style={[styles.goalPctBadgeText, { color: goal.color }]}>{progressPct}%</Text>
                      </View>
                    </View>

                    {/* Numbers Row */}
                    <View style={styles.goalNumbersRow}>
                      <View>
                        <Text style={styles.goalNumLabel}>Saved so far</Text>
                        <Text style={[styles.goalNumVal, { color: THEME.colors.success }]}>
                          {formatCurrency(current, currentCurrency)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.goalNumLabel}>Target Goal</Text>
                        <Text style={styles.goalNumVal}>{formatCurrency(target, currentCurrency)}</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.goalBarBg}>
                      <View style={[styles.goalBarFill, { width: `${progressPct}%`, backgroundColor: goal.color }]} />
                    </View>

                    {/* Needed More & Contribute Bar */}
                    <View style={styles.goalFooterRow}>
                      <View>
                        <Text style={styles.neededLabel}>Amount Needed More</Text>
                        <Text style={styles.neededValue}>{formatCurrency(neededMore, currentCurrency)}</Text>
                      </View>

                      <Pressable
                        style={[styles.contributeActionBtn, { backgroundColor: goal.color }]}
                        onPress={() => {
                          setSelectedGoalForContribute(goal);
                          setShowContributeModal(true);
                        }}
                      >
                        <Ionicons name="sparkles" size={14} color="#FFF" />
                        <Text style={styles.contributeActionText}>Contribute Savings</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: STOCKS & INVESTMENTS */}
        {activeTab === 'stocks' && (
          <View style={styles.sectionWrap}>
            <View style={styles.tabBannerRow}>
              <View>
                <Text style={styles.tabHeading}>Stock Market Portfolio 📈</Text>
                <Text style={styles.tabSubheading}>
                  Monthly investments in stocks, ETFs, mutual funds & SIPs.
                </Text>
              </View>
              <Pressable style={styles.addPrimaryBtn} onPress={() => setShowStockModal(true)}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addPrimaryText}>Add Stock</Text>
              </Pressable>
            </View>

            {/* Portfolio Cards & Charts */}
            <Charts
              transactions={transactions}
              goals={goals}
              investments={investments}
              profile={currentProfile}
              workspace={currentWs}
              currency={currentCurrency}
            />
          </View>
        )}

        {/* TAB 4: STATISTICS */}
        {activeTab === 'stats' && (
          <View style={styles.sectionWrap}>
            <View style={styles.tabBannerRow}>
              <View>
                <Text style={styles.tabHeading}>Financial Analytics 📊</Text>
                <Text style={styles.tabSubheading}>
                  Individual vs together savings & expense distribution plots.
                </Text>
              </View>
            </View>

            <Charts
              transactions={transactions}
              goals={goals}
              investments={investments}
              profile={currentProfile}
              workspace={currentWs}
              currency={currentCurrency}
              onOpenContributeModal={(g) => {
                setSelectedGoalForContribute(g);
                setShowContributeModal(true);
              }}
            />
          </View>
        )}

        {/* TAB 5: BILLS */}
        {activeTab === 'bills' && (
          <View style={styles.sectionWrap}>
            <View style={styles.tabBannerRow}>
              <View>
                <Text style={styles.tabHeading}>Bills & Subscriptions 💳</Text>
                <Text style={styles.tabSubheading}>
                  Track unpaid vs paid bills and assign payments to each partner.
                </Text>
              </View>
              <Pressable style={styles.addPrimaryBtn} onPress={() => setShowBillModal(true)}>
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.addPrimaryText}>Add Bill</Text>
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              {bills.map((bill) => (
                <View
                  key={bill.id}
                  style={[
                    styles.billCard,
                    bill.is_paid && { opacity: 0.7, borderColor: THEME.colors.cardBorder },
                  ]}
                >
                  <View style={styles.billLeft}>
                    <View
                      style={[
                        styles.billStatusCircle,
                        { backgroundColor: bill.is_paid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' },
                      ]}
                    >
                      <Ionicons
                        name={bill.is_paid ? 'checkmark' : 'time'}
                        size={18}
                        color={bill.is_paid ? THEME.colors.success : '#EF4444'}
                      />
                    </View>
                    <View>
                      <Text style={styles.billTitleText}>{bill.title}</Text>
                      <Text style={styles.billMetaText}>
                        Due: {bill.due_date} • Assigned to {bill.assigned_to_name || 'You'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billRight}>
                    <Text style={styles.billAmountText}>{formatCurrency(bill.amount, currentCurrency)}</Text>
                    {bill.is_paid ? (
                      <View style={styles.paidBadge}>
                        <Text style={styles.paidBadgeText}>PAID</Text>
                      </View>
                    ) : (
                      <Pressable style={styles.payBtn} onPress={() => handleMarkBillPaid(bill.id)}>
                        <Text style={styles.payBtnText}>Mark Paid</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 6: SETTINGS & EXPORT */}
        {activeTab === 'settings' && (
          <View style={styles.sectionWrap}>
            <Text style={styles.tabHeading}>Settings & Cloud Sync ⚙️</Text>
            <Text style={styles.tabSubheading}>
              Workspace management, live couple sharing, currency, and reports.
            </Text>

            <View style={styles.settingsMenu}>
              <Pressable style={styles.settingItem} onPress={() => setShowProfileModal(true)}>
                <View style={styles.settingLeft}>
                  <Ionicons name="person-circle-outline" size={22} color={THEME.colors.primaryLight} />
                  <View>
                    <Text style={styles.settingItemTitle}>Profile & Photo Avatar</Text>
                    <Text style={styles.settingItemSub}>{currentProfile.display_name} ({currentProfile.email})</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textDim} />
              </Pressable>

              <Pressable style={styles.settingItem} onPress={() => setShowWorkspaceModal(true)}>
                <View style={styles.settingLeft}>
                  <Ionicons name="heart-circle-outline" size={22} color="#EC4899" />
                  <View>
                    <Text style={styles.settingItemTitle}>Manage Workspaces</Text>
                    <Text style={styles.settingItemSub}>{currentWs.name} ({currentWs.type})</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textDim} />
              </Pressable>

              <Pressable style={styles.settingItem} onPress={() => setShowPartnerInviteModal(true)}>
                <View style={styles.settingLeft}>
                  <Ionicons name="share-social-outline" size={22} color={THEME.colors.accentGold} />
                  <View>
                    <Text style={styles.settingItemTitle}>Invite Partner to Space</Text>
                    <Text style={styles.settingItemSub}>Share code: {currentWs.invite_code || 'NUPRA2026'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textDim} />
              </Pressable>

              <Pressable style={styles.settingItem} onPress={() => handleToggleCurrency(currentCurrency === 'INR' ? 'EUR' : 'INR')}>
                <View style={styles.settingLeft}>
                  <Ionicons name="cash-outline" size={22} color={THEME.colors.success} />
                  <View>
                    <Text style={styles.settingItemTitle}>Currency (Rupees ₹ / Euros €)</Text>
                    <Text style={styles.settingItemSub}>Active: {currentCurrency === 'INR' ? 'Indian Rupee (₹)' : 'Euro (€)'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.colors.textDim} />
              </Pressable>

              <Pressable style={styles.settingItem} onPress={handleExportReport}>
                <View style={styles.settingLeft}>
                  <Ionicons name="document-text-outline" size={22} color={THEME.colors.info} />
                  <View>
                    <Text style={styles.settingItemTitle}>Export Financial Statement</Text>
                    <Text style={styles.settingItemSub}>Share CSV / summary report</Text>
                  </View>
                </View>
                <Ionicons name="share-outline" size={18} color={THEME.colors.textDim} />
              </Pressable>

              <Pressable style={[styles.settingItem, styles.logoutItem]} onPress={handleSignOut}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={22} color={THEME.colors.danger} />
                  <Text style={[styles.settingItemTitle, { color: THEME.colors.danger }]}>Log Out</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modern Floating Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {[
          { id: 'overview', label: 'Home', icon: 'home' },
          { id: 'goals', label: 'Goals', icon: 'trophy' },
          { id: 'stocks', label: 'Stocks', icon: 'trending-up' },
          { id: 'stats', label: 'Stats', icon: 'pie-chart' },
          { id: 'bills', label: 'Bills', icon: 'receipt' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.navTabItem, isActive && styles.activeNavTabItem]}
              onPress={() => setActiveTab(item.id as any)}
            >
              <Ionicons
                name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                size={20}
                color={isActive ? THEME.colors.primaryLight : THEME.colors.textMuted}
              />
              <Text style={[styles.navTabLabel, isActive && styles.activeNavTabLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Modals */}
      <TransactionModal
        visible={showTxModal}
        onClose={() => setShowTxModal(false)}
        onSave={handleSaveTransaction}
        initialType={txInitialType}
        categories={categories}
        paymentMethods={paymentMethods}
        profile={currentProfile}
        workspace={currentWs}
        currency={currentCurrency}
        onAddNewCategory={() => setShowCategoryModal(true)}
      />

      <GoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={handleSaveGoal}
        profile={currentProfile}
        workspace={currentWs}
        currency={currentCurrency}
      />

      <ContributeModal
        visible={showContributeModal}
        goal={selectedGoalForContribute}
        currency={currentCurrency}
        onClose={() => setShowContributeModal(false)}
        onContribute={handleContributeToGoal}
      />

      <StockModal
        visible={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSave={handleSaveStock}
        profile={currentProfile}
        workspace={currentWs}
        currency={currentCurrency}
      />

      <BillModal
        visible={showBillModal}
        onClose={() => setShowBillModal(false)}
        onSave={handleSaveBill}
        categories={categories}
        profile={currentProfile}
        workspace={currentWs}
        currency={currentCurrency}
      />

      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        workspace={currentWs}
      />

      <PartnerInviteModal
        visible={showPartnerInviteModal}
        onClose={() => setShowPartnerInviteModal(false)}
        workspace={currentWs}
      />

      <WorkspaceModal
        visible={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        workspaces={workspaces}
        activeWorkspace={currentWs}
        onSelectWorkspace={(ws) => {
          dataService.setActiveWorkspace(ws);
          setActiveWorkspace(ws);
        }}
        onCreateCoupleWorkspace={handleCreateCoupleSpace}
        onJoinWithCode={(code) => {
          Alert.alert('Workspace Joined', `Connected to partner's space with code ${code}`);
        }}
      />

      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={currentProfile}
        onSave={handleUpdateProfile}
        onSignOut={handleSignOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  centerLoading: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGlow: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  mainScroll: {
    paddingBottom: 90,
  },
  sectionWrap: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  sectionActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryLight,
  },
  txCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textDim,
  },
  budgetScroll: {
    paddingBottom: 4,
  },
  budgetCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 16,
    padding: 12,
    width: 140,
    marginRight: 10,
    borderWidth: 1,
  },
  budgetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  catIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  catSpent: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  catLimit: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
    marginBottom: 8,
  },
  budgetTrack: {
    height: 6,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 3,
  },
  miniBillCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  miniBillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  miniBillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  miniBillDue: {
    fontSize: 11,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  miniBillRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  miniBillAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.accent,
  },
  miniPayBtn: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniPayBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textDim,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  tabSubheading: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
    maxWidth: 240,
  },
  addPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addPrimaryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  goalFullCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  goalFullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalFullLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalFullIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalFullTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  goalFullMeta: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  goalPctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goalPctBadgeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  goalNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalNumLabel: {
    fontSize: 10,
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  goalNumVal: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
    marginTop: 2,
  },
  goalBarBg: {
    height: 10,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 14,
  },
  neededLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
  },
  neededValue: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.accentGold,
  },
  contributeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  contributeActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  billCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  billStatusCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  billMetaText: {
    fontSize: 11,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  billAmountText: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  payBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.success,
  },
  settingsMenu: {
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  settingItemSub: {
    fontSize: 11,
    color: THEME.colors.textDim,
    marginTop: 1,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    marginTop: 6,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeNavTabItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 3,
  },
  activeNavTabLabel: {
    color: THEME.colors.primaryLight,
    fontWeight: '800',
  },
});