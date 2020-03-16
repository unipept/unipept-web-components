export default interface ChangeListener<T> {
    onChange(object: T, field: string, oldValue: any, newValue: any);
}
