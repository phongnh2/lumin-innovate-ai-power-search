export interface RequestAccessBuilder<T, K> {
    setActor(actor: string)
    setEntity(entity: K)
    setTarget(target: string)
    build(): Record<string, unknown>
}
