import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BankService, BankAccount, Transaction, Card } from '../../services/bank.service';
import { MaskingService } from '../../services/masking.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss'
})
export class AccountDetailComponent implements OnInit {
  account = signal<BankAccount | undefined>(undefined);
  activeTab = signal<'overview' | 'cards' | 'transactions'>('overview');
  loading = signal(true);
  selectedCard = signal<Card | null>(null);

  constructor(
    private bankService: BankService,
    private maskingService: MaskingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const accountId = this.route.snapshot.paramMap.get('id');
    if (accountId) {
      this.loadAccount(accountId);
    }
  }

  async loadAccount(accountId: string) {
    this.loading.set(true);
    const account = await this.bankService.getAccount(accountId);
    this.account.set(account);
    this.loading.set(false);
  }

  setActiveTab(tab: 'overview' | 'cards' | 'transactions') {
    this.activeTab.set(tab);
  }

  selectCard(card: Card) {
    this.selectedCard.set(card);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getTransactionIcon(origin: string): string {
    const icons: { [key: string]: string } = {
      'Transferencia': '💰',
      'TarjetaBancaria': '💳',
      'Domiciliacion': '📄',
      'Interes': '💸'
    };
    return icons[origin] || '📊';
  }

  getTransactionType(tipo: string): string {
    return tipo === 'Haber' ? 'income' : 'expense';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getIBANDisplay(iban: string): string {
    return this.maskingService.maskIBAN(iban);
  }

  getCardNumberDisplay(cardNumber: string): string {
    return this.maskingService.maskCardNumber(cardNumber);
  }
}
