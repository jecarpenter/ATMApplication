using Microsoft.EntityFrameworkCore;
using ATMApplication.Data;
using ATMApplication.Models;
using ATMApplication.Models.DTOs;
using ATMApplication.Services.Interfaces;

namespace ATMApplication.Services
{
    public class AccountService : IAccountService
    {
        private readonly ATMDbContext _context;

        public AccountService(ATMDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AccountSummary>> GetAllAccountsAsync()
        {
            return await _context.Accounts
                .Select(a => new AccountSummary
                {
                    Id = a.Id,
                    AccountType = a.AccountType,
                    Balance = a.Balance,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<Account?> GetAccountByTypeAsync(string accountType)
        {
            return await _context.Accounts
                .Include(a => a.Transactions)
                .FirstOrDefaultAsync(a => a.AccountType.ToLower() == accountType.ToLower());
        }

        public async Task<ApiResponse<AccountSummary>> DepositAsync(string accountType, decimal amount)
        {
            try
            {
                var account = await GetAccountByTypeAsync(accountType);
                if (account == null)
                {
                    return new ApiResponse<AccountSummary>
                    {
                        Success = false,
                        Message = $"Account type '{accountType}' not found."
                    };
                }

                account.Balance += amount;

                var transaction = new Transaction
                {
                    AccountId = account.Id,
                    Type = "Deposit",
                    Amount = amount,
                    BalanceAfter = account.Balance,
                    Description = $"Deposit to {accountType} account",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return new ApiResponse<AccountSummary>
                {
                    Success = true,
                    Message = $"Successfully deposited ${amount:F2} to {accountType} account.",
                    Data = new AccountSummary
                    {
                        Id = account.Id,
                        AccountType = account.AccountType,
                        Balance = account.Balance,
                        CreatedAt = account.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<AccountSummary>
                {
                    Success = false,
                    Message = $"Error during deposit: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<AccountSummary>> WithdrawAsync(string accountType, decimal amount)
        {
            try
            {
                var account = await GetAccountByTypeAsync(accountType);
                if (account == null)
                {
                    return new ApiResponse<AccountSummary>
                    {
                        Success = false,
                        Message = $"Account type '{accountType}' not found."
                    };
                }

                if (account.Balance < amount)
                {
                    return new ApiResponse<AccountSummary>
                    {
                        Success = false,
                        Message = "Insufficient funds for this withdrawal."
                    };
                }

                account.Balance -= amount;

                var transaction = new Transaction
                {
                    AccountId = account.Id,
                    Type = "Withdrawal",
                    Amount = amount,
                    BalanceAfter = account.Balance,
                    Description = $"Withdrawal from {accountType} account",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return new ApiResponse<AccountSummary>
                {
                    Success = true,
                    Message = $"Successfully withdrew ${amount:F2} from {accountType} account.",
                    Data = new AccountSummary
                    {
                        Id = account.Id,
                        AccountType = account.AccountType,
                        Balance = account.Balance,
                        CreatedAt = account.CreatedAt
                    }
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<AccountSummary>
                {
                    Success = false,
                    Message = $"Error during withdrawal: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<string>> TransferAsync(string fromAccountType, string toAccountType, decimal amount)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fromAccountType) || string.IsNullOrWhiteSpace(toAccountType))
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Both account types are required."
                    };
                }

                if (fromAccountType.Equals(toAccountType, StringComparison.OrdinalIgnoreCase))
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Cannot transfer to the same account."
                    };
                }

                var fromAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountType.ToLower() == fromAccountType.ToLower());
                var toAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.AccountType.ToLower() == toAccountType.ToLower());

                if (fromAccount == null)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = $"Source account '{fromAccountType}' not found."
                    };
                }

                if (toAccount == null)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = $"Destination account '{toAccountType}' not found."
                    };
                }

                if (fromAccount.Balance < amount)
                {
                    return new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Insufficient funds for this transfer."
                    };
                }

                fromAccount.Balance -= amount;
                toAccount.Balance += amount;

                var now = DateTime.UtcNow;

                var withdrawalTransaction = new Transaction
                {
                    AccountId = fromAccount.Id,
                    Type = "Transfer",
                    Amount = amount,
                    BalanceAfter = fromAccount.Balance,
                    Description = $"Transfer to {toAccountType} account",
                    RelatedAccountId = toAccount.Id,
                    CreatedAt = now
                };

                var depositTransaction = new Transaction
                {
                    AccountId = toAccount.Id,
                    Type = "Transfer",
                    Amount = amount,
                    BalanceAfter = toAccount.Balance,
                    Description = $"Transfer from {fromAccountType} account",
                    RelatedAccountId = fromAccount.Id,
                    CreatedAt = now
                };

                _context.Transactions.AddRange(withdrawalTransaction, depositTransaction);
                await _context.SaveChangesAsync();

                return new ApiResponse<string>
                {
                    Success = true,
                    Message = $"Successfully transferred ${amount:F2} from {fromAccountType} to {toAccountType}.",
                    Data = $"Transfer completed at {now:yyyy-MM-dd HH:mm:ss} UTC"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<string>
                {
                    Success = false,
                    Message = $"Error during transfer: {ex.Message}"
                };
            }
        }

        public async Task<IEnumerable<TransactionHistory>> GetTransactionHistoryAsync(string accountType)
        {
            var account = await GetAccountByTypeAsync(accountType);
            if (account == null)
            {
                return new List<TransactionHistory>();
            }

            return await _context.Transactions
                .Where(t => t.AccountId == account.Id)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionHistory
                {
                    Id = t.Id,
                    Type = t.Type,
                    Amount = t.Amount,
                    BalanceAfter = t.BalanceAfter,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    RelatedAccountId = t.RelatedAccountId,
                    RelatedAccountType = t.RelatedAccountId != null ?
                        _context.Accounts.Where(a => a.Id == t.RelatedAccountId).Select(a => a.AccountType).FirstOrDefault() : null
                })
                .ToListAsync();
        }
    }
}