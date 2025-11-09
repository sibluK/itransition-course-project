import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client({
    region: region!,
    credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
    },
});

export type UploadResult = { url: string; key: string };

export const uploadFileToS3 = async (buffer: Buffer, contentType?: string) => {
    const key = uuidv4();
    const params = {
        Bucket: bucketName!,
        Key: key,
        Body: buffer,
        ContentType: contentType ?? 'application/octet-stream',
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return { url, key };
}

export const deleteFileFromS3 = async (url: string) => {
    if (!url) return;
    try {
        const params = { Bucket: bucketName!, Key: extractKeyFromUrl(url)! };
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw error;
    }
}

const extractKeyFromUrl = (url: string): string | null => {
    return url.split('amazonaws.com/')[1] || null;
}
