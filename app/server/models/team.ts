import isNil from "lodash/isNil";

import { minutesFromNow } from "../../shared/utils";
import environment from "../environment";
import { ClientError } from "../errors";
import { ModelOptions, Team, TeamPlan } from "../types";
import { buildApiKey, cuid } from "../utils";
import { decrypt, encrypt } from "./encrypt";
import { createEnvironment } from "./environment";

const DEFAULT_ENVIRONMENT_NAME = "Environment";
const DEFAULT_NAME = "My Team";

type UpdateTeam = {
  alert_integration_id?: string | null;
  alert_only_on_failure?: boolean;
  base_price?: number;
  git_sync_integration_id?: string | null;
  helpers?: string;
  id: string;
  is_email_alert_enabled?: boolean;
  is_enabled?: boolean;
  last_synced_at?: string;
  limit_reached_at?: string | null;
  metered_price?: number;
  name?: string;
  plan?: TeamPlan;
  renewed_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

type ValidateApiKeyForTeam = {
  api_key: string;
  team_id: string;
};

export const formatTeam = (team: Team): Team => {
  return { ...team, api_key: decrypt(team.api_key) };
};

export const createDefaultTeam = async ({
  db,
  logger,
}: ModelOptions): Promise<Team> => {
  const id = cuid();

  const log = logger.prefix("createDefaultTeam");
  log.debug(id);

  const timestamp = new Date().toISOString();

  const teamData = {
    alert_integration_id: null,
    api_key: encrypt(buildApiKey()),
    created_at: timestamp,
    helpers: "",
    id,
    inbox: `${cuid()}@${environment.EMAIL_DOMAIN}`,
    is_email_alert_enabled: true,
    is_enabled: true,
    last_synced_at: null,
    limit_reached_at: null,
    name: DEFAULT_NAME,
    plan: "free" as const,
    renewed_at: timestamp,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    updated_at: timestamp,
  };

  const teams = await db("teams").insert(teamData, "*");
  const team = teams[0];
  log.debug("created", team.id);

  await createEnvironment(
    { name: DEFAULT_ENVIRONMENT_NAME, team_id: team.id },
    { db, logger }
  );

  return formatTeam(team);
};

export const ensureTeamCanCreateSuite = (
  team: Team,
  logger: ModelOptions["logger"]
): void => {
  const log = logger.prefix("ensureTeamCanCreateSuite");
  log.debug("team", team.id);

  if (!team.is_enabled) {
    log.error("disabled");
    throw new ClientError("team disabled, please contact support");
  }

  if (team.limit_reached_at) {
    log.error("limit reached at", team.limit_reached_at);
    throw new ClientError("free plan limit reached, please upgrade");
  }
};

export const findTeam = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("findTeam");

  const team = await db.select("*").from("teams").where({ id }).first();

  if (!team) {
    log.error("not found", id);
    throw new Error("Team not found");
  }

  log.debug("found", id);

  return formatTeam(team);
};

export const findTeamForApiKey = async (
  api_key: string,
  { db, logger }: ModelOptions
): Promise<Team | null> => {
  const log = logger.prefix("findTeamForApiKey");

  const encryptedApiKey = encrypt(api_key);

  const team = await db("teams").where({ api_key: encryptedApiKey }).first();

  log.debug(team ? `found ${team.id}` : "not found");

  return team || null;
};

export const findTeamForEmail = async (
  email: string,
  { db, logger }: ModelOptions
): Promise<Team | null> => {
  const log = logger.prefix("findTeamForEmail");
  log.debug("email", email);

  let inbox = email;
  if (inbox.includes("+")) {
    // remove slug, example: test+admin@qawolf.com
    const [prefix, suffix] = inbox.split("+");
    inbox = prefix + "@" + suffix.split("@")[1];
  }

  const team = await db("teams").where({ inbox }).first();
  log.debug(team ? `found ${team.id}: ${inbox}` : `not found: ${inbox}`);

  return team || null;
};

export const findTeamsForUser = async (
  user_id: string,
  { db }: ModelOptions
): Promise<Team[] | null> => {
  const teams = await db
    .select("teams.*" as "*")
    .from("teams")
    .innerJoin("team_users", "teams.id", "team_users.team_id")
    .where({ user_id })
    .orderBy("name", "asc");

  return teams.length ? teams.map((t: Team) => formatTeam(t)) : null;
};

export const findTeamsToSync = async (
  limit: number,
  { db, logger }: ModelOptions
): Promise<Team[]> => {
  const log = logger.prefix("findTeamsToSync");

  const teams = await db("teams")
    .where({ last_synced_at: null })
    .orWhere("last_synced_at", "<", minutesFromNow(-60))
    .limit(limit);

  log.debug(`found ${teams.length} teams`);

  return teams;
};

export const updateTeam = async (
  {
    alert_integration_id,
    alert_only_on_failure,
    base_price,
    git_sync_integration_id,
    helpers,
    id,
    is_email_alert_enabled,
    is_enabled,
    last_synced_at,
    limit_reached_at,
    metered_price,
    name,
    plan,
    renewed_at,
    stripe_customer_id,
    stripe_subscription_id,
  }: UpdateTeam,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("updateTeam");
  const team = await findTeam(id, { db, logger });

  const updates: Partial<Team> = {
    updated_at: minutesFromNow(),
  };

  if (alert_integration_id !== undefined) {
    updates.alert_integration_id = alert_integration_id;
  }
  if (!isNil(alert_only_on_failure)) {
    updates.alert_only_on_failure = alert_only_on_failure;
  }
  if (base_price !== undefined) updates.base_price = base_price;
  if (git_sync_integration_id !== undefined) {
    updates.git_sync_integration_id = git_sync_integration_id;
  }
  if (!isNil(helpers)) updates.helpers = helpers;
  if (!isNil(is_email_alert_enabled)) {
    updates.is_email_alert_enabled = is_email_alert_enabled;
  }
  if (!isNil(is_enabled)) updates.is_enabled = is_enabled;
  if (!isNil(last_synced_at)) updates.last_synced_at = last_synced_at;
  if (limit_reached_at !== undefined) {
    updates.limit_reached_at = limit_reached_at;
  }
  if (metered_price !== undefined) updates.metered_price = metered_price;
  if (!isNil(name)) updates.name = name;
  if (plan) updates.plan = plan;
  if (renewed_at) updates.renewed_at = renewed_at;
  if (stripe_customer_id !== undefined)
    updates.stripe_customer_id = stripe_customer_id;
  if (stripe_subscription_id !== undefined) {
    updates.stripe_subscription_id = stripe_subscription_id;
  }

  await db("teams").where({ id }).update(updates);
  log.debug("updated", id, updates);

  return { ...team, ...updates };
};

export const validateApiKeyForTeam = async (
  { api_key, team_id }: ValidateApiKeyForTeam,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("validateApiKeyForTeam");
  log.debug("team", team_id);

  const team = await findTeam(team_id, { db, logger });

  if (api_key !== team.api_key) {
    log.error("invalid api key");
    throw new Error("invalid api key");
  }
};
