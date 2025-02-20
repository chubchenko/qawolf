// GraphQL Types
export type AuthenticatedUser = {
  access_token: string;
  user: User;
};

export type DeploymentProvider = "heroku" | "netlify" | "render" | "vercel";

export type Env = { [name: string]: string };

export type Environment = {
  id: string;
  name: string;
};

export type EnvironmentVariable = {
  created_at: string;
  environment_id: string;
  id: string;
  name: string;
  value: string;
};

export type File = {
  branch: string | null;
  content: string;
  id: string;
  is_deleted: boolean;
  is_read_only: boolean;
  path: string;
  team_id: string;
};

export type GitHubBranch = {
  is_default: boolean;
  name: string;
};

export type Integration = {
  github_repo_name: string;
  id: string;
  slack_channel: string | null;
  team_name: string | null;
  type: "github" | "github_sync" | "slack";
};

export type Invite = {
  email: string;
  id: string;
  team_id: string;
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

export type Onboarding = {
  has_completed_tutorial: boolean;
  has_created_test: boolean;
  has_invited_user: boolean;
  has_trigger: boolean;
};

export type RunStatus = "created" | "fail" | "pass";

export type Run = {
  code: string;
  completed_at: string | null;
  created_at: string;
  current_line: number | null;
  environment_id: string | null;
  id: string;
  logs_url: string | null;
  started_at: string | null;
  status: RunStatus;
  suite_id: string | null;
  test_id: string;
  video_url: string | null;
};

export type Runner = {
  api_key: string | null;
  ws_url: string | null;
};

export type ShortSuite = {
  branch: string | null;
  commit_url: string | null;
  created_at: string;
  environment_id: string | null;
  environment_name: string | null;
  environment_variables: string | null;
  id: string;
  is_api: boolean;
  tag_names: string | null;
  team_id: string;
  trigger: ShortTrigger | null;
};

export type StatusCounts = {
  created: number;
  fail: number;
  pass: number;
};

export type Suite = ShortSuite & {
  runs: SuiteRun[];
};

export type SuiteRun = {
  completed_at: string | null;
  created_at: string;
  gif_url: string | null;
  id: string;
  is_test_deleted: boolean;
  started_at: string | null;
  status: RunStatus;
  test_id: string;
  test_name: string;
  test_tags: Tag[];
};

export type SuiteSummary = ShortSuite & {
  status_counts: StatusCounts;
};

export type ShortTeam = {
  id: string;
  name: string;
};

export type Tag = {
  color: string;
  id: string;
  name: string;
  team_id: string;
};

export type TagFilter = "all" | "any";

export type TagsForTest = {
  tags: Tag[];
  test_id: string;
};

export type Team = ShortTeam & {
  alert_integration_id: string | null;
  alert_only_on_failure: boolean;
  api_key: string;
  base_price: number | null;
  git_sync_integration_id: string | null;
  helpers: string;
  inbox: string;
  is_email_alert_enabled: boolean;
  is_enabled: boolean;
  metered_price: number | null;
  plan: "business" | "custom" | "free";
  renewed_at: string;
};

export type TeamWithUsers = Team & {
  invites: Invite[];
  users: User[];
};

export type ShortTest = {
  id: string;
  name: string | null;
  path: string | null;
};

export type Test = ShortTest & {
  code: string;
  deleted_at: string | null;
  is_enabled: boolean;
  team_id: string;
  updated_at: string;
  url?: string;
};

export type TestHistoryRun = {
  created_at: string;
  id: string;
  started_at: string;
  status: RunStatus;
};

export type TestSummaryRun = {
  created_at: string;
  gif_url: string | null;
  id: string;
  status: RunStatus;
};

export type TestSummary = {
  gif_url: string | null;
  last_runs: TestSummaryRun[];
  test_id: string;
};

export type ShortTrigger = {
  color: string;
  deployment_provider: DeploymentProvider | null;
  id: string;
  name: string;
  repeat_minutes: number | null;
};

export type Trigger = ShortTrigger & {
  created_at: string;
  deployment_branches: string | null;
  deployment_environment: string | null;
  deployment_integration_id: string | null;
  deployment_preview_url: string | null;
  environment_id: string | null;
  next_at: string | null;
  tags: Tag[];
};

export type User = {
  avatar_url: string | null;
  email: string;
  id: string;
  intercom_hash?: string;
  onboarded_at: string | null;
  teams: ShortTeam[];
  wolf_name: string;
  wolf_number: number;
  wolf_variant: string;
};

// Component Types
export type AuthMode = "logIn" | "signUp";

export type CreateCode = {
  code: string;
  test_id: string | null;
};

export type Modal =
  | "confirmBack"
  | "createSuite"
  | "createTest"
  | "environments"
  | "deleteTests"
  | "tags"
  | "triggers";

export type MutableListArgs = {
  callback: () => void;
  fields?: MutableListFields;
  name: string;
};

export type MutableListFunction = (args: MutableListArgs) => void;

export type MutableListFields = {
  id: string;
  name: string;
};

export type MutableListType = "environment";

export type NavigationOption = "code" | "logs" | "helpers";

export type NavigationType = "dark" | "light";

export type SelectState = "all" | "none" | "some";

export type SelectedTest = {
  id: string;
  name: string;
};

export type Side = "left" | "right";

export type Size = {
  height: number | null;
  width: number | null;
};

export type Rect = Size & {
  x: number | null;
  y: number | null;
};

export type TriggerFields = {
  deployment_branches: string | null;
  deployment_environment: string | null;
  deployment_integration_id: string | null;
  deployment_preview_url: string | null;
  deployment_provider: DeploymentProvider | null;
  environment_id: string | null;
  name: string;
  repeat_minutes: number | null;
  tag_ids: string[] | null;
};

export type ValueProp = {
  detail: string;
  message: string;
};

export type Wolf = {
  name: string;
  number: number;
  variant: string;
};

// Runner Types
export interface ElementChooserValue {
  isActive: boolean;
  isFillable?: boolean;
  selectors?: string[];
  text?: string;
}

export type Log = {
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
};

export type RunOptions = {
  code: string;
  code_to_run?: string;
  end_line?: number;
  env: Env;
  helpers?: string;
  restart: boolean;
  run_id?: string;
  start_line?: number;
};

export type RunProgress = {
  code: string;
  completed_at: string | null;
  current_line: number | null;
  run_id?: string;
  start_line?: number;
  status: RunStatus;
};

export type Selection = {
  endLine: number;
  startLine: number;
};

// State Types
type SignUp = {
  inviteId?: string | null;
  redirectUri?: string | null;
};

type ModalState = {
  name: Modal | null;
  testIds?: string[];
};

export type State = {
  branch: string | null;
  dashboardUri: string | null;
  editorSidebarWidth: number;
  email: string | null;
  environmentId: string | null;
  isSubscribed: boolean;
  modal: ModalState;
  run: RunOptions | null;
  signUp: SignUp;
  teamId: string | null;
  toast: {
    error?: boolean;
    expiresIn?: number;
    message: string;
  } | null;
};
