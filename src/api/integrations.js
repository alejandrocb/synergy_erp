import { base44 } from './base44Client.js';

export function extractIntegrationBindings(client = base44) {
  return {
    Core: client.integrations.Core,
    InvokeLLM: client.integrations.Core.InvokeLLM,
    SendEmail: client.integrations.Core.SendEmail,
    UploadFile: client.integrations.Core.UploadFile,
    GenerateImage: client.integrations.Core.GenerateImage,
    ExtractDataFromUploadedFile: client.integrations.Core.ExtractDataFromUploadedFile,
    CreateFileSignedUrl: client.integrations.Core.CreateFileSignedUrl,
    UploadPrivateFile: client.integrations.Core.UploadPrivateFile,
  };
}

const bindings = extractIntegrationBindings();

export const Core = bindings.Core;
export const InvokeLLM = bindings.InvokeLLM;
export const SendEmail = bindings.SendEmail;
export const UploadFile = bindings.UploadFile;
export const GenerateImage = bindings.GenerateImage;
export const ExtractDataFromUploadedFile = bindings.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = bindings.CreateFileSignedUrl;
export const UploadPrivateFile = bindings.UploadPrivateFile;
