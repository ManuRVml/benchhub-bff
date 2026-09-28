import { v04QuerySchema, v04ResponseSchema } from './analyses/v-04-analyses.js';
import {
  v05QuerySchema,
  v05ResponseSchema,
} from './analysis-definition/v-05-analysis-definition.js';
import { v08ResponseSchema } from './analysis-definition/v-08-analysis-validation.js';
import { v46QuerySchema, v46ResponseSchema } from './assistant/v-46-assistant-context.js';
import { v06QuerySchema, v06ResponseSchema } from './catalogs/v-06-competitor-catalog.js';
import { v07QuerySchema, v07ResponseSchema } from './catalogs/v-07-indicator-catalog.js';
import { c01RequestSchema, c01ResponseSchema } from './commands/c-01-create-analysis-draft.js';
import { c02RequestSchema, c02ResponseSchema } from './commands/c-02-save-analysis-draft.js';
import { c03RequestSchema, c03ResponseSchema } from './commands/c-03-generate-analysis.js';
import { c04RequestSchema, c04ResponseSchema } from './commands/c-04-add-company.js';
import { c05RequestSchema, c05ResponseSchema } from './commands/c-05-remove-company.js';
import { c06RequestSchema, c06ResponseSchema } from './commands/c-06-batch-value-overrides.js';
import { c07RequestSchema, c07ResponseSchema } from './commands/c-07-batch-weight-overrides.js';
import { c08RequestSchema, c08ResponseSchema } from './commands/c-08-recalculations.js';
import { c09RequestSchema, c09ResponseSchema } from './commands/c-09-publish-analysis.js';
import { c10RequestSchema, c10ResponseSchema } from './commands/c-10-create-review-comment.js';
import { c11RequestSchema, c11ResponseSchema } from './commands/c-11-update-review-comment.js';
import { c12RequestSchema, c12ResponseSchema } from './commands/c-12-create-change-request.js';
import { c13RequestSchema, c13ResponseSchema } from './commands/c-13-update-change-request.js';
import { c14RequestSchema, c14ResponseSchema } from './commands/c-14-export-product.js';
import {
  c15RequestSchema,
  c15ResponseSchema,
} from './commands/c-15-generate-executive-narrative.js';
import { c16RequestSchema, c16ResponseSchema } from './commands/c-16-update-kvi-targets.js';
import {
  c17RequestSchema,
  c17ResponseSchema,
} from './commands/c-17-update-value-monitor-config.js';
import { c18RequestSchema, c18ResponseSchema } from './commands/c-18-add-indicator-to-monitor.js';
import { c19RequestSchema, c19ResponseSchema } from './commands/c-19-save-view.js';
import { c20RequestSchema, c20ResponseSchema } from './commands/c-20-delete-saved-view.js';
import { c21RequestSchema, c21ResponseSchema } from './commands/c-21-evaluate-sensitivity.js';
import {
  c22RequestSchema,
  c22ResponseSchema,
} from './commands/c-22-validate-sensitivity-suggestion.js';
import {
  c23RequestSchema,
  c23ResponseSchema,
} from './commands/c-23-save-sensitivity-simulation.js';
import { c24RequestSchema, c24ResponseSchema } from './commands/c-24-evaluate-weight-simulation.js';
import { c25RequestSchema, c25ResponseSchema } from './commands/c-25-generate-strategic-plan.js';
import { c26RequestSchema, c26ResponseSchema } from './commands/c-26-update-strategic-plan.js';
import { c27RequestSchema, c27ResponseSchema } from './commands/c-27-create-presentation-draft.js';
import {
  c28RequestSchema,
  c28ResponseSchema,
} from './commands/c-28-update-presentation-builder.js';
import { c29RequestSchema, c29ResponseSchema } from './commands/c-29-publish-presentation.js';
import { c30RequestSchema, c30ResponseSchema } from './commands/c-30-upload-presentation.js';
import { c31RequestSchema, c31ResponseSchema } from './commands/c-31-remove-uploaded-version.js';
import { c32RequestSchema, c32ResponseSchema } from './commands/c-32-generate-slide-comment.js';
import { c33RequestSchema, c33ResponseSchema } from './commands/c-33-send-assistant-message.js';
import { c34RequestSchema, c34ResponseSchema } from './commands/c-34-submit-assistant-feedback.js';
import { c35RequestSchema, c35ResponseSchema } from './commands/c-35-mark-notification-read.js';
import {
  c36RequestSchema,
  c36ResponseSchema,
} from './commands/c-36-mark-all-notifications-read.js';
import { c37RequestSchema, c37ResponseSchema } from './commands/c-37-update-user-settings.js';
import { c38RequestSchema, c38ResponseSchema } from './commands/c-38-save-comparison-profile.js';
import { c39RequestSchema, c39ResponseSchema } from './commands/c-39-update-comparison-profile.js';
import { c40RequestSchema, c40ResponseSchema } from './commands/c-40-delete-comparison-profile.js';
import { c41RequestSchema, c41ResponseSchema } from './commands/c-41-preview-invitations.js';
import { v26QuerySchema, v26ResponseSchema } from './comments/v-26-comment-thread.js';
import { v25ResponseSchema } from './company-profile/v-25-company-profile.js';
import {
  V24_SECTIONS,
  v24QuerySchema,
  v24ResponseSchema,
} from './indicator-detail/v-24-indicator-detail.js';
import { v44QuerySchema, v44ResponseSchema } from './notifications/v-44-notifications.js';
import { o01ResponseSchema } from './operations/o-01-operation-status.js';
import { o02ResponseSchema } from './operations/o-02-operation-events.js';
import { o03RequestSchema, o03ResponseSchema } from './operations/o-03-file-download.js';
import { o04ResponseSchema } from './operations/o-04-health-ready.js';
import { o05ResponseSchema } from './operations/o-05-ready.js';
import { v40QuerySchema, v40ResponseSchema } from './presentations/v-40-presentations.js';
import { v41ResponseSchema } from './presentations/v-41-presentation-builder.js';
import { v42QuerySchema, v42ResponseSchema } from './presentations/v-42-presentation-slides.js';
import { v43ResponseSchema } from './presentations/v-43-presentation-detail.js';
import { v09QuerySchema, v09ResponseSchema } from './results/v-09-results-header.js';
import {
  V10_SECTIONS,
  v10QuerySchema,
  v10ResponseSchema,
} from './results/v-10-company-coverage.js';
import { v11QuerySchema, v11ResponseSchema } from './results/v-11-peer-average-comparison.js';
import { v12QuerySchema, v12ResponseSchema } from './results/v-12-company-comparison.js';
import { v13QuerySchema, v13ResponseSchema } from './results/v-13-report-summary.js';
import { v14QuerySchema, v14ResponseSchema } from './results/v-14-ai-findings.js';
import {
  v15RequestSchema,
  v15ResponseSchema,
} from './results-tbg/v-15-tbg-indicator-comparator.js';
import { v16RequestSchema, v16ResponseSchema } from './results-tbg/v-16-future-aspiration.js';
import { v17RequestSchema, v17ResponseSchema } from './results-tbg/v-17-tbg-horizon.js';
import { v18RequestSchema, v18ResponseSchema } from './results-tbg/v-18-tbg-dimension-weights.js';
import { v19RequestSchema, v19ResponseSchema } from './results-tbg/v-19-comparison-profiles.js';
import { v47QuerySchema, v47ResponseSchema } from './saved-views/v-47-saved-views.js';
import { v37QuerySchema, v37ResponseSchema } from './sensitivities/v-37-sensitivity-drivers.js';
import { v38ResponseSchema } from './sensitivities/v-38-sensitivity-scenarios.js';
import { v39ResponseSchema } from './sensitivities/v-39-weight-simulator.js';
import { a01QuerySchema, a01ResponseSchema } from './session/a-01-auth-login.js';
import { a02QuerySchema, a02ResponseSchema } from './session/a-02-auth-callback.js';
import { a03RequestSchema, a03ResponseSchema } from './session/a-03-auth-logout.js';
import { a04ResponseSchema } from './session/a-04-session.js';
import { a05RequestSchema, a05ResponseSchema } from './session/a-05-password-login.js';
import { v45ResponseSchema } from './settings/v-45-user-settings.js';
import { v01ResponseSchema } from './shell/v-01-shell-status.js';
import { v02ResponseSchema } from './shell/v-02-admin-home.js';
import {
  V27_SECTIONS,
  v27QuerySchema,
  v27ResponseSchema,
} from './value-monitor/v-27-value-monitor.js';
import {
  v28QuerySchema,
  v28ResponseSchema,
} from './value-monitor/v-28-value-monitor-peer-ranking.js';
import { v29QuerySchema, v29ResponseSchema } from './value-monitor/v-29-value-monitor-history.js';
import { v30QuerySchema, v30ResponseSchema } from './value-monitor/v-30-value-monitor-kvis.js';
import {
  v31QuerySchema,
  v31ResponseSchema,
} from './value-monitor/v-31-value-monitor-composition.js';
import { v32ResponseSchema } from './value-monitor/v-32-value-monitor-configuration.js';
import { v33RequestSchema, v33ResponseSchema } from './value-monitor/v-33-kvi-traceability.js';
import { v34RequestSchema, v34ResponseSchema } from './value-monitor/v-34-kvi-candidates.js';
import {
  v35RequestSchema,
  v35ResponseSchema,
} from './value-monitor/v-35-value-monitor-recommendations.js';
import {
  V36_SECTIONS,
  v36RequestSchema,
  v36ResponseSchema,
} from './value-monitor/v-36-value-monitor-benchmark-radar.js';
import { V03_SECTIONS, v03ResponseSchema } from './views/v-03-home.js';
import { V20_SECTIONS, v20ResponseSchema } from './visualization/v-20-visualization.js';
import { v21RequestSchema, v21ResponseSchema } from './visualization/v-21-peer-weight-ranking.js';
import { v22RequestSchema, v22ResponseSchema } from './visualization/v-22-category-indicators.js';
import {
  v23RequestSchema,
  v23ResponseSchema,
} from './visualization/v-23-weight-recommendations.js';

import type { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ContractEndpoint {
  method: HttpMethod;
  /** Express-style path from the contract's "- Endpoint:" line; path params stay as `:param`. */
  path: string;
}

export interface ContractEntry {
  /** HTTP method and path of the contract; P3-02 builds the OpenAPI paths from it. */
  endpoint: ContractEndpoint;
  /** camelCase OpenAPI operationId, unique across the registry. */
  operationId: string;
  request?: z.ZodType;
  response: z.ZodType;
  /** Response keys wrapped in `sectionResult(...)`; each must also parse as `error` and `forbidden`. */
  sections?: readonly string[];
}

/** Every contract id (A-/V-/C-/O-nn of web view-data-contracts) with its Zod schemas. Rows add their ids here. */
export const CONTRACT_SCHEMAS: Record<string, ContractEntry> = {
  'A-01': {
    endpoint: { method: 'GET', path: '/api/v1/auth/login' },
    operationId: 'startLogin',
    request: a01QuerySchema,
    response: a01ResponseSchema,
  },
  'A-02': {
    endpoint: { method: 'GET', path: '/api/v1/auth/callback' },
    operationId: 'completeLogin',
    request: a02QuerySchema,
    response: a02ResponseSchema,
  },
  'A-03': {
    endpoint: { method: 'POST', path: '/api/v1/auth/logout' },
    operationId: 'logout',
    request: a03RequestSchema,
    response: a03ResponseSchema,
  },
  'A-04': {
    endpoint: { method: 'GET', path: '/api/v1/session' },
    operationId: 'getSession',
    response: a04ResponseSchema,
  },
  'A-05': {
    endpoint: { method: 'POST', path: '/api/v1/auth/password-login' },
    operationId: 'passwordLogin',
    request: a05RequestSchema,
    response: a05ResponseSchema,
  },
  'V-01': {
    endpoint: { method: 'GET', path: '/api/v1/views/shell-status' },
    operationId: 'getShellStatusView',
    response: v01ResponseSchema,
  },
  'V-02': {
    endpoint: { method: 'GET', path: '/api/v1/views/admin-home' },
    operationId: 'getAdminHomeView',
    response: v02ResponseSchema,
  },
  'V-03': {
    endpoint: { method: 'GET', path: '/api/v1/views/home' },
    operationId: 'getHomeView',
    response: v03ResponseSchema,
    sections: V03_SECTIONS,
  },
  'V-09': {
    endpoint: { method: 'GET', path: '/api/v1/views/results-header/:analysisId' },
    operationId: 'getResultsHeaderView',
    request: v09QuerySchema,
    response: v09ResponseSchema,
  },
  'V-10': {
    endpoint: { method: 'GET', path: '/api/v1/views/company-coverage/:analysisId' },
    operationId: 'getCompanyCoverageView',
    request: v10QuerySchema,
    response: v10ResponseSchema,
    sections: V10_SECTIONS,
  },
  'V-11': {
    endpoint: { method: 'GET', path: '/api/v1/views/peer-average-comparison/:analysisId' },
    operationId: 'getPeerAverageComparisonView',
    request: v11QuerySchema,
    response: v11ResponseSchema,
  },
  'V-12': {
    endpoint: { method: 'GET', path: '/api/v1/views/company-comparison/:analysisId' },
    operationId: 'getCompanyComparisonView',
    request: v12QuerySchema,
    response: v12ResponseSchema,
  },
  'V-13': {
    endpoint: { method: 'GET', path: '/api/v1/views/report-summary/:analysisId' },
    operationId: 'getReportSummaryView',
    request: v13QuerySchema,
    response: v13ResponseSchema,
  },
  'V-14': {
    endpoint: { method: 'GET', path: '/api/v1/views/ai-findings/:analysisId' },
    operationId: 'getAiFindingsView',
    request: v14QuerySchema,
    response: v14ResponseSchema,
  },
  'V-15': {
    endpoint: { method: 'GET', path: '/api/v1/views/tbg-indicator-comparator/:analysisId' },
    operationId: 'getTbgIndicatorComparatorView',
    request: v15RequestSchema,
    response: v15ResponseSchema,
  },
  'V-16': {
    endpoint: { method: 'GET', path: '/api/v1/views/future-aspiration/:analysisId' },
    operationId: 'getFutureAspirationView',
    request: v16RequestSchema,
    response: v16ResponseSchema,
  },
  'V-17': {
    endpoint: { method: 'GET', path: '/api/v1/views/tbg-horizon/:analysisId' },
    operationId: 'getTbgHorizonView',
    request: v17RequestSchema,
    response: v17ResponseSchema,
  },
  'V-18': {
    endpoint: { method: 'GET', path: '/api/v1/views/tbg-dimension-weights/:analysisId' },
    operationId: 'getTbgDimensionWeightsView',
    request: v18RequestSchema,
    response: v18ResponseSchema,
  },
  'V-19': {
    endpoint: { method: 'GET', path: '/api/v1/views/comparison-profiles/:analysisId' },
    operationId: 'getComparisonProfilesView',
    request: v19RequestSchema,
    response: v19ResponseSchema,
  },
  'V-20': {
    endpoint: { method: 'GET', path: '/api/v1/views/visualization/:analysisId' },
    operationId: 'getVisualizationView',
    response: v20ResponseSchema,
    sections: V20_SECTIONS,
  },
  'V-21': {
    endpoint: { method: 'GET', path: '/api/v1/views/peer-weight-ranking/:analysisId' },
    operationId: 'getPeerWeightRankingView',
    request: v21RequestSchema,
    response: v21ResponseSchema,
  },
  'V-22': {
    endpoint: { method: 'GET', path: '/api/v1/views/category-indicators/:analysisId' },
    operationId: 'getCategoryIndicatorsView',
    request: v22RequestSchema,
    response: v22ResponseSchema,
  },
  'V-23': {
    endpoint: { method: 'GET', path: '/api/v1/views/weight-recommendations/:analysisId' },
    operationId: 'getWeightRecommendationsView',
    request: v23RequestSchema,
    response: v23ResponseSchema,
  },
  'C-01': {
    endpoint: { method: 'POST', path: '/api/v1/analysis-drafts' },
    operationId: 'createAnalysisDraft',
    request: c01RequestSchema,
    response: c01ResponseSchema,
  },
  'C-02': {
    endpoint: { method: 'PATCH', path: '/api/v1/analysis-drafts/:draftId' },
    operationId: 'updateAnalysisDraft',
    request: c02RequestSchema,
    response: c02ResponseSchema,
  },
  'C-03': {
    endpoint: { method: 'POST', path: '/api/v1/analysis-drafts/:draftId/generation' },
    operationId: 'generateAnalysis',
    request: c03RequestSchema,
    response: c03ResponseSchema,
  },
  'C-04': {
    endpoint: { method: 'POST', path: '/api/v1/analyses/:analysisId/companies' },
    operationId: 'addAnalysisCompany',
    request: c04RequestSchema,
    response: c04ResponseSchema,
  },
  'C-05': {
    endpoint: { method: 'DELETE', path: '/api/v1/analyses/:analysisId/companies/:companyId' },
    operationId: 'removeAnalysisCompany',
    request: c05RequestSchema,
    response: c05ResponseSchema,
  },
  'C-06': {
    endpoint: { method: 'PATCH', path: '/api/v1/analyses/:analysisId/value-overrides' },
    operationId: 'updateValueOverrides',
    request: c06RequestSchema,
    response: c06ResponseSchema,
  },
  'C-07': {
    endpoint: { method: 'PATCH', path: '/api/v1/analyses/:analysisId/weight-overrides' },
    operationId: 'updateWeightOverrides',
    request: c07RequestSchema,
    response: c07ResponseSchema,
  },
  'C-08': {
    endpoint: { method: 'POST', path: '/api/v1/recalculations' },
    operationId: 'createRecalculation',
    request: c08RequestSchema,
    response: c08ResponseSchema,
  },
  'C-09': {
    endpoint: { method: 'POST', path: '/api/v1/publications' },
    operationId: 'publishAnalysis',
    request: c09RequestSchema,
    response: c09ResponseSchema,
  },
  'C-10': {
    endpoint: { method: 'POST', path: '/api/v1/review-comments' },
    operationId: 'createReviewComment',
    request: c10RequestSchema,
    response: c10ResponseSchema,
  },
  'C-11': {
    endpoint: { method: 'PATCH', path: '/api/v1/review-comments/:commentId' },
    operationId: 'updateReviewComment',
    request: c11RequestSchema,
    response: c11ResponseSchema,
  },
  'C-12': {
    endpoint: { method: 'POST', path: '/api/v1/change-requests' },
    operationId: 'createChangeRequest',
    request: c12RequestSchema,
    response: c12ResponseSchema,
  },
  'C-13': {
    endpoint: { method: 'PATCH', path: '/api/v1/change-requests/:requestId' },
    operationId: 'updateChangeRequest',
    request: c13RequestSchema,
    response: c13ResponseSchema,
  },
  'C-14': {
    endpoint: { method: 'POST', path: '/api/v1/exports' },
    operationId: 'createExport',
    request: c14RequestSchema,
    response: c14ResponseSchema,
  },
  'C-15': {
    endpoint: { method: 'POST', path: '/api/v1/executive-narratives' },
    operationId: 'generateExecutiveNarrative',
    request: c15RequestSchema,
    response: c15ResponseSchema,
  },
  'C-16': {
    endpoint: { method: 'PATCH', path: '/api/v1/kvis/:kviId/targets' },
    operationId: 'updateKviTargets',
    request: c16RequestSchema,
    response: c16ResponseSchema,
  },
  'C-17': {
    endpoint: { method: 'PUT', path: '/api/v1/value-monitor-configuration' },
    operationId: 'updateValueMonitorConfiguration',
    request: c17RequestSchema,
    response: c17ResponseSchema,
  },
  'C-18': {
    endpoint: { method: 'POST', path: '/api/v1/value-monitor-kvis' },
    operationId: 'addValueMonitorKvis',
    request: c18RequestSchema,
    response: c18ResponseSchema,
  },
  'C-19': {
    endpoint: { method: 'POST', path: '/api/v1/saved-views' },
    operationId: 'createSavedView',
    request: c19RequestSchema,
    response: c19ResponseSchema,
  },
  'C-20': {
    endpoint: { method: 'DELETE', path: '/api/v1/saved-views/:viewId' },
    operationId: 'deleteSavedView',
    request: c20RequestSchema,
    response: c20ResponseSchema,
  },
  'C-21': {
    endpoint: { method: 'POST', path: '/api/v1/sensitivity-evaluations' },
    operationId: 'evaluateSensitivity',
    request: c21RequestSchema,
    response: c21ResponseSchema,
  },
  'C-22': {
    endpoint: { method: 'POST', path: '/api/v1/sensitivity-suggestions/:suggestionId/validation' },
    operationId: 'validateSensitivitySuggestion',
    request: c22RequestSchema,
    response: c22ResponseSchema,
  },
  'C-23': {
    endpoint: { method: 'POST', path: '/api/v1/sensitivity-simulations' },
    operationId: 'createSensitivitySimulation',
    request: c23RequestSchema,
    response: c23ResponseSchema,
  },
  'C-24': {
    endpoint: { method: 'POST', path: '/api/v1/weight-simulation-evaluations' },
    operationId: 'evaluateWeightSimulation',
    request: c24RequestSchema,
    response: c24ResponseSchema,
  },
  'V-04': {
    endpoint: { method: 'GET', path: '/api/v1/views/analyses' },
    operationId: 'getAnalysesView',
    request: v04QuerySchema,
    response: v04ResponseSchema,
  },
  'V-05': {
    endpoint: { method: 'GET', path: '/api/v1/views/analysis-definition/:draftId' },
    operationId: 'getAnalysisDefinitionView',
    request: v05QuerySchema,
    response: v05ResponseSchema,
  },
  'V-06': {
    endpoint: { method: 'GET', path: '/api/v1/views/competitor-catalog' },
    operationId: 'getCompetitorCatalogView',
    request: v06QuerySchema,
    response: v06ResponseSchema,
  },
  'V-07': {
    endpoint: { method: 'GET', path: '/api/v1/views/indicator-catalog' },
    operationId: 'getIndicatorCatalogView',
    request: v07QuerySchema,
    response: v07ResponseSchema,
  },
  'V-08': {
    endpoint: { method: 'GET', path: '/api/v1/views/analysis-validation/:draftId' },
    operationId: 'getAnalysisValidationView',
    response: v08ResponseSchema,
  },
  'C-25': {
    endpoint: { method: 'POST', path: '/api/v1/strategic-plans' },
    operationId: 'createStrategicPlan',
    request: c25RequestSchema,
    response: c25ResponseSchema,
  },
  'C-26': {
    endpoint: { method: 'PATCH', path: '/api/v1/strategic-plans/:planId' },
    operationId: 'updateStrategicPlan',
    request: c26RequestSchema,
    response: c26ResponseSchema,
  },
  'C-27': {
    endpoint: { method: 'POST', path: '/api/v1/presentations' },
    operationId: 'createPresentation',
    request: c27RequestSchema,
    response: c27ResponseSchema,
  },
  'C-28': {
    endpoint: { method: 'PATCH', path: '/api/v1/presentations/:presentationId' },
    operationId: 'updatePresentation',
    request: c28RequestSchema,
    response: c28ResponseSchema,
  },
  'C-29': {
    endpoint: { method: 'POST', path: '/api/v1/presentations/:presentationId/publication' },
    operationId: 'publishPresentation',
    request: c29RequestSchema,
    response: c29ResponseSchema,
  },
  'C-30': {
    endpoint: { method: 'PUT', path: '/api/v1/presentations/:presentationId/uploaded-version' },
    operationId: 'uploadPresentationVersion',
    request: c30RequestSchema,
    response: c30ResponseSchema,
  },
  'C-31': {
    endpoint: { method: 'DELETE', path: '/api/v1/presentations/:presentationId/uploaded-version' },
    operationId: 'deletePresentationVersion',
    request: c31RequestSchema,
    response: c31ResponseSchema,
  },
  'C-32': {
    endpoint: { method: 'POST', path: '/api/v1/slide-comment-drafts' },
    operationId: 'createSlideCommentDraft',
    request: c32RequestSchema,
    response: c32ResponseSchema,
  },
  'C-33': {
    endpoint: { method: 'POST', path: '/api/v1/assistant/messages' },
    operationId: 'sendAssistantMessage',
    request: c33RequestSchema,
    response: c33ResponseSchema,
  },
  'C-34': {
    endpoint: { method: 'POST', path: '/api/v1/assistant/feedback' },
    operationId: 'createAssistantFeedback',
    request: c34RequestSchema,
    response: c34ResponseSchema,
  },
  'C-35': {
    endpoint: { method: 'PATCH', path: '/api/v1/notifications/:notificationId/read' },
    operationId: 'markNotificationRead',
    request: c35RequestSchema,
    response: c35ResponseSchema,
  },
  'C-36': {
    endpoint: { method: 'POST', path: '/api/v1/notifications/read-all' },
    operationId: 'markAllNotificationsRead',
    request: c36RequestSchema,
    response: c36ResponseSchema,
  },
  'C-37': {
    endpoint: { method: 'PATCH', path: '/api/v1/user-settings' },
    operationId: 'updateUserSettings',
    request: c37RequestSchema,
    response: c37ResponseSchema,
  },
  'C-38': {
    endpoint: { method: 'POST', path: '/api/v1/analyses/:analysisId/comparison-profiles' },
    operationId: 'createComparisonProfile',
    request: c38RequestSchema,
    response: c38ResponseSchema,
  },
  'C-39': {
    endpoint: {
      method: 'PATCH',
      path: '/api/v1/analyses/:analysisId/comparison-profiles/:profileId',
    },
    operationId: 'updateComparisonProfile',
    request: c39RequestSchema,
    response: c39ResponseSchema,
  },
  'C-40': {
    endpoint: {
      method: 'DELETE',
      path: '/api/v1/analyses/:analysisId/comparison-profiles/:profileId',
    },
    operationId: 'deleteComparisonProfile',
    request: c40RequestSchema,
    response: c40ResponseSchema,
  },
  'C-41': {
    endpoint: { method: 'POST', path: '/api/v1/analyses/:analysisId/preview-invitations' },
    operationId: 'createPreviewInvitations',
    request: c41RequestSchema,
    response: c41ResponseSchema,
  },
  'O-01': {
    endpoint: { method: 'GET', path: '/api/v1/operations/:operationId' },
    operationId: 'getOperationStatus',
    response: o01ResponseSchema,
  },
  'O-02': {
    endpoint: { method: 'GET', path: '/api/v1/operations/:operationId/events' },
    operationId: 'getOperationEvents',
    response: o02ResponseSchema,
  },
  'O-03': {
    endpoint: { method: 'GET', path: '/api/v1/files/:fileId/download' },
    operationId: 'downloadFile',
    request: o03RequestSchema,
    response: o03ResponseSchema,
  },
  'O-04': {
    endpoint: { method: 'GET', path: '/api/v1/health' },
    operationId: 'getHealth',
    response: o04ResponseSchema,
  },
  'O-05': {
    endpoint: { method: 'GET', path: '/api/v1/ready' },
    operationId: 'getReadiness',
    response: o05ResponseSchema,
  },
  'V-37': {
    endpoint: { method: 'GET', path: '/api/v1/views/sensitivity-drivers' },
    operationId: 'getSensitivityDriversView',
    request: v37QuerySchema,
    response: v37ResponseSchema,
  },
  'V-38': {
    endpoint: { method: 'GET', path: '/api/v1/views/sensitivity-scenarios' },
    operationId: 'getSensitivityScenariosView',
    response: v38ResponseSchema,
  },
  'V-39': {
    endpoint: { method: 'GET', path: '/api/v1/views/weight-simulator' },
    operationId: 'getWeightSimulatorView',
    response: v39ResponseSchema,
  },
  'V-27': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor' },
    operationId: 'getValueMonitorView',
    request: v27QuerySchema,
    response: v27ResponseSchema,
    sections: V27_SECTIONS,
  },
  'V-28': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-peer-ranking' },
    operationId: 'getValueMonitorPeerRankingView',
    request: v28QuerySchema,
    response: v28ResponseSchema,
  },
  'V-29': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-history' },
    operationId: 'getValueMonitorHistoryView',
    request: v29QuerySchema,
    response: v29ResponseSchema,
  },
  'V-30': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-kvis' },
    operationId: 'getValueMonitorKvisView',
    request: v30QuerySchema,
    response: v30ResponseSchema,
  },
  'V-31': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-composition' },
    operationId: 'getValueMonitorCompositionView',
    request: v31QuerySchema,
    response: v31ResponseSchema,
  },
  'V-32': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-configuration' },
    operationId: 'getValueMonitorConfigurationView',
    response: v32ResponseSchema,
  },
  'V-33': {
    endpoint: { method: 'GET', path: '/api/v1/views/kvi-traceability/:kviId' },
    operationId: 'getKviTraceabilityView',
    request: v33RequestSchema,
    response: v33ResponseSchema,
  },
  'V-34': {
    endpoint: { method: 'GET', path: '/api/v1/views/kvi-candidates' },
    operationId: 'getKviCandidatesView',
    request: v34RequestSchema,
    response: v34ResponseSchema,
  },
  'V-35': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-recommendations' },
    operationId: 'getValueMonitorRecommendationsView',
    request: v35RequestSchema,
    response: v35ResponseSchema,
  },
  'V-36': {
    endpoint: { method: 'GET', path: '/api/v1/views/value-monitor-benchmark-radar' },
    operationId: 'getValueMonitorBenchmarkRadarView',
    request: v36RequestSchema,
    response: v36ResponseSchema,
    sections: V36_SECTIONS,
  },
  'V-40': {
    endpoint: { method: 'GET', path: '/api/v1/views/presentations' },
    operationId: 'getPresentationsView',
    request: v40QuerySchema,
    response: v40ResponseSchema,
  },
  'V-41': {
    endpoint: { method: 'GET', path: '/api/v1/views/presentation-builder/:presentationId' },
    operationId: 'getPresentationBuilderView',
    response: v41ResponseSchema,
  },
  'V-42': {
    endpoint: { method: 'GET', path: '/api/v1/views/presentation-slides/:presentationId' },
    operationId: 'getPresentationSlidesView',
    request: v42QuerySchema,
    response: v42ResponseSchema,
  },
  'V-43': {
    endpoint: { method: 'GET', path: '/api/v1/views/presentation-detail/:presentationId' },
    operationId: 'getPresentationDetailView',
    response: v43ResponseSchema,
  },
  'V-44': {
    endpoint: { method: 'GET', path: '/api/v1/views/notifications' },
    operationId: 'getNotificationsView',
    request: v44QuerySchema,
    response: v44ResponseSchema,
  },
  'V-45': {
    endpoint: { method: 'GET', path: '/api/v1/views/user-settings' },
    operationId: 'getUserSettingsView',
    response: v45ResponseSchema,
  },
  'V-46': {
    endpoint: { method: 'GET', path: '/api/v1/views/assistant-context' },
    operationId: 'getAssistantContextView',
    request: v46QuerySchema,
    response: v46ResponseSchema,
  },
  'V-47': {
    endpoint: { method: 'GET', path: '/api/v1/views/saved-views' },
    operationId: 'getSavedViewsView',
    request: v47QuerySchema,
    response: v47ResponseSchema,
  },
  'V-24': {
    endpoint: { method: 'GET', path: '/api/v1/views/indicator-detail/:analysisId/:indicatorId' },
    operationId: 'getIndicatorDetailView',
    request: v24QuerySchema,
    response: v24ResponseSchema,
    sections: V24_SECTIONS,
  },
  'V-25': {
    endpoint: { method: 'GET', path: '/api/v1/views/company-profile/:companyId' },
    operationId: 'getCompanyProfileView',
    response: v25ResponseSchema,
  },
  'V-26': {
    endpoint: { method: 'GET', path: '/api/v1/views/comment-thread' },
    operationId: 'getCommentThreadView',
    request: v26QuerySchema,
    response: v26ResponseSchema,
  },
};

/** Registry summary printed by tools/contract/list-registry.ts (read by the Phase-3 acceptance check). */
export function listRegistry() {
  return Object.fromEntries(
    Object.entries(CONTRACT_SCHEMAS).map(([id, entry]) => [
      id,
      {
        endpoint: { ...entry.endpoint },
        operationId: entry.operationId,
        request: Boolean(entry.request),
        response: Boolean(entry.response),
        sections: [...(entry.sections ?? [])],
      },
    ]),
  );
}
