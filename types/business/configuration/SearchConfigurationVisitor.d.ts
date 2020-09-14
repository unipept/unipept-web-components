import SearchConfiguration from "./SearchConfiguration";
export default interface SearchConfigurationVisitor {
    visitSearchConfiguration(config: SearchConfiguration): Promise<void>;
}
