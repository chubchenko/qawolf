import { Box } from "grommet";
import { useRef, useState } from "react";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";

import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";
import GitBranch from "../../shared/GitBranch";
import Check from "../../shared/icons/Check";
import Tooltip from "../../shared/Tooltip";

type Props = {
  branch: string | null;
  hasChanges: boolean;
};

export default function Branch({ branch, hasChanges }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);

  if (!branch) return null;

  const color = hasChanges ? colors.gray4 : colors.success5;
  const IconComponent = hasChanges ? RiCheckboxBlankCircleFill : Check;
  const label = hasChanges ? copy.uncommittedChanges : copy.allChangesCommitted;

  return (
    <Box align="center" direction="row" margin={{ right: "small" }}>
      <Box
        align="center"
        direction="row"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        ref={ref}
      >
        <Box margin={{ left: "xxsmall" }}>
          <IconComponent color={color} size={edgeSize.small} />
        </Box>
        <Tooltip
          align={{ right: "left" }}
          label={label}
          isVisible={isHover}
          target={ref.current}
        />
      </Box>
      <GitBranch branch={branch} />
    </Box>
  );
}
