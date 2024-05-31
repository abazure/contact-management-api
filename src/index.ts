import { app } from "./application/app";
import { logger } from "./application/logger";
const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});
