import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Guard in case of unexpected undefined export structure
if (matchers && Object.keys(matchers).length > 0) {
	// @ts-expect-error jest-dom augments expect matchers at runtime
	expect.extend(matchers as unknown);
}

