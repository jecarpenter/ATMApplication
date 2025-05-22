import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add,
  Remove,
  SwapHoriz,
  AccountBalance,
  Savings,
  History
} from '@mui/icons-material';
import { getTransactionHistory } from '../../Services/ApiService';

const TransactionHistory = ({ accounts }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransactions = async (accountType) => {
    if (!accountType) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await getTransactionHistory(accountType);
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError(err.message || 'Failed to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (event) => {
    const accountType = event.target.value;
    setSelectedAccount(accountType);
    fetchTransactions(accountType);
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return <Add fontSize="small" />;
      case 'withdrawal':
        return <Remove fontSize="small" />;
      case 'transfer':
        return <SwapHoriz fontSize="small" />;
      default:
        return <History fontSize="small" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'error';
      case 'transfer':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransferDescription = (transaction) => {
    if (transaction.type?.toLowerCase() !== 'transfer') {
      return transaction.description;
    }

    if (transaction.relatedAccountType) {
      return transaction.description?.includes('from') 
        ? `Transfer from ${transaction.relatedAccountType}`
        : `Transfer to ${transaction.relatedAccountType}`;
    }

    return transaction.description;
  };

  const availableAccounts = accounts?.filter(account => account.accountType) || [];

  useEffect(() => {
    if (!selectedAccount && availableAccounts.length > 0) {
      const defaultAccount = availableAccounts[0].accountType;
      setSelectedAccount(defaultAccount);
      fetchTransactions(defaultAccount);
    }
  }, [availableAccounts, selectedAccount]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <History />
            <Typography variant="h5" component="h2" ml={1} color="text.primary">
              Transaction History
            </Typography>
          </Box>

          {/* Account Selection */}
          <Box mb={3}>
            <FormControl fullWidth sx={{ maxWidth: 300 }}>
              <InputLabel>Select Account</InputLabel>
              <Select
                value={selectedAccount}
                onChange={handleAccountChange}
                label="Select Account"
                disabled={loading || availableAccounts.length === 0}
              >
                {availableAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.accountType}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          mr: 1,
                          bgcolor: account.accountType?.toLowerCase() === 'checking' ? 'primary.main' : 'success.main'
                        }}
                      >
                        {account.accountType?.toLowerCase() === 'checking' ? 
                          <AccountBalance fontSize="small" /> : 
                          <Savings fontSize="small" />
                        }
                      </Avatar>
                      {account.accountType}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" ml={2}>
                Loading transactions...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!selectedAccount && !loading && availableAccounts.length > 0 && (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              py={4}
              sx={{ 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Please select an account to view transaction history
              </Typography>
            </Box>
          )}

          {availableAccounts.length === 0 && !loading && (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              py={4}
              sx={{ 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No accounts available
              </Typography>
            </Box>
          )}

          {!loading && !error && selectedAccount && (
            <>
              {transactions.length === 0 ? (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  py={4}
                  sx={{ 
                    backgroundColor: 'grey.50', 
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Box>
                    <History sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No transactions yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your transaction history will appear here after you make deposits, withdrawals, or transfers.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Balance After</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Chip
                              icon={getTransactionIcon(transaction.type)}
                              label={transaction.type}
                              color={getTransactionColor(transaction.type)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {getTransferDescription(transaction)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              fontWeight="medium"
                              color={transaction.type?.toLowerCase() === 'deposit' ? 'success.main' : 'text.primary'}
                            >
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(transaction.balanceAfter)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(transaction.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;