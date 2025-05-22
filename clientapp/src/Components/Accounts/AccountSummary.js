import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Avatar
} from '@mui/material';
import {
  AccountBalance,
  Savings
} from '@mui/icons-material';

const AccountCard = ({ account, loading }) => {
  const isChecking = account?.accountType?.toLowerCase() === 'checking';
  const icon = isChecking ? <AccountBalance /> : <Savings />;
  const color = isChecking ? 'primary' : 'success';

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={120} height={32} />
          </Box>
          <Skeleton variant="text" width={100} height={48} />
          <Skeleton variant="text" width={80} height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: `${color}.main`, 
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" component="h2" color="text.primary">
            {account?.accountType} Account
          </Typography>
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          color={`${color}.main`}
          fontWeight="bold"
          mb={1}
        >
          ${account?.balance?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) || '0.00'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Available Balance
        </Typography>
      </CardContent>
    </Card>
  );
};

const AccountSummary = ({ accounts, loading }) => {
  const checkingAccount = accounts?.find(acc => acc.accountType?.toLowerCase() === 'checking');
  const savingsAccount = accounts?.find(acc => acc.accountType?.toLowerCase() === 'savings');

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom color="text.primary" fontWeight="medium">
        Account Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <AccountCard account={checkingAccount} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AccountCard account={savingsAccount} loading={loading} />
        </Grid>
      </Grid>
      {!loading && accounts?.length === 0 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          py={4}
          sx={{ 
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            mt: 2
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No accounts found. Please check your connection.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccountSummary;