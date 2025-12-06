import { ApiService } from './externalApiService';

// Re-export the relevant services from the external API service
export const ConfigService = {
  getOptions: ApiService.config.getOptions,
  detectUnconfiguredOnts: ApiService.config.detectUnconfiguredOnts,
  runConfiguration: ApiService.config.runConfiguration,
};

// Export the UnconfiguredOnt type
export interface UnconfiguredOnt {
  sn: string;
  pon_port: string;
  pon_slot: string;
}