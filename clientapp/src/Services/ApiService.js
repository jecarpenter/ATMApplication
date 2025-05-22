const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7132/api';

class ApiService {
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAccounts() {
    return this.makeRequest('/accounts');
  }

  async getTransactionHistory(accountType) {
    return this.makeRequest(`/accounts/${accountType}/transactions`);
  }

  async deposit(accountType, amount) {
    return this.makeRequest(`/accounts/${accountType}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async withdraw(accountType, amount) {
    return this.makeRequest(`/accounts/${accountType}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async transfer(fromAccountType, toAccountType, amount) {
    return this.makeRequest('/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountType,
        toAccountType,
        amount,
      }),
    });
  }

  async healthCheck() {
    return this.makeRequest('/health');
  }
}

const apiService = new ApiService();

export const getAccounts = () => apiService.getAccounts();
export const getTransactionHistory = (accountType) => apiService.getTransactionHistory(accountType);
export const deposit = (accountType, amount) => apiService.deposit(accountType, amount);
export const withdraw = (accountType, amount) => apiService.withdraw(accountType, amount);
export const transfer = (fromAccountType, toAccountType, amount) => apiService.transfer(fromAccountType, toAccountType, amount);
export const healthCheck = () => apiService.healthCheck();

export default apiService;