using System.ComponentModel.DataAnnotations;

namespace ATMApplication.Models
{
    public class Account
    {
        public int Id { get; set; }

        [Required]
        public string AccountType { get; set; } = string.Empty;

        public decimal Balance { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}