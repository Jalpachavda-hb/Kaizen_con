// Pure helpers for the Push Notifications feature (no React / no network) so they can be unit-tested.

export const NOTIFICATION_TITLE_MAX = 200; // backend: NotificationCreate.title maxLength
export const NOTIFICATION_BODY_MAX = 2000; // backend: NotificationCreate.body maxLength
export const NOTIFICATION_MAX_RECIPIENTS = 5000; // backend: delegate_ids maxItems

export type RecipientMode = "selected" | "broadcast";

export interface CustomDataRow {
  key: string;
  value: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  delegate_ids: number[];
  data?: Record<string, string>;
}

export interface NotificationFormInput {
  title: string;
  body: string;
  mode: RecipientMode;
  delegateIds: Array<number | string>;
  customData: CustomDataRow[];
}

/** Convert key/value rows to a `data` object; rows with an empty key are ignored. Returns null when empty. */
export const buildCustomData = (rows: CustomDataRow[]): Record<string, string> | null => {
  const out: Record<string, string> = {};
  rows.forEach((r) => {
    const key = (r.key ?? "").trim();
    if (!key) return;
    out[key] = String(r.value ?? "").trim(); // backend schema: values must be strings
  });
  return Object.keys(out).length > 0 ? out : null;
};

/** Build the exact request body for POST /api/notifications. Only API fields are included. */
export const buildNotificationPayload = (input: NotificationFormInput): NotificationPayload => {
  const ids =
    input.mode === "broadcast"
      ? []
      : Array.from(
          new Set(
            input.delegateIds
              .map((id) => Number(id))
              .filter((n) => Number.isInteger(n) && n > 0)
          )
        );

  const payload: NotificationPayload = {
    title: input.title.trim(),
    body: input.body.trim(),
    delegate_ids: ids,
  };

  const data = buildCustomData(input.customData);
  if (data) payload.data = data;

  return payload;
};

export type FormErrors = Partial<Record<"title" | "body" | "recipients" | "customData", string>>;

export const validateNotificationForm = (input: NotificationFormInput): FormErrors => {
  const errors: FormErrors = {};
  const title = input.title.trim();
  const body = input.body.trim();

  if (!title) errors.title = "Notification title is required.";
  else if (title.length > NOTIFICATION_TITLE_MAX)
    errors.title = `Title must be ${NOTIFICATION_TITLE_MAX} characters or fewer.`;

  if (!body) errors.body = "Notification message is required.";
  else if (body.length > NOTIFICATION_BODY_MAX)
    errors.body = `Message must be ${NOTIFICATION_BODY_MAX} characters or fewer.`;

  if (input.mode === "selected") {
    if (input.delegateIds.length === 0)
      errors.recipients = "Select at least one delegate, or choose Broadcast to All.";
    else if (input.delegateIds.length > NOTIFICATION_MAX_RECIPIENTS)
      errors.recipients = `A maximum of ${NOTIFICATION_MAX_RECIPIENTS} delegates can be targeted at once.`;
  }

  const seen = new Set<string>();
  for (const row of input.customData) {
    const key = row.key.trim();
    const value = row.value.trim();
    if (!key && value) {
      errors.customData = "Every custom data value needs a key.";
      break;
    }
    if (key && seen.has(key)) {
      errors.customData = `Duplicate custom data key "${key}".`;
      break;
    }
    if (key) seen.add(key);
  }

  return errors;
};

export type DeliveryStatus = "delivered" | "no-devices" | "partial" | "failed" | "pending";

export interface DeliveryCounts {
  target_count?: number | null;
  sent_count?: number | null;
  failed_count?: number | null;
}

/** Classify actual delivery from the backend counts. HTTP 201 alone is never treated as delivered. */
export const getDeliveryStatus = (n: DeliveryCounts): DeliveryStatus => {
  const target = Number(n.target_count) || 0;
  const sent = Number(n.sent_count) || 0;
  const failed = Number(n.failed_count) || 0;

  if (sent > 0 && failed === 0) return "delivered";
  if (sent > 0 && failed > 0) return "partial";
  if (sent === 0 && failed > 0) return "failed";
  if (target === 0) return "no-devices";
  return "pending"; // devices targeted but nothing reported as sent or failed
};

export const DELIVERY_STATUS_META: Record<
  DeliveryStatus,
  { label: string; badgeClass: string; panelClass: string; description: string }
> = {
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    panelClass: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300",
    description: "Push notification was delivered to all targeted devices.",
  },
  partial: {
    label: "Partially Delivered",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    panelClass: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300",
    description: "Some devices received the notification, but delivery failed for others.",
  },
  failed: {
    label: "Delivery Failed",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    panelClass: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300",
    description: "The notification was saved, but delivery failed for every targeted device.",
  },
  "no-devices": {
    label: "Saved · Not Delivered",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    panelClass: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300",
    description:
      "Notification saved successfully, but no registered delegate devices were available. No push notification was delivered.",
  },
  pending: {
    label: "Saved · Unconfirmed",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    panelClass: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300",
    description:
      "Notification saved and devices were targeted, but the backend has not reported any sent or failed deliveries.",
  },
};
