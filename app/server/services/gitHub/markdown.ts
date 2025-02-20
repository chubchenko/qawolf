import environment from "../../environment";
import { SuiteRun, Trigger, User } from "../../types";
import { buildWolfImage } from "../alert/utils";

type BuildCommentForSuite = {
  runs: SuiteRun[];
  suite_id: string;
  trigger: Trigger;
  user: User;
};

const buildDetailsForRuns = (runs: SuiteRun[]): string => {
  if (!runs.length) return "";

  const status = runs[0].status;
  const emoji = status === "fail" ? "❌" : "✅";

  const runsHtml = runs
    .map((run) => {
      const runUrl = new URL(`/run/${run.id}`, environment.APP_URL).href;

      return `<tr>
<td>
<div>
<a href="${runUrl}"><p>${emoji} ${run.test_name}</p></a>
<img src="${run.gif_url}" width="240" />
</div>
</td>
</tr>`;
    })
    .join("\n");

  return `
<details>
<summary>${emoji} ${runs.length} ${status}</summary>
<table>
${runsHtml}
</table>
</details>`;
};

export const buildCommentForSuite = ({
  runs,
  suite_id,
  trigger,
  user,
}: BuildCommentForSuite): string => {
  const suiteUrl = new URL(`/suites/${suite_id}`, environment.APP_URL).href;
  let emoji = "🐺";

  const inProgressRuns = runs.filter((r) => r.status === "created");
  const failingRuns = runs.filter((r) => r.status === "fail");
  const passingRuns = runs.filter((r) => r.status === "pass");

  if (!inProgressRuns.length) emoji = failingRuns.length ? "❌" : "✅";
  const isPass = passingRuns.length === runs.length;

  const header = inProgressRuns.length
    ? `${inProgressRuns.length} test${
        inProgressRuns.length === 1 ? "" : "s"
      } running`
    : `${runs.length} test${runs.length === 1 ? "" : "s"} ran`;

  return `## ${emoji} QA Wolf - ${trigger.name}
${buildWolfImage({
  isPass,
  user,
})} ${
    user.wolf_name
  } here: ${header}, [see details here](${suiteUrl}).${buildDetailsForRuns(
    failingRuns
  )}${buildDetailsForRuns(passingRuns)}`;
};
