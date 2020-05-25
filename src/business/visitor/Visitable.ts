export default interface Visitable<T> {
    accept(visitor: T) : Promise<void>;
}
