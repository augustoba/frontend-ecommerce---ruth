/** Config del servicio de mail (SMTP). Sólo superadmin (`PLATFORM_SETTINGS_MANAGE`). */
export interface PlatformMailSettings {
  host: string;
  port: number;
  username: string;
  fromAddress: string;
  /** true si ya hay una clave SMTP guardada (nunca viaja en texto plano). */
  passwordSet: boolean;
}

export interface PlatformMailSettingsInput {
  host: string;
  port: number;
  username: string;
  /** Vacío = no cambiarla (se mantiene la guardada). */
  password: string;
  fromAddress: string;
}
