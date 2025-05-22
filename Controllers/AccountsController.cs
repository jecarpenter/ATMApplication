using Microsoft.AspNetCore.Mvc;
using ATMApplication.Models.DTOs;
using ATMApplication.Services;
using ATMApplication.Services.Interfaces;

namespace ATMApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogger<AccountsController> _logger;

        public AccountsController(IAccountService accountService, ILogger<AccountsController> logger)
        {
            _accountService = accountService;
            _logger = logger;
        }

        /// <summary>
        /// Get all accounts with their current balances
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountSummary>>> GetAccounts()
        {
            try
            {
                var accounts = await _accountService.GetAllAccountsAsync();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accounts");
                return Problem("Internal server error");
            }
        }

        /// <summary>
        /// Get transaction history for a specific account
        /// </summary>
        [HttpGet("{accountType}/transactions")]
        public async Task<ActionResult<IEnumerable<TransactionHistory>>> GetTransactionHistory(string accountType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(accountType))
                {
                    return BadRequest(new { message = "Account type is required" });
                }

                var transactions = await _accountService.GetTransactionHistoryAsync(accountType);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving transaction history for {accountType}");
                return Problem("Internal server error");
            }
        }

        /// <summary>
        /// Deposit funds to an account
        /// </summary>
        [HttpPost("{accountType}/deposit")]
        public async Task<ActionResult<ApiResponse<AccountSummary>>> Deposit(string accountType, [FromBody] DepositRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(accountType))
                {
                    return BadRequest(new { message = "Account type is required" });
                }

                var result = await _accountService.DepositAsync(accountType, request.Amount);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during deposit to {accountType}");
                return Problem("Internal server error");
            }
        }

        /// <summary>
        /// Withdraw funds from an account
        /// </summary>
        [HttpPost("{accountType}/withdraw")]
        public async Task<ActionResult<ApiResponse<AccountSummary>>> Withdraw(string accountType, [FromBody] WithdrawRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(accountType))
                {
                    return BadRequest(new { message = "Account type is required" });
                }

                var result = await _accountService.WithdrawAsync(accountType, request.Amount);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during withdrawal from {accountType}");
                return Problem("Internal server error");
            }
        }

        /// <summary>
        /// Transfer funds between accounts
        /// </summary>
        [HttpPost("transfer")]
        public async Task<ActionResult<ApiResponse<string>>> Transfer([FromBody] TransferRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _accountService.TransferAsync(
                    request.FromAccountType,
                    request.ToAccountType,
                    request.Amount);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during transfer from {FromAccount} to {ToAccount}",
                    request.FromAccountType, request.ToAccountType);
                return Problem("Internal server error");
            }
        }
    }
}