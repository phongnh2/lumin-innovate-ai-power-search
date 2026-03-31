type SequenceHandler<T, R> = (data: T) => Promise<R>;

const sequentialRequestBuilder = async <T, R>(list: Array<T>, handler: SequenceHandler<T, R>): Promise<R[]> => {
	const result: R[] = [];
	const promise = list.reduce(async (p: Promise<R>, item: T) => {
		const data = await p;
		result.push(data);
		return handler(item);
	}, Promise.resolve(null) as unknown as Promise<R>);
	const last = await promise;
	return [...result, last].slice(1);
};

export default sequentialRequestBuilder;