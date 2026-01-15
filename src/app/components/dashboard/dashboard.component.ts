import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BankService, BankAccount } from '../../services/bank.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  accounts = signal<BankAccount[]>([]);
  userName = signal('');
  loading = signal(true);

  constructor(
    private authService: AuthService,
    private bankService: BankService,
    private router: Router
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.nombre);
      this.loadAccounts(user.id.toString());
    }
  }

  async loadAccounts(userId: string) {
    this.loading.set(true);
    const accounts = await this.bankService.getAccountsByUser(userId);
    this.accounts.set(accounts);
    this.loading.set(false);
  }

  selectAccount(account: BankAccount) {
    this.router.navigate(['/account', account.id]);
  }

  getTotalBalance(): number {
    return this.accounts().reduce((total, account) => total + account.saldo, 0);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
