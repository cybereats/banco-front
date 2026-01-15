import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export interface Card {
  id: number;
  numeroTarjeta: string;
  fechaCaducidad: string;
  cvc: string;
  nombreCompleto: string;
  cuenta_id: number;
  tipo?: 'credit' | 'debit';
  marca?: 'visa' | 'mastercard';
}

export interface Transaction {
  id: number;
  tipoMovimientoBancario: string;
  origenMovimientoBancario: string;
  tarjetaCreditoOrigen: string | null;
  fecha: string;
  importe: number;
  concepto: string;
}

export interface BankAccount {
  id: number;
  iban: string;
  saldo: number;
  cliente_id: number;
  nombre: string;
  tipo: 'checking' | 'savings';
  moneda: string;
  cards?: Card[];
  transactions?: Transaction[];
}

interface AccountResponse {
  id: number;
  saldo: number;
  iban: string;
  cliente: { id: number };
  tarjetas?: BackendCard[];
  movimientos?: BackendMovement[];
}

interface BackendCard {
  id: number;
  numeroTarjeta: string;
  fechaCaducidad: string;
  cvc: number;
  nombreCompleto: string;
}

interface BackendMovement {
  id: number;
  tipoMovimientoBancario: 'DEBE' | 'HABER';
  origenMovimientoBancario: 'TRANSFERENCIA' | 'DOMICILIACION' | 'TARJETA_BANCARIA';
  fecha: string;
  importe: number;
  concepto: string;
  tarjetaCreditoOrigen: BackendCard | null;
}

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) { }

  async getAccountsByUser(userId: string): Promise<BankAccount[]> {
    try {
      const response: any = await this.http
        .get(`${this.apiUrl}/cuentas/cliente/${userId}`)
        .toPromise();

      const accounts = response?.data ?? [];
      if (Array.isArray(accounts)) {
        return accounts.map((account: AccountResponse) => this.mapAccount(account));
      }
      return [];
    } catch (error) {
      console.error('Error loading accounts:', error);
      return [];
    }
  }

  async getAccount(accountId: string): Promise<BankAccount | undefined> {
    try {
      const account = await this.http
        .get<AccountResponse>(`${this.apiUrl}/cuentas/${accountId}`)
        .toPromise();

      if (!account) {
        return undefined;
      }

      return this.mapAccount(account);
    } catch (error) {
      console.error('Error loading account:', error);
      return undefined;
    }
  }

  private mapAccount(account: AccountResponse): BankAccount {
    const cards = (account.tarjetas || []).map((card) => this.mapCard(card, account.id));
    const transactions = (account.movimientos || []).map((movement) => this.mapMovement(movement));

    return {
      id: account.id,
      iban: account.iban,
      saldo: account.saldo,
      cliente_id: account.cliente?.id ?? 0,
      nombre: this.getAccountName(account.iban),
      tipo: this.getAccountType(account.saldo),
      moneda: 'EUR',
      cards,
      transactions
    };
  }

  private mapCard(card: BackendCard, accountId: number): Card {
    return {
      id: card.id,
      numeroTarjeta: card.numeroTarjeta,
      fechaCaducidad: card.fechaCaducidad,
      cvc: String(card.cvc),
      nombreCompleto: card.nombreCompleto,
      cuenta_id: accountId,
      marca: this.getCardBrand(card.numeroTarjeta),
      tipo: this.getCardType(card.numeroTarjeta)
    };
  }

  private mapMovement(movement: BackendMovement): Transaction {
    return {
      id: movement.id,
      tipoMovimientoBancario: this.getMovementTypeLabel(movement.tipoMovimientoBancario),
      origenMovimientoBancario: this.getMovementOriginLabel(movement.origenMovimientoBancario),
      tarjetaCreditoOrigen: movement.tarjetaCreditoOrigen?.numeroTarjeta ?? null,
      fecha: movement.fecha,
      importe: movement.importe,
      concepto: movement.concepto
    };
  }

  private getAccountName(iban: string): string {
    const suffix = iban.slice(-4);
    return `Cuenta ${suffix}`;
  }

  private getAccountType(balance: number): 'checking' | 'savings' {
    return balance >= 20000 ? 'savings' : 'checking';
  }

  private getCardBrand(cardNumber: string): 'visa' | 'mastercard' {
    if (cardNumber.startsWith('4')) {
      return 'visa';
    }
    return 'mastercard';
  }

  private getCardType(cardNumber: string): 'credit' | 'debit' {
    const lastDigit = Number(cardNumber.slice(-1));
    return lastDigit % 2 === 0 ? 'debit' : 'credit';
  }

  private getMovementTypeLabel(type: BackendMovement['tipoMovimientoBancario']): string {
    return type === 'HABER' ? 'Haber' : 'Debe';
  }

  private getMovementOriginLabel(origin: BackendMovement['origenMovimientoBancario']): string {
    switch (origin) {
      case 'TRANSFERENCIA':
        return 'Transferencia';
      case 'DOMICILIACION':
        return 'Domiciliacion';
      case 'TARJETA_BANCARIA':
        return 'TarjetaBancaria';
      default:
        return 'Transferencia';
    }
  }
}
