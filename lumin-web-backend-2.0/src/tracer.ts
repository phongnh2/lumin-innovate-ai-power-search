// import tracer from 'dd-trace';

// if (process.env.LUMIN_DD_TRACER_ENABLED) {
//   tracer.init({
//     service: 'lumin-web-backend',
//     env: process.env.LUMIN_ENV,
//     version: process.env.LUMIN_VERSION,
//     logInjection: true,
//     startupLogs: true,
//     // Environment variables will be loaded by dd-trace internally throught k8s env
//     // profiling: process.env.DD_PROFILING_ENABLED,
//     // runtimeMetrics: process.env.DD_RUNTIME_METRICS_ENABLED,
//     // sampleRate: process.env.DD_TRACE_SAMPLE_RATE,
//     logLevel: 'debug',
//     plugins: true,
//     reportHostname: true,
//     clientIpEnabled: true,
//     clientIpHeader: 'x-forwarded-for',
//   });

//   tracer.use('express', {
//     blocklist: ['/.well-known/apollo/server-health', '/favicon.ico'],
//     // Currently, we accept 400 status code as a success request
//     // Because graphql subscription is switched protocol 101, but the request status will be 400.
//     // I will investigate it later.
//     validateStatus: (code) => code < 400,
//   });
// }
