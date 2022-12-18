import cytoscape from "cytoscape";
// @ts-expect-error
import dagre from "cytoscape-dagre";

import routes from "../routes.json";

import {
  createTrie,
  matchTrie,
  CATCH_ALL_SYMBOL,
  DYNAMIC_SYMBOL,
  INDEX_SYMBOL,
  ROOT_SYMBOL,
  ROUTE_SYMBOL,
  type Node,
} from "../src";

function createGraphElements(node: Node<any>) {
  return createGraphElementsRecursive(node, { edges: [], nodes: [] });
}

function createGraphElementsRecursive(
  node: Node<any>,
  result: { edges: any[]; nodes: any[] }
) {
  if (!node) return result;

  const id = toId(node);
  result.nodes.push({
    data: {
      id,
      label: id.match(/\{(.*)\}/)?.[1],
      node,
    },
    classes: "bottom-center",
  });

  if (node.parent) {
    result.edges.push({
      data: { source: toId(node.parent), target: id },
    });
  }

  for (const child of node.children) {
    createGraphElementsRecursive(child, result);
  }

  return result;
}
function toId(node: Node<any>) {
  let id = "_";
  let t: Node<any> | null = node;
  while (t) {
    let i = t.parent?.children.indexOf(t) || 0;
    id = `${i}_` + id;
    t = t.parent;
  }
  if (typeof node.key === "string" && node.key) return `${id}{${node.key}}`;
  switch (node.key) {
    case INDEX_SYMBOL:
      return `${id}{_INDEX_}`;
    case DYNAMIC_SYMBOL:
      return `${id}{_DYNAMIC_}`;
    case CATCH_ALL_SYMBOL:
      return `${id}{_CATCH_ALL_}`;
    case ROUTE_SYMBOL:
      return `${id}{_ROUTE_}`;
    case ROOT_SYMBOL:
      return `${id}{_ROOT_}`;
    default:
      return id;
  }
}

let routesTrie = createTrie(routes);

cytoscape.use(dagre);
const cytoscapeOptions = {
  container: document.getElementById("cy"),

  boxSelectionEnabled: false,
  autounselectify: true,

  layout: {
    name: "dagre",
  },

  style: [
    {
      selector: "node[label]",
      style: {
        label: "data(label)",
        "text-valign": "bottom",
        "text-halign": "center",
      },
    },
    {
      selector: "node.visited",
      style: {
        "background-color": "blue",
      },
    },
  ],
};
let cy = cytoscape({
  ...cytoscapeOptions,
  elements: createGraphElements(routesTrie),
} as any);

const fileInput = document.getElementById("routes-file") as HTMLInputElement;
fileInput.addEventListener("change", async (event) => {
  const input = event.target as HTMLInputElement;
  const json = await input.files?.item(0)?.text();
  if (json) {
    const newRoutes = JSON.parse(json);
    routesTrie = createTrie(newRoutes);

    console.log(newRoutes);
    cy.destroy();
    cy = cytoscape({
      ...cytoscapeOptions,
      elements: createGraphElements(routesTrie),
    } as any);
  }
});

const form = document.getElementById("match-form") as HTMLFormElement;
let controller: AbortController | undefined;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const signal = controller.signal;

  const target = event.target as HTMLFormElement | HTMLButtonElement;
  const formData = new FormData(target.form || target);
  const path = (formData.get("path") as string) || "";
  const visitedIDs: string[] = [];

  const matches = matchTrie(routesTrie, path, {
    onVisit: (node) => {
      visitedIDs.push(toId(node));
    },
  });

  document.getElementById("matches")!.innerText = JSON.stringify(
    matches,
    null,
    2
  );

  let lastElement: cytoscape.CollectionReturnValue | undefined;
  for (const id of visitedIDs) {
    if (lastElement) {
      lastElement.removeClass("visited");
    }
    lastElement = cy.getElementById(id);
    lastElement.addClass("visited");

    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
    if (signal.aborted) break;
  }
  if (lastElement) {
    lastElement.removeClass("visited");
  }
});
