import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    try {
        const simplifier = require('meshoptimizer/meshopt_simplifier.js');
        console.log('Simplifier file keys:', Object.keys(simplifier));
    } catch (e) {
        console.log('No simplifier file', e.message);
    }
} catch (e) {
    console.error('Fail require:', e);
}

try {
    import('meshoptimizer').then(m => console.log('Success import:', m)).catch(e => console.error('Fail import:', e));
} catch (e) {
    console.error('Fail import block:', e);
}
