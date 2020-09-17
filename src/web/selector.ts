import { buildCues, BuildCues, Cue, getPenalty } from './cues';
import { getClickableGroup } from './element';
import {
  buildCueSets,
  combine,
  CueGroup,
  trimExcessCues,
} from './optimizeCues';
import { getXpath } from './serialize';
import { buildSelectorParts, isMatch } from './selectorEngine';
import { SelectorPart } from './types';

const selectorCache = new Map<HTMLElement, SelectorPart[]>();
const clickSelectorCache = new Map<HTMLElement, SelectorPart[]>();

/**
 * @summary Clear the selector cache. Currently only used for tests.
 */
export const clearSelectorCache = (): void => {
  selectorCache.clear();
  clickSelectorCache.clear();
};

export const toSelector = (selectorParts: SelectorPart[]): string => {
  const names = selectorParts.map((s) => s.name);

  // CSS selector
  if (!names.includes('text')) {
    return selectorParts.map((s) => s.body).join(' ');
  }

  // mixed selector
  return selectorParts.map(({ body, name }) => `${name}=${body}`).join(' >> ');
};

export const buildSelector = (options: BuildCues): string => {
  const { isClick, target } = options;

  let targetGroup: HTMLElement[];
  if (isClick) {
    targetGroup = getClickableGroup(target);
    if (targetGroup.length === 0) targetGroup = [target];
  } else {
    targetGroup = [target];
  }

  // To save looping, see if we have already figured out a unique
  // selector for this target.
  let cachedSelectorParts: SelectorPart[];
  if (isClick) {
    cachedSelectorParts = clickSelectorCache.get(target);
  } else {
    cachedSelectorParts = selectorCache.get(target);
  }

  let selector: string;
  if (cachedSelectorParts) {
    // Even if we have cached a selector, it is possible that the DOM
    // has changed since the cached one was built. Confirm it's a match.
    if (isMatch({ selectorParts: cachedSelectorParts, target })) {
      selector = toSelector(cachedSelectorParts);
      // console.debug('Using cached selector', selector, 'for target', target);
      return selector;
    }
  }

  console.log('create combinations');
  let combinations: Map<string, { cues: Cue[]; penalty: number }> = new Map();

  targetGroup.forEach((targetElement) => {
    console.log('target group: build cues');
    const cues = buildCues({ ...options, target: targetElement });

    console.log('target group: build cue sets');
    const cueSets = buildCueSets(cues);

    console.log('target group: trim excess cues');
    const cueGroups = cueSets
      .map((cueSet) => trimExcessCues(cueSet, target, 5))
      .filter((cueGroup) => cueGroup && cueGroup.cues.length < 8);

    console.log('target group: build combinations');
    cueGroups.forEach((seedGroup) => {
      for (let i = 1; i <= 3; i++) {
        combine(seedGroup.cues, i).forEach((cues) => {
          const key = cues
            .map((c) => `${c.type}${c.value}`)
            .sort()
            .join(',');
          combinations.set(key, {
            cues,
            penalty: getPenalty(cues),
          });
        });
      }
    });
  });

  let selectorParts: SelectorPart[] = null;

  console.log('sort combinations');

  const combos = [...combinations.values()].sort(
    (a, b) => a.penalty - b.penalty,
  );

  console.log('sorted combinations', combos.length);

  for (let i = 0; i < combos.length; i++) {
    const trySelectorParts = buildSelectorParts(combos[i].cues);

    // If these selector parts match any element that we are targeting,
    // then it's currently the best group.
    if (
      targetGroup.some((target) =>
        isMatch({ selectorParts: trySelectorParts, target }),
      )
    ) {
      selectorParts = trySelectorParts;
      console.log('found selector', i);
      break;
    }
  }

  if (selectorParts) {
    // First cache it so that we don't need to do all the looping for this
    // same target next time. We cache `selectorParts` rather than `selector`
    // because the DOM can change, so when we later use the cached selector,
    // we will need to run it through `isMatch` again, which needs the parsed
    // selector.
    if (isClick) {
      clickSelectorCache.set(target, selectorParts);
    } else {
      selectorCache.set(target, selectorParts);
    }

    // Now convert selectorParts (a Playwright thing) to a string selector
    selector = toSelector(selectorParts);
  } else {
    // No selector was found, fall back to xpath.
    selector = `xpath=${getXpath(target)}`;
  }

  // console.debug('Built selector', selector, 'for target', target);
  return selector;
};
