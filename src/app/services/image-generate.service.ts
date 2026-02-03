import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ImageGenerateRequest,
  ImageGenerateResponse
} from '../models/image-generation.model';

@Injectable({
  providedIn: 'root'
})
export class ImageGenerateService {
  constructor(private http: HttpClient) {}

  generateImage(
    options?: Partial<ImageGenerateRequest>,
    token?: string
  ): Observable<string[]> {
    // if (!environment.apiKey) {
    //   return throwError(() => new Error('Missing API_KEY'));
    // }

    const payload: ImageGenerateRequest = {
      model: options?.model ?? 'nano-banana',
      prompt: options?.prompt ?? '',
      n: options?.n ?? 1,
      size: options?.size ?? '1024x1792',
      response_format: 'b64_json',
      seed: options?.seed
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http
      .post<ImageGenerateResponse>(
        `${environment.baseUrl}/images/generations`,
        payload,
        { headers }
      )
      .pipe(
        map(res =>
          res.data.map(
            img => `data:image/png;base64,${img.b64_json}`
          )
        )
      );
  }
}
