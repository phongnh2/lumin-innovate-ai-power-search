interface CompressPDFWithWorkerProps {
  fileUrl: string;
  resolution: string;
  documentPassword: string;
}

export async function compressPDFWithWorker({ fileUrl, resolution, documentPassword }: CompressPDFWithWorkerProps) {
  const worker = new Worker(new URL('./background-worker.js', import.meta.url), { type: 'module' });
  worker.postMessage({ data: { fileUrl, resolution, documentPassword }, target: 'wasm' });
  return new Promise((resolve) => {
    const listener = (e: MessageEvent<{ data: CompressPDFWithWorkerProps }>) => {
      resolve(e.data);
      worker.removeEventListener('message', listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener('message', listener);
  });
}
