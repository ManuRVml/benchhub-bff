import { z } from 'zod';

// Opaque, branded identifiers. v1 is brand-only (no format regex, BFF-P3.md amendment 1): ids are non-empty strings
// minted by the BFF, and the brand stops one kind of id being passed where another is expected. To add an id kind,
// add one schema line and one type line here.
export const analysisIdSchema = z.string().min(1).brand<'AnalysisId'>();
export const companyIdSchema = z.string().min(1).brand<'CompanyId'>();
export const userIdSchema = z.string().min(1).brand<'UserId'>();
export const notificationIdSchema = z.string().min(1).brand<'NotificationId'>();
export const presentationIdSchema = z.string().min(1).brand<'PresentationId'>();
export const operationIdSchema = z.string().min(1).brand<'OperationId'>();
export const commentIdSchema = z.string().min(1).brand<'CommentId'>();
export const newsIdSchema = z.string().min(1).brand<'NewsId'>();
export const indicatorIdSchema = z.string().min(1).brand<'IndicatorId'>();
export const categoryIdSchema = z.string().min(1).brand<'CategoryId'>();
export const draftIdSchema = z.string().min(1).brand<'DraftId'>();
export const publicationIdSchema = z.string().min(1).brand<'PublicationId'>();
export const changeRequestIdSchema = z.string().min(1).brand<'ChangeRequestId'>();
export const kviIdSchema = z.string().min(1).brand<'KviId'>();
export const savedViewIdSchema = z.string().min(1).brand<'SavedViewId'>();
export const suggestionIdSchema = z.string().min(1).brand<'SuggestionId'>();
export const simulationIdSchema = z.string().min(1).brand<'SimulationId'>();
export const leverIdSchema = z.string().min(1).brand<'LeverId'>();
export const strategicPlanIdSchema = z.string().min(1).brand<'StrategicPlanId'>();
export const presentationVersionIdSchema = z.string().min(1).brand<'PresentationVersionId'>();
export const assistantMessageIdSchema = z.string().min(1).brand<'AssistantMessageId'>();
export const feedbackIdSchema = z.string().min(1).brand<'FeedbackId'>();
export const profileIdSchema = z.string().min(1).brand<'ProfileId'>();
export const fileIdSchema = z.string().min(1).brand<'FileId'>();
export const invitationIdSchema = z.string().min(1).brand<'InvitationId'>();
export const snapshotIdSchema = z.string().min(1).brand<'SnapshotId'>();

export type AnalysisId = z.infer<typeof analysisIdSchema>;
export type CompanyId = z.infer<typeof companyIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type NotificationId = z.infer<typeof notificationIdSchema>;
export type PresentationId = z.infer<typeof presentationIdSchema>;
export type OperationId = z.infer<typeof operationIdSchema>;
export type CommentId = z.infer<typeof commentIdSchema>;
export type NewsId = z.infer<typeof newsIdSchema>;
export type IndicatorId = z.infer<typeof indicatorIdSchema>;
export type CategoryId = z.infer<typeof categoryIdSchema>;
export type DraftId = z.infer<typeof draftIdSchema>;
export type PublicationId = z.infer<typeof publicationIdSchema>;
export type ChangeRequestId = z.infer<typeof changeRequestIdSchema>;
export type KviId = z.infer<typeof kviIdSchema>;
export type SavedViewId = z.infer<typeof savedViewIdSchema>;
export type SuggestionId = z.infer<typeof suggestionIdSchema>;
export type SimulationId = z.infer<typeof simulationIdSchema>;
export type LeverId = z.infer<typeof leverIdSchema>;
export type StrategicPlanId = z.infer<typeof strategicPlanIdSchema>;
export type PresentationVersionId = z.infer<typeof presentationVersionIdSchema>;
export type AssistantMessageId = z.infer<typeof assistantMessageIdSchema>;
export type FeedbackId = z.infer<typeof feedbackIdSchema>;
export type ProfileId = z.infer<typeof profileIdSchema>;
export type FileId = z.infer<typeof fileIdSchema>;
export type InvitationId = z.infer<typeof invitationIdSchema>;
export type SnapshotId = z.infer<typeof snapshotIdSchema>;
