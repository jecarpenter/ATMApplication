using ATMApplication.Models.DTOs;
using ATMApplication.Models;

namespace ATMApplication.Services.Interfaces
{
    public interface IAccountService
    {
        Task<IEnumerable<AccountSummary>> GetAllAccountsAsync();
        Task<Account?> GetAccountByTypeAsync(string accountType);
        Task<ApiResponse<AccountSummary>> DepositAsync(string accountType, decimal amount);
        Task<ApiResponse<AccountSummary>> WithdrawAsync(string accountType, decimal amount);
        Task<ApiResponse<string>> TransferAsync(string fromAccountType, string toAccountType, decimal amount);
        Task<IEnumerable<TransactionHistory>> GetTransactionHistoryAsync(string accountType);
    }
}
