import annotationLoadObserver, { AnnotationEvent } from '../annotationLoadObserver';

describe('AnnotationLoadObserver', () => {
  beforeEach(() => {
    annotationLoadObserver.clean();
  });

  it('should store and retrieve annotations', () => {
    const mockAnnots = [{ Id: '1' }] as any[];
    annotationLoadObserver.setAnnotations(mockAnnots);
    expect(annotationLoadObserver.getAnnotations()).toBe(mockAnnots);
  });

  it('should notify and resolve wait() for ExternalAnnotLoaded', async () => {
    const waitPromise = annotationLoadObserver.wait(AnnotationEvent.ExternalAnnotLoaded);
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    await expect(waitPromise).resolves.toBeUndefined();
  });

  it('should resolve wait() immediately if event already occurred', async () => {
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    // Should not hang
    await expect(annotationLoadObserver.wait(AnnotationEvent.ExternalAnnotLoaded)).resolves.toBeUndefined();
  });

  it('should clean internal state', async () => {
    annotationLoadObserver.notify(AnnotationEvent.ExternalAnnotLoaded);
    annotationLoadObserver.setAnnotations([{ Id: '1' }] as any[]);
    
    annotationLoadObserver.clean();
    
    expect(annotationLoadObserver.getAnnotations()).toEqual([]);
    
    // Verify state is reset: wait() should essentially hang (wait for new notify)
    // We test this by ensuring it doesn't resolve immediately
    let resolved = false;
    annotationLoadObserver.wait(AnnotationEvent.ExternalAnnotLoaded).then(() => { resolved = true; });
    
    await new Promise(r => setTimeout(r, 10));
    expect(resolved).toBe(false);
  });

  it('should notify and call callback for FormFieldAnnotLoaded', () => {
    const callback = jest.fn();
    annotationLoadObserver.on(AnnotationEvent.FormFieldAnnotLoaded, callback);
    annotationLoadObserver.notify(AnnotationEvent.FormFieldAnnotLoaded);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback immediately if FormFieldAnnotLoaded already occurred', () => {
    const callback = jest.fn();
    annotationLoadObserver.notify(AnnotationEvent.FormFieldAnnotLoaded);
    annotationLoadObserver.on(AnnotationEvent.FormFieldAnnotLoaded, callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle default case in notify without error', () => {
    expect(() => {
      annotationLoadObserver.notify('unknown_event' as AnnotationEvent);
    }).not.toThrow();
  });

  it('should handle default case in on without error', () => {
    const result = annotationLoadObserver.on('unknown_event' as AnnotationEvent, jest.fn());
    expect(result).toBe(annotationLoadObserver);
  });
});