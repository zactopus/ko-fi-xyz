import { v4 as uuid } from "uuid";

const { SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
  process.env;

import { createClient } from "@supabase/supabase-js";
import logger from "../../../helpers/logger.js";

export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

async function createRow(column, data) {
  const rowId = data?.id || uuid();
  const newRow = { id: rowId, ...data };

  const { error } = await supabase.from(column).insert([newRow]);

  if (error) {
    logger.error(error.message);
    return null;
  }

  return rowId;
}

async function updateRow(column, data, options) {
  return supabase.from(column).update(data).match(options);
}

async function getSortedRows({
  column,
  options,
  sinceDate,
  sorting,
}) {
  const supabaseConnection = supabase
    .from(column)
    .select()
    .match(options);

  if (sinceDate) {
    supabaseConnection.gte("created_at", sinceDate);
  }

  supabaseConnection.order(sorting.column, sorting.options);

  const { data: rows, error } = await supabaseConnection;

  if (error) {
    logger.error(error.message);
    return [];
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows;
}

async function getRows(column, options) {
  const { data: rows, error } = await supabase
    .from(column)
    .select()
    .match(options);

  if (error) {
    logger.error(error.message);
    return [];
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows;
}

async function getRow(column, options) {
  const [row] = await getRows(column, options);

  return row;
}

// users

export async function createUser(id, email) {
  const overlay_id = await createOverlay();

  return createRow("users", {
    id,
    email,
    webhook_id: uuid(),
    overlay_id,
  });
}

export async function getAuthorizedUserByToken(token) {
  // not in supabase's docs directly because
  // they use https://github.com/netlify/gotrue
  return supabase.auth.api.getUser(token);
}

export async function getUserById(id) {
  return getRow("users", { id });
}

export async function getUserByWebhookId(webhook_id) {
  return getRow("users", { webhook_id });
}

// overlays

export async function createOverlay() {
  const data = {
    settings: {
      canPlaySounds: false,
      messageText: "{type} of {amount} from {from_name} {message}",
      messageDuration: "5",
      messageBackgroundColor: "#f8befc",
      messageTextColor: "#840042",
      messagePosition: "top-left",
      messageSpacingHorizontal: "50",
      messageSpacingVertical: "50",
      messageAnimationType: "slide",
      messageAnimationDirection: "left",
      messageShowIcon: false,
      messageHasCurvedCorners: true,
    },
  };

  return await createRow("overlays", data);
}

export async function getOverlayById(id) {
  return getRow("overlays", { id });
}

export async function updateOverlaySettings(id, settings) {
  return supabase.from("overlays").update({ settings }).eq("id", id);
}

// alerts

export async function getAlerts({
  overlayId,
  sinceDate,
  isAscending,
  isShown,
}) {
  const options = {
    overlay_id: overlayId,
  };

  if (typeof isShown !== "undefined") {
    options.is_shown = isShown;
  }

  return getSortedRows({
    column: "alerts",
    options,
    sinceDate,
    sorting: {
      column: "created_at",
      options: { ascending: isAscending },
    },
  });
}

export async function createAlert(data) {
  return createRow("alerts", data);
}

export async function updateAlert(id, data) {
  return updateRow("alerts", data, { id });
}
