// preload/api/categories.api.ts
import * as Shared from "../../shared/ipc/categories";
import { makeApiModule } from "./common";

export const categoriesApi = makeApiModule(Shared);
