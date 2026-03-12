import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private botToken = '8467717779:AAExeTlnHXBjkzN-5L3oJjOergVVVXRL-TM';
  private chatId = '-4825864321';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const body = {
      chat_id: this.chatId,
      text: message,
      parse_mode: 'HTML' // Enable HTML for better formatting
    };

    return this.http.post(url, body);
  }
}
