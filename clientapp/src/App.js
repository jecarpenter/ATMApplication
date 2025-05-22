import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import AccountSummary from './Components/Accounts/AccountSummary';
import TransactionForm from './Components/Transactions/TransactionForm';
import TransactionHistory from './Components/Transactions/TransactionHistory';
import TransferForm from './Components/Transactions/TransferForm';
import { getAccounts } from './Services/ApiService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const accountData = await getAccounts();
      setAccounts(accountData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showNotification('Error loading account data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', severity: 'info' });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTransactionSuccess = (message) => {
    fetchAccounts();
    showNotification(message, 'success');
  };

  const handleTransactionError = (message) => {
    showNotification(message, 'error');
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            BankBank | Portal
          </Typography>
          <Typography variant="h6" gutterBottom align="center" color="text.secondary">
            Manage your Checking and Savings accounts with BankBank
          </Typography>
          <Box sx={{ mb: 4 }}>
            <AccountSummary accounts={accounts} loading={loading} />
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Deposit" />
              <Tab label="Withdraw" />
              <Tab label="Transfer" />
              <Tab label="Transaction History" />
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index={0}>
            <TransactionForm
              transactionType="deposit"
              accounts={accounts}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <TransactionForm
              transactionType="withdraw"
              accounts={accounts}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <TransferForm
              accounts={accounts}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <TransactionHistory accounts={accounts} />
          </TabPanel>
        </Paper>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;