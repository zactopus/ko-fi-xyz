import {
  createUser,
  getUserById,
  getAuthorizedUserByToken,
} from "./helpers/supabase.js";

import logger from "../../helpers/logger.js";

function getToken(request) {
  if (!request.headers?.authorization) {
    return null;
  }

  return request.headers.authorization.replace("Bearer", "").trim();
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).end();
  }

  const token = getToken(request);

  const { data: authorisedUser, error } =
    await getAuthorizedUserByToken(token);

  if (error) {
    logger.error(error.message);
    return response.status(400).end();
  }

  if (!authorisedUser.id) {
    return response.end();
  }

  // check if user already exists
  const existingUser = await getUserById(authorisedUser.id);
  if (existingUser) {
    return response.end();
  }

  try {
    await createUser(authorisedUser.id, authorisedUser.email);
  } catch (e) {
    logger.log("Creating user error: ", e.message);
  }

  response.end();
}
