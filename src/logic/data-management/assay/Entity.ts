export default interface Entity<T> {
    getId(): T;
    setId(id: T);
}
