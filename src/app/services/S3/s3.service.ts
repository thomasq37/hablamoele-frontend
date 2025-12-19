import { Injectable } from '@angular/core';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from "../../../environments/environment";

interface S3Config {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  S3_BUCKET_NAME: string;
}

@Injectable({
  providedIn: 'root'
})
export class S3Service {
  private s3Client!: S3Client;
  private bucket!: string;
  private region!: string;
  private initialized = false;

  constructor(private http: HttpClient) {}

  /**
   * Initialiser le client S3 avec les credentials du backend
   * ⚠️ À appeler AVANT toute opération S3
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // ✅ Récupérer les credentials depuis le backend
      const config = await firstValueFrom(
        this.http.get<S3Config>(`/config/s3`)
      );

      this.bucket = config.S3_BUCKET_NAME;
      this.region = config.AWS_REGION;

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: config.AWS_ACCESS_KEY_ID,
          secretAccessKey: config.AWS_SECRET_ACCESS_KEY
        }
      });

      this.initialized = true;
      console.log('✅ S3 Client initialisé avec succès');

    } catch (error: any) {
      console.error('❌ Erreur initialisation S3:', error);
      throw new Error('Impossible de charger la configuration S3');
    }
  }

  /**
   * Vérifier que le service est initialisé
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('S3Service non initialisé. Appelez initialize() d\'abord.');
    }
  }

  /**
   * Upload un fichier vers S3
   * @param file - Le fichier à uploader
   * @param type - 'banners' ou 'infografias'
   * @param titulo - Nom du dossier parent
   * @returns L'URL publique (banners) ou la clé S3 (infografias)
   */
  async uploadFile(file: File, type: 'banners' | 'infografias', titulo: string): Promise<string> {
    this.ensureInitialized();

    if (!file) {
      throw new Error('Aucun fichier fourni pour l\'upload');
    }

    try {
      const folder = type === 'banners' ? 'public/banners' : 'private/infografias';

      const sanitizedFileName = this.sanitizeFileName(file.name);
      const sanitizedFolderName = this.sanitizeFileName(titulo);

      const key = `${folder}/${sanitizedFolderName}/${sanitizedFileName}`;

      const arrayBuffer = await this.fileToArrayBuffer(file);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: this.sanitizeMetadata(file.name),
          uploadDate: new Date().toISOString(),
          fileSize: file.size.toString(),
          type: type
        }
      });

      console.log('🚀 Upload vers:', { bucket: this.bucket, key, type });

      await this.s3Client.send(command);

      console.log('✅ Upload réussi:', key);

      return type === 'banners'
        ? `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
        : key;

    } catch (error: any) {
      console.error('❌ Erreur upload S3:', {
        message: error.message,
        code: error.Code || error.code,
        statusCode: error.$metadata?.httpStatusCode
      });
      throw new Error(`Échec de l'upload du fichier "${file.name}": ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * @param files - Liste des fichiers à uploader
   * @param type - 'banners' ou 'infografias'
   * @param titulo - Nom du dossier parent
   * @returns Liste des URLs/clés S3
   */
  async uploadMultipleFiles(files: File[], type: 'banners' | 'infografias', titulo: string): Promise<string[]> {
    this.ensureInitialized();

    if (!files || files.length === 0) {
      throw new Error('Aucun fichier fourni pour l\'upload');
    }

    try {
      const uploadPromises = files.map(file => this.uploadFile(file, type, titulo));
      const results = await Promise.all(uploadPromises);

      console.log(`✅ ${results.length} fichier(s) uploadé(s) avec succès`);

      return results;
    } catch (error: any) {
      console.error('❌ Erreur upload multiple:', error);
      throw new Error(`Échec de l'upload de fichiers multiples: ${error.message}`);
    }
  }

  /**
   * Générer URL publique à partir d'une clé S3
   * @param key - La clé S3 (ex: "public/banners/image.jpg")
   * @returns URL publique
   */
  getPublicUrl(key: string): string {
    this.ensureInitialized();
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Supprimer un fichier par son URL
   * @param url - URL complète du fichier S3
   */
  async deleteFileByUrl(url: string): Promise<void> {
    this.ensureInitialized();

    try {
      const key = this.extractKeyFromUrl(url);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      console.log('🗑️ Suppression de:', key);
      await this.s3Client.send(command);
      console.log('✅ Fichier supprimé:', key);

    } catch (error: any) {
      console.error('❌ Erreur suppression S3:', error);
      throw new Error(`Échec de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprimer plusieurs fichiers
   * @param urls - Liste des URLs S3
   */
  async deleteMultipleFiles(urls: string[]): Promise<void> {
    this.ensureInitialized();

    if (!urls || urls.length === 0) return;

    try {
      const deletePromises = urls.map(url => this.deleteFileByUrl(url));
      await Promise.all(deletePromises);
      console.log(`✅ ${urls.length} fichier(s) supprimé(s)`);
    } catch (error: any) {
      console.error('❌ Erreur suppression multiple:', error);
      throw new Error(`Échec de la suppression multiple: ${error.message}`);
    }
  }

  /**
   * Convertir un File en ArrayBuffer
   */
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur de conversion du fichier'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur de lecture du fichier'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Sanitiser le nom de fichier pour S3 (clé)
   */
  private sanitizeFileName(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

    const cleanName = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .toLowerCase();

    return cleanName + extension.toLowerCase();
  }

  /**
   * Sanitiser les métadonnées pour S3 (ASCII uniquement)
   */
  private sanitizeMetadata(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\xFF]/g, '')
      .replace(/[^\x20-\x7E]/g, '_');
  }

  /**
   * Extraire la clé S3 depuis une URL complète
   */
  private extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch (error) {
      throw new Error(`URL invalide: ${url}`);
    }
  }
}
