// Violates application-only-domain-ports: application depends on an HTTP framework.
import express from 'express';

export const router = express.Router();
