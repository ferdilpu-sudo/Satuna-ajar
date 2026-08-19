export interface UploadedMaterialFile {
  name: string;
  size: number;
  mimeType: string;
  file?: File;
  storagePath?: string;
  base64?: string;
  text?: string;
}

export interface GradeConflict {
  detectedGrade: string;
  detectedLevel: string;
  detectedPhase: string;
  formGrade: string;
}
