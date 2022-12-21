export const INDEX_SYMBOL = Symbol("index"),
  DYNAMIC_SYMBOL = Symbol("dynamic"),
  OPTIONAL_SYMBOL = Symbol("optional"),
  CATCH_ALL_SYMBOL = Symbol("catch-all"),
  ROUTE_SYMBOL = Symbol("route"),
  ROOT_SYMBOL = Symbol("root");

// #region MATCHING

export function matchTrie<Route extends RouteConfig>(
  root: Node<Route>,
  pathname: string,
  options: {
    onVisit?: (node: Node<Route>) => void;
  } = {}
) {
  let match = !pathname ? null : pathname.replace(/^\//, "").replace(/\/$/, ""),
    path = match || "",
    segments = path.split("/").filter(Boolean),
    matched = matchRecursive<Route>(root, segments, 0, [], options.onVisit);
  if (!matched.length) return null;

  return rankMatched(matched);
}

function matchRecursive<Route extends RouteConfig>(
  root: Node<Route> | undefined,
  segments: string[],
  segmentIndex: number,
  matches: Omit<Route, "children">[][],
  onVisit?: (node: Node<Route>) => void
): Omit<Route, "children">[][] {
  if (!root) return matches;

  if (onVisit) onVisit(root);

  let segmentsLength = segments.length;
  if (segmentIndex >= segmentsLength) {
    switch (root.key) {
      case INDEX_SYMBOL:
        matchRecursive(
          root.children[0],
          segments,
          segmentIndex,
          matches,
          onVisit
        );
        break;
      case DYNAMIC_SYMBOL:
      case CATCH_ALL_SYMBOL:
        break;
      case ROUTE_SYMBOL:
        if (root.route) {
          matches.push(getMatchesFromNode(root)!);
        }
      case ROOT_SYMBOL:
      case OPTIONAL_SYMBOL:
        for (let child of root.children) {
          matchRecursive(child, segments, segmentIndex, matches, onVisit);
        }
        break;
    }
  } else {
    if (typeof root.key === "string") {
      if (root.key === segments[segmentIndex]) {
        for (let child of root.children) {
          matchRecursive(child, segments, segmentIndex + 1, matches, onVisit);
        }
      }
    } else {
      switch (root.key) {
        case INDEX_SYMBOL:
          break;
        case CATCH_ALL_SYMBOL:
          matchRecursive(
            root.children[0],
            segments,
            segmentsLength,
            matches,
            onVisit
          );
          break;
        case DYNAMIC_SYMBOL:
        case OPTIONAL_SYMBOL:
          segmentIndex++;
        case ROOT_SYMBOL:
        case ROUTE_SYMBOL:
          for (let child of root.children) {
            matchRecursive(child, segments, segmentIndex, matches, onVisit);
          }
          break;
      }
    }
  }

  return matches;
}

function getMatchesFromNode<Route extends RouteConfig>(node: Node<Route>) {
  if (!node.route) return null;
  let matches: Omit<Route, "children">[] = [],
    currentNode: Node<Route> | null = node;
  while (currentNode) {
    if (currentNode.route) {
      matches.push(currentNode.route);
    }
    currentNode = currentNode.parent;
  }

  return matches.reverse();
}

function rankMatched<Route extends RouteConfig>(
  matched: Omit<Route, "children">[][]
) {
  let bestScore = Number.MIN_SAFE_INTEGER,
    bestMatch;

  for (let matches of matched) {
    let score = 0;
    for (let match of matches) {
      score += computeScore(match);
    }

    console.log({ score, matches });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = matches;
    }
  }

  return bestMatch;
}

let staticSegmentValue = 10,
  dynamicSegmentValue = 4,
  optionalSegmentValue = 3,
  indexRouteValue = 2,
  emptySegmentValue = 1,
  splatPenalty = 0,
  isSplat = (s: string) => s === "*";
function computeScore(match: Omit<RouteConfig, "children">): number {
  let segments = (match.path || "").split("/").filter(Boolean),
    initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }

  if (match.index) {
    initialScore += indexRouteValue;
  }

  return segments
    .filter((s) => !isSplat(s))
    .reduce(
      (score, segment) =>
        score +
        (segment.startsWith(":")
          ? segment.endsWith("?")
            ? optionalSegmentValue
            : dynamicSegmentValue
          : segment === ""
          ? emptySegmentValue
          : staticSegmentValue),
      initialScore
    );
}

// #endregion MATCHING

// #region CREATION
export function createTrie<Route extends RouteConfig>(routes: Route[]) {
  let root: Node<Route> = {
    key: ROOT_SYMBOL,
    parent: null,
    children: [],
    route: null,
  };

  for (let route of routes) {
    insertRouteConfig(root, route);
  }

  return root;
}

function insertRouteConfig<Route extends RouteConfig>(
  root: Node<Route>,
  route: Route
) {
  let path = route.path ? route.path.replace(/^\//, "").replace(/\/$/, "") : "",
    node = insertPath(root, path, route);

  if (!route.index && route.children) {
    for (let childRoute of route.children) {
      insertRouteConfig<Route>(node, childRoute as Route);
    }
  }

  return node;
}

function insertPath<Route extends RouteConfig>(
  root: Node<Route>,
  path: string,
  route: Route
) {
  let segments = path.split("/"),
    segmentsLength = segments.length,
    currentNode = root;

  for (let i = 0; i < segmentsLength; i++) {
    let segment = segments[i];
    if (!segment) continue;

    if (segment.startsWith("*")) {
      let existingNode = currentNode.children.find(
        (child) => child.key === CATCH_ALL_SYMBOL
      );
      if (existingNode) {
        throw new Error(
          "Only one catch all route is allowed per branch of the tree"
        );
      }
      let catchAllNode = createNode(CATCH_ALL_SYMBOL, currentNode);
      currentNode.children.push(catchAllNode);
      currentNode = catchAllNode;
      break;
    }
    if (segment.startsWith(":")) {
      if (segment.endsWith("?")) {
        let existingNode = currentNode.children.find(
          (child) => child.key === OPTIONAL_SYMBOL
        );
        if (existingNode) {
          currentNode = existingNode;
        } else {
          let optionalNode = createNode(OPTIONAL_SYMBOL, currentNode);
          currentNode.children.push(optionalNode);
          currentNode = optionalNode;
        }
      } else {
        let existingNode = currentNode.children.find(
          (child) => child.key === DYNAMIC_SYMBOL
        );
        if (existingNode) {
          currentNode = existingNode;
        } else {
          let dynamicNode = createNode(DYNAMIC_SYMBOL, currentNode);
          currentNode.children.push(dynamicNode);
          currentNode = dynamicNode;
        }
      }
      continue;
    }

    let existingNode = currentNode.children.find(
      (child) => child.key === segment
    );
    if (existingNode) {
      currentNode = existingNode;
    } else {
      let segmentNode = createNode(segment, currentNode);
      currentNode.children.push(segmentNode);
      currentNode = segmentNode;
    }
  }

  if (route.index) {
    let indexNode = createNode(INDEX_SYMBOL, currentNode);
    currentNode.children.push(indexNode);
    currentNode = indexNode;
  }

  let routeNode = createNode(ROUTE_SYMBOL, currentNode, route);
  currentNode.children.push(routeNode);
  currentNode = routeNode;

  return currentNode;
}

function createNode<Route extends RouteConfig>(
  key: string | symbol,
  parent: Node<Route>,
  route: Route | null = null
) {
  if (route) {
    let { children: _, ...rest } = route as NonIndexRouteConfig;
    route = rest as any;
  }
  let node: Node<Route> = {
    key,
    route,
    parent,
    children: [],
  };
  return node;
}

// #endregion CREATION

// #region TYPES

export interface Node<Item> {
  key: string | symbol;
  parent: Node<Item> | null;
  children: Node<Item>[];
  route: Omit<Item, "children"> | null;
}

interface BaseRouteConfig {
  id: string;
  path?: string;
}

export interface IndexRouteConfig extends BaseRouteConfig {
  index: true;
}

export interface NonIndexRouteConfig extends BaseRouteConfig {
  index?: false;
  children?: RouteConfig[];
}

export type RouteConfig = IndexRouteConfig | NonIndexRouteConfig;

// #endregion TYPES
