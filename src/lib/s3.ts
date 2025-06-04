/* ----------------------------------------------------------------
   Very small S3 helper – unchanged logic, only one note added
   ---------------------------------------------------------------- */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID }                  from 'crypto';
import { extname }                     from 'node:path';

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId    : process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload bytes to S3 and return a public HTTPS URL.
 * The bucket is configured with “Bucket-owner-enforced”.
 * → **DO NOT** attach an ACL here – it would be rejected.
 */
export async function uploadToS3(
  buffer      : Buffer,
  mimeType    : string,
  prefix      : string,
  originalName = 'file',
) {
  const key = `${prefix}/${Date.now()}-${randomUUID()}${extname(originalName)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket      : process.env.AWS_S3_BUCKET_NAME!,
      Key         : key,
      Body        : buffer,
      ContentType : mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
