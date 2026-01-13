import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = 'http://localhost:8080/api/test';

  constructor(private http: HttpClient) {}

  getTest() {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
