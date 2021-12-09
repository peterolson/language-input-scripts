import * as dotenv from "dotenv";
import { populateDifficulties } from "./frequency/populateFrequency";
import { days, hours, scheduleTask } from "./task";

dotenv.config();

scheduleTask("Populate difficulties", populateDifficulties, days(7));
