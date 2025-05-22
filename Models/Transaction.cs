using System.ComponentModel.DataAnnotations;

namespace ATMApplication.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        public int AccountId { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public decimal BalanceAfter { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? RelatedAccountId { get; set; }

        public Account Account { get; set; } = null!;
    }
}