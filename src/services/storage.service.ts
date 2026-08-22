import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { ApiResponse } from '../interfaces/api-response';

export interface StorageUploadData {
  fileName: string;
  path: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

/**
 * Servicio para operaciones con el endpoint /v1/storage (subida y obtención de archivos).
 * Reemplaza al antiguo FilesExportService y la lógica de /files del UsuariosService.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly baseEndpoint = '/storage';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  /**
   * Retorna la URL pública autenticada para obtener un archivo almacenado.
   * GET /v1/storage/:categoria/:fileName
   */
  getFileUrl(categoria: string, fileName: string): string {
    return `${environment.apiPath}${this.baseEndpoint}/${encodeURIComponent(categoria)}/${encodeURIComponent(fileName)}`;
  }

  /**
   * Sube un archivo a la categoría indicada.
   * POST /v1/storage/upload/:categoria
   * @param categoria  'perfil' | 'producto' | 'porcion' | 'solicitud' | 'documento'
   * @param file       Archivo a subir
   * @param customName Nombre personalizado opcional (sin extensión; se conserva la del archivo)
   */
  async uploadFile(
    categoria: string,
    file: File,
    customName?: string
  ): Promise<ApiResponse<StorageUploadData> | null> {
    try {
      const form = new FormData();
      form.append('file', file);
      if (customName) {
        form.append('customName', customName);
      }

      const token = localStorage.getItem('token') || '';
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
      const url = `${environment.apiPath}${this.baseEndpoint}/upload/${encodeURIComponent(categoria)}`;

      const resp = await firstValueFrom(
        this.http.post<ApiResponse<StorageUploadData>>(url, form, {
          headers,
          observe: 'response',
        })
      );

      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('StorageService.uploadFile error:', error);
      this.toastr.error(error?.error?.message || 'Error al subir archivo', 'Error');
      return null;
    }
  }

  /**
   * Sube la foto de perfil de un usuario.
   * El archivo se almacena en la categoría 'perfil' con nombre {userName}{ext}.
   * POST /v1/storage/upload/perfil
   */
  async uploadPerfil(
    file: File,
    userName: string
  ): Promise<ApiResponse<StorageUploadData> | null> {
    // Solo el nombre sin extensión — el backend detecta el tipo desde el archivo
    const customName = userName;

    const result = await this.uploadFile('perfil', file, customName);
    if (result?.success) {
      this.toastr.success(result.message || 'Imagen de perfil subida', 'Éxito');
    }
    return result;
  }

  /**
   * Descarga un archivo como Blob (útil para mostrarlo en pantalla sin exponer la URL).
   * GET /v1/storage/:categoria/:fileName
   */
  async downloadAsBlob(categoria: string, fileName: string): Promise<Blob | null> {
    try {
      const token = localStorage.getItem('token') || '';
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
      const url = this.getFileUrl(categoria, fileName);

      return await firstValueFrom(
        this.http.get(url, { headers, responseType: 'blob' })
      );
    } catch (error: any) {
      console.log('StorageService.downloadAsBlob error:', error);
      return null;
    }
  }
}
