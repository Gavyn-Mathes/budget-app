// preload/api/categories.api.ts
import * as Shared from "../../shared/ipc/categories";
import { makeZodApiModule } from "./common";

export const categoriesApi = makeZodApiModule(Shared);
