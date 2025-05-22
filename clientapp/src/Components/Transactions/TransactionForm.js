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
  CircularProgress
} from '@mui/material';
import {
  AttachMoney,
  Add,
  Remove
} from '@mui/icons-material';
import { deposit, withdraw } from '../../Services/ApiService';

const TransactionForm = ({ transactionType, accounts, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    accountType: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isDeposit = transactionType === 'deposit';
  const title = isDeposit ? 'Deposit Funds' : 'Withdraw Funds';
  const buttonText = isDeposit ? 'Deposit' : 'Withdraw';
  const icon = isDeposit ? <Add /> : <Remove />;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account';
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const apiCall = isDeposit ? deposit : withdraw;
      const response = await apiCall(formData.accountType, amount);
      
      if (response.success) {
        onSuccess(response.message);
        setFormData({ accountType: '', amount: '' });
      } else {
        onError(response.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      onError(error.message || 'An error occurred during the transaction');
    } finally {
      setLoading(false);
    }
  };

  const availableAccounts = accounts?.filter(account => account.accountType) || [];

  return (
    <Box display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            {icon}
            <Typography variant="h5" component="h2" ml={1} color="text.primary">
              {title}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.accountType}>
                  <InputLabel>Select Account</InputLabel>
                  <Select
                    value={formData.accountType}
                    onChange={handleInputChange('accountType')}
                    label="Select Account"
                    disabled={loading}
                  >
                    {availableAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.accountType}>
                        {account.accountType} - ${account.balance?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.accountType && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.accountType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
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
                  color={isDeposit ? 'primary' : 'secondary'}
                  startIcon={loading ? <CircularProgress size={20} /> : icon}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Processing...' : buttonText}
                </Button>
              </Grid>
            </Grid>
          </form>
          {availableAccounts.length === 0 && !loading && (
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
                No accounts available. Please ensure your accounts are loaded.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionForm;