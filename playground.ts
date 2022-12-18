import { createTrie, matchTrie } from "./src";
import { nodeToMermaidMarkdown } from "./src/mermaid";

import routes from "./routes.json";

const routesTrie = createTrie(routes);
console.log("MATCH /not-nested", matchTrie(routesTrie, "/not-nested"));
console.log("GRAPH:");
console.log(nodeToMermaidMarkdown(routesTrie));
