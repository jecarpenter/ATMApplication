using Microsoft.EntityFrameworkCore;
using ATMApplication.Models;

namespace ATMApplication.Data
{
    public class ATMDbContext : DbContext
    {
        public ATMDbContext(DbContextOptions<ATMDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccountType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Balance).HasPrecision(18, 2);
                entity.HasIndex(e => e.AccountType).IsUnique();
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.BalanceAfter).HasPrecision(18, 2);
                entity.Property(e => e.Description).HasMaxLength(200);

                entity.HasOne(t => t.Account)
                      .WithMany(a => a.Transactions)
                      .HasForeignKey(t => t.AccountId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //default data
            modelBuilder.Entity<Account>().HasData(
                new Account { Id = 1, AccountType = "Checking", Balance = 1000.00m, CreatedAt = DateTime.UtcNow },
                new Account { Id = 2, AccountType = "Savings", Balance = 5000.00m, CreatedAt = DateTime.UtcNow }
            );

            base.OnModelCreating(modelBuilder);
        }
    }
}