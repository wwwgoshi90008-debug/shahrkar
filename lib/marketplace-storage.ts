import { getStorage } from "firebase/storage";
import marketplaceApp from "./marketplace-firebase";

export const marketplaceStorage = getStorage(marketplaceApp);
