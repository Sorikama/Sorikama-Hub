// src/database/models/serviceRequest.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  serviceId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  serviceId: { type: String, required: true, index: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  userAgent: { type: String },
  ip: { type: String },
  success: { type: Boolean, required: true },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const ServiceRequestModel = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);