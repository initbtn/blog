// src/lib/firestore.ts
import { Firestore, Settings } from '@google-cloud/firestore';

/**
 * Cloud Firestore Singleton Client for Domlog WAS Gateway
 * 
 * - Single WAS proxy principle: 브라우저가 아닌 Next.js Serverless WAS에서만 인스턴스화
 * - Database ID 유연성: 환경변수 FIRESTORE_DATABASE_ID (기본값 '(default)') 지원으로 향후 독립 DB 마이그레이션 대비
 * - GCP Always Free Tier (nam5 / us-central1) 완전 호환
 */

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore | null {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'waffle-dominic';
  const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';

  const settings: Settings = {
    projectId,
    databaseId,
  };

  // 1. Base64 인코딩된 서비스 계정 키 환경변수 지원 (Vercel 배포 시 주로 사용)
  if (process.env.GCP_SA_KEY_BASE64) {
    try {
      const decodedKey = Buffer.from(process.env.GCP_SA_KEY_BASE64, 'base64').toString('utf8');
      const credentials = JSON.parse(decodedKey);
      settings.credentials = credentials;
    } catch (e) {
      console.error('[Firestore] Failed to parse GCP_SA_KEY_BASE64:', e);
    }
  } else if (process.env.GCP_SA_KEY_JSON) {
    try {
      const credentials = JSON.parse(process.env.GCP_SA_KEY_JSON);
      settings.credentials = credentials;
    } catch (e) {
      console.error('[Firestore] Failed to parse GCP_SA_KEY_JSON:', e);
    }
  }

  // 로컬 개발 환경이거나 ADC(Application Default Credentials)가 있거나 키가 주입된 경우 인스턴스 생성
  try {
    firestoreInstance = new Firestore(settings);
    return firestoreInstance;
  } catch (err) {
    console.warn('[Firestore] Client initialization failed or credentials missing (falling back to memory):', err);
    return null;
  }
}

/**
 * 네임스페이스 상수 정의 (추후 독립 DB 마이그레이션 시 단일 컬렉션 Export/Import 용이)
 */
export const FIRESTORE_COLLECTIONS = {
  SESSIONS: 'domlog_chat_sessions',
  MESSAGES: 'messages',
} as const;
