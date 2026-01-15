import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MaskingService {
  maskIBAN(iban: string): string {
    if (!iban || iban.length < 8) return iban;
    const visible = iban.slice(-4);
    const masked = '*'.repeat(iban.length - 4);
    return masked + visible;
  }

  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return cardNumber;
    const visible = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return masked + visible;
  }

  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return username + '*'.repeat(Math.max(1, username.length)) + '@' + domain;
    }
    const visible = username.slice(0, 2) + username.slice(-1);
    const masked = '*'.repeat(username.length - 3);
    return visible.slice(0, 2) + masked + visible.slice(2) + '@' + domain;
  }

  maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    const visible = phone.slice(-4);
    const masked = '*'.repeat(phone.length - 4);
    return masked + visible;
  }

  maskName(name: string): string {
    if (!name || name.length < 4) return name;
    const words = name.split(' ');
    return words.map(word => {
      if (word.length <= 2) return word;
      return word.charAt(0) + '*'.repeat(word.length - 2) + word.charAt(word.length - 1);
    }).join(' ');
  }
}
