import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/* Testing Library only auto-cleans when a global afterEach exists;
 * vitest globals are off, so register it explicitly. */
afterEach(cleanup);
