import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

export interface CloudinaryUpload {
  /** URL https servida por el CDN de Cloudinary. Es lo que se guarda en la base. */
  secureUrl: string;
  /** Identificador del asset en la media library (incluye la carpeta). */
  publicId: string;
}

export interface CloudinaryUploadOptions {
  /**
   * Carpeta destino en Cloudinary (ej: `estilos-pequenos/carrusel`). Pasa a ser
   * parte del public_id y de la URL. Si se omite, se usa la carpeta del preset.
   */
  folder?: string;
  /**
   * Nombre del archivo dentro de la carpeta, sin extensión (ej: `remera-bebe-1`).
   * Si ya existe uno igual, Cloudinary le agrega un sufijo (no se puede
   * sobrescribir con subida unsigned).
   */
  publicId?: string;
}

/**
 * Sube imágenes a Cloudinary directo desde el navegador usando un
 * **unsigned upload preset** (no expone el API secret). Cuenta cargada desde
 * `SettingsService` (editable por un superadmin en `/admin/superadmin/cloudinary`).
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly settingsService = inject(SettingsService);

  /** true si hay cuenta de Cloudinary cargada. */
  get configured(): boolean {
    return this.settingsService.cloudinaryConfigured();
  }

  /**
   * Sube una imagen y devuelve su URL. `file` puede ser un File del `<input>` o
   * un data URI (ej: el que devuelve `resizeImageFile`).
   */
  async upload(file: File | string, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUpload> {
    const { cloudinaryCloudName: cloudName, cloudinaryUploadPreset: uploadPreset } = this.settingsService.settings();
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary no está configurado (lo carga el superadmin desde el panel).');
    }

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    if (options.folder) form.append('folder', options.folder);
    if (options.publicId) form.append('public_id', options.publicId);

    let res: Response;
    try {
      res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
      });
    } catch {
      throw new Error('No se pudo conectar con Cloudinary. Revisá la conexión.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message ?? `Cloudinary respondió ${res.status}.`);
    }

    const data = await res.json();
    return { secureUrl: data.secure_url as string, publicId: data.public_id as string };
  }
}
