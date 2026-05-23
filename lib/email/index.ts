/* =====================================================================
   lib/email — public API.

   Import from '@/lib/email' to send any of the 13 canonical messages.
   Each sendXxx() returns a SendResult — never throws. Callers can log
   the failure or move on; we never want a stuck send to block the
   order pipeline.
   ===================================================================== */

import { sendEmail, type SendResult, ADMIN_EMAIL } from './client'
import {
  buildBriefReceiptEmail, type BriefReceiptProps,
  buildQuoteEmail,        type QuoteEmailProps,
  buildApprovedEmail,     type ApprovedProps,
  buildSketchEmail,       type SketchProps,
  buildUpdateEmail,       type UpdateProps,
  buildDeliveryEmail,     type DeliveryProps,
  buildReleaseEmail,      type ReleaseProps,
  buildCycleShipsEmail,   type CycleShipsProps,
  buildSubPausedEmail,    type SubPausedProps,
  buildSubResumedEmail,   type SubResumedProps,
  buildRefundEmail,       type RefundProps,
  buildAdminInquiryEmail, type AdminInquiryProps,
  buildAdminPaymentFailedEmail, type AdminPaymentFailedProps,
  buildInquiryAckEmail,   type InquiryAckProps,
  buildAdminBriefEmail,   type AdminBriefProps,
  buildAdminWaitlistEmail, type AdminWaitlistProps,
} from './templates'

export type { SendResult }
export { sendEmail, ADMIN_EMAIL }

export function sendBriefReceiptEmail(p: BriefReceiptProps): Promise<SendResult> {
  return sendEmail(buildBriefReceiptEmail(p))
}
export function sendQuoteEmail(p: QuoteEmailProps): Promise<SendResult> {
  return sendEmail(buildQuoteEmail(p))
}
export function sendApprovedEmail(p: ApprovedProps): Promise<SendResult> {
  return sendEmail(buildApprovedEmail(p))
}
export function sendSketchEmail(p: SketchProps): Promise<SendResult> {
  return sendEmail(buildSketchEmail(p))
}
export function sendUpdateEmail(p: UpdateProps): Promise<SendResult> {
  return sendEmail(buildUpdateEmail(p))
}
export function sendDeliveryEmail(p: DeliveryProps): Promise<SendResult> {
  return sendEmail(buildDeliveryEmail(p))
}
export function sendReleaseEmail(p: ReleaseProps): Promise<SendResult> {
  return sendEmail(buildReleaseEmail(p))
}
export function sendCycleShipsEmail(p: CycleShipsProps): Promise<SendResult> {
  return sendEmail(buildCycleShipsEmail(p))
}
export function sendSubPausedEmail(p: SubPausedProps): Promise<SendResult> {
  return sendEmail(buildSubPausedEmail(p))
}
export function sendSubResumedEmail(p: SubResumedProps): Promise<SendResult> {
  return sendEmail(buildSubResumedEmail(p))
}
export function sendRefundEmail(p: RefundProps): Promise<SendResult> {
  return sendEmail(buildRefundEmail(p))
}
export function sendAdminInquiryEmail(p: AdminInquiryProps): Promise<SendResult> {
  return sendEmail(buildAdminInquiryEmail(p))
}
export function sendAdminPaymentFailedEmail(p: AdminPaymentFailedProps): Promise<SendResult> {
  return sendEmail(buildAdminPaymentFailedEmail(p))
}
export function sendInquiryAckEmail(p: InquiryAckProps): Promise<SendResult> {
  return sendEmail(buildInquiryAckEmail(p))
}
export function sendAdminBriefEmail(p: AdminBriefProps): Promise<SendResult> {
  return sendEmail(buildAdminBriefEmail(p))
}
export function sendAdminWaitlistEmail(p: AdminWaitlistProps): Promise<SendResult> {
  return sendEmail(buildAdminWaitlistEmail(p))
}
