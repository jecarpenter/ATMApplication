import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  AttachMoney,
  SwapHoriz,
  ArrowForward
} from '@mui/icons-material';
import { transfer } from '../../Services/ApiService';

const TransferForm = ({ accounts, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    fromAccountType: '',
    toAccountType: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromAccountType) {
      newErrors.fromAccountType = 'Please select a source account';
    }

    if (!formData.toAccountType) {
      newErrors.toAccountType = 'Please select a destination account';
    }

    if (formData.fromAccountType && formData.toAccountType && 
        formData.fromAccountType === formData.toAccountType) {
      newErrors.toAccountType = 'Destination must be different from source account';
    }

    if (!formData.amount) {
      newErrors.amount = 'Please enter an amount';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      } else if (amount > 999999.99) {
        newErrors.amount = 'Amount cannot exceed $999,999.99';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        newErrors.amount = 'Please enter a valid dollar amount (e.g., 123.45)';
      }

      if (formData.fromAccountType) {
        const sourceAccount = accounts?.find(acc => acc.accountType === formData.fromAccountType);
        if (sourceAccount && amount > sourceAccount.balance) {
          newErrors.amount = `Insufficient funds. Available: $${sourceAccount.balance.toFixed(2)}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'fromAccountType' && accounts?.length === 2) {
      const otherAccount = accounts.find(acc => acc.accountType !== value);
      if (otherAccount && !formData.toAccountType) {
        setFormData(prev => ({ ...prev, toAccountType: otherAccount.accountType }));
      }
    }
  };

  const handleQuickSwap = () => {
    setFormData(prev => ({
      ...prev,
      fromAccountType: prev.toAccountType,
      toAccountType: prev.fromAccountType
    }));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const response = await transfer(formData.fromAccountType, formData.toAccountType, amount);
      
      if (response.success) {
        onSuccess(response.message);
        setFormData({ fromAccountType: '', toAccountType: '', amount: '' });
      } else {
        onError(response.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      onError(error.message || 'An error occurred during the transfer');
    } finally {
      setLoading(false);
    }
  };

  const availableAccounts = accounts?.filter(account => account.accountType) || [];
  const fromAccount = availableAccounts.find(acc => acc.accountType === formData.fromAccountType);
  const toAccount = availableAccounts.find(acc => acc.accountType === formData.toAccountType);

  return (
    <Box display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <SwapHoriz />
            <Typography variant="h5" component="h2" ml={1} color="text.primary">
              Transfer Funds
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth error={!!errors.fromAccountType}>
                  <InputLabel>From Account</InputLabel>
                  <Select
                    value={formData.fromAccountType}
                    onChange={handleInputChange('fromAccountType')}
                    label="From Account"
                    disabled={loading}
                  >
                    {availableAccounts.map((account) => (
                      <MenuItem 
                        key={account.id} 
                        value={account.accountType}
                        disabled={account.accountType === formData.toAccountType}
                      >
                        {account.accountType} - ${account.balance?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.fromAccountType && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.fromAccountType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2} display="flex" alignItems="center" justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={handleQuickSwap}
                  disabled={loading || !formData.fromAccountType || !formData.toAccountType}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SwapHoriz />
                </Button>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth error={!!errors.toAccountType}>
                  <InputLabel>To Account</InputLabel>
                  <Select
                    value={formData.toAccountType}
                    onChange={handleInputChange('toAccountType')}
                    label="To Account"
                    disabled={loading}
                  >
                    {availableAccounts.map((account) => (
                      <MenuItem 
                        key={account.id} 
                        value={account.accountType}
                        disabled={account.accountType === formData.fromAccountType}
                      >
                        {account.accountType} - ${account.balance?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.toAccountType && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.toAccountType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              {fromAccount && toAccount && (
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'grey.50', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Transfer Summary
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                      <Chip 
                        label={`${fromAccount.accountType}: $${fromAccount.balance.toFixed(2)}`} 
                        color="secondary"
                        size="small"
                      />
                      <ArrowForward fontSize="small" />
                      <Chip 
                        label={`${toAccount.accountType}: $${toAccount.balance.toFixed(2)}`} 
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transfer Amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="0.00"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SwapHoriz />}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Processing Transfer...' : 'Transfer Funds'}
                </Button>
              </Grid>
            </Grid>
          </form>
          {availableAccounts.length < 2 && !loading && (
            <Box 
              mt={2} 
              p={2} 
              sx={{ 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                You need at least two accounts to make transfers.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransferForm;