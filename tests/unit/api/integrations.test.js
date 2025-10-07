import test from 'node:test';
import assert from 'node:assert/strict';
import { extractIntegrationBindings } from '../../../src/api/integrations.js';

test('extractIntegrationBindings maps core integrations to top-level exports', () => {
  const core = {
    InvokeLLM: () => {},
    SendEmail: () => {},
    UploadFile: () => {},
    GenerateImage: () => {},
    ExtractDataFromUploadedFile: () => {},
    CreateFileSignedUrl: () => {},
    UploadPrivateFile: () => {},
  };

  const bindings = extractIntegrationBindings({
    integrations: { Core: core },
  });

  Object.entries(core).forEach(([key, value]) => {
    assert.equal(bindings[key], value);
  });
  assert.equal(bindings.Core, core);
});
