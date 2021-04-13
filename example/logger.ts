import { Logger, LogLevel } from "../src";

const logger = new Logger({
  packageName: "example",
  packageVersion: "0.0.0",
});

const child1 = logger.createChildLogger(["context", "name"]);
const session = child1.createSessionLogger({ id: "sessionId" });
const child2 = logger.createChildLogger("other");

logger.addConsole(LogLevel.INFO);

logger.verbose("this will be hidden because log level is info");

logger.info("this will be displayed");

logger.warn("this will be displayed as a warning");

logger.error("this will be displayed as an error");

logger.info("this will be displayed with a details object", { details: "data" });

logger.setFocus("context");

child1.info("this will be displayed because context includes the focused context");

child2.info("this will not be displayed because its context does not include the focused context");

session.info("this will be displayed because it is a child of child1");

logger.setFocus(null);

child2.info("this will be displayed because focus is restored to null");
