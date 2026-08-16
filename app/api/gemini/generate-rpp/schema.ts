import type { OutputConfig } from '../../../../types/rpp';
import { buildModuleResponseSchema } from './schema-module';
import { buildRPPResponseSchema } from './schema-rpp';

export function responseSchemaForOutput(output: OutputConfig) {
  return output.format === 'Ringkas' ? buildRPPResponseSchema(output) : buildModuleResponseSchema(output);
}
