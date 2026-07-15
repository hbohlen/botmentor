import assert from 'node:assert/strict';
import { projectBoundary } from '../src/lib/project-boundaries';

assert.equal(projectBoundary.label, 'Prototype demo');
assert.match(projectBoundary.summary, /not a production-ready diagnostic service/i);
assert.match(projectBoundary.summary, /nonprofit or volunteer organization/i);
assert.match(projectBoundary.bullets.join(' '), /does not see, control, repair, or confirm/i);

console.log('✓ Prototype positioning states the project boundary and intended learning use.');